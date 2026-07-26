'use client';

import { API_BASE_URL, authHeaders } from './api';

const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3MB (matches backend)
const MAX_BANNER_SIZE = 3 * 1024 * 1024; // 3MB (matches backend)
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
  return new Promise((resolve) => {
    // Skip compression for files under 500KB
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
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob.size >= file.size ? file : blob);
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
      resolve(file);
    };
    
    img.src = url;
  });
}

/**
 * Direct upload using XMLHttpRequest for reliable progress tracking.
 * Matches the backend API exactly:
 * - Method: POST
 * - Field: 'avatar' or 'banner'
 * - Route: /api/profiles/me/avatar or /api/profiles/me/banner
 * - Response: { message, profile, url }
 */
function directUpload(
  path: string,
  fieldName: string,
  file: File,
  token: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const url = `${API_BASE_URL}${path}`;
    const formData = new FormData();
    formData.append(fieldName, file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          // Backend returns: { message, profile, url }
          const imageUrl = response?.url || response?.data?.url || '';
          if (imageUrl) {
            resolve({ url: imageUrl });
          } else {
            resolve({ url: '', error: 'No URL returned from server' });
          }
        } else {
          const errorMsg = response?.error || response?.message || `Upload failed (${xhr.status})`;
          resolve({ url: '', error: errorMsg });
        }
      } catch {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: '', error: 'Invalid response from server' });
        } else {
          resolve({ url: '', error: `Upload failed (${xhr.status})` });
        }
      }
    });

    xhr.addEventListener('error', () => {
      resolve({ url: '', error: 'Network error during upload' });
    });

    xhr.addEventListener('abort', () => {
      resolve({ url: '', error: 'Upload cancelled' });
    });

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    // Do NOT set Content-Type - browser sets it with boundary for FormData
    xhr.send(formData);
  });
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
    
    // Compress - avatars can be smaller
    const compressed = await compressImage(file, 512, 0.8);
    const compressedFile = new File([compressed], `avatar-${Date.now()}.webp`, { 
      type: 'image/webp' 
    });
    
    onProgress?.({ percent: 30, status: 'uploading' });
    
    // Upload via POST with field name 'avatar' (matches backend)
    const result = await directUpload(
      '/api/profiles/me/avatar',
      'avatar',
      compressedFile,
      token,
      (percent) => onProgress?.({ percent: 30 + percent * 0.7, status: 'uploading' })
    );
    
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
    
    // Compress - banners can be larger
    const compressed = await compressImage(file, 2048, 0.85);
    const compressedFile = new File([compressed], `banner-${Date.now()}.webp`, { 
      type: 'image/webp' 
    });
    
    onProgress?.({ percent: 30, status: 'uploading' });
    
    // Upload via POST with field name 'banner' (matches backend)
    const result = await directUpload(
      '/api/profiles/me/banner',
      'banner',
      compressedFile,
      token,
      (percent) => onProgress?.({ percent: 30 + percent * 0.7, status: 'uploading' })
    );
    
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