import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function PremiumCard({ children, className = '', glow = false }: PremiumCardProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden glass ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-gradient-spark opacity-10 blur-xl pointer-events-none"></div>
      )}
      <div className="relative z-10 p-5">
        {children}
      </div>
    </div>
  );
}
