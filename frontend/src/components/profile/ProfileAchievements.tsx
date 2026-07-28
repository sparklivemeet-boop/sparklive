'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Star, Zap, Crown, Flame, Gift, Heart, Users, Radio, Target, Check, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  date?: string;
  category?: string;
  unlocked?: boolean;
  progress?: number;
  maxProgress?: number;
}

interface ProfileAchievementsProps {
  achievements: Achievement[];
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  '100-followers': <Users size={16} />,
  'first-live': <Radio size={16} />,
  'verified': <Check size={16} />,
  'top-stream': <Crown size={16} />,
  'community-founder': <Users size={16} />,
  'creator-partner': <Award size={16} />,
  'trending': <Zap size={16} />,
  'viral': <Flame size={16} />,
  'gift-master': <Gift size={16} />,
  'fan-favorite': <Heart size={16} />,
};

export default function ProfileAchievements({ achievements }: ProfileAchievementsProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['all', 'milestone', 'live', 'community', 'growth', 'special'];
  const displayAchievements = showAll ? achievements : achievements.slice(0, 6);

  if (!achievements || achievements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <Trophy size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Achievements</h3>
            <p className="text-[10px] text-white/40">{achievements.length} total</p>
          </div>
        </div>
        {achievements.length > 6 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium"
          >
            {showAll ? 'Show less' : `View all ${achievements.length}`}
          </motion.button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((cat) => {
          const count = cat === 'all'
            ? achievements.length
            : achievements.filter(a => (a.category || 'milestone') === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all',
                (selectedCategory === cat || (!selectedCategory && cat === 'all'))
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/20'
                  : 'bg-white/[0.03] text-white/30 hover:text-white/50 border border-transparent'
              )}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Achievements timeline */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayAchievements.map((achievement, index) => {
            const isUnlocked = achievement.unlocked ?? true;
            const progress = achievement.progress ?? 100;
            const maxProgress = achievement.maxProgress ?? 100;
            const progressPercent = Math.min(100, (progress / maxProgress) * 100);

            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  'relative flex items-start gap-3 p-3 rounded-xl transition-all duration-300 group',
                  isUnlocked
                    ? 'hover:bg-white/[0.03] cursor-pointer'
                    : 'opacity-40'
                )}
              >
                {/* Timeline line */}
                {index < displayAchievements.length - 1 && (
                  <div className={cn(
                    'absolute left-[18px] top-10 bottom-0 w-[1px]',
                    isUnlocked ? 'bg-white/[0.06]' : 'bg-white/[0.03]'
                  )} />
                )}

                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300',
                  isUnlocked
                    ? 'bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/20'
                )}>
                  {achievement.icon ? (
                    <span className="text-sm">{achievement.icon}</span>
                  ) : (
                    ACHIEVEMENT_ICONS[achievement.id] || <Star size={14} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      'text-sm font-semibold truncate',
                      isUnlocked ? 'text-white' : 'text-white/40'
                    )}>
                      {achievement.title}
                    </h4>
                    {isUnlocked && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="shrink-0"
                      >
                        <Sparkles size={10} className="text-emerald-400" />
                      </motion.span>
                    )}
                    {!isUnlocked && (
                      <Lock size={10} className="text-white/20 shrink-0" />
                    )}
                  </div>
                  <p className={cn(
                    'text-[11px] mt-0.5',
                    isUnlocked ? 'text-white/50' : 'text-white/20'
                  )}>
                    {achievement.description}
                  </p>

                  {/* Progress bar for locked achievements */}
                  {!isUnlocked && progressPercent < 100 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[8px] text-white/20 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                          initial={{ width: '0%' }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  {achievement.date && isUnlocked && (
                    <p className="text-[9px] text-white/20 mt-1">
                      {new Date(achievement.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                {isUnlocked && (
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors mt-1.5" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {displayAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <Trophy size={20} className="text-white/20" />
          </div>
          <p className="text-xs text-white/40">No achievements yet</p>
          <p className="text-[10px] text-white/20 mt-1">Complete milestones to earn achievements</p>
        </div>
      )}
    </motion.div>
  );
}