'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Sparkles, Radio, Hash, Loader2, Compass, Flame, Music, Gamepad2, Palette, Globe, BookOpen, Camera, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import DiscoverSearch from '@/components/discover/DiscoverSearch';
import DiscoverHero from '@/components/discover/DiscoverHero';
import DiscoverTabs from '@/components/discover/DiscoverTabs';
import DiscoverSidebar from '@/components/discover/DiscoverSidebar';
import DiscoverStories from '@/components/discover/DiscoverStories';
import LiveStreamsGrid from '@/components/discover/LiveStreamsGrid';
import CreatePostModal from '@/components/create/CreatePostModal';

// Categories for exploration
const categories = [
  { id: 'trending', icon: Flame, label: 'Trending', color: 'from-red-500 to-orange-500' },
  { id: 'music', icon: Music, label: 'Music', color: 'from-pink-500 to-purple-500' },
  { id: 'gaming', icon: Gamepad2, label: 'Gaming', color: 'from-purple-500 to-indigo-500' },
  { id: 'art', icon: Palette, label: 'Art', color: 'from-indigo-500 to-blue-500' },
  { id: 'education', icon: BookOpen, label: 'Education', color: 'from-blue-500 to-cyan-500' },
  { id: 'photography', icon: Camera, label: 'Photo', color: 'from-cyan-500 to-teal-500' },
  { id: 'lifestyle', icon: Star, label: 'Lifestyle', color: 'from-teal-500 to-green-500' },
  { id: 'global', icon: Globe, label: 'Global', color: 'from-green-500 to-yellow-500' },
];

// Trending hashtags
const trendingHashtags = [
  { tag: 'sparklive', posts: '12.5K' },
  { tag: 'creatorlife', posts: '8.2K' },
  { tag: 'livestream', posts: '6.7K' },
  { tag: 'viral', posts: '5.1K' },
  { tag: 'music', posts: '4.8K' },
  { tag: 'gaming', posts: '4.2K' },
  { tag: 'tutorial', posts: '3.9K' },
  { tag: 'dance', posts: '3.5K' },
];

export default function DiscoverPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

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

  const handleSearch = () => {
    return;
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  };

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

        {/* Stories Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="mb-6"
        >
          <div className="flex items-center gap-1 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 flex items-center justify-center">
              <Camera size={11} className="text-[#ff007f]" />
            </div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Stories</h2>
          </div>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
            <DiscoverStories />
          </div>
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
            <button onClick={fetchData} className="btn-primary text-sm">
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Categories Grid */}
              <motion.section
                custom={0}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="section-header">
                  <h2 className="section-title">
                    <Compass size={16} className="text-[#ff007f]" />
                    Explore
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        className="relative group overflow-hidden rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 text-left"
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110',
                          cat.color
                        )}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-white">{cat.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Explore {cat.label.toLowerCase()}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.section>

              {/* Trending Hashtags */}
              <motion.section
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="section-header">
                  <h2 className="section-title">
                    <Hash size={16} className="text-[#06f7ff]" />
                    Trending Hashtags
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map((item) => (
                    <button
                      key={item.tag}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-[#ff007f]/20 transition-all duration-200 group"
                    >
                      <span className="text-sm font-medium text-white/80 group-hover:text-white">#{item.tag}</span>
                      <span className="text-[10px] text-white/30 ml-2">{item.posts} posts</span>
                    </button>
                  ))}
                </div>
              </motion.section>

              {/* Hero Carousel */}
              {liveStreams.length > 0 && (
                <motion.div
                  custom={2}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <DiscoverHero />
                </motion.div>
              )}

              {/* Live Streams */}
              <motion.section
                custom={3}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="section-header">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-red-400" />
                    <h2 className="text-lg font-bold text-white">Live Now</h2>
                    {liveStreams.length > 0 && (
                      <span className="badge-live">
                        {liveStreams.length} streams
                      </span>
                    )}
                  </div>
                  {liveStreams.length > 0 && (
                    <button className="section-action flex items-center gap-1">
                      View all <ArrowRight size={10} />
                    </button>
                  )}
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

              {/* Recommended Creators */}
              {creators.length > 0 && (
                <motion.section
                  custom={4}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="section-header">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#ff007f]" />
                      <h2 className="text-lg font-bold text-white">Recommended Creators</h2>
                    </div>
                    <button className="section-action flex items-center gap-1">
                      View all <ArrowRight size={10} />
                    </button>
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

              {/* Empty state */}
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
                    className="btn-primary mt-6 text-sm"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <DiscoverSidebar />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Post Action */}
      <motion.button
        onClick={() => setPostModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff007f] via-[#7a00cc] to-[#3b82f6] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-[#ff007f]/30 transition-all duration-300 hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Create post"
      >
        <span className="text-lg leading-none">+</span>
        <span>Post</span>
      </motion.button>

      <CreatePostModal open={postModalOpen} initialIntent="post" onClose={() => setPostModalOpen(false)} />
    </>
  );
}