'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Radio, TrendingUp, Video, Eye, Loader2, ChevronRight, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import LiveFeaturedStream from '@/components/live/LiveFeaturedStream';
import LiveCategoryFilters from '@/components/live/LiveCategoryFilters';
import LiveStreamCard from '@/components/live/LiveStreamCard';
import LiveSidebar from '@/components/live/LiveSidebar';
import FloatingGoLiveButton from '@/components/profile/FloatingGoLiveButton';
import PremiumGoLiveModal from '@/components/profile/PremiumGoLiveModal';

export default function LivePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [featuredStream, setFeaturedStream] = useState<any>(null);

  const fetchStreams = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/live', token);
      const list = Array.isArray(data) ? data : data?.items ?? data?.streams ?? [];
      const streamArray = Array.isArray(list) ? list : [];
      setStreams(streamArray);
      
      // Only set featured stream if real data exists
      if (streamArray.length > 0) {
        const first = streamArray[0];
        setFeaturedStream({
          id: first.id,
          title: first.title || 'Live Stream',
          description: first.description,
          viewerCount: first.viewerCount || 0,
          likeCount: first.likeCount || 0,
          giftCount: first.giftCount || 0,
          category: first.category || 'General',
          language: first.language || 'English',
          quality: first.quality || 'HD',
          creator: {
            name: first.host?.fullName || first.host?.username || 'Creator',
            username: first.host?.username || '@creator',
            avatar: first.host?.avatar,
            verified: first.host?.verified || false,
            level: first.host?.level || 1,
            followers: first.host?.followersCount || 0,
          },
          topSupporters: first.topSupporters || [],
        });
      } else {
        setFeaturedStream(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStreams(); }, [fetchStreams]);

  // Filter streams by category - only from real data
  const filteredStreams = activeCategory === 'all'
    ? streams
    : streams.filter(s => s.category?.toLowerCase() === activeCategory);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  // No streams available message
  const showNoStreams = !loading && streams.length === 0 && !error;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto space-y-6 pb-24 lg:pb-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff3366] to-[#ff007f] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
                <Radio size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Live</h1>
                <p className="text-sm text-white/40">Discover live streams happening now</p>
              </div>
            </div>
          </div>
          {streams.length > 0 && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">{streams.length} live</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && streams.length === 0 ? (
          <div className="space-y-6">
            <div className="skeleton h-12 w-full rounded-2xl" />
            <div className="skeleton h-[420px] rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i}>
                  <div className="skeleton aspect-video rounded-2xl" />
                  <div className="mt-3 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Loader2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-white/50 font-medium text-lg mb-1">Failed to load streams</h3>
            <p className="text-white/30 text-sm mb-4">{error}</p>
            <button onClick={fetchStreams} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
              Try Again
            </button>
          </div>
        ) : showNoStreams ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/15 flex items-center justify-center mb-5">
              <Radio size={36} className="text-red-400/30" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No live streams right now</h2>
            <p className="text-sm text-white/30 max-w-md mb-6">
              There are no active streams at the moment. Be the first to go live and connect with your audience!
            </p>
            <button
              onClick={() => setGoLiveOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all"
            >
              <Radio size={14} className="inline mr-2" />
              Start Your First Stream
            </button>
            <button
              onClick={fetchStreams}
              className="mt-3 px-4 py-2 rounded-xl text-xs text-white/30 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category Filters - only shown when streams exist */}
              {streams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <LiveCategoryFilters
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                </motion.div>
              )}

              {/* Featured Stream - only from real data */}
              {featuredStream && (
                <motion.div
                  custom={0}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <LiveFeaturedStream stream={featuredStream} />
                </motion.div>
              )}

              {/* Live Streams Grid - only real streams */}
              <motion.section
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-red-400" />
                    <h2 className="text-lg font-bold text-white">
                      {activeCategory === 'all' ? 'All Live Streams' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Streams`}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-bold text-red-400 border border-red-500/20">
                      {filteredStreams.length || streams.length}
                    </span>
                  </div>
                </div>

                {filteredStreams.length === 0 && streams.length > 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Video size={32} className="text-white/10 mb-3" />
                    <p className="text-sm text-white/40">No streams in this category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(filteredStreams.length > 0 ? filteredStreams : streams).slice(0, 6).map((stream: any, i: number) => (
                      <LiveStreamCard
                        key={stream.id}
                        stream={{
                          id: stream.id,
                          title: stream.title || 'Untitled Stream',
                          thumbnailUrl: stream.thumbnailUrl,
                          viewerCount: stream.viewerCount || 0,
                          likeCount: stream.likeCount || 0,
                          giftCount: stream.giftCount || 0,
                          category: stream.category || 'General',
                          language: stream.language,
                          quality: stream.quality,
                          duration: stream.duration,
                          trending: false, // No fake trending data
                          creator: {
                            name: stream.host?.fullName || stream.host?.username || 'Creator',
                            username: stream.host?.username || '@creator',
                            avatar: stream.host?.avatar,
                            verified: stream.host?.verified || false,
                            level: stream.host?.level,
                          },
                        }}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <LiveSidebar />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Go Live */}
      <FloatingGoLiveButton onClick={() => setGoLiveOpen(true)} />
      <PremiumGoLiveModal open={goLiveOpen} onClose={() => setGoLiveOpen(false)} />
    </>
  );
}