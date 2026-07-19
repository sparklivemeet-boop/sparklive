"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, UserPlus, Activity, Radio, UserCog,
  Building2, FileText, Video, BookOpen, MessageCircle,
  DollarSign, TrendingUp, ShoppingCart, Wallet, AlertTriangle,
  Server, Database, HardDrive, RefreshCw, Eye, EyeOff,
  ArrowUp, ArrowDown, MoreHorizontal, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { getDashboardStats } from '@/lib/adminApi';
import type { DashboardStats } from '@/types/admin';

// Format large numbers
const fmt = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
};

const fmtCurrency = (n: number) => '$' + fmt(n);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; positive: boolean };
  color: string;
  subtitle?: string;
  delay?: number;
}

function StatCard({ title, value, icon: Icon, trend, color, subtitle, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.03, duration: 0.4, ease: 'easeOut' }}
      className="glass rounded-[20px] p-5 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,127,0.06)] group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend.positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {trend.positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{title}</p>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

interface HealthBadgeProps {
  status: string;
}

function HealthBadge({ status }: HealthBadgeProps) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-500/15 text-green-400 border-green-500/20',
    degraded: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    down: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  const dots: Record<string, string> = {
    healthy: 'bg-green-400',
    degraded: 'bg-yellow-400',
    down: 'bg-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border ${colors[status] || colors.healthy}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.healthy}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeVisible, setRealTimeVisible] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Poll for real-time updates
  useEffect(() => {
    if (!realTimeVisible || !stats) return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (err) {
        console.error('Failed to refresh dashboard stats:', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [realTimeVisible, stats]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: fmt(stats.totalUsers), icon: Users, color: 'bg-gradient-to-br from-pink-500 to-rose-600', trend: { value: 12.5, positive: true }, subtitle: `+${fmt(stats.newRegistrations)} today` },
    { title: 'Active Users', value: fmt(stats.activeUsers), icon: UserCheck, color: 'bg-gradient-to-br from-emerald-500 to-green-600', trend: { value: 8.3, positive: true } },
    { title: 'Online Now', value: fmt(stats.onlineUsers), icon: Activity, color: 'bg-gradient-to-br from-cyan-500 to-blue-600', subtitle: 'Live right now' },
    { title: 'New Registrations', value: fmt(stats.newRegistrations), icon: UserPlus, color: 'bg-gradient-to-br from-violet-500 to-purple-600', trend: { value: 23.1, positive: true }, subtitle: 'Last 24h' },
    { title: 'Live Streams', value: fmt(stats.liveStreams), icon: Radio, color: 'bg-gradient-to-br from-red-500 to-orange-600', subtitle: `${stats.onlineUsers} watching` },
    { title: 'Active Creators', value: fmt(stats.activeCreators), icon: UserCog, color: 'bg-gradient-to-br from-purple-500 to-indigo-600', trend: { value: 5.7, positive: true } },
    { title: 'Communities', value: fmt(stats.communities), icon: Building2, color: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
    { title: 'Posts', value: fmt(stats.posts), icon: FileText, color: 'bg-gradient-to-br from-amber-500 to-yellow-600' },
    { title: 'Shorts', value: fmt(stats.shorts), icon: Video, color: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
    { title: 'Stories', value: fmt(stats.stories), icon: BookOpen, color: 'bg-gradient-to-br from-sky-500 to-blue-600' },
    { title: 'Messages Today', value: fmt(stats.messagesSentToday), icon: MessageCircle, color: 'bg-gradient-to-br from-pink-500 to-fuchsia-600', subtitle: 'Sent in last 24h' },
    { title: 'Revenue Today', value: fmtCurrency(stats.revenueToday), icon: DollarSign, color: 'bg-gradient-to-br from-green-500 to-emerald-600', trend: { value: 15.2, positive: true } },
    { title: 'Monthly Revenue', value: fmtCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'bg-gradient-to-br from-purple-500 to-pink-600', trend: { value: 22.8, positive: true } },
    { title: 'Coin Purchases', value: fmt(stats.coinPurchases), icon: ShoppingCart, color: 'bg-gradient-to-br from-yellow-500 to-amber-600', subtitle: 'Today' },
    { title: 'Creator Payouts', value: fmt(stats.creatorPayouts), icon: Wallet, color: 'bg-gradient-to-br from-indigo-500 to-purple-600', subtitle: 'Pending' },
    { title: 'Pending Reports', value: fmt(stats.pendingReports), icon: AlertTriangle, color: 'bg-gradient-to-br from-red-500 to-pink-600', trend: { value: 8.5, positive: false } },
  ];

  const healthItems = [
    { label: 'Server', value: stats.serverHealth, icon: Server },
    { label: 'API', value: stats.apiStatus, icon: Database },
    { label: 'Database', value: stats.databaseHealth, icon: Database },
    { label: 'Storage', value: `${stats.storageUsage}%`, icon: HardDrive, isPercent: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-pink-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">Admin Control Center</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, {user?.fullName || user?.username}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Here's what's happening with SparkLive today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/[0.06]">
            {(['24h', '7d', '30d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  timeframe === t ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Real-time toggle */}
          <button
            onClick={() => setRealTimeVisible(!realTimeVisible)}
            className={`p-2 rounded-xl transition-colors ${
              realTimeVisible ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-gray-500'
            }`}
            title={realTimeVisible ? 'Pause real-time updates' : 'Enable real-time updates'}
          >
            {realTimeVisible ? <Activity size={16} className="animate-pulse" /> : <Activity size={16} />}
          </button>
          <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i} />
        ))}
      </div>

      {/* Bottom Row: System Health + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-pink-400" />
              <h3 className="text-sm font-bold text-white">System Health</h3>
            </div>
            <span className="text-[10px] text-gray-500">Auto-refreshes every 30s</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {healthItems.map((item) => (
              <div key={item.label} className="glass rounded-2xl p-4 text-center">
                <item.icon size={20} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-400">{item.label}</p>
                {item.isPercent ? (
                  <div className="mt-2">
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${stats.storageUsage}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold text-white mt-1">{stats.storageUsage}%</p>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-center">
                    <HealthBadge status={item.value} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 border-t border-white/[0.06] pt-3">
            <span>All systems operational</span>
            <span>Uptime: 14d 7h 32m</span>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Review Pending Reports', icon: AlertTriangle, count: stats.pendingReports, color: 'text-red-400' },
              { label: 'Process Creator Payouts', icon: Wallet, count: stats.creatorPayouts, color: 'text-yellow-400' },
              { label: 'Check Server Status', icon: Server, count: null, color: 'text-cyan-400' },
              { label: 'View New Registrations', icon: UserPlus, count: stats.newRegistrations, color: 'text-green-400' },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center justify-between p-3 rounded-2xl glass hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <action.icon size={14} className={action.color} />
                  <span className="text-xs text-gray-300">{action.label}</span>
                </div>
                {action.count !== null && (
                  <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
                    {action.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}