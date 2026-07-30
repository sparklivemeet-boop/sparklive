'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Eye, Heart, Clock, Star } from 'lucide-react';

interface Highlight {
  id: string;
  title: string;
  thumbnail?: string;
  type: 'livestream' | 'post' | 'clip' | 'pinned';
  views?: number;
  likes?: number;
  duration?: string;
  gradient?: string;
}

interface CreatorHighlightsProps {
  highlights: Highlight[];
}

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  {
    id: '1',
    title: 'Best Stream Moments',
    type: 'livestream',
    views: 12400,
    likes: 890,
    duration: '2:34:00',
    gradient: 'from-[#ff007f]/20 to-[#7a00cc]/20',
  },
  {
    id: '2',
    title: 'Community Q&A Recap',
    type: 'clip',
    views: 8700,
    likes: 650,
    duration: '15:20',
    gradient: 'from-[#00d8ff]/20 to-[#3b82f6]/20',
  },
  {
    id: '3',
    title: 'Top Fan Appreciation',
    type: 'post',
    views: 5600,
    likes: 1200,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: '4',
    title: 'New Setup Tour',
    type: 'pinned',
    views: 3200,
    likes: 430,
    duration: '8:15',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
];

function HighlightCard({ highlight, index }: { highlight: Highlight; index: number }) {
  const typeIcons: Record<string, string> = {
    livestream: '🔴',
    post: '📝',
    clip: '🎬',
    pinned: '📌',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative group flex-shrink-0 w-[260px] sm:w-[280px]"
    >
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${highlight.gradient || 'from-white/[0.03] to-white/[0.01]'} border border-white/[0.06] group-hover:border-white/[0.12] transition-all duration-300`}>
        {/* Thumbnail placeholder */}
        <div className="aspect-video bg-black/40 relative overflow-hidden">
          {highlight.thumbnail ? (
            <img src={highlight.thumbnail} alt={highlight.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl opacity-30">{typeIcons[highlight.type] || '📌'}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Play button overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
          </motion.div>

          {/* Duration badge */}
          {highlight.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white/80">
              {highlight.duration}
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[9px] text-white/60">
            {highlight.type.charAt(0).toUpperCase() + highlight.type.slice(1)}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
            {highlight.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {highlight.views !== undefined && (
              <span className="flex items-center gap-1 text-[10px] text-white/40">
                <Eye size={10} />
                {highlight.views >= 1000
                  ? `${(highlight.views / 1000).toFixed(1)}K`
                  : highlight.views}
              </span>
            )}
            {highlight.likes !== undefined && (
              <span className="flex items-center gap-1 text-[10px] text-white/40">
                <Heart size={10} />
                {highlight.likes >= 1000
                  ? `${(highlight.likes / 1000).toFixed(1)}K`
                  : highlight.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CreatorHighlights({ highlights = DEFAULT_HIGHLIGHTS }: CreatorHighlightsProps) {
  const [scrollPos, setScrollPos] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (highlights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-white/40" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">
            Creator Highlights
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <ChevronLeft size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {highlights.map((highlight, i) => (
          <HighlightCard key={highlight.id} highlight={highlight} index={i} />
        ))}
      </div>
    </div>
  );
}