'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Video, Radio, Film, Image, Gift, Info, Repeat2, Clock } from 'lucide-react';

interface PremiumTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: Record<string, number>;
}

const TABS = [
  { id: 'posts', label: 'Posts', icon: Video },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'replays', label: 'Replays', icon: Repeat2 },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'gifts', label: 'Gifts', icon: Gift },
  { id: 'about', label: 'About', icon: Info },
];

export default function PremiumTabs({ activeTab, onTabChange, counts }: PremiumTabsProps) {
  return (
    <div className="relative">
      <div className="flex border-b border-white/[0.06]">
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

              {/* Glowing underline for active tab */}
              {isActive && (
                <motion.div
                  layoutId="premiumTabGlow"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="h-full bg-gradient-to-r from-[#ff007f] via-[#7a00cc] to-[#00d8ff] rounded-full" />
                  <div className="absolute inset-0 h-full bg-gradient-to-r from-[#ff007f] via-[#7a00cc] to-[#00d8ff] rounded-full blur-sm opacity-50" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}