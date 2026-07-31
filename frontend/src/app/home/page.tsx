'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  Flame, TrendingUp, Radio, MapPin, Users, Clock, Sparkles,
  Loader2, Heart, MessageCircle, Share2, Bookmark, Play,
  Plus, ChevronLeft, ChevronRight, Crown, Zap, Star, Eye,
  Gift, Video, Camera, Image, Music, Globe, Hash, Filter,
  ArrowUp, ArrowDown, MoreHorizontal, Check, Send,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import CreatePostComposer from '@/components/create/CreatePostComposer';

// Tab definitions
const tabs = [
  { id: 'foryou', label: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'latest', label: 'Latest', icon: Clock },
];

// Story data
interface Story {
  id: string;
  username: string;
  avatar?: string;
  hasStory: boolean;
  viewed: boolean;
}

// Feed item types
interface FeedItem {
  id: string;
  type: 'post' | 'photo' | 'video' | 'reel' | 'live' | 'sponsored';
  content: string;
  media?: string;
  author: { id: string; username: string; fullName: string; avatar?: string; };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
  saved?: boolean;
}

export default function HomePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const storiesScrollRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [feedData, storiesData] = await Promise.all([
        apiGet<any>(`/api/feed?tab=${activeTab}`, token).catch(() => ({ posts: [] })),
        apiGet<any>('/api/stories', token).catch(() => ({ stories: [] })),
      ]);
      setFeed(Array.isArray(feedData) ? feedData : feedData?.posts ?? feedData?.data ?? []);
      setStories(Array.isArray(storiesData) ? storiesData : storiesData?.stories ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const scrollStories = (direction: 'left' | 'right') => {
    const el = storiesScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-10">
      {/* Stories Bar - Premium Redesign */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center gap-1 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 flex items-center justify-center">
            <Camera size={11} className="text-[#ff007f]" />
          </div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Stories</h2>
        </div>
        <div className="relative">
          {stories.length > 4 && (
            <>
              <button
                onClick={() => scrollStories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => scrollStories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
          <div ref={storiesScrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
            {/* Create Story */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7c3aed] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center border-2 border-[#0a0a0f] group-hover:bg-white/[0.08] transition-colors">
                    <Plus size={20} className="text-white/50 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-white/40">Your Story</span>
            </div>

            {/* Stories */}
            {stories.slice(0, 10).map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className={cn(
                  'w-16 h-16 rounded-full p-[2px] relative',
                  story.viewed
                    ? 'bg-white/[0.1]'
                    : 'bg-gradient-to-br from-[#ff007f] via-[#7c3aed] to-[#06f7ff]'
                )}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                    {story.avatar ? (
                      <img src={story.avatar} alt={story.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff007f]/20 to-[#7c3aed]/20">
                        <span className="text-base font-bold text-white/60">{story.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  {story.hasStory && !story.viewed && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" />
                  )}
                </div>
                <span className="text-[10px] text-white/50 truncate max-w-[64px]">{story.username}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Bar - Premium Redesign */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-2xl p-1.5 overflow-x-auto scrollbar-hide border border-white/[0.04]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center',
                  isActive
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-lg shadow-[#ff007f]/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Create Post Composer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <CreatePostComposer />
      </motion.div>

      {/* Feed Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-3 w-32" />
                  <div className="skeleton h-2 w-20" />
                </div>
              </div>
              <div className="skeleton h-64 w-full" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4" />
                <div className="flex gap-4">
                  <div className="skeleton h-8 w-16 rounded-lg" />
                  <div className="skeleton h-8 w-16 rounded-lg" />
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Loader2 size={24} className="text-red-400" />
          </div>
          <h3 className="text-white/50 font-medium text-lg mb-1">Failed to load feed</h3>
          <p className="text-white/30 text-sm mb-4">{error}</p>
          <button onClick={fetchFeed} className="btn-primary text-sm">Try Again</button>
        </div>
      ) : feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#ff007f]/5 to-[#7c3aed]/5 border border-[#ff007f]/10 flex items-center justify-center mb-5">
            <Sparkles size={40} className="text-[#ff007f]/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your feed is empty</h3>
          <p className="text-sm text-white/30 max-w-sm mb-8 leading-relaxed">
            Follow creators and explore trending content to personalize your feed. Discover amazing content tailored just for you.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setActiveTab('trending')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#ff007f]/20 transition-all">
              <TrendingUp size={14} className="inline mr-1.5" />
              Explore Trending
            </button>
            <button onClick={() => setActiveTab('live')} className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-all">
              <Radio size={14} className="inline mr-1.5" />
              Live Now
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar src={item.author.avatar} alt={item.author.username} size="md" status="online" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.author.fullName}</p>
                      {item.type === 'sponsored' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[8px] font-bold text-amber-400 border border-amber-500/20">Ad</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30">@{item.author.username}</span>
                      <span className="text-[8px] text-white/20">·</span>
                      <span className="text-[10px] text-white/20">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.04] transition-all">
                  <MoreHorizontal size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-sm text-white/80 leading-relaxed">{item.content}</p>
              </div>

              {/* Media */}
              {item.media && (
                <div className="relative overflow-hidden bg-white/[0.02] mx-3 rounded-2xl">
                  <div className="aspect-video bg-gradient-to-br from-[#ff007f]/5 via-[#7c3aed]/5 to-[#06f7ff]/5 flex items-center justify-center">
                    {item.type === 'video' || item.type === 'reel' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center backdrop-blur-sm">
                          <Play size={28} className="text-white/40 ml-0.5" fill="white" />
                        </div>
                        <span className="text-xs text-white/30 font-medium">Tap to play video</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center">
                          <Image size={28} className="text-white/30" />
                        </div>
                        <span className="text-xs text-white/30 font-medium">View image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-1">
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                    item.liked ? 'text-[#ff007f] bg-[#ff007f]/10' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  )}>
                    <Heart size={14} className={item.liked ? 'fill-[#ff007f]' : ''} />
                    {item.likes > 0 && <span>{item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes}</span>}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                    <MessageCircle size={14} />
                    {item.comments > 0 && <span>{item.comments}</span>}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                    <Share2 size={14} />
                  </button>
                </div>
                <button className={cn(
                  'p-1.5 rounded-xl transition-all',
                  item.saved ? 'text-[#06f7ff] bg-[#06f7ff]/10' : 'text-white/30 hover:text-white hover:bg-white/[0.04]'
                )}>
                  <Bookmark size={14} className={item.saved ? 'fill-[#06f7ff]' : ''} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}