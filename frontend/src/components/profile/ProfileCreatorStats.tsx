'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import {
  TrendingUp, Users, Eye, Heart, Radio, Clock, DollarSign,
  Activity, Target, BarChart3, Zap, Sparkles, ArrowUp, ArrowDown,
  ChevronRight, Star, Flame, Crown, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatorStatsData {
  profileVisits: number;
  followerGrowth: number;
  engagementRate: number;
  postImpressions: number;
  liveViewers: number;
  giftRevenue: number;
  watchTime: string;
  totalStreams: number;
  totalPosts: number;
  totalShorts: number;
  avgWatchTime: string;
  peakViewers: number;
  totalGifts: number;
  sparksReceived: number;
}

interface ProfileCreatorStatsProps {
  stats: CreatorStatsData;
  loading?: boolean;
}

function StatCard({ 
  label, 
  value, 
  prefix = '', 
  suffix = '', 
  icon, 
  trend, 
  trendLabel,
  color,
  delay = 0 
}: { 
  label: string; 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down'; 
  trendLabel?: string;
  color: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; glow: string }> = {
    pink: { 
      bg: 'bg-gradient-to-br from-[#ff007f]/5 to-[#7a00cc]/5', 
      border: 'border-[#ff007f]/15', 
      text: 'text-[#ff007f]',
      iconBg: 'bg-[#ff007f]/10 border-[#ff007f]/20',
      glow: 'shadow-[#ff007f]/10'
    },
    cyan: { 
      bg: 'bg-gradient-to-br from-[#00d8ff]/5 to-[#3b82f6]/5', 
      border: 'border-[#00d8ff]/15', 
      text: 'text-[#00d8ff]',
      iconBg: 'bg-[#00d8ff]/10 border-[#00d8ff]/20',
      glow: 'shadow-[#00d8ff]/10'
    },
    emerald: { 
      bg: 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5', 
      border: 'border-emerald-500/15', 
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'shadow-emerald-500/10'
    },
    amber: { 
      bg: 'bg-gradient-to-br from-amber-500/5 to-orange-500/5', 
      border: 'border-amber-500/15', 
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      glow: 'shadow-amber-500/10'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-purple-500/5 to-pink-500/5', 
      border: 'border-purple-500/15', 
      text: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      glow: 'shadow-purple-500/10'
    },
    blue: { 
      bg: 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5', 
      border: 'border-blue-500/15', 
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      glow: 'shadow-blue-500/10'
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(0, value, {
        duration: 1.5 + delay * 0.1,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value, delay]);

  const formatValue = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={cn(
        'rounded-2xl border p-4 transition-all duration-300 group relative overflow-hidden',
        c.bg,
        c.border,
        c.glow
      )}
    >
      {/* Hover gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.02), transparent 50%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center border',
            c.iconBg
          )}>
            <span className={c.text}>{icon}</span>
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold',
              trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            )}>
              {trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {trendLabel || ''}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
            {prefix}{displayValue > 0 ? formatValue(displayValue) : '0'}
          </span>
          {suffix && (
            <span className="text-xs text-white/40 font-medium">{suffix}</span>
          )}
        </div>

        {/* Label */}
        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-1.5">
          {label}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        'absolute bottom-0 left-3 right-3 h-[1px] rounded-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity'
      )} />
    </motion.div>
  );
}

export default function ProfileCreatorStats({ stats, loading }: ProfileCreatorStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
            <div className="skeleton h-8 w-20 mb-2" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Profile Visits', value: stats.profileVisits, icon: <Eye size={15} />, color: 'cyan', trend: 'up' as const, trendLabel: '12%',
    },
    {
      label: 'Follower Growth', value: stats.followerGrowth, icon: <Users size={15} />, color: 'emerald', trend: 'up' as const, trendLabel: '8%',
    },
    {
      label: 'Engagement Rate', value: stats.engagementRate, suffix: '%', icon: <Activity size={15} />, color: 'amber', trend: 'up' as const, trendLabel: '3%',
    },
    {
      label: 'Post Impressions', value: stats.postImpressions, icon: <BarChart3 size={15} />, color: 'purple', trend: 'up' as const, trendLabel: '15%',
    },
    {
      label: 'Live Viewers', value: stats.liveViewers, icon: <Radio size={15} />, color: 'pink', trend: 'up' as const, trendLabel: '22%',
    },
    {
      label: 'Gift Revenue', value: stats.giftRevenue, prefix: '$', icon: <DollarSign size={15} />, color: 'amber',
    },
    {
      label: 'Watch Time', value: parseInt(stats.watchTime) || 0, suffix: 'h', icon: <Clock size={15} />, color: 'blue',
    },
    {
      label: 'Total Streams', value: stats.totalStreams, icon: <Radio size={15} />, color: 'pink',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d8ff]/10 to-blue-500/10 border border-[#00d8ff]/15 flex items-center justify-center">
            <BarChart3 size={14} className="text-[#00d8ff]" />
          </div>
          <h3 className="text-sm font-bold text-white">Creator Analytics</h3>
        </div>
        <button className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium flex items-center gap-1">
          View all
          <ChevronRight size={10} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => (
          <StatCard key={card.label} {...card} delay={index} />
        ))}
      </div>
    </motion.div>
  );
}