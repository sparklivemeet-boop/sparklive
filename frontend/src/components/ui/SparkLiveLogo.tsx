'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SparkLiveLogoProps {
  size?: number;
  className?: string;
  variant?: 'gradient' | 'white' | 'black' | 'monochrome' | 'icon';
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

// Official uploaded SparkLive logo - single source of truth
const LOGO_PATH = '/branding/sparklive-logo.png';

export default function SparkLiveLogo({
  size = 18,
  className = '',
  variant = 'gradient',
  showText = false,
  textSize = 'md',
}: SparkLiveLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_PATH}
        alt="SparkLive"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className={cn(
          'font-bold tracking-tight',
          textSizes[textSize],
          variant === 'white' ? 'text-white' : 
          variant === 'black' ? 'text-black' : 
          'text-white'
        )}>
          Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3EA5] to-[#8B3DFF]">Live</span>
        </span>
      )}
    </span>
  );
}

// Full wordmark component with text
export function SparkLiveWordmark({ size = 'md', className, variant = 'gradient' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
  variant?: 'gradient' | 'white' | 'black';
}) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 36 : 32;
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <SparkLiveLogo size={iconSize} variant={variant} />
      <span className={cn(
        'font-bold tracking-tight',
        textClass,
        variant === 'white' ? 'text-white' : 
        variant === 'black' ? 'text-black' : 
        'text-white'
      )}>
        Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3EA5] to-[#8B3DFF]">Live</span>
      </span>
    </span>
  );
}

// Sidebar-specific logo (compact using uploaded image)
export function SparkLiveSidebarLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2E8B] to-[#8B3DFF] flex items-center justify-center shadow-lg shadow-[#FF2E8B]/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_PATH}
          alt="SparkLive"
          width={18}
          height={18}
          className="object-contain"
          style={{ width: 18, height: 18 }}
        />
      </div>
      <div>
        <span className="text-base font-bold text-white">SparkLive</span>
        <p className="text-[8px] text-gray-500 tracking-widest uppercase">Premium social</p>
      </div>
    </span>
  );
}

// Navbar logo (horizontal wordmark using uploaded image)
export function SparkLiveNavbarLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF2E8B] to-[#8B3DFF] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_PATH}
          alt="SparkLive"
          width={14}
          height={14}
          className="object-contain"
          style={{ width: 14, height: 14 }}
        />
      </div>
      <span className="text-base font-bold text-white">SparkLive</span>
    </span>
  );
}