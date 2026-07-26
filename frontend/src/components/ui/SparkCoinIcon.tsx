'use client';

import { cn } from '@/lib/utils';

interface SparkCoinIconProps {
  size?: number;
  className?: string;
}

export default function SparkCoinIcon({ size = 24, className }: SparkCoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-label="Spark Coin"
    >
      <defs>
        <linearGradient id="spark-coin-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF007F" />
          <stop offset="50%" stopColor="#7A00CC" />
          <stop offset="100%" stopColor="#00D8FF" />
        </linearGradient>
        <linearGradient id="spark-coin-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="12" cy="12" r="11" fill="url(#spark-coin-grad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="8.5" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {/* Spark bolt icon */}
      <path
        d="M13.5 4.5L8 13h3.5l-1 6.5L17 11h-3.5l1-6.5z"
        fill="white"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.3"
      />
      {/* Shine overlay */}
      <ellipse cx="9" cy="8" rx="3" ry="2" fill="url(#spark-coin-shine)" />
    </svg>
  );
}