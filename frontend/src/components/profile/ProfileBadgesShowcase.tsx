'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, Shield, Crown, Star, Zap, Flame, Gem, Trophy, Medal, Rocket, Heart, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  label: string;
  icon?: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  description?: string;
  earnedAt?: string;
  category?: string;
}

interface ProfileBadgesShowcaseProps {
  badges: Badge[];
  title?: string;
}

const RARITY_CONFIG: Record<string, { gradient: string; border: string; text: string; glow: string; label: string }> = {
  legendary: {
    gradient: 'from-amber-400 to-orange-500',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/30',
    label: 'Legendary',
  },
  epic: {
    gradient: 'from-purple-400 to-pink-500',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/30',
    label: 'Epic',
  },
  rare: {
    gradient: 'from-blue-400 to-cyan-400',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/30',
    label: 'Rare',
  },
  uncommon: {
    gradient: 'from-emerald-400 to-teal-400',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/30',
    label: 'Uncommon',
  },
  common: {
    gradient: 'from-gray-400 to-gray-500',
    border: 'border-gray-500/40',
    text: 'text-gray-300',
    glow: 'shadow-gray-500/30',
    label: 'Common',
  },
};

function BadgeTooltip({ badge, children }: { badge: Badge; children: React.ReactNode }) {
  const config = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;

  return (
    <div className="group relative">
      {children}
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2.5 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 min-w-[180px] translate-y-1 group-hover:translate-y-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={cn('text-lg', badge.icon ? '' : 'hidden')}>{badge.icon}</span>
          <span className="text-xs font-bold text-white">{badge.label}</span>
        </div>
        {badge.description && (
          <p className="text-[10px] text-white/50 mb-1.5 max-w-[200px] leading-relaxed">{badge.description}</p>
        )}
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
            `bg-gradient-to-r ${config.gradient}`,
            'text-white/90'
          )}>
            {config.label}
          </span>
          {badge.earnedAt && (
            <span className="text-[8px] text-white/30">
              {new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileBadgesShowcase({ badges, title = 'Badges' }: ProfileBadgesShowcaseProps) {
  const [showAll, setShowAll] = useState(false);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);

  const filteredBadges = filterRarity
    ? badges.filter(b => b.rarity === filterRarity)
    : badges;

  const displayBadges = showAll ? filteredBadges : filteredBadges.slice(0, 12);
  const rarities = ['legendary', 'epic', 'rare', 'uncommon', 'common'] as const;

  if (!badges || badges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
            <Award size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-[10px] text-white/40">{badges.length} badge{badges.length !== 1 ? 's' : ''} earned</p>
          </div>
        </div>
        {badges.length > 12 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium"
          >
            {showAll ? 'Show less' : `View all ${badges.length}`}
          </motion.button>
        )}
      </div>

      {/* Rarity filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterRarity(null)}
          className={cn(
            'px-2 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all',
            !filterRarity
              ? 'bg-white/[0.08] text-white'
              : 'bg-white/[0.03] text-white/30 hover:text-white/50'
          )}
        >
          All
        </button>
        {rarities.map((rarity) => {
          const count = badges.filter(b => b.rarity === rarity).length;
          if (count === 0) return null;
          const config = RARITY_CONFIG[rarity];
          return (
            <button
              key={rarity}
              onClick={() => setFilterRarity(filterRarity === rarity ? null : rarity)}
              className={cn(
                'px-2 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all',
                filterRarity === rarity
                  ? `bg-gradient-to-r ${config.gradient} text-white`
                  : 'bg-white/[0.03] text-white/30 hover:text-white/50'
              )}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        <AnimatePresence mode="popLayout">
          {displayBadges.map((badge, index) => {
            const config = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
            return (
              <BadgeTooltip key={badge.id} badge={badge}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    delay: index * 0.03,
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ scale: 1.12, rotate: [0, -5, 5, 0] }}
                  className={cn(
                    'w-full aspect-square rounded-xl bg-gradient-to-br border cursor-pointer flex items-center justify-center relative overflow-hidden',
                    config.gradient,
                    config.border,
                    config.glow
                  )}
                >
                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {/* Badge icon */}
                  <span className="relative z-10 text-lg sm:text-xl">
                    {badge.icon || '🎖️'}
                  </span>

                  {/* Rarity indicator dot */}
                  <div className={cn(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                    badge.rarity === 'legendary' ? 'bg-amber-400 animate-pulse' :
                    badge.rarity === 'epic' ? 'bg-purple-400' :
                    badge.rarity === 'rare' ? 'bg-blue-400' :
                    badge.rarity === 'uncommon' ? 'bg-emerald-400' :
                    'bg-gray-400'
                  )} />
                </motion.div>
              </BadgeTooltip>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state for filter */}
      {displayBadges.length === 0 && filterRarity && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <X size={20} className="text-white/20" />
          </div>
          <p className="text-xs text-white/40">No {filterRarity} badges found</p>
        </div>
      )}
    </motion.div>
  );
}