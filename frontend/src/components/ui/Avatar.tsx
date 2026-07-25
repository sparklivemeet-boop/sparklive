'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  className?: string;
  onClick?: () => void;
  fallback?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
};

const statusStyles = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-500',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
  none: 'hidden',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5 ring-1',
  sm: 'w-2 h-2 ring-1',
  md: 'w-2.5 h-2.5 ring-2',
  lg: 'w-3 h-3 ring-2',
  xl: 'w-3.5 h-3.5 ring-2',
  '2xl': 'w-4 h-4 ring-2',
};

export default function Avatar({
  src,
  alt = 'User',
  size = 'md',
  status = 'none',
  className,
  onClick,
  fallback,
}: AvatarProps) {
  const [error, setError] = useState(false);
  const hasImage = src && !error;

  return (
    <div
      className={cn('relative inline-flex shrink-0', onClick && 'cursor-pointer')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={alt}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center overflow-hidden',
          'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/[0.06]',
          sizeStyles[size],
          className
        )}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <span className="font-semibold text-white/40">
            {fallback ? (
              fallback.charAt(0).toUpperCase()
            ) : (
              <User size={size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 14 : size === 'lg' ? 16 : 20} />
            )}
          </span>
        )}
      </div>

      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-[#07070d]',
            statusStyles[status],
            statusSizes[size]
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}