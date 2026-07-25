'use client';

import { apiUpload } from './apiClient';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BANNER_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RETRIES = 3;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  url: string;
  error?: string;
}

export interface UploadProgress {
  percent: number;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  error?: string;
}

// Validate image file
function validateImage(file: File, maxSize: number, fieldName: string): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${fieldName} must be JPEG, PNG or WebP format. Received: ${file.type}`;
  }
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return `${fieldName} must be under ${maxMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`;
  }
  return null;
}

// Compress image before upload
function compressImage(file: File, maxWidth: number = 2048, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Skip compression for WebP images under 500KB
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;
      
      // Resize if larger than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // If compressed is larger than original, use original
            if (blob.size >= file.size) {
              resolve(file);
            } else {
              resolve(blob);
            }
          } else {
            resolve(file);
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/webp',
        file.type === 'image/png' ? 0.9 : quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fall back to original on error
    };
    
    img.src = url;
  });
}

// Upload with retry logic
async function uploadWithRetry(
  path: string,
  formData: FormData,
  token: string,
  retries: number = MAX_RETRIES
): Promise<UploadResult> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await apiUpload<{ url: string }>(path, formData, token);
      if (result?.url) {
        // Invalidate user profile cache
        if (typeof window !== 'undefined') {
          const cacheKey = `GET:${process.env.NEXT_PUBLIC_API_URL || ''}/api/profiles/me`;
          if ('caches' in window) {
            caches.open('sparklive-api').then(cache => {
              cache.keys().then(keys => {
                keys.filter(k => k.url.includes('/api/profiles/me')).forEach(k => cache.delete(k));
              });
            }).catch(() => {});
          }
        }
        return { url: result.url };
      }
      throw new Error('No URL returned from upload');
    } catch (error: any) {
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
      return {
        url: '',
        error: error.message || 'Upload failed after multiple attempts. Please try again.',
      };
    }
  }
  return { url: '', error: 'Upload failed' };
}

// Upload avatar
export async function uploadAvatar(
  file: File,
  token: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate
  const validationError = validateImage(file, MAX_AVATAR_SIZE, 'Avatar');
  if (validationError) {
    return { url: '', error: validationError };
  }

  try {
    onProgress?.({ percent: 0, status: 'compressing' });
    
    // Compress
    const compressed = await compressImage(file, 512, 0.8);
    const compressedFile = new File([compressed], file.name, { type: compressed.type });
    
    onProgress?.({ percent: 30, status: 'uploading' });
    
    // Upload
    const formData = new FormData();
    formData.append('avatar', compressedFile);
    
    const result = await uploadWithRetry('/api/profiles/me/avatar', formData, token);
    
    if (result.url) {
      onProgress?.({ percent: 100, status: 'done' });
    } else {
      onProgress?.({ percent: 0, status: 'error', error: result.error });
    }
    
    return result;
  } catch (error: any) {
    const errorMsg = error.message || 'Avatar upload failed';
    onProgress?.({ percent: 0, status: 'error', error: errorMsg });
    return { url: '', error: errorMsg };
  }
}

// Upload banner
export async function uploadBanner(
  file: File,
  token: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate
  const validationError = validateImage(file, MAX_BANNER_SIZE, 'Banner');
  if (validationError) {
    return { url: '', error: validationError };
  }

  try {
    onProgress?.({ percent: 0, status: 'compressing' });
    
    // Compress
    const compressed = await compressImage(file, 2048, 0.85);
    const compressedFile = new File([compressed], file.name, { type: compressed.type });
    
    onProgress?.({ percent: 30, status: 'uploading' });
    
    // Upload
    const formData = new FormData();
    formData.append('banner', compressedFile);
    
    const result = await uploadWithRetry('/api/profiles/me/banner', formData, token);
    
    if (result.url) {
      onProgress?.({ percent: 100, status: 'done' });
    } else {
      onProgress?.({ percent: 0, status: 'error', error: result.error });
    }
    
    return result;
  } catch (error: any) {
    const errorMsg = error.message || 'Banner upload failed';
    onProgress?.({ percent: 0, status: 'error', error: errorMsg });
    return { url: '', error: errorMsg };
  }
}

// Validate file before upload (sync check for immediate feedback)
export function validateUploadFile(file: File, type: 'avatar' | 'banner'): string | null {
  const maxSize = type === 'avatar' ? MAX_AVATAR_SIZE : MAX_BANNER_SIZE;
  const fieldName = type === 'avatar' ? 'Avatar' : 'Banner';
  return validateImage(file, maxSize, fieldName);
}