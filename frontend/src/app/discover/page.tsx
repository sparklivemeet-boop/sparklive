'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Sparkles, TrendingUp, Radio, Users, Hash, ChevronRight, Loader2, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import DiscoverSearch from '@/components/discover/DiscoverSearch';
import DiscoverHero from '@/components/discover/DiscoverHero';
import DiscoverTabs from '@/components/discover/DiscoverTabs';
import DiscoverSidebar from '@/components/discover/DiscoverSidebar';
import LiveStreamsGrid from '@/components/discover/LiveStreamsGrid';
import FloatingGoLiveButton from '@/components/profile/FloatingGoLiveButton';
import PremiumGoLiveModal from '@/components/profile/PremiumGoLiveModal';

export default function DiscoverPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states - all from backend, no mock data
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [streamsData, creatorsData] = await Promise.all([
        apiGet<any>('/api/streams/live', token).catch(() => ({ streams: [] })),
        apiGet<any>('/api/profiles/discover', token).catch(() => []),
      ]);
      setLiveStreams(streamsData?.streams ?? streamsData?.data ?? []);
      setCreators(Array.isArray(creatorsData) ? creatorsData : creatorsData?.profiles ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load discover feed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  // Only show sections when real data exists
  const hasTrendingTopics = false; // Would come from backend trending API
  const hasCategories = false; // Would come from backend categories API

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <DiscoverSearch onSearch={handleSearch} />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <DiscoverTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        {/* Main Content Grid */}
        {loading && creators.length === 0 && liveStreams.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="skeleton h-[380px] rounded-3xl" />
              <div className="skeleton h-12 w-full rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="skeleton h-48 rounded-2xl" />
                <div className="skeleton h-48 rounded-2xl" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="skeleton h-48 rounded-2xl" />
              <div className="skeleton h-32 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Loader2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-white/50 font-medium text-lg mb-1">Failed to load discover feed</h3>
            <p className="text-white/30 text-sm mb-4">{error}</p>
            <button onClick={fetchData} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Carousel - only show if real data exists */}
              {liveStreams.length > 0 && (
                <motion.div
                  custom={0}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <DiscoverHero />
                </motion.div>
              )}

              {/* Live Streams - only shows real data from backend */}
              <motion.section
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-red-400" />
                    <h2 className="text-lg font-bold text-white">Live Now</h2>
                    {liveStreams.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-bold text-red-400 border border-red-500/20">
                        {liveStreams.length} streams
                      </span>
                    )}
                  </div>
                </div>
                {liveStreams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <Radio size={28} className="text-white/10 mb-3" />
                    <p className="text-sm text-white/30">No live streams right now</p>
                    <p className="text-xs text-white/20 mt-1">Check back later for live content</p>
                  </div>
                ) : (
                  <LiveStreamsGrid streams={liveStreams as any} loading={false} />
                )}
              </motion.section>

              {/* Recommended Creators - only from real backend data */}
              {creators.length > 0 && (
                <motion.section
                  custom={2}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#ff007f]" />
                      <h2 className="text-lg font-bold text-white">Recommended Creators</h2>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-2">
                    {creators.slice(0, 8).map((creator: any, i: number) => (
                      <motion.div
                        key={creator.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="shrink-0 w-48 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:bg-white/[0.04] hover:border-[#ff007f]/20 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="h-16 bg-gradient-to-br from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/10" />
                        <div className="relative px-4 -mt-8">
                          <div className="w-14 h-14 rounded-full border-2 border-[#0a0a0f] overflow-hidden bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-white/60">
                              {(creator.fullName || creator.username || 'U').charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 pt-2">
                          <p className="text-sm font-semibold text-white truncate">{creator.fullName || creator.username}</p>
                          <p className="text-[10px] text-gray-500">@{creator.username}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-500">{(creator.followersCount || 0).toLocaleString()} followers</span>
                            <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.04]">{creator.city || 'Global'}</span>
                          </div>
                          {creator.bio && (
                            <p className="text-[10px] text-white/30 mt-1.5 line-clamp-2">{creator.bio}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Categories - only shown if real data from backend */}
              {hasCategories && (
                <motion.section
                  custom={3}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Hash size={16} className="text-[#00d8ff]" />
                    <h2 className="text-lg font-bold text-white">Explore Categories</h2>
                  </div>
                </motion.section>
              )}

              {/* Empty state when nothing at all exists */}
              {liveStreams.length === 0 && creators.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/15 flex items-center justify-center mb-5">
                    <Compass size={36} className="text-[#ff007f]/30" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Nothing to discover yet</h3>
                  <p className="text-sm text-white/30 max-w-sm">
                    Content will appear here as creators start streaming and posting.
                  </p>
                  <button
                    onClick={fetchData}
                    className="mt-6 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar - only rendered, shows empty states internally */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <DiscoverSidebar />
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