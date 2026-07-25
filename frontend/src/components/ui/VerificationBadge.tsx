'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldCheck, Crown } from 'lucide-react';

interface VerificationBadgeProps {
  type: 'BLUE' | 'GOLD' | 'NONE';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export default function VerificationBadge({
  type,
  size = 'sm',
  showTooltip = false,
  className,
}: VerificationBadgeProps) {
  if (type === 'NONE') return null;

  const sizeMap = {
    sm: { icon: 10, container: 'w-4 h-4', stroke: 1.5 },
    md: { icon: 14, container: 'w-5 h-5', stroke: 2 },
    lg: { icon: 18, container: 'w-7 h-7', stroke: 2.5 },
  };

  const s = sizeMap[size];

  const isBlue = type === 'BLUE';
  const gradient = isBlue
    ? 'from-blue-500 to-blue-600'
    : 'from-amber-400 to-yellow-600';
  const glowColor = isBlue
    ? 'shadow-blue-500/40'
    : 'shadow-yellow-500/40';
  const label = isBlue ? 'Verified Account' : 'SparkLive Creator';
  const Icon = isBlue ? ShieldCheck : Crown;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15, rotate: -5 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg cursor-pointer',
        gradient,
        s.container,
        glowColor,
        className
      )}
      title={showTooltip ? label : undefined}
    >
      <Icon size={s.icon} strokeWidth={s.stroke} className="text-white drop-shadow-sm" />
    </motion.div>
  );
}