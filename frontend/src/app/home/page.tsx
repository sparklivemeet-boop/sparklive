'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  Flame,
  TrendingUp,
  Radio,
  MapPin,
  Users,
  Clock,
  Sparkles,
  Loader2,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Plus,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

// Tab definitions
const tabs = [
  { id: 'foryou', label: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'friends', label: 'Friends', icon: Heart },
  { id: 'latest', label: 'Latest', icon: Clock },
];

// Story data (from backend)
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
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
  saved?: boolean;
}

export default function HomePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<any[]>([]);

  const fetchFeed = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [feedData, storiesData, creatorsData] = await Promise.all([
        apiGet<any>(`/api/feed?tab=${activeTab}`, token).catch(() => ({ posts: [] })),
        apiGet<any>('/api/stories', token).catch(() => ({ stories: [] })),
        apiGet<any>('/api/profiles/trending', token).catch(() => []),
      ]);
      setFeed(Array.isArray(feedData) ? feedData : feedData?.posts ?? feedData?.data ?? []);
      setStories(Array.isArray(storiesData) ? storiesData : storiesData?.stories ?? []);
      setTrendingCreators(Array.isArray(creatorsData) ? creatorsData : creatorsData?.profiles ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Stories Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {/* Create Story */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7c3aed] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center border-2 border-[#0a0a0f]">
                  <Plus size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
            <span className="text-[10px] text-white/40">Your Story</span>
          </div>

          {/* Stories */}
          {stories.slice(0, 10).map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className={cn(
                'w-16 h-16 rounded-full p-[2px]',
                story.viewed ? 'bg-white/[0.15]' : 'bg-gradient-to-br from-[#ff007f] via-[#7c3aed] to-[#06f7ff]'
              )}>
                <div className="w-full h-full rounded-full bg-[#0a0a0f] overflow-hidden">
                  {story.avatar ? (
                    <img src={story.avatar} alt={story.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff007f]/20 to-[#7c3aed]/20">
                      <span className="text-sm font-bold text-white/60">{story.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-white/50 truncate max-w-[64px]">{story.username}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
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
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
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
          <button onClick={fetchFeed} className="btn-primary text-sm">
            Try Again
          </button>
        </div>
      ) : feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff007f]/10 to-[#7c3aed]/10 border border-[#ff007f]/15 flex items-center justify-center mb-5">
            <Sparkles size={36} className="text-[#ff007f]/30" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Your feed is empty</h3>
          <p className="text-sm text-white/30 max-w-sm mb-6">
            Follow creators and explore trending content to personalize your feed.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setActiveTab('trending')} className="btn-primary text-sm">
              <TrendingUp size={14} />
              Trending
            </button>
            <button onClick={() => setActiveTab('live')} className="btn-secondary text-sm">
              <Radio size={14} />
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
              className="rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:bg-white/[0.03] transition-all duration-300 group"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar
                    src={item.author.avatar}
                    alt={item.author.username}
                    size="md"
                    status="online"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.author.fullName}</p>
                      <span className="text-[10px] text-white/30">@{item.author.username}</span>
                    </div>
                    <p className="text-[10px] text-white/30">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {item.type === 'sponsored' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[8px] font-bold text-amber-400 border border-amber-500/20">
                    Sponsored
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-sm text-white/80 leading-relaxed">{item.content}</p>
              </div>

              {/* Media */}
              {item.media && (
                <div className="relative overflow-hidden bg-white/[0.02]">
                  <div className="aspect-video bg-gradient-to-br from-[#ff007f]/5 via-[#7c3aed]/5 to-[#06f7ff]/5 flex items-center justify-center">
                    {item.type === 'video' || item.type === 'reel' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center">
                          <Play size={24} className="text-white/40 ml-0.5" />
                        </div>
                        <span className="text-xs text-white/30">Video content</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-xl bg-white/[0.06] flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <span className="text-xs text-white/30">Image content</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-1">
                  <button className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    item.liked ? 'text-[#ff007f] bg-[#ff007f]/10' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  )}>
                    <Heart size={14} className={item.liked ? 'fill-[#ff007f]' : ''} />
                    {item.likes > 0 && item.likes}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                    <MessageCircle size={14} />
                    {item.comments > 0 && item.comments}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                    <Share2 size={14} />
                  </button>
                </div>
                <button className={cn(
                  'p-1.5 rounded-lg transition-all',
                  item.saved ? 'text-[#06f7ff]' : 'text-white/30 hover:text-white'
                )}>
                  <Bookmark size={14} className={item.saved ? 'fill-[#06f7ff]' : ''} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}