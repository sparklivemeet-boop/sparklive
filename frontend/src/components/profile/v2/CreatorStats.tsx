'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function AnimatedStatValue({ value, isInView }: { value: number; isInView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(prevValue.current, value, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      prevValue.current = value;
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
      {displayValue > 0 ? formatNumber(displayValue) : '0'}
    </span>
  );
}

interface StatItem {
  value: number;
  label: string;
  onClick?: () => void;
}

export default function CreatorStats({
  stats,
  onFollowersClick,
  onFollowingClick,
}: {
  stats: StatItem[];
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-center gap-0 sm:gap-2 md:gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.label}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04, duration: 0.3 }}
            whileHover={{ y: -2 }}
            onClick={stat.onClick}
            aria-disabled={!stat.onClick}
            className={cn(
              'flex flex-col items-start min-w-0 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg px-1.5 sm:px-2.5 py-1',
              stat.onClick ? 'cursor-pointer hover:text-white' : 'cursor-default'
            )}
          >
            <AnimatedStatValue value={stat.value} isInView={isInView} />
            <span className="mt-0.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] text-white/[0.38]">
              {stat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}