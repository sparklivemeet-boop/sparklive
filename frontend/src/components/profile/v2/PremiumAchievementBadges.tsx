'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Award, Crown, Star, Zap, Shield, Sparkles, Trophy, Medal, Target, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PremiumAchievementBadgesProps {
  achievements: Achievement[];
  loading?: boolean;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-purple-500',
  epic: 'from-purple-400 to-pink-500',
  legendary: 'from-amber-400 to-orange-500',
};

const rarityBorders = {
  common: 'border-gray-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-amber-500/30',
};

const iconMap: Record<string, any> = {
  award: Award,
  crown: Crown,
  star: Star,
  zap: Zap,
  shield: Shield,
  sparkles: Sparkles,
  trophy: Trophy,
  medal: Medal,
  target: Target,
  flame: Flame,
};

export default function PremiumAchievementBadges({ achievements, loading }: PremiumAchievementBadgesProps) {
  if (loading) {
    return (
      <div className="card-premium p-5">
        <div className="skeleton h-4 w-32 mb-4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton w-14 h-14 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (achievements.length === 0) return null;

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Achievements</h3>
        </div>
        <span className="text-[10px] text-white/30">
          {unlocked.length}/{achievements.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {achievements.slice(0, 8).map((achievement, i) => {
          const Icon = iconMap[achievement.icon] || Award;
          const isUnlocked = achievement.unlocked;
          const rarity = achievement.rarity || 'common';

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group"
            >
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                isUnlocked
                  ? cn('bg-gradient-to-br', rarityColors[rarity], 'shadow-lg')
                  : 'bg-white/[0.04] border border-white/[0.06]'
              )}>
                <Icon size={16} className={isUnlocked ? 'text-white' : 'text-white/20'} />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[#1a1a2e] border border-white/[0.08] text-[10px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                <p className="font-medium">{achievement.title}</p>
                <p className="text-white/50">{achievement.description}</p>
              </div>
            </motion.div>
          );
        })}

        {achievements.length > 8 && (
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-medium">
            +{achievements.length - 8}
          </div>
        )}
      </div>
    </div>
  );
}