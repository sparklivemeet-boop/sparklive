'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, Award, TrendingUp, Shield, Star, Zap, Crown, ChevronRight, Gift, Heart, MessageCircle, Clock, Calendar, Flame, Sparkles, Music, Gamepad2, Palette, BookOpen, Trophy, Monitor, Smartphone, DollarSign, Activity, BarChart3, Target, Eye } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

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
  recentActivity?: { type: string; description: string; time: string; icon?: string }[];
  upcomingStreams?: { title: string; date: string; time: string; category?: string }[];
  topDonors?: { name: string; amount: number; avatar?: string }[];
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
          <motion.span
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
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
  const [showAll, setShowAll] = useState(false);
  const displayBadges = showAll ? badges : badges.slice(0, 6);

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
        {displayBadges.map((badge) => (
          <div key={badge.id} className="group relative">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rarityColors[badge.rarity] || 'from-gray-400 to-gray-500'} bg-opacity-20 flex items-center justify-center border border-white/[0.06] cursor-pointer transition-transform`}
            >
              <span className="text-sm">{badge.icon}</span>
            </motion.div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-xl bg-[#0e0e16]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              <p className="text-[10px] font-medium text-white">{badge.label}</p>
              <p className="text-[8px] text-white/40 uppercase tracking-wider">{badge.rarity}</p>
            </div>
          </div>
        ))}
        {badges.length > 6 && !showAll && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAll(true)}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-medium cursor-pointer hover:bg-white/[0.08] transition-colors"
          >
            +{badges.length - 6}
          </motion.button>
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
          <p className="text-[10px] text-amber-400/60">Top {Math.round(rankPercentile)}%</p>
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
          <div className="flex items-center justify-between text-[9px] text-white/30 mb-1">
            <span>Progress to next level</span>
            <span>{Math.round(rankPercentile)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, rankPercentile)}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecentActivityCard({ activities }: { activities: NonNullable<SidebarProps['recentActivity']> }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={12} className="text-[#ff007f]" />;
      case 'follow': return <Users size={12} className="text-[#00d8ff]" />;
      case 'stream': return <Radio size={12} className="text-red-400" />;
      case 'gift': return <Gift size={12} className="text-amber-400" />;
      case 'achievement': return <Award size={12} className="text-emerald-400" />;
      default: return <Activity size={12} className="text-white/40" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4"
    >
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {activities.slice(0, 4).map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/60 truncate">{activity.description}</p>
              <p className="text-[9px] text-white/30">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function UpcomingStreamsCard({ streams }: { streams: NonNullable<SidebarProps['upcomingStreams']> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4"
    >
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Upcoming Streams</h3>
      <div className="space-y-2">
        {streams.slice(0, 3).map((stream, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff007f]/10 to-[#7a00cc]/10 border border-white/[0.06] flex items-center justify-center shrink-0">
              <Calendar size={15} className="text-[#ff007f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{stream.title}</p>
              <p className="text-[9px] text-white/40">{stream.date} at {stream.time}</p>
            </div>
            {stream.category && (
              <span className="text-[8px] text-white/30 px-1.5 py-0.5 rounded-md bg-white/[0.04]">
                {stream.category}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TopDonorsCard({ donors }: { donors: NonNullable<SidebarProps['topDonors']> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4"
    >
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Top Supporters</h3>
      <div className="space-y-2">
        {donors.slice(0, 4).map((donor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <div className="relative">
              <Avatar src={donor.avatar} alt={donor.name} size="xs" />
              {i === 0 && (
                <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/70 truncate">{donor.name}</p>
            </div>
            <span className="text-[10px] font-semibold text-amber-400">${donor.amount}</span>
          </motion.div>
        ))}
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
  recentActivity,
  upcomingStreams,
  topDonors,
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

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <RecentActivityCard activities={recentActivity} />
      )}

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

      {/* Upcoming Streams */}
      {upcomingStreams && upcomingStreams.length > 0 && (
        <UpcomingStreamsCard streams={upcomingStreams} />
      )}

      {/* Top Supporters */}
      {topDonors && topDonors.length > 0 && (
        <TopDonorsCard donors={topDonors} />
      )}

      {/* Creator Rank */}
      {creatorRank && <CreatorRankCard rank={creatorRank} />}
    </div>
  );
}