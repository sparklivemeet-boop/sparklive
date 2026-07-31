'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Radio, PinIcon, MessageCircle, Play, Film, Image as ImageIcon, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

interface FeaturedCard {
  id: string;
  type: 'live' | 'post' | 'reel' | 'video' | 'media';
  title: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  date?: string;
  meta?: string;
  streamer?: string;
  viewerCount?: number;
}

export default function FeaturedContentCarousel({ items }: { items: FeaturedCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  const typeConfig: Record<string, { icon: any; label: string; gradient: string }> = {
    live: { icon: Radio, label: 'Live', gradient: 'from-red-500/10 to-rose-500/10 border-red-500/20' },
    post: { icon: MessageCircle, label: 'Post', gradient: 'from-pink-500/10 to-purple-500/10 border-pink-500/20' },
    reel: { icon: Film, label: 'Reel', gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20' },
    video: { icon: Play, label: 'Video', gradient: 'from-purple-500/10 to-violet-500/10 border-purple-500/20' },
    media: { icon: ImageIcon, label: 'Media', gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-300" />
          <h3 className="text-xs font-semibold text-white/[0.45] uppercase tracking-[0.15em]">Featured Content</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center transition-all',
              canScrollLeft ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-white/5 text-white/20 cursor-not-allowed'
            )}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll('right')}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center transition-all',
              canScrollRight ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-white/5 text-white/20 cursor-not-allowed'
            )}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 sm:-mx-0 px-4 sm:px-0"
      >
        {items.map((item, i) => {
          const config = typeConfig[item.type] || typeConfig.media;
          const Icon = config.icon;
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="snap-start shrink-0"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={cn(
                'w-[240px] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group',
                config.gradient,
                isHovered ? 'bg-white/[0.06]' : 'bg-white/[0.02]'
              )}>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1a1a28] to-[#0e0e16] overflow-hidden">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon size={28} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white">
                      <Icon size={10} />
                      {config.label}
                    </span>
                  </div>

                  {/* Views / Live Count */}
                  {item.viewerCount !== undefined && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/80 flex items-center gap-1">
                      <Eye size={10} /> {formatNumber(item.viewerCount)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-white/80 line-clamp-1 group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {item.likes !== undefined && (
                      <span className="flex items-center gap-1 text-[10px] text-white/40">
                        <Heart size={9} /> {formatNumber(item.likes)}
                      </span>
                    )}
                    {item.views !== undefined && (
                      <span className="flex items-center gap-1 text-[10px] text-white/40">
                        <Eye size={9} /> {formatNumber(item.views)}
                      </span>
                    )}
                    {item.date && (
                      <span className="text-[10px] text-white/30 ml-auto">{formatTimeAgo(item.date)}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}