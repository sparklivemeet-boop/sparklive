'use client';

import React, { useState, forwardRef, type HTMLAttributes } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  premium?: boolean;
  onClick?: () => void;
}

const sizeMap: Record<AvatarSize, { container: string; icon: string; dot: string }> = {
  xs: { container: 'w-6 h-6', icon: 'text-[8px]', dot: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8', icon: 'text-[10px]', dot: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', icon: 'text-xs', dot: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', icon: 'text-sm', dot: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', icon: 'text-lg', dot: 'w-3.5 h-3.5 border-2' },
  '2xl': { container: 'w-20 h-20', icon: 'text-xl', dot: 'w-4 h-4 border-2' },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-emerald-400',
  offline: 'bg-gray-400',
  busy: 'bg-red-400',
  away: 'bg-yellow-400',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      size = 'md',
      status,
      premium = false,
      onClick,
      className = '',
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);
    const sizeConfig = sizeMap[size];
    const initials = alt ? getInitials(alt) : '?';
    const showImage = src && !imgError;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          relative inline-flex items-center justify-center shrink-0
          ${sizeConfig.container}
          ${onClick ? 'cursor-pointer' : ''}
          ${premium ? 'rounded-full p-0.5 bg-gradient-spark' : 'rounded-full'}
          ${className}
        `}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={alt || 'Avatar'}
        {...props}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
          {showImage ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className={`font-bold text-white ${sizeConfig.icon}`}>
              {initials}
            </span>
          )}
        </div>

        {status && (
          <span
            className={`
              absolute bottom-0 right-0
              ${sizeConfig.dot}
              ${statusColors[status]}
              rounded-full
              border-[var(--background)]
              z-10
            `}
            aria-label={status}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;