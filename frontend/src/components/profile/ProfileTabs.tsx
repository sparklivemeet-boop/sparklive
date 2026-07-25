'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: Record<string, number>;
}

const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'streams', label: 'Streams' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'media', label: 'Media' },
  { id: 'likes', label: 'Likes' },
];

export default function ProfileTabs({ activeTab, onTabChange, counts }: ProfileTabsProps) {
  return (
    <div className="relative border-b border-white/[0.06]">
      <div className="flex -mb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts?.[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-all duration-200 outline-none"
              aria-selected={isActive}
              role="tab"
            >
              <span className={isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}>
                {tab.label}
              </span>
              {count !== undefined && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
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
    </div>
  );
}