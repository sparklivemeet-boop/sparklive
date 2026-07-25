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

const gradientId = 'sparkLiveLogoGradient';

const logoPath = (
  <g transform="translate(256, 256)">
    {/* Main flame teardrop */}
    <path d="M 0,-200 C 60,-170 110,-110 120,-50 C 132,20 120,80 90,130 C 55,190 20,220 0,230 C -20,220 -55,190 -90,130 C -120,80 -132,20 -120,-50 C -110,-110 -60,-170 0,-200 Z" />
    {/* Left heart curve */}
    <path d="M 0,50 C -25,10 -80,-5 -105,25 C -130,55 -125,95 -95,115 C -65,135 -30,135 0,105 Z" />
    {/* Right heart curve */}
    <path d="M 0,50 C 25,10 80,-5 105,25 C 130,55 125,95 95,115 C 65,135 30,135 0,105 Z" />
    {/* Left fold */}
    <path d="M 0,-200 C -45,-165 -85,-100 -100,-40 C -55,-75 -25,-95 0,-105 Z" opacity="0.85" />
    {/* Right fold */}
    <path d="M 0,-200 C 45,-165 85,-100 100,-40 C 55,-75 25,-95 0,-105 Z" opacity="0.85" />
  </g>
);

export default function SparkLiveLogo({
  size = 18,
  className = '',
  variant = 'gradient',
  showText = false,
  textSize = 'md',
}: SparkLiveLogoProps) {
  const fillValue = variant === 'white' ? '#FFFFFF' 
    : variant === 'black' ? '#000000' 
    : variant === 'monochrome' ? '#8B3DFF' 
    : `url(#${gradientId})`;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SparkLive"
        role="img"
        className="shrink-0"
      >
        {variant === 'gradient' && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF2E8B" />
              <stop offset="35%" stopColor="#FF3EA5" />
              <stop offset="65%" stopColor="#8B3DFF" />
              <stop offset="100%" stopColor="#C45CFF" />
            </linearGradient>
          </defs>
        )}
        {React.cloneElement(logoPath as React.ReactElement, { fill: fillValue })}
      </svg>
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

// Sidebar-specific logo (compact)
export function SparkLiveSidebarLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2E8B] to-[#8B3DFF] flex items-center justify-center shadow-lg shadow-[#FF2E8B]/20">
        <svg width="18" height="18" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(256, 256)">
            <path d="M 0,-200 C 60,-170 110,-110 120,-50 C 132,20 120,80 90,130 C 55,190 20,220 0,230 C -20,220 -55,190 -90,130 C -120,80 -132,20 -120,-50 C -110,-110 -60,-170 0,-200 Z" fill="white"/>
            <path d="M 0,50 C -25,10 -80,-5 -105,25 C -130,55 -125,95 -95,115 C -65,135 -30,135 0,105 Z" fill="white"/>
            <path d="M 0,50 C 25,10 80,-5 105,25 C 130,55 125,95 95,115 C 65,135 30,135 0,105 Z" fill="white"/>
            <path d="M 0,-200 C -45,-165 -85,-100 -100,-40 C -55,-75 -25,-95 0,-105 Z" fill="white" opacity="0.6"/>
            <path d="M 0,-200 C 45,-165 85,-100 100,-40 C 55,-75 25,-95 0,-105 Z" fill="white" opacity="0.6"/>
          </g>
        </svg>
      </div>
      <div>
        <span className="text-base font-bold text-white">SparkLive</span>
        <p className="text-[8px] text-gray-500 tracking-widest uppercase">Premium social</p>
      </div>
    </span>
  );
}

// Navbar logo (horizontal wordmark)
export function SparkLiveNavbarLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF2E8B] to-[#8B3DFF] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(256, 256)">
            <path d="M 0,-200 C 60,-170 110,-110 120,-50 C 132,20 120,80 90,130 C 55,190 20,220 0,230 C -20,220 -55,190 -90,130 C -120,80 -132,20 -120,-50 C -110,-110 -60,-170 0,-200 Z" fill="white"/>
            <path d="M 0,50 C -25,10 -80,-5 -105,25 C -130,55 -125,95 -95,115 C -65,135 -30,135 0,105 Z" fill="white"/>
            <path d="M 0,50 C 25,10 80,-5 105,25 C 130,55 125,95 95,115 C 65,135 30,135 0,105 Z" fill="white"/>
          </g>
        </svg>
      </div>
      <span className="text-base font-bold text-white">SparkLive</span>
    </span>
  );
}