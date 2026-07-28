'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, Video, Radio, Play, Heart, Image, Film, Clock, TrendingUp, ChevronDown, MessageCircle, Users, Bookmark, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: Record<string, number>;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  viewMode?: 'grid' | 'list';
}

const TABS = [
  { id: 'posts', label: 'Posts', icon: Video },
  { id: 'replies', label: 'Replies', icon: MessageCircle },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'shorts', label: 'Shorts', icon: Film },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'likes', label: 'Likes', icon: Heart },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'tagged', label: 'Tagged', icon: Hash },
  { id: 'saved', label: 'Saved Streams', icon: Clock },
];

export default function ProfileTabs({ activeTab, onTabChange, counts, onViewModeChange, viewMode = 'grid' }: ProfileTabsProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex -mb-px overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const count = counts?.[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-200 outline-none whitespace-nowrap"
                aria-selected={isActive}
                role="tab"
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-white/30'} />
                <span className={isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}>
                  {tab.label}
                </span>
                {count !== undefined && (
                  <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-[#ff007f]/15 text-[#ff007f]' 
                      : 'bg-white/[0.04] text-white/30'
                  }`}>
                    {count}
                  </span>
                )}
                
                {/* Animated underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ff007f] to-[#7a00cc]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Sort */}
        <div className="flex items-center gap-1 sm:gap-2 pb-3">
          {onViewModeChange && (
            <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-0.5">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                )}
                aria-label="Grid view"
              >
                <Grid3X3 size={13} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                )}
                aria-label="List view"
              >
                <List size={13} />
              </button>
            </div>
          )}

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/40 hover:text-white/60 transition-all"
            >
              <Clock size={11} />
              <span className="hidden sm:inline">Latest</span>
              <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-36 py-1.5 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl z-50"
                >
                  {['Latest', 'Popular', 'Oldest'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setShowSortDropdown(false)}
                      className="w-full text-left px-4 py-2 text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {sort}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}