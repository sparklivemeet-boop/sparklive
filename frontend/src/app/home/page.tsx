'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  Flame, Radio, Users, Sparkles, Heart, MessageCircle, Share2,
  Bookmark, Gift, Plus, Loader2, Music, Volume2, VolumeX, Play,
  Pause, Eye, Crown, RefreshCw, WifiOff,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useContentCreation } from '@/components/create/ContentCreationContext';

// Tab definitions
const tabs = [
  { id: 'foryou', label: 'For You', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'live', label: 'Live', icon: Radio },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'latest', label: 'Latest', icon: RefreshCw },
];

// Feed item types
interface FeedItem {
  id: string;
  type: 'post' | 'photo' | 'video' | 'reel' | 'live' | 'community' | 'suggested_creator' | 'sponsored';
  content: string;
  description?: string;
  media?: string;
  thumbnail?: string;
  duration?: number;
  playbackUrl?: string;
  liveKitRoom?: string;
  viewerCount?: number;
  category?: string;
  community?: { id: string; name: string; avatar?: string };
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    verified?: boolean;
    bio?: string;
  };
  followers?: number;
  posts?: number;
  views?: number;
  gifts?: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
  saved?: boolean;
  source?: string;
  music?: string;
}

const formatCount = (count: number): string => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Skeleton loader for the initial feed
function FeedSkeleton() {
  return (
    <div className="w-full max-w-[760px] mx-auto space-y-4 px-3 sm:px-4">
      {[1, 2].map((i) => (
        <div key={i} className="relative min-h-[620px] h-[calc(100dvh-150px)] rounded-[28px] overflow-hidden bg-white/[0.025] border border-white/[0.06]">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.04] via-transparent to-[#7a00cc]/[0.06]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center animate-pulse">
              <Loader2 size={20} className="text-white/20 animate-spin" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Right Side Actions (TikTok style)
function RightActions({
  item,
  onLike,
  onComment,
  onShare,
  onGift,
  onSave,
  onFollow,
}: {
  item: FeedItem;
  onLike: (_item: FeedItem) => void;
  onComment: (_item: FeedItem) => void;
  onShare: (_item: FeedItem) => void;
  onGift: (_item: FeedItem) => void;
  onSave: (_item: FeedItem) => void;
  onFollow?: (_item: FeedItem) => void;
}) {
  const actionBtn = "flex flex-col items-center gap-1 group cursor-pointer";
  const actionIcon = (active?: boolean) => cn(
    'w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200',
    active ? 'bg-[#ff007f]/20' : 'bg-white/[0.1] hover:bg-white/[0.2] group-hover:scale-110'
  );

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4" onClick={(event) => event.stopPropagation()}>
      <button className={actionBtn} onClick={() => onLike(item)} aria-label="Like">
        <div className={actionIcon(item.liked)}>
          <Heart size={18} className={item.liked ? 'text-[#ff007f] fill-[#ff007f]' : 'text-white'} />
        </div>
        <span className="text-[10px] text-white/70 font-medium">{formatCount(item.likes)}</span>
      </button>

      <button className={actionBtn} onClick={() => onComment(item)} aria-label="Comment">
        <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] group-hover:scale-110 transition-all duration-200">
          <MessageCircle size={18} className="text-white" />
        </div>
        <span className="text-[10px] text-white/70 font-medium">{formatCount(item.comments)}</span>
      </button>

      <button className={actionBtn} onClick={() => onShare(item)} aria-label="Share">
        <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] group-hover:scale-110 transition-all duration-200">
          <Share2 size={18} className="text-white" />
        </div>
        <span className="text-[10px] text-white/70 font-medium">{formatCount(item.shares)}</span>
      </button>

      {item.type === 'live' ? (
        <button className={actionBtn} onClick={() => onGift(item)} aria-label="Send Gift">
          <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] group-hover:scale-110 transition-all duration-200">
            <Gift size={18} className="text-amber-400" />
          </div>
          <span className="text-[10px] text-amber-300/80 font-medium">{formatCount(item.gifts || 0)}</span>
        </button>
      ) : (
        <button className={actionBtn} onClick={() => onGift(item)} aria-label="Send Gift">
          <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] group-hover:scale-110 transition-all duration-200">
            <Gift size={18} className="text-amber-400" />
          </div>
        </button>
      )}

      <button className={actionBtn} onClick={() => onSave(item)} aria-label="Save">
        <div className={actionIcon(item.saved)}>
          <Bookmark size={18} className={item.saved ? 'text-[#06f7ff] fill-[#06f7ff]' : 'text-white'} />
        </div>
      </button>

      {/* Avatar + Follow */}
      <div className="relative mt-2">
        <Avatar
          src={item.author.avatar}
          alt={item.author.username}
          size="md"
          className="ring-2 ring-white/20"
        />
        {item.type !== 'suggested_creator' && (
          <button
            onClick={() => onFollow?.(item)}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/30 hover:scale-110 active:scale-95 transition-all"
            aria-label="Follow"
          >
            <Plus size={11} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

// Video player with autoplay
function VideoPlayer({
  src,
  thumbnail,
  muted,
  autoPlay,
  playing,
}: {
  src?: string;
  thumbnail?: string;
  muted: boolean;
  autoPlay: boolean;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay may be blocked - try muted
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [autoPlay, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  if (!src) {
    // No video src - show a visual placeholder matching the item
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff007f]/5 via-[#7c3aed]/5 to-[#06f7ff]/5">
        {thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" loading={autoPlay ? 'eager' : 'lazy'} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.06] backdrop-blur-sm flex items-center justify-center">
            {playing ? (
              <Pause size={32} className="text-white/50 ml-0.5" />
            ) : (
              <Play size={32} className="text-white/50 ml-0.5" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={thumbnail}
      loop
      muted={muted}
      autoPlay={autoPlay}
      playsInline
      preload={autoPlay ? 'auto' : 'metadata'}
      className="w-full h-full object-cover"
    />
  );
}

// Single feed item (TikTok style)
function FeedCard({
  item,
  isActive,
  isFirst,
  onLike,
  onComment,
  onShare,
  onGift,
  onSave,
  onFollow,
  onToggleMute,
  muted,
}: {
  item: FeedItem;
  isActive: boolean;
  isFirst: boolean;
  onLike: (_item: FeedItem) => void;
  onComment: (_item: FeedItem) => void;
  onShare: (_item: FeedItem) => void;
  onGift: (_item: FeedItem) => void;
  onSave: (_item: FeedItem) => void;
  onFollow?: (_item: FeedItem) => void;
  onToggleMute: () => void;
  muted: boolean;
}) {
  const router = useRouter();
  const [playing, setPlaying] = useState(isFirst);
  const isVideo = item.type === 'reel' || item.type === 'video';
  const videoSource = item.playbackUrl || (isVideo ? item.media : undefined);
  const imageSource = !isVideo ? (item.media || item.thumbnail) : undefined;

  useEffect(() => {
    if (isActive) setPlaying(true);
  }, [isActive]);

  // Live stream badge
  const showLiveBadge = item.type === 'live';

  return (
    <motion.article
      className="relative w-full min-h-[560px] h-[calc(100dvh-150px)] max-h-[860px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-black border border-white/[0.08] shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.02]"
      onClick={() => isVideo && setPlaying(!playing)}
      initial={{ opacity: 0, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Media / Video Area */}
      <div className="absolute inset-0">
        {isVideo ? (
          <VideoPlayer
            src={videoSource}
            thumbnail={item.thumbnail}
            muted={muted}
            autoPlay={isActive}
            playing={playing && isActive}
          />
        ) : imageSource ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSource} alt="" className="h-full w-full object-cover" loading={isFirst ? 'eager' : 'lazy'} />
        ) : <VideoPlayer src={undefined} thumbnail={item.thumbnail} muted playing={false} autoPlay={false} />}

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-16 z-10 flex items-center gap-2">
        {showLiveBadge && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}
        {item.viewerCount !== undefined && item.type === 'live' && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-medium">
            <Eye size={10} />
            {formatCount(item.viewerCount)}
          </span>
        )}
        {item.category && (
          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/60 text-[10px] font-medium">
            {item.category}
          </span>
        )}
        {item.type === 'community' && item.community && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7a00cc]/40 backdrop-blur-sm text-white/80 text-[10px] font-medium">
            <Users size={10} />
            {item.community.name}
          </span>
        )}
        {item.type === 'suggested_creator' && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff007f]/30 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
            <Crown size={10} />
            Suggested Creator
          </span>
        )}
        {item.type === 'sponsored' && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/30 backdrop-blur-sm text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            Ad
          </span>
        )}
      </div>

      {/* Volume control */}
      {isVideo && videoSource && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={14} className="text-white/80" /> : <Volume2 size={14} className="text-white/80" />}
        </button>
      )}

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-6 z-10 pr-24">
        {/* Suggested Creator special layout */}
        {item.type === 'suggested_creator' ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={item.author.avatar} alt={item.author.username} size="lg" className="ring-2 ring-[#ff007f]/50" />
              <div>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  {item.author.fullName}
                  {item.author.verified && <span className="w-4 h-4 rounded-full bg-[#06f7ff]/20 flex items-center justify-center"><Crown size={9} className="text-[#06f7ff]" /></span>}
                </p>
                <p className="text-xs text-white/50">@{item.author.username}</p>
              </div>
            </div>
            {item.followers !== undefined && (
              <p className="text-sm text-white/70 mb-1">
                <span className="font-bold text-white">{formatCount(item.followers)}</span> followers
                <span className="mx-2 text-white/30">·</span>
                <span className="font-bold text-white">{formatCount(item.posts || 0)}</span> posts
              </p>
            )}
            {item.author.bio && (
              <p className="text-xs text-white/50 line-clamp-2 mb-3">{item.author.bio}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onFollow?.(item); }}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-xs font-bold text-white hover:shadow-lg hover:shadow-[#ff007f]/20 transition-all"
              >
                Follow
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/profile/${item.author.username}`); }}
                className="px-4 py-1.5 rounded-full bg-white/[0.1] backdrop-blur-sm text-xs font-medium text-white hover:bg-white/[0.2] transition-all"
              >
                View Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Author info */}
            <div
              className="flex items-center gap-2.5 mb-3 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); router.push(`/profile/${item.author.username}`); }}
            >
              <Avatar src={item.author.avatar} alt={item.author.username} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white flex items-center gap-1 truncate">
                  {item.author.fullName || item.author.username}
                  {item.author.verified && <Crown size={11} className="text-[#06f7ff] shrink-0" />}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/50">@{item.author.username}</span>
                  <span className="text-[8px] text-white/30">·</span>
                  <span className="text-[10px] text-white/30">{formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Content text */}
            {item.content && (
              <p className="text-sm text-white/85 leading-relaxed mb-3 line-clamp-3 font-medium">
                {item.content}
              </p>
            )}

            {/* Music / view count */}
            {(item.music || item.views !== undefined) && (
              <div className="flex items-center gap-2 text-white/60 text-[10px]">
                {item.music && (
                  <span className="flex items-center gap-1">
                    <Music size={10} />
                    {item.music}
                  </span>
                )}
                {item.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye size={10} />
                    {formatCount(item.views)} views
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right side actions */}
      <div className="absolute right-3 bottom-6 z-20">
        <RightActions
          item={item}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          onGift={onGift}
          onSave={onSave}
          onFollow={onFollow}
        />
      </div>
    </motion.article>
  );
}

export default function HomePage() {
  const { token } = useAuth();
  const { openCreateHub } = useContentCreation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const displayFeed = useMemo(() => {
    const next = [...feed];
    if (activeTab === 'latest') {
      next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (activeTab === 'trending') {
      next.sort((a, b) => (b.likes + (b.views || 0)) - (a.likes + (a.views || 0)));
    }
    if (activeTab === 'live') {
      next.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
    }
    return next;
  }, [activeTab, feed]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const fetchHomeFeed = useCallback(async (reset: boolean = false, nextCursor?: string) => {
    if (!token) return;
    
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      if (nextCursor) params.set('cursor', nextCursor);
      if (activeTab === 'following') params.set('following', 'true');
      if (activeTab === 'trending') params.set('trending', 'true');
      if (activeTab === 'live') params.set('live', 'true');

      const data = await apiGet<any>(`/api/feed/home?${params.toString()}`, token, { skipCache: reset });
      const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];

      if (reset) {
        setFeed(items);
        setCursor(data?.nextCursor);
        setHasMore(!!data?.nextCursor || items.length > 0);
        if (items.length > 0) {
          setActiveItemId(items[0].id);
          setError(null);
        } else {
          setActiveItemId(null);
          setError('No recommendations are available right now.');
        }
      } else {
        // Append new items
        setFeed(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newItems = items.filter((i: FeedItem) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
        setCursor(data?.nextCursor);
        setHasMore(!!data?.nextCursor || items.length > 0);
      }
    } catch (err: any) {
      setError(err.message || 'Recommended feed is temporarily unavailable');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, activeTab]);

  // Initial load
  useEffect(() => {
    fetchHomeFeed(true);
  }, [fetchHomeFeed]);

  // Infinite scroll
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when user is near the bottom (within 600px)
      if (scrollHeight - scrollTop - clientHeight < 600 && hasMore && !loadingMore && !loading) {
        fetchHomeFeed(false, cursor);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, cursor, fetchHomeFeed]);

  // Track visible item for autoplay using IntersectionObserver
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-item-id');
            if (id) setActiveItemId(id);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    // Observe all item refs
    itemRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [displayFeed]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, [contenteditable="true"]')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        const currentIndex = displayFeed.findIndex(i => i.id === activeItemId);
        const next = displayFeed[Math.min(currentIndex + 1, displayFeed.length - 1)];
        if (next && itemRefs.current.has(next.id)) {
          itemRefs.current.get(next.id)?.scrollIntoView({ behavior: 'smooth' });
          setActiveItemId(next.id);
        }
      } else if (e.key === 'ArrowUp') {
        const currentIndex = displayFeed.findIndex(i => i.id === activeItemId);
        const prev = displayFeed[Math.max(currentIndex - 1, 0)];
        if (prev && itemRefs.current.has(prev.id)) {
          itemRefs.current.get(prev.id)?.scrollIntoView({ behavior: 'smooth' });
          setActiveItemId(prev.id);
        }
      } else if (e.key === 'm') {
        setMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayFeed, activeItemId]);

  // Action handlers
  const handleLike = useCallback(async (item: FeedItem) => {
    if (!token) return;
    
    // Optimistic update
    setFeed(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, liked: !i.liked, likes: i.liked ? Math.max(0, i.likes - 1) : i.likes + 1 }
        : i
    ));

    if (item.type === 'post' || item.type === 'community' || item.type === 'suggested_creator') {
      // Post like
      try {
        await apiPost(`/api/feed/${item.id}/like`, {}, token);
      } catch {
        // Revert optimistic update
        setFeed(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, liked: !i.liked, likes: i.liked ? Math.max(0, i.likes - 1) : i.likes + 1 }
            : i
        ));
      }
    } else if (item.type === 'reel' || item.type === 'video') {
      // Video like endpoint would go here
      // Fallback to feed like for now
      try {
        const videoId = item.id.replace('video-', '');
        await apiPost(`/api/feed/${videoId}/like`, {}, token);
      } catch {
        // Revert
        setFeed(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, liked: !i.liked, likes: i.liked ? Math.max(0, i.likes - 1) : i.likes + 1 }
            : i
        ));
      }
    } else if (item.type === 'live') {
      try {
        const streamId = item.id.replace('live-', '');
        await apiPost(`/api/live/${streamId}/like`, {}, token);
      } catch {
        // Revert
        setFeed(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, liked: !i.liked, likes: i.liked ? Math.max(0, i.likes - 1) : i.likes + 1 }
            : i
        ));
      }
    }
  }, [token]);

  const handleComment = useCallback((item: FeedItem) => {
    if (item.type === 'live') {
      router.push(`/live/${item.id.replace('live-', '')}`);
      return;
    }
    if (item.type === 'community') {
      const communityId = item.community?.id;
      if (communityId) {
        router.push(`/communities/${communityId}`);
      }
      return;
    }
    if (item.type === 'reel' || item.type === 'video') {
      router.push(`/post/${item.id.replace('video-', '')}`);
      return;
    }
    router.push(`/post/${item.id}`);
  }, [router]);

  const handleShare = useCallback(async (item: FeedItem) => {
    // Copy link to clipboard
    const url = `${window.location.origin}/post/${item.id.replace(/^(video-|live-|community-|creator-)/, '')}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Silent fail - just show a brief toast-like indicator
    }
  }, []);

  const handleGift = useCallback((item: FeedItem) => {
    if (item.type === 'live') {
      router.push(`/live/${item.id.replace('live-', '')}`);
    } else {
      router.push('/gift-store');
    }
  }, [router]);

  const handleSave = useCallback(async (item: FeedItem) => {
    if (!token) return;
    
    setFeed(prev => prev.map(i => 
      i.id === item.id ? { ...i, saved: !i.saved } : i
    ));

    try {
      const postId = item.id.replace(/^(video-|live-|community-|creator-)/, '');
      await apiPost(`/api/feed/${postId}/save`, {}, token);
    } catch {
      // Revert
      setFeed(prev => prev.map(i => 
        i.id === item.id ? { ...i, saved: !i.saved } : i
      ));
    }
  }, [token]);

  const handleFollow = useCallback((item: FeedItem) => {
    // Follow functionality - navigate to profile for now
    router.push(`/profile/${item.author.username}`);
  }, [router]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setCursor(undefined);
    setHasMore(true);
    setFeed([]);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#07070c]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_5%,rgba(122,0,204,0.12),transparent_36%),radial-gradient(circle_at_25%_70%,rgba(6,247,255,0.055),transparent_34%)]" />
      {/* Feed container with TikTok-style layout */}
      <div
        ref={feedContainerRef}
        className="relative h-[100dvh] overflow-y-auto overscroll-y-contain scroll-smooth scrollbar-hide"
      >
        {/* Sticky Tab Bar */}
        <div className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#07070c]/75 px-3 py-3 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1180px] items-center gap-3">
            <div className="hidden min-w-[230px] max-w-[330px] flex-1 lg:block">
              <GlobalSearch />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.035] p-1 scrollbar-hide lg:justify-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 sm:px-4',
                    isActive
                      ? 'bg-gradient-to-r from-[#ff007f]/20 to-[#7a00cc]/25 text-white shadow-[0_0_24px_rgba(255,0,127,0.12)]'
                      : 'text-gray-500 hover:text-white/80 hover:bg-white/[0.03]'
                  )}
                >
                  <Icon size={15} className={isActive ? 'text-[#ff007f]' : ''} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="home-tab-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff007f] to-[#06f7ff]"
                    />
                  )}
                </button>
              );
            })}
            </div>
            <button onClick={openCreateHub} className="hidden h-10 shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff007f] via-[#9a30e8] to-[#3b82f6] px-4 text-xs font-bold text-white shadow-lg shadow-[#ff007f]/20 transition hover:-translate-y-0.5 lg:flex">
              <Plus size={16} /> Create
            </button>
          </div>
        </div>

        {!online && (
          <div className="sticky top-[65px] z-20 mx-auto flex w-fit items-center gap-2 rounded-b-xl border border-t-0 border-amber-400/20 bg-amber-500/15 px-4 py-1.5 text-[11px] font-medium text-amber-200 backdrop-blur-xl">
            <WifiOff size={12} /> Offline
          </div>
        )}

        {/* Feed Content - no gap, content starts immediately */}
        {loading && feed.length === 0 ? (
          <div className="pt-4">
            <FeedSkeleton />
          </div>
        ) : (
          <div className="space-y-4 pb-24 pt-3 sm:pt-4">
            {error && displayFeed.length > 0 && <div className="mx-auto flex max-w-[760px] items-center justify-between rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-2 text-xs text-amber-100/70"><span>{error}</span><button onClick={() => fetchHomeFeed(true)} className="font-semibold text-white">Retry</button></div>}
            <div className="mx-auto w-full max-w-[760px] space-y-4 px-2 sm:px-4">
              {displayFeed.length === 0 && (
                <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-white/[0.07] bg-white/[0.025] px-6 text-center">
                  <div className="max-w-xs">
                    <RefreshCw size={22} className="mx-auto mb-4 text-white/35" />
                    <p className="text-sm font-medium text-white/75">{error || 'The feed is unavailable right now.'}</p>
                    <button onClick={() => fetchHomeFeed(true)} className="mt-5 rounded-xl bg-white/[0.08] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.13]">
                      Retry
                    </button>
                  </div>
                </div>
              )}
              {displayFeed.map((item, index) => (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el);
                    else itemRefs.current.delete(item.id);
                  }}
                  data-item-id={item.id}
                  className="scroll-mt-20 snap-start"
                >
                  <FeedCard
                    item={item}
                    isActive={activeItemId === item.id}
                    isFirst={index === 0}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onGift={handleGift}
                    onSave={handleSave}
                    onFollow={handleFollow}
                    onToggleMute={() => setMuted(prev => !prev)}
                    muted={muted}
                  />
                </div>
              ))}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="text-white/30 animate-spin" />
                </div>
              )}

              {/* Recommendations loop instead of an empty/end state */}
              {!hasMore && !loadingMore && displayFeed.length > 0 && (
                <div className="flex items-center justify-center gap-3 py-8 text-center">
                  <Sparkles size={16} className="text-[#ff69b4]" />
                  <p className="text-xs text-white/40">More moments are waiting</p>
                  <button 
                    onClick={() => fetchHomeFeed(true)} 
                    className="rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/[0.1] hover:text-white"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}