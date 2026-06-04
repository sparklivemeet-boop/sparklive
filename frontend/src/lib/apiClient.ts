import { API_BASE_URL, authHeaders, ApiError, type ApiResponse } from './api';

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

const makeRequest = async <T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  
  // Debug: log API call in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url}`);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(options.token),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include', // Include cookies for auth
    });

    const data = await readJson(response);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network error or parsing error
    console.error(`[API] Error ${method} ${url}:`, error);
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Failed to fetch',
      error
    );
  }
};

export const apiGet = async <T>(path: string, token?: string): Promise<T> => {
  return makeRequest<T>('GET', path, { token });
};

export const apiPost = async <T>(
  path: string,
  payload: unknown,
  token?: string
): Promise<T> => {
  return makeRequest<T>('POST', path, { body: payload, token });
};

export const apiPut = async <T>(
  path: string,
  payload: unknown,
  token?: string
): Promise<T> => {
  return makeRequest<T>('PUT', path, { body: payload, token });
};

export const apiDelete = async <T>(
  path: string,
  token?: string,
  payload?: unknown
): Promise<T> => {
  return makeRequest<T>('DELETE', path, { body: payload, token });
};

export const apiUpload = async <T>(
  path: string,
  formData: FormData,
  token?: string
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] POST ${url} (FormData)`);
  }

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
