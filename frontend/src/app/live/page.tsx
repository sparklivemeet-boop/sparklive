'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  Radio,
  Users,
  TrendingUp,
  Gamepad2,
  Music,
  Palette,
  Globe,
  BookOpen,
  Star,
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Crown,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  Calendar,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import GoLiveModal from '@/components/create/GoLiveModal';
import LiveCategoryFilters from '@/components/live/LiveCategoryFilters';
import LiveFeaturedStream from '@/components/live/LiveFeaturedStream';
import LiveSidebar from '@/components/live/LiveSidebar';
import LiveStreamCard from '@/components/live/LiveStreamCard';

const categories = [
  { id: 'all', label: 'All', icon: Radio },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'irl', label: 'IRL', icon: Globe },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'premium', label: 'Premium', icon: Crown },
];

export default function LivePage() {
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [featuredStream, setFeaturedStream] = useState<any>(null);
  const [goLiveOpen, setGoLiveOpen] = useState(false);

  const fetchStreams = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>(`/api/streams/live?category=${activeCategory}`, token).catch(() => ({ streams: [] }));
      const streamList = Array.isArray(data) ? data : data?.streams ?? data?.data ?? [];
      setStreams(streamList);
      if (streamList.length > 0) {
        setFeaturedStream(streamList[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  }, [token, activeCategory]);

  useEffect(() => { fetchStreams(); }, [fetchStreams]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Radio size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Live</h1>
            <p className="text-sm text-white/40">Discover live streams</p>
          </div>
        </div>
        <button onClick={() => setGoLiveOpen(true)} className="btn-primary text-sm">
          <Radio size={14} />
          Go Live
        </button>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-sm'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                )}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-[400px] rounded-3xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="skeleton h-48 rounded-2xl" />
              <div className="skeleton h-48 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Loader2 size={24} className="text-red-400" />
          </div>
          <h3 className="text-white/50 font-medium text-lg mb-1">Failed to load streams</h3>
          <p className="text-white/30 text-sm mb-4">{error}</p>
          <button onClick={fetchStreams} className="btn-primary text-sm">
            Try Again
          </button>
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/15 flex items-center justify-center mb-5">
            <Radio size={36} className="text-red-400/30" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No live streams</h3>
          <p className="text-sm text-white/30 max-w-sm mb-6">
            There are no live streams in this category right now. Be the first to go live!
          </p>
          <button onClick={() => setGoLiveOpen(true)} className="btn-primary text-sm">
            <Radio size={14} />
            Go Live Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Stream */}
            {featuredStream && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <LiveFeaturedStream stream={featuredStream} />
              </motion.div>
            )}

            {/* Stream Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="section-header">
                <h2 className="section-title">
                  <Radio size={16} className="text-red-400" />
                  All Streams
                </h2>
                <span className="text-xs text-white/30">{streams.length} streams</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {streams.slice(1).map((stream, i) => (
                  <motion.div
                    key={stream.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <LiveStreamCard stream={stream} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Streams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-5"
            >
              <div className="section-header">
                <h2 className="section-title">
                  <Calendar size={16} className="text-[#06f7ff]" />
                  Upcoming Streams
                </h2>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock size={24} className="text-white/10 mb-3" />
                <p className="text-sm text-white/30">No upcoming streams scheduled</p>
                <p className="text-xs text-white/20 mt-1">Creators will schedule streams here</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LiveSidebar />
            </div>
          </div>
        </div>
      )}

      <GoLiveModal open={goLiveOpen} onClose={() => setGoLiveOpen(false)} />
    </motion.div>
  );
}