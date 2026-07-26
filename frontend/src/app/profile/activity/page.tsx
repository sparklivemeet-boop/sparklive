'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Users, Radio, Gift, Award, Star, Zap, Eye, Clock, ArrowLeft, ChevronRight, ThumbsUp, Share2, UserPlus, Activity as ActivityIcon, Music, Gamepad2, Palette, BookOpen, Trophy, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';

const ACTIVITIES = [
  { type: 'like', description: 'Liked a post by Sarah', time: '2 min ago', icon: Heart, color: 'text-[#ff007f]', bg: 'bg-[#ff007f]/10' },
  { type: 'follow', description: 'Started following Mike', time: '15 min ago', icon: UserPlus, color: 'text-[#00d8ff]', bg: 'bg-[#00d8ff]/10' },
  { type: 'stream', description: 'Went live - "Gaming Night!"', time: '1 hour ago', icon: Radio, color: 'text-red-400', bg: 'bg-red-500/10' },
  { type: 'gift', description: 'Received a gift from Alex', time: '2 hours ago', icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { type: 'achievement', description: 'Earned "Streak Master" badge', time: '3 hours ago', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { type: 'like', description: 'Liked a comment by Jane', time: '4 hours ago', icon: Heart, color: 'text-[#ff007f]', bg: 'bg-[#ff007f]/10' },
  { type: 'follow', description: 'Gained a new follower: Emily', time: '5 hours ago', icon: Users, color: 'text-[#7a00cc]', bg: 'bg-[#7a00cc]/10' },
  { type: 'stream', description: 'Streamed "Music Session" ended', time: '6 hours ago', icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { type: 'achievement', description: 'Reached 100 followers!', time: '1 day ago', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { type: 'gift', description: 'Sent a gift to CreativeStudio', time: '1 day ago', icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { type: 'like', description: 'Liked a video by TechTutorials', time: '2 days ago', icon: ThumbsUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { type: 'share', description: 'Shared a post to timeline', time: '2 days ago', icon: Share2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { type: 'stream', description: 'Scheduled a stream for tomorrow', time: '3 days ago', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { type: 'achievement', description: 'Completed "Rising Star" challenge', time: '4 days ago', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { type: 'like', description: 'Liked a stream by GamingPro', time: '5 days ago', icon: Eye, color: 'text-[#00d8ff]', bg: 'bg-[#00d8ff]/10' },
  { type: 'follow', description: 'Started following ArtByDesign', time: '1 week ago', icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

const FILTERS = [
  { id: 'all', label: 'All', icon: ActivityIcon },
  { id: 'like', label: 'Likes', icon: Heart },
  { id: 'follow', label: 'Follows', icon: UserPlus },
  { id: 'stream', label: 'Streams', icon: Radio },
  { id: 'gift', label: 'Gifts', icon: Gift },
  { id: 'achievement', label: 'Achievements', icon: Award },
];

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = activeFilter === 'all'
    ? ACTIVITIES
    : ACTIVITIES.filter(a => a.type === activeFilter);

  const getActivityIcon = (activity: typeof ACTIVITIES[0]) => {
    const Icon = activity.icon;
    return (
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', activity.bg)}>
        <Icon size={15} className={activity.color} />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-4">
          <ArrowLeft size={14} />
          Back to profile
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Activity</h1>
            <p className="text-sm text-white/40 mt-1">Your recent actions and interactions</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 hover:text-white transition-all sm:hidden"
          >
            <Filter size={13} />
            Filter
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="hidden sm:flex items-center gap-2 mb-6"
      >
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all border',
                isActive
                  ? 'bg-[#ff007f]/10 border-[#ff007f]/20 text-[#ff007f]'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.05]'
              )}
            >
              <Icon size={13} />
              {filter.label}
            </button>
          );
        })}
      </motion.div>

      {/* Filter Tabs - Mobile */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden overflow-hidden mb-4"
          >
            <div className="flex flex-wrap gap-2 pt-2">
              {FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => { setActiveFilter(filter.id); setShowFilters(false); }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all border',
                      isActive
                        ? 'bg-[#ff007f]/10 border-[#ff007f]/20 text-[#ff007f]'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/40'
                    )}
                  >
                    <Icon size={12} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-lg font-bold text-white">{ACTIVITIES.length}</p>
          <p className="text-[9px] text-white/40 mt-0.5">Total Actions</p>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-lg font-bold text-white">{ACTIVITIES.filter(a => a.type === 'like').length}</p>
          <p className="text-[9px] text-white/40 mt-0.5">Likes</p>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-lg font-bold text-white">{ACTIVITIES.filter(a => a.type === 'stream').length}</p>
          <p className="text-[9px] text-white/40 mt-0.5">Streams</p>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-lg font-bold text-white">{ACTIVITIES.filter(a => a.type === 'gift').length}</p>
          <p className="text-[9px] text-white/40 mt-0.5">Gifts</p>
        </div>
      </motion.div>

      {/* Activity Feed */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filtered.map((activity, i) => (
            <motion.div
              key={`${activity.type}-${i}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.02, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              {/* Timeline line */}
              <div className="relative flex flex-col items-center">
                {getActivityIcon(activity)}
                {i < filtered.length - 1 && (
                  <div className="w-px h-full min-h-[20px] bg-white/[0.04] mt-1" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                  {activity.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-white/30">{activity.time}</span>
                <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <ActivityIcon size={40} className="text-white/10 mb-4" />
          <p className="text-sm text-white/30">No activity found</p>
        </motion.div>
      )}
    </div>
  );
}