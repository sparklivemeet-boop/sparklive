import { API_BASE_URL, authHeaders, ApiError, type ApiResponse } from './api';

// In-memory request cache for GET requests
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds default cache
const pendingRequests = new Map<string, Promise<any>>(); // Request deduplication
const inflightControllers = new Map<string, AbortController>(); // In-flight request cancellation

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const RETRY_BACKOFF = 2; // Exponential backoff multiplier

// Request batching
interface BatchEntry {
  path: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}
const batchQueue = new Map<string, BatchEntry[]>();
const BATCH_WINDOW_MS = 50; // 50ms bat
const BATCH_ENDPOINTS = ['/api/feed', '/api/notifications', '/api/messages']; // Batchable endpoints

const getCacheKey = (method: string, url: string, body?: string): string => {
  if (body) return `${method}:${url}:${body}`;
  return `${method}:${url}`;
};

const readJson = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || data.message || response.statusText,
        data
      );
    }
    
    return data;
  }
  
  const text = await response.text();
  
  if (!response.ok) {
    throw new ApiError(response.status, text || response.statusText);
  }
  
  return { message: text };
};

// Handle session expiry by redirecting to login
const handleSessionExpiry = (error: unknown) => {
  if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
    // Clear auth tokens from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sparklive_token');
      localStorage.removeItem('sparklive_user');
      localStorage.removeItem('sparklive_refresh_token');
      // Redirect to login
      window.location.href = '/login';
    }
  }
};

// Exponential backoff sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cancel an active request by URL pattern
export const cancelRequest = (pathPattern: string): void => {
  for (const [key, controller] of inflightControllers) {
    if (key.includes(pathPattern)) {
      controller.abort();
      inflightControllers.delete(key);
    }
  }
};

// Cancel all active requests
export const cancelAllRequests = (): void => {
  for (const [, controller] of inflightControllers) {
    controller.abort();
  }
  inflightControllers.clear();
};

// Request batching for specific endpoints
const tryBatchRequest = async <T>(
  method: string,
  path: string,
  options: { body?: unknown; token?: string }
): Promise<T | null> => {
  // Only batch GET requests to specific endpoints
  if (method !== 'GET') return null;
  
  const basePath = '/' + path.split('/').slice(1, 3).join('/');
  if (!BATCH_ENDPOINTS.includes(basePath)) return null;

  return new Promise<T>((resolve, reject) => {
    if (!batchQueue.has(path)) {
      batchQueue.set(path, []);
      
      // Schedule batch processing after a short delay
      setTimeout(() => {
        const entries = batchQueue.get(path) || [];
        batchQueue.delete(path);
        
        if (entries.length === 0) return;
        
        // Execute single request for all batched entries
        makeRequestInternal<T>(method, path, options)
          .then((data) => {
            entries.forEach((entry) => entry.resolve(data));
          })
          .catch((error) => {
            entries.forEach((entry) => entry.reject(error));
          });
      }, BATCH_WINDOW_MS);
    }
    
    batchQueue.get(path)!.push({ path, resolve, reject } as BatchEntry);
  });
};

const makeRequestInternal = async <T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
    cacheTTL?: number;
    skipCache?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  const bodyStr = options.body ? JSON.stringify(options.body) : undefined;
  const cacheKey = getCacheKey(method, url, bodyStr);
  const now = Date.now();

  // Return cached data for GET requests if valid
  if (method === 'GET' && !options.skipCache) {
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < (options.cacheTTL || CACHE_TTL)) {
      return cached.data as T;
    }

    // Deduplicate concurrent GET requests
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  // Cancel previous in-flight request to same endpoint
  if (method === 'GET' && inflightControllers.has(cacheKey)) {
    inflightControllers.get(cacheKey)!.abort();
    inflightControllers.delete(cacheKey);
  }

  // Create abort controller for this request
  const controller = new AbortController();
  if (method === 'GET') {
    inflightControllers.set(cacheKey, controller);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Accept compressed responses
    'Accept-Encoding': 'gzip, deflate, br',
    ...authHeaders(options.token),
    ...options.headers,
  };

  const executeFetch = async (retryCount: number = 0): Promise<T> => {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: bodyStr,
        credentials: 'include',
        signal: options.signal || controller.signal,
        // Enable keep-alive for connection reuse
        keepalive: method !== 'GET',
        // Enable cache mode for GET requests
        cache: method === 'GET' ? 'default' : 'no-store',
      });

      const data = await readJson(response);

      // Cache successful GET responses
      if (method === 'GET') {
        requestCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(499, 'Request cancelled');
      }

      if (error instanceof ApiError) {
        // Don't retry client errors (4xx)
        if (error.statusCode >= 400 && error.statusCode < 500) {
          handleSessionExpiry(error);
          throw error;
        }
      }

      // Retry on network errors or 5xx with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF, retryCount);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Retry ${retryCount + 1}/${MAX_RETRIES} for ${method} ${url} after ${delay}ms`);
        }
        await sleep(delay);
        return executeFetch(retryCount + 1);
      }

      // Network error or parsing error after all retries
      console.error(`[API] Error ${method} ${url}:`, error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : 'Failed to fetch',
        error
      );
    }
  };

  const promise = executeFetch().finally(() => {
    inflightControllers.delete(cacheKey);
  });

  // Store pending promise for deduplication
  if (method === 'GET') {
    pendingRequests.set(cacheKey, promise);
    promise.finally(() => {
      pendingRequests.delete(cacheKey);
    });
  }

  return promise;
};

const makeRequest = async <T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
    cacheTTL?: number;
    skipCache?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<T> => {
  // Try batching first
  const batchResult = await tryBatchRequest<T>(method, path, options);
  if (batchResult !== null) return batchResult;

  return makeRequestInternal<T>(method, path, options);
};

// Invalidate cache for a specific path pattern
export const invalidateCache = (pathPattern?: string) => {
  if (!pathPattern) {
    requestCache.clear();
    return;
  }
  for (const key of requestCache.keys()) {
    if (key.includes(pathPattern)) {
      requestCache.delete(key);
    }
  }
};

// Prefetch data for faster navigation
export const prefetchData = (path: string, token?: string): void => {
  if (typeof window === 'undefined') return;
  const url = `${API_BASE_URL}${path}`;
  const cacheKey = `GET:${url}`;
  
  if (!requestCache.has(cacheKey)) {
    // Use low priority fetch
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        makeRequestInternal('GET', path, { token, cacheTTL: CACHE_TTL }).catch(() => {});
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        makeRequestInternal('GET', path, { token, cacheTTL: CACHE_TTL }).catch(() => {});
      }, 1000);
    }
  }
};

export const apiGet = async <T>(
  path: string, 
  token?: string, 
  options?: { cacheTTL?: number; skipCache?: boolean; signal?: AbortSignal }
): Promise<T> => {
  return makeRequest<T>('GET', path, { token, ...options });
};

export const apiPost = async <T>(
  path: string,
  payload: unknown,
  token?: string
): Promise<T> => {
  // Invalidate related caches on mutation
  invalidateCache(path.split('/').slice(1, 3).join('/'));
  return makeRequest<T>('POST', path, { body: payload, token });
};

export const apiPut = async <T>(
  path: string,
  payload: unknown,
  token?: string
): Promise<T> => {
  invalidateCache(path.split('/').slice(1, 3).join('/'));
  return makeRequest<T>('PUT', path, { body: payload, token });
};

export const apiDelete = async <T>(
  path: string,
  token?: string
): Promise<T> => {
  invalidateCache(path.split('/').slice(1, 3).join('/'));
  return makeRequest<T>('DELETE', path, { token });
};

export const apiUpload = async <T>(
  path: string,
  formData: FormData,
  token?: string,
  onProgress?: (percent: number) => void
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  invalidateCache(path.split('/').slice(1, 3).join('/'));
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] POST ${url} (FormData)`);
  }

  const executeUpload = async (retryCount: number = 0): Promise<T> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...authHeaders(token),
        },
        body: formData,
        credentials: 'include',
      });

      const data = await readJson(response);
      return data as T;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF, retryCount);
        await sleep(delay);
        return executeUpload(retryCount + 1);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error(`[API] Error uploading to ${url}:`, error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : 'Upload failed',
        error
      );
    }
  };

  return executeUpload();
};

// Get cache stats for monitoring
export const getCacheStats = () => ({
  size: requestCache.size,
  pendingRequests: pendingRequests.size,
  inflightRequests: inflightControllers.size,
  batchQueueSize: batchQueue.size,
});