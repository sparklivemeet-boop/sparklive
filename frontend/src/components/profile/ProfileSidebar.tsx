'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, Award, TrendingUp, Shield, Star, Zap, Crown, ChevronRight } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface SidebarProps {
  liveNow?: {
    title: string;
    viewerCount: number;
    thumbnail?: string;
    streamer: { name: string; username: string; avatar?: string };
  } | null;
  community?: {
    name: string;
    members: number;
    online: number;
    avatar?: string;
  };
  badges?: { id: string; label: string; icon: string; rarity: string }[];
  achievements?: { id: string; title: string; description: string; date: string }[];
  creatorRank?: {
    rank: number;
    total: number;
    score: number;
    level: number;
  };
}

function LiveNowCard({ live }: { live: NonNullable<SidebarProps['liveNow']> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/15 overflow-hidden group cursor-pointer hover:border-[#ff007f]/30 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-[#1a1a28] to-[#0e0e16]">
        {live.thumbnail ? (
          <img src={live.thumbnail} alt={live.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio size={32} className="text-[#ff007f]/30" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/80">
          {live.viewerCount.toLocaleString()} watching
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-white truncate">{live.title}</p>
        <div className="flex items-center gap-2 mt-2">
          <Avatar src={live.streamer.avatar} alt={live.streamer.name} size="xs" />
          <span className="text-xs text-white/50">{live.streamer.name}</span>
        </div>
      </div>
    </motion.div>
  );
}

function CommunityCard({ community }: { community: NonNullable<SidebarProps['community']> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7a00cc]/20 to-[#3b82f6]/20 border border-white/[0.06] flex items-center justify-center">
          <Users size={18} className="text-[#7a00cc]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{community.name}</p>
          <p className="text-[10px] text-white/40">
            {community.members.toLocaleString()} members · {community.online} online
          </p>
        </div>
        <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
      </div>
    </motion.div>
  );
}

function BadgesCard({ badges }: { badges: NonNullable<SidebarProps['badges']> }) {
  const rarityColors: Record<string, string> = {
    legendary: 'from-amber-400 to-orange-500',
    epic: 'from-purple-400 to-pink-500',
    rare: 'from-blue-400 to-cyan-400',
    common: 'from-gray-400 to-gray-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Badges</h3>
        <span className="text-[10px] text-white/30">{badges.length} total</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 6).map((badge) => (
          <div
            key={badge.id}
            className="group relative"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rarityColors[badge.rarity] || 'from-gray-400 to-gray-500'} bg-opacity-20 flex items-center justify-center border border-white/[0.06] cursor-pointer hover:scale-110 transition-transform`}>
              <span className="text-sm">{badge.icon}</span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-xl bg-[#0e0e16]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              <p className="text-[10px] font-medium text-white">{badge.label}</p>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">{badge.rarity}</p>
            </div>
          </div>
        ))}
        {badges.length > 6 && (
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-medium cursor-pointer hover:bg-white/[0.08] transition-colors">
            +{badges.length - 6}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AchievementCard({ achievement }: { achievement: NonNullable<SidebarProps['achievements']>[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Award size={14} className="text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white truncate">{achievement.title}</p>
        <p className="text-[10px] text-white/40 mt-0.5">{achievement.description}</p>
        <p className="text-[8px] text-white/20 mt-0.5">{achievement.date}</p>
      </div>
    </motion.div>
  );
}

function CreatorRankCard({ rank }: { rank: NonNullable<SidebarProps['creatorRank']> }) {
  const rankPercentile = ((rank.total - rank.rank) / rank.total * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Crown size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Creator Rank</p>
          <p className="text-[10px] text-amber-400/60">Top {rankPercentile}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Rank</span>
          <span className="text-white font-semibold">#{rank.rank.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Level</span>
          <span className="text-white font-semibold">{rank.level}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Score</span>
          <span className="text-white font-semibold">{rank.score.toLocaleString()}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: `${Math.min(100, rankPercentile)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfileSidebar({
  liveNow,
  community,
  badges,
  achievements,
  creatorRank,
}: SidebarProps) {
  return (
    <div className="space-y-4">
      {/* Section Label */}
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold px-1">
        Overview
      </div>

      {/* Live Now */}
      {liveNow && <LiveNowCard live={liveNow} />}

      {/* Community */}
      {community && <CommunityCard community={community} />}

      {/* Badges */}
      {badges && badges.length > 0 && <BadgesCard badges={badges} />}

      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
            Recent Achievements
          </h3>
          <div className="space-y-1">
            {achievements.slice(0, 3).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Creator Rank */}
      {creatorRank && <CreatorRankCard rank={creatorRank} />}
    </div>
  );
}