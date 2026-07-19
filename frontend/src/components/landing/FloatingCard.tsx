'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingCardProps {
  icon: ReactNode;
  label: string;
  value?: string;
  color?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionStyles: Record<string, string> = {
  'top-left': '-top-8 -left-12',
  'top-right': '-top-8 -right-12',
  'bottom-left': '-bottom-8 -left-12',
  'bottom-right': '-bottom-8 -right-12',
  'left': 'top-1/2 -left-16 -translate-y-1/2',
  'right': 'top-1/2 -right-16 -translate-y-1/2',
};

const colorVariants: Record<string, string> = {
  pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
};

export default function FloatingCard({
  icon,
  label,
  value,
  color = 'pink',
  position,
  delay = 0,
  className = '',
}: FloatingCardProps) {
  const colorClass = colorVariants[color] || colorVariants.pink;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-20 ${positionStyles[position]} ${className} hidden lg:block`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
        className={`flex items-center gap-3 bg-white/5 backdrop-blur-2xl rounded-2xl border ${colorClass} bg-gradient-to-br p-3.5 shadow-xl shadow-black/20 hover:scale-105 transition-transform duration-200 cursor-default min-w-[160px]`}
      >
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass.replace('/20', '').replace('/10', '').split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/50 font-medium">{label}</span>
          {value && <span className="text-sm font-semibold text-white">{value}</span>}
        </div>
      </motion.div>
    </motion.div>
  );
}