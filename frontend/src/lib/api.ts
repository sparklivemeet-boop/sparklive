// API Configuration
export const API_BASE_URL = (() => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  
  // Client-side
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseUrl) {
    // Fallback for production: attempt to use same origin with /api prefix
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.host}/api`;
    }
    return 'http://localhost:5000';
  }
  
  return baseUrl;
})();

export type ApiResponse<T = any> = {
  data?: T;
  message?: string;
  error?: string;
  token?: string;
  user?: any;
  code?: number;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const authHeaders = (token?: string | null): Record<string, string> => {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
