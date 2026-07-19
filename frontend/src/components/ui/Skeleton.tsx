'use client';

import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const baseClasses = 'skeleton';

  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'h-3 rounded-md w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-[28px] w-full h-48',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export function SkeletonCard() {
  return (
    <div className="skeleton-card animate-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton rounded-full w-12 h-12" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line w-1/3" />
          <div className="skeleton-line w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-line" />
        <div className="skeleton-line w-4/5" />
        <div className="skeleton-line w-3/5" />
      </div>
      <div className="mt-6">
        <div className="skeleton rounded-2xl h-40 w-full" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6 animate-in">
      <div className="skeleton rounded-[36px] w-full h-48" />
      <div className="flex items-center gap-5">
        <div className="skeleton rounded-full w-20 h-20" />
        <div className="space-y-2 flex-1">
          <div className="skeleton-line w-1/4" />
          <div className="skeleton-line w-1/3" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="skeleton-line" />
        <div className="skeleton-line w-3/4" />
        <div className="skeleton-line w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="space-y-4 animate-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="skeleton rounded-full w-10 h-10" />
            <div className="skeleton-line w-1/4" />
          </div>
          <div className="skeleton rounded-2xl h-48 w-full mb-4" />
          <div className="skeleton-line w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;