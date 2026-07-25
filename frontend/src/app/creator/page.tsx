'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Sparkles, TrendingUp, Users, Eye, DollarSign, Radio, BarChart3, Settings, Loader2, Calendar, Activity, Zap, Crown, Star, ChevronRight, Clock, Gift, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

const creatorLinks = [
  { icon: Radio, label: 'Go Live', href: '/creator/live', color: 'from-pink-500 to-rose-600', desc: 'Start streaming now' },
  { icon: BarChart3, label: 'Analytics', href: '/creator/analytics', color: 'from-purple-500 to-violet-600', desc: 'Track your growth' },
  { icon: TrendingUp, label: 'Earnings', href: '/creator/earnings', color: 'from-emerald-500 to-teal-600', desc: 'Revenue & payouts' },
  { icon: Users, label: 'Community', href: '/creator/community', color: 'from-cyan-500 to-blue-600', desc: 'Manage followers' },
  { icon: Sparkles, label: 'Content', href: '/creator/content', color: 'from-amber-500 to-orange-600', desc: 'Your posts & streams' },
  { icon: Settings, label: 'Settings', href: '/creator/monetization', color: 'from-indigo-500 to-purple-600', desc: 'Channel settings' },
];

export default function CreatorDashboard() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/analytics/creator/summary', token);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-white/30 mb-6">{error}</p>
        <button onClick={fetchAnalytics} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    { icon: Eye, label: 'Total Views', value: analytics?.totalViews ?? 0, change: '+12.5%', color: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-400' },
    { icon: Users, label: 'Followers', value: analytics?.totalFollowers ?? 0, change: '+5.2%', color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400' },
    { icon: DollarSign, label: 'Earnings', value: `$${analytics?.totalEarnings ?? 0}`, change: '+18.7%', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
    { icon: Radio, label: 'Streams', value: analytics?.totalStreams ?? 0, change: '+8.3%', color: 'from-cyan-500/20 to-cyan-500/5', iconColor: 'text-cyan-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6 pb-24 lg:pb-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Creator Studio</h1>
            <p className="text-sm text-white/40">Manage your content, track growth, and earn revenue</p>
          </div>
        </div>
        <Link
          href="/creator/live"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all"
        >
          <Radio size={14} />
          Go Live
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br border border-white/[0.06] p-4', stat.color)}
          >
            <stat.icon size={16} className={cn('mb-2', stat.iconColor)} />
            <p className="text-2xl font-bold text-white tabular-nums">
              {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-[8px] font-medium text-emerald-400">
              {stat.change}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <Link href="/creator/settings" className="text-xs text-white/30 hover:text-white transition-colors">Manage all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {creatorLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
            >
              <Link
                href={link.href}
                className="flex flex-col items-center text-center gap-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 group"
              >
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', link.color)}>
                  <link.icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{link.label}</p>
                  <p className="text-[8px] text-white/30 mt-0.5">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-white/40" />
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          </div>
          <button className="text-xs text-white/30 hover:text-white transition-colors">View all</button>
        </div>

        {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
          <div className="space-y-1">
            {analytics.recentActivity.map((activity: any, i: number) => (
              <motion.div
                key={activity.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border',
                  activity.type === 'stream' && 'bg-red-500/10 border-red-500/20',
                  activity.type === 'post' && 'bg-[#ff007f]/10 border-[#ff007f]/20',
                  activity.type === 'gift' && 'bg-amber-500/10 border-amber-500/20',
                )}>
                  {activity.type === 'stream' && <Play size={16} className="text-red-400" />}
                  {activity.type === 'post' && <Sparkles size={16} className="text-[#ff007f]" />}
                  {activity.type === 'gift' && <Gift size={16} className="text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{activity.message || activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={10} className="text-white/20" />
                    <span className="text-[10px] text-white/30">{activity.time || new Date(activity.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Activity size={32} className="text-white/10 mb-3" />
            <h3 className="text-white/50 font-medium text-base mb-1">No recent activity</h3>
            <p className="text-white/25 text-sm max-w-md">Your recent streams, posts, and interactions will appear here. Start creating to see activity!</p>
          </div>
        )}
      </motion.div>

      {/* Growth Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl bg-gradient-to-br from-[#ff007f]/5 via-[#7a00cc]/5 to-[#00d8ff]/5 border border-[#ff007f]/10 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[#ff007f]" />
          <h2 className="text-lg font-bold text-white">Growth Tips</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Stream consistently', desc: 'Stream at least 3 times per week to build your audience', emoji: '📅' },
            { title: 'Engage with viewers', desc: 'Reply to comments and chat messages to build community', emoji: '💬' },
            { title: 'Use tags & categories', desc: 'Properly tag your streams to reach the right audience', emoji: '🏷️' },
            { title: 'Promote your streams', desc: 'Share your live streams on social media platforms', emoji: '📢' },
          ].map((tip, i) => (
            <div key={tip.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-lg">{tip.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-white">{tip.title}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}