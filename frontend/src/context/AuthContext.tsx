"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/platformStorage';
import { authGetMe, authRefreshToken, authLogout } from '@/lib/authApi';
import type { AuthUser } from '@/lib/authApi';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  login: (userData: AuthUser, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'sparklive_token';
const REFRESH_TOKEN_STORAGE_KEY = 'sparklive_refresh_token';
const USER_STORAGE_KEY = 'sparklive_user';
const REFRESH_TOKEN_INTERVAL = 5 * 60 * 1000; // Refresh every 5 minutes
const TOKEN_EXPIRY_BUFFER = 60 * 1000; // Refresh if token expires in less than 1 minute

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from storage
  const restoreSession = useCallback(async () => {
    try {
      const storedToken = await storage.getItem(TOKEN_STORAGE_KEY);
      const storedRefreshToken = await storage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      const storedUser = await storage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid by fetching user profile
        try {
          const response = await authGetMe(storedToken);
          if (response.user) {
            setUser(response.user);
            await storage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
          }
        } catch (error) {
          console.warn('Token verification failed, attempting refresh...');
          // Token might be expired, try refresh
          if (storedRefreshToken) {
            await refreshAccessToken(storedRefreshToken);
          } else {
            // Clear invalid session
            await clearSession();
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore auth session', error);
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear session
  const clearSession = useCallback(async () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    await storage.removeItem(TOKEN_STORAGE_KEY);
    await storage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    await storage.removeItem(USER_STORAGE_KEY);
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (currentRefreshToken: string) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await authRefreshToken({ refreshToken: currentRefreshToken });
      
      if (response.token) {
        setToken(response.token);
        await storage.setItem(TOKEN_STORAGE_KEY, response.token);
        
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
          await storage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
        }
        
        return response.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await clearSession();
      setError('Session expired. Please log in again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [clearSession, isRefreshing]);

  // Login
  const login = useCallback(async (userData: AuthUser, accessToken: string, newRefreshToken?: string) => {
    setToken(accessToken);
    setRefreshToken(newRefreshToken || null);
    setUser(userData);
    setError(null);
    
    await storage.setItem(TOKEN_STORAGE_KEY, accessToken);
    await storage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    
    if (newRefreshToken) {
      await storage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (token) {
      try {
        await authLogout(token);
      } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue with local logout even if API fails
      }
    }
    
    await clearSession();
    setError(null);
    router.push('/login');
  }, [token, clearSession, router]);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Set up token refresh interval
  useEffect(() => {
    if (!token || !refreshToken) return;

    const interval = setInterval(async () => {
      await refreshAccessToken(refreshToken);
    }, REFRESH_TOKEN_INTERVAL);

    return () => clearInterval(interval);
  }, [token, refreshToken, refreshAccessToken]);

  // Handle public/private routes
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!token && !isPublicRoute) {
      router.push('/login');
    } else if (token && pathname === '/login') {
      router.push('/discover');
    }
  }, [isLoading, token, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        logout,
        isLoading,
        error,
        setError,
        isRefreshing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
  }, []);

  useEffect(() => {
    // Protected routes logic
    const publicPaths = ['/login', '/register', '/'];
    if (!isLoading) {
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/register')) {
        router.push('/discover');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    await storage.setItem('sparklive_token', tokenData);
    await storage.setItem('sparklive_user', JSON.stringify(userData));
    router.push('/discover');
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.removeItem('sparklive_token');
    await storage.removeItem('sparklive_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {!isLoading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-spark-pink)]"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
