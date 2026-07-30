'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  DollarSign,
  Gift,
  Sparkles,
  Loader2,
  Calendar,
  Clock,
  FileText,
  Video,
  Image,
  Film,
  Radio,
  Settings,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  Crown,
  Award,
  Star,
} from 'lucide-react';

// Tab definitions
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Metric card component
function MetricCard({ icon: Icon, label, value, change, color }: {
  icon: any;
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
  color: string;
}) {
  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
          <Icon size={16} className="text-white" />
        </div>
        {change && (
          <span className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium',
            change.positive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {change.positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {change.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40 mt-1">{label}</p>
    </div>
  );
}

export default function CreatorStudioPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, contentData] = await Promise.all([
        apiGet<any>('/api/creator/stats', token).catch(() => null),
        apiGet<any>('/api/creator/content', token).catch(() => ({ posts: [] })),
      ]);
      setStats(statsData);
      setContent(Array.isArray(contentData) ? contentData : contentData?.posts ?? contentData?.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load creator studio');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load creator studio</h2>
        <p className="text-sm text-white/30 mb-6">{error}</p>
        <button onClick={fetchData} className="btn-primary text-sm">Try Again</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Creator Studio</h1>
            <p className="text-sm text-white/40">Manage your content and grow your audience</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400 border border-amber-500/20">
            <Crown size={10} className="inline mr-1" />
            Creator Level {stats?.level || 1}
          </span>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-sm'
                    : 'text-gray-500 hover:text-white'
                )}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              icon={Eye}
              label="Total Views"
              value={(stats?.totalViews ?? 0).toLocaleString()}
              change={{ value: '+12.5%', positive: true }}
              color="bg-blue-500/10 border border-blue-500/20"
            />
            <MetricCard
              icon={Users}
              label="Total Followers"
              value={(stats?.totalFollowers ?? 0).toLocaleString()}
              change={{ value: '+5.2%', positive: true }}
              color="bg-purple-500/10 border border-purple-500/20"
            />
            <MetricCard
              icon={Heart}
              label="Total Likes"
              value={(stats?.totalLikes ?? 0).toLocaleString()}
              change={{ value: '+8.1%', positive: true }}
              color="bg-pink-500/10 border border-pink-500/20"
            />
            <MetricCard
              icon={DollarSign}
              label="Total Earnings"
              value={`${(stats?.totalEarnings ?? 0).toLocaleString()} ⚡`}
              change={{ value: '+15.3%', positive: true }}
              color="bg-emerald-500/10 border border-emerald-500/20"
            />
          </div>

          {/* Performance Chart Placeholder */}
          <div className="card-premium p-6">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={16} className="text-[#06f7ff]" />
                Performance Overview
              </h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-white/[0.06] text-white/60 hover:text-white transition">7d</button>
                <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white">30d</button>
                <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-white/[0.06] text-white/60 hover:text-white transition">90d</button>
              </div>
            </div>
            <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 size={24} className="text-white/10" />
                <p className="text-xs text-white/20">Chart data will appear here</p>
              </div>
            </div>
          </div>

          {/* Recent Content */}
          <div className="card-premium p-6">
            <div className="section-header">
              <h2 className="section-title">
                <FileText size={16} className="text-[#ff007f]" />
                Recent Content
              </h2>
              <button className="section-action flex items-center gap-1">
                View all <ChevronRight size={10} />
              </button>
            </div>
            {content.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText size={24} className="text-white/10 mb-3" />
                <p className="text-sm text-white/30">No content yet</p>
                <p className="text-xs text-white/20 mt-1">Create your first post to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {content.slice(0, 5).map((item: any, i: number) => (
                  <div key={item.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                      {item.type === 'video' ? <Video size={16} className="text-white/40" /> :
                       item.type === 'image' ? <Image size={16} className="text-white/40" /> :
                       <FileText size={16} className="text-white/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.title || 'Untitled'}</p>
                      <p className="text-[10px] text-white/30">
                        {item.views || 0} views · {item.likes || 0} likes
                      </p>
                    </div>
                    <span className="text-[10px] text-white/20">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Growth Recommendations */}
          <div className="card-premium p-6 bg-gradient-to-br from-[#ff007f]/5 via-[#7c3aed]/5 to-[#06f7ff]/5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-[#06f7ff]" />
              <h2 className="text-base font-bold text-white">Growth Recommendations</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Zap size={14} className="text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Post more Reels</p>
                  <p className="text-[10px] text-white/40">Short-form video content gets 3x more engagement</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Users size={14} className="text-[#06f7ff] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Go live this week</p>
                  <p className="text-[10px] text-white/40">Live streams boost follower growth by 40%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
                <Star size={14} className="text-[#ff007f] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Engage with comments</p>
                  <p className="text-[10px] text-white/40">Replying to comments increases retention by 25%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard icon={Eye} label="Views (30d)" value={(stats?.views30d ?? 0).toLocaleString()} color="bg-blue-500/10 border border-blue-500/20" />
            <MetricCard icon={Heart} label="Likes (30d)" value={(stats?.likes30d ?? 0).toLocaleString()} color="bg-pink-500/10 border border-pink-500/20" />
            <MetricCard icon={MessageCircle} label="Comments" value={(stats?.totalComments ?? 0).toLocaleString()} color="bg-purple-500/10 border border-purple-500/20" />
            <MetricCard icon={Share2} label="Shares" value={(stats?.totalShares ?? 0).toLocaleString()} color="bg-cyan-500/10 border border-cyan-500/20" />
          </div>
          <div className="card-premium p-6">
            <h3 className="text-base font-bold text-white mb-4">Detailed Analytics</h3>
            <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
              <BarChart3 size={32} className="text-white/10" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Content Manager</h3>
            <button className="btn-primary text-xs">
              <Sparkles size={12} />
              Create Content
            </button>
          </div>
          {content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center card-premium">
              <FileText size={36} className="text-white/10 mb-4" />
              <h3 className="text-white/50 font-medium text-base mb-1">No content yet</h3>
              <p className="text-white/25 text-sm max-w-xs">Your posts, reels, and streams will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item: any, i: number) => (
                <div key={item.id || i} className="card-premium p-4">
                  <div className="aspect-video rounded-xl bg-white/[0.04] mb-3 flex items-center justify-center">
                    {item.type === 'video' ? <Video size={24} className="text-white/20" /> :
                     item.type === 'image' ? <Image size={24} className="text-white/20" /> :
                     <FileText size={24} className="text-white/20" />}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{item.title || 'Untitled'}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                    <span>{item.views || 0} views</span>
                    <span>{item.likes || 0} likes</span>
                    <span>{item.comments || 0} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-premium p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-white">{(stats?.totalEarnings ?? 0).toLocaleString()} ⚡</p>
            </div>
            <div className="card-premium p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Gifts Received</p>
              <p className="text-2xl font-bold text-white">{(stats?.giftsReceived ?? 0).toLocaleString()} ⚡</p>
            </div>
            <div className="card-premium p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">This Month</p>
              <p className="text-2xl font-bold text-white">{(stats?.monthlyEarnings ?? 0).toLocaleString()} ⚡</p>
            </div>
          </div>
          <div className="card-premium p-6">
            <h3 className="text-base font-bold text-white mb-4">Revenue History</h3>
            <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
              <DollarSign size={32} className="text-white/10" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Audience Tab */}
      {activeTab === 'audience' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-premium p-6">
              <h3 className="text-sm font-bold text-white mb-4">Demographics</h3>
              <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <Users size={32} className="text-white/10" />
              </div>
            </div>
            <div className="card-premium p-6">
              <h3 className="text-sm font-bold text-white mb-4">Active Hours</h3>
              <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                <Clock size={32} className="text-white/10" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="card-premium p-6">
            <h3 className="text-base font-bold text-white mb-4">Creator Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <div>
                  <p className="text-sm font-medium text-white">Creator Verification</p>
                  <p className="text-[10px] text-white/40">Get verified to unlock premium features</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-[10px] font-bold text-white">
                  Apply
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <div>
                  <p className="text-sm font-medium text-white">Monetization</p>
                  <p className="text-[10px] text-white/40">Enable tips and gifts for your content</p>
                </div>
                <div className="w-10 h-6 rounded-full bg-emerald-500/30 relative cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <div>
                  <p className="text-sm font-medium text-white">Content Scheduling</p>
                  <p className="text-[10px] text-white/40">Schedule posts for optimal times</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg bg-white/[0.06] text-[10px] font-medium text-white/60 hover:text-white transition">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}