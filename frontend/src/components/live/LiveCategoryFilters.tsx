'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  label: string;
  icon: string;
  liveCount?: number;
  viewerCount?: number;
  trending?: boolean;
}

interface LiveCategoryFiltersProps {
  categories?: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'all', label: 'All Streams', icon: '🌐', liveCount: 156, viewerCount: 45200, trending: true },
  { id: 'gaming', label: 'Gaming', icon: '🎮', liveCount: 45, viewerCount: 18200, trending: true },
  { id: 'music', label: 'Music', icon: '🎵', liveCount: 32, viewerCount: 12400, trending: true },
  { id: 'sports', label: 'Sports', icon: '⚽', liveCount: 18, viewerCount: 8700 },
  { id: 'technology', label: 'Technology', icon: '💻', liveCount: 24, viewerCount: 5600 },
  { id: 'education', label: 'Education', icon: '📚', liveCount: 15, viewerCount: 3400 },
  { id: 'creative', label: 'Creative', icon: '🎨', liveCount: 21, viewerCount: 7800 },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟', liveCount: 12, viewerCount: 4500 },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', liveCount: 28, viewerCount: 11200 },
  { id: 'business', label: 'Business', icon: '💼', liveCount: 8, viewerCount: 2100 },
  { id: 'news', label: 'News', icon: '📰', liveCount: 10, viewerCount: 3200 },
  { id: 'food', label: 'Food & Drink', icon: '🍳', liveCount: 14, viewerCount: 3800 },
];

export default function LiveCategoryFilters({
  categories = defaultCategories,
  activeCategory,
  onCategoryChange,
}: LiveCategoryFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mb-2">
      {categories.map((cat, i) => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border-[#ff007f]/20 text-white'
                : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12]'
            )}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="whitespace-nowrap">{cat.label}</span>
            {cat.liveCount !== undefined && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-[#ff007f]/20 text-[#ff007f]' : 'bg-white/[0.04] text-white/30'
              )}>
                {cat.liveCount}
              </span>
            )}
            {cat.trending && (
              <motion.span
                className="text-[10px]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔥
              </motion.span>
            )}
            {isActive && (
              <motion.div
                layoutId="liveCategoryActive"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff007f]/5 to-[#7a00cc]/5"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}