'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence, animate } from 'framer-motion';
import {
  Sparkles, Zap, Trophy, Crown, Activity, Target, TrendingUp, Eye,
  Radio, Users, Award, Flame, Gift, Heart, MessageCircle,
  Clock, Calendar, Shield, MapPin, Link as LinkIcon, Share2,
  Edit3, Check, X, MoreHorizontal, ChevronDown, ChevronRight,
  Play, Grid3X3, List, Video, Film, Bookmark, Repeat2,
  Music, Gamepad2, BookOpen, Monitor, Smartphone,
  DollarSign, BarChart3, Rocket, Globe, Disc3, Waves,
  PenSquare, Wallet, Search, Filter,
  Plus, Hash, Bot, Code, Headphones, Mic, Settings, LogOut,
  Github, Twitter, Instagram, Youtube, Linkedin, Facebook,
  Music2, Gamepad, Book, Code2, Atom, ImageIcon,
  Camera, Loader2, Star, Medal, Target as TargetIcon,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  ArrowUp, ArrowDown, Info, Image as ImageIcon2,
  UserPlus, UserCheck, MessageSquare, Copy, ExternalLink,
  QrCode, Flag, Send, ThumbsUp, MessageCircle as MessageCircle2,
  Share2 as ShareIcon, Bookmark as BookmarkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiDelete, invalidateCache } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';
import SharedEditProfileModal from '@/components/profile/EditProfileModal';
import SharedGoLiveModal from '@/components/create/GoLiveModal';

// Import new v2 sub-components
import CreatorStats from './CreatorStats';
import FeaturedContentCarousel from './FeaturedContentCarousel';
import TopSupporters from './TopSupporters';
import TrendingCreators from './TrendingCreators';
import SuggestedCreators from './SuggestedCreators';

// ============================================================
// TYPES
// ============================================================

interface CreatorProfile {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  website?: string;
  country?: string;
  city?: string;
  verified: boolean;
  premium: boolean;
  creatorCategory?: string;
  occupation?: string;
  languages: string[];
  pronouns?: string;
  businessEmail?: string;
  theme?: string;
  featuredContent: any[];
  socialLinks: any[];
  media: any[];
  isOnline: boolean;
  lastActive?: string;
  verificationType?: string;
  verificationStatus?: string;
  creatorMembership?: string;
  loyaltyLevel: number;
  loyaltyTier: string;
  loyaltyXp: number;
  currentStream?: {
    id: string;
    title: string;
    viewerCount: number;
    thumbnailUrl?: string;
    categoryName?: string;
  } | null;
  counts: {
    followers: number;
    following: number;
    posts: number;
    media: number;
  };
  stats: {
    totalLikes: number;
    totalComments: number;
    totalGifts: number;
    totalViews: number;
    totalStreams: number;
    totalPosts: number;
    totalFollowers: number;
    totalFollowing: number;
  };
  wallet: {
    coinBalance: number;
    earningsBalance: number;
    lifetimeEarnings: number;
    totalGiftsReceived: number;
  };
  latestPosts: any[];
  joinedAt: string;
}

interface CreatorScore {
  totalScore: number;
  level: number;
  xp: number;
  xpToNext: number;
  components: {
    followers: number;
    engagement: number;
    gifts: number;
    consistency: number;
    profile: number;
  };
  rank: number;
  topPercent?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalGifts: number;
  totalFollowers: number;
  totalPosts: number;
  totalStreams: number;
  engagementRate: number;
  followerGrowth: number;
  viewsGrowth: number;
  likesGrowth: number;
}

interface WalletPreview {
  balance: number;
  totalEarnings: number;
  totalGifts: number;
}

interface Supporter {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  amount: number;
  rank: number;
}

// ============================================================
// PROPS
// ============================================================

interface CreatorHubPageProps {
  username?: string;
}

// ============================================================
// HELPERS
// ============================================================

const getNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return 0;
};

const extractFollowCountData = (payload: any) => {
  const target = payload?.counts?.target ?? payload?.target ?? payload?.counts ?? payload ?? {};
  const currentUser = payload?.counts?.currentUser ?? payload?.currentUser ?? {};
  return {
    targetFollowers: getNumber(target.followers, target.followersCount, target.followers_count),
    targetFollowing: getNumber(target.following, target.followingCount, target.following_count),
    currentUserFollowing: getNumber(currentUser.following, currentUser.followingCount, currentUser.following_count),
  };
};

const normalizeCreatorProfile = (rawProfile: any): CreatorProfile => {
  const raw = rawProfile ?? {};
  return {
    id: raw.id || '',
    username: raw.username || '',
    fullName: raw.fullName ?? raw.full_name ?? '',
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? raw.avatar ?? null,
    bannerUrl: raw.bannerUrl ?? raw.banner_url ?? null,
    bio: raw.bio ?? '',
    website: raw.website ?? null,
    country: raw.country ?? null,
    city: raw.city ?? null,
    verified: raw.verified ?? false,
    premium: raw.premium ?? false,
    creatorCategory: raw.creatorCategory ?? raw.creator_category ?? null,
    occupation: raw.occupation ?? null,
    languages: raw.languages ?? [],
    pronouns: raw.pronouns ?? null,
    businessEmail: raw.businessEmail ?? raw.business_email ?? null,
    theme: raw.theme ?? null,
    featuredContent: raw.featuredContent ?? raw.featured_content ?? [],
    socialLinks: raw.socialLinks ?? raw.social_links ?? [],
    media: raw.media ?? [],
    isOnline: raw.isOnline ?? raw.is_online ?? false,
    lastActive: raw.lastActive ?? raw.last_active ?? null,
    verificationType: raw.verificationType ?? raw.verification_type ?? null,
    verificationStatus: raw.verificationStatus ?? raw.verification_status ?? null,
    creatorMembership: raw.creatorMembership ?? raw.creator_membership ?? null,
    loyaltyLevel: raw.loyaltyLevel ?? raw.loyalty_level ?? 1,
    loyaltyTier: raw.loyaltyTier ?? raw.loyalty_tier ?? 'BRONZE',
    loyaltyXp: raw.loyaltyXp ?? raw.loyalty_xp ?? 0,
    currentStream: raw.currentStream ?? raw.current_stream ?? null,
    counts: {
      followers: getNumber(raw.counts?.followers, raw.followersCount, raw.followers_count, raw.followers, raw.followerCount, raw.follower_count),
      following: getNumber(raw.counts?.following, raw.followingCount, raw.following_count, raw.following),
      posts: getNumber(raw.counts?.posts, raw.postsCount, raw.posts_count),
      media: getNumber(raw.counts?.media, raw.mediaCount, raw.media_count),
    },
    stats: {
      totalLikes: getNumber(raw.stats?.totalLikes, raw.totalLikes, raw.likesReceived, raw.likes_received),
      totalComments: getNumber(raw.stats?.totalComments, raw.totalComments),
      totalGifts: getNumber(raw.stats?.totalGifts, raw.totalGifts, raw.giftsReceived, raw.gifts_received),
      totalViews: getNumber(raw.stats?.totalViews, raw.totalViews, raw.total_views),
      totalStreams: getNumber(raw.stats?.totalStreams, raw.totalStreams, raw.streamsCount, raw.streams_count),
      totalPosts: getNumber(raw.stats?.totalPosts, raw.totalPosts, raw.postsCount, raw.posts_count),
      totalFollowers: getNumber(raw.stats?.totalFollowers, raw.totalFollowers, raw.followersCount, raw.followers_count, raw.followers, raw.followerCount, raw.follower_count),
      totalFollowing: getNumber(raw.stats?.totalFollowing, raw.totalFollowing, raw.followingCount, raw.following_count, raw.following),
    },
    wallet: {
      coinBalance: getNumber(raw.wallet?.coinBalance, raw.coinBalance, raw.coin_balance),
      earningsBalance: getNumber(raw.wallet?.earningsBalance, raw.earningsBalance, raw.earnings_balance),
      lifetimeEarnings: getNumber(raw.wallet?.lifetimeEarnings, raw.lifetimeEarnings, raw.lifetime_earnings),
      totalGiftsReceived: getNumber(raw.wallet?.totalGiftsReceived, raw.totalGiftsReceived, raw.total_gifts_received),
    },
    latestPosts: raw.latestPosts ?? raw.latest_posts ?? [],
    joinedAt: raw.joinedAt ?? raw.joined_at ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    music: '🎵', gaming: '🎮', creative: '🎨', education: '📚',
    sports: '🏆', tech: '💻', lifestyle: '❤️', mobile: '📱',
    chatting: '💬',
  };
  return icons[category.toLowerCase()] || '⭐';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CreatorHubPage({ username }: CreatorHubPageProps) {
  const { token, user: authUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Data states
  const [creatorScore, setCreatorScore] = useState<CreatorScore | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [walletPreview, setWalletPreview] = useState<WalletPreview | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [pinnedContent, setPinnedContent] = useState<any[]>([]);
  const [topSupporters, setTopSupporters] = useState<Supporter[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<any[]>([]);
  const [suggestedCreators, setSuggestedCreators] = useState<any[]>([]);

  // UI states
  const [feedLoading, setFeedLoading] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [feedCursor, setFeedCursor] = useState<string | undefined>();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followPending, setFollowPending] = useState(false);

  // Track mouse for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Determine if own profile
  useEffect(() => {
    if (username && authUser) {
      setIsOwnProfile(username === authUser.username);
    } else if (!username) {
      setIsOwnProfile(true);
    }
  }, [username, authUser]);

  // ===== FETCH PROFILE =====
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let data;
      if (username && !isOwnProfile) {
        data = await apiGet<any>(`/api/profiles/public/${username}`, token);
      } else {
        data = await apiGet<any>('/api/profiles/me', token);
      }
      const raw = data?.profile ?? data?.data ?? data ?? {};
      const normalized = normalizeCreatorProfile(raw);
      setProfile(normalized);

      if (!isOwnProfile && raw.isFollowing !== undefined) {
        setIsFollowing(raw.isFollowing);
      }

      setPinnedContent(normalized.latestPosts?.filter((p: any) => p.pinned) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token, username, isOwnProfile]);

  // ===== FETCH CREATOR SCORE =====
  const fetchCreatorScore = useCallback(async () => {
    if (!token || !isOwnProfile) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/creator-score', token);
      setCreatorScore(data);
    } catch { /* silently fail */ }
  }, [token, isOwnProfile]);

  // ===== FETCH ACHIEVEMENTS =====
  const fetchAchievements = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/achievements', token);
      setAchievements(Array.isArray(data) ? data : data?.achievements || []);
    } catch { /* silently fail */ }
  }, [token]);

  // ===== FETCH ANALYTICS =====
  const fetchAnalytics = useCallback(async () => {
    if (!token || !isOwnProfile) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/analytics', token);
      setAnalytics(data);
    } catch { /* silently fail */ }
  }, [token, isOwnProfile]);

  // ===== FETCH WALLET PREVIEW =====
  const fetchWalletPreview = useCallback(async () => {
    if (!token || !isOwnProfile) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/wallet-preview', token);
      setWalletPreview(data);
    } catch { /* silently fail */ }
  }, [token, isOwnProfile]);

  // ===== FETCH POSTS =====
  const fetchPosts = useCallback(async (cursor?: string) => {
    if (!token) return;
    setFeedLoading(true);
    try {
      const endpoint = username && !isOwnProfile
        ? `/api/profiles/public/${username}/posts${cursor ? `?cursor=${cursor}` : ''}`
        : `/api/profiles/me/posts${cursor ? `?cursor=${cursor}` : ''}`;
      const data = await apiGet<any>(endpoint, token);
      const items = data?.items || data?.posts || data?.data || [];
      const nextCursor = data?.nextCursor;

      if (cursor) {
        setPosts(prev => [...prev, ...items]);
      } else {
        setPosts(items);
      }
      setFeedCursor(nextCursor);
      setHasMoreFeed(!!nextCursor);

      const extractedMedia = items.flatMap((post: any) => {
        const mediaItems: any[] = [];
        if (post.images) {
          post.images.forEach((img: string, i: number) => {
            mediaItems.push({
              id: `${post.id}-img-${i}`,
              type: 'image',
              url: img,
              thumbnail: img,
              title: post.content?.slice(0, 50),
              likes: post.likes?.length || post.likes || 0,
              comments: post.comments?.length || post.comments || 0,
              createdAt: post.createdAt,
            });
          });
        }
        if (post.video || post.mediaUrl) {
          mediaItems.push({
            id: `${post.id}-video`,
            type: 'video',
            url: post.video || post.mediaUrl,
            thumbnail: post.thumbnail || post.video || post.mediaUrl,
            title: post.content?.slice(0, 50),
            duration: post.duration,
            likes: post.likes?.length || post.likes || 0,
            comments: post.comments?.length || post.comments || 0,
            views: post.views || 0,
            createdAt: post.createdAt,
          });
        }
        return mediaItems;
      });
      setMedia(prev => cursor ? [...prev, ...extractedMedia] : extractedMedia);
    } catch {
      if (!cursor) { setPosts([]); setMedia([]); }
    } finally {
      setFeedLoading(false);
    }
  }, [token, username, isOwnProfile]);

  // ===== FETCH REELS =====
  const fetchReels = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = username && !isOwnProfile
        ? `/api/profiles/public/${username}/reels`
        : '/api/profiles/me/reels';
      const data = await apiGet<any>(endpoint, token);
      setReels(data?.items || data?.reels || []);
    } catch { /* silently fail */ }
  }, [token, username, isOwnProfile]);

  // ===== FETCH LIVE STREAMS =====
  const fetchLiveStreams = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = username && !isOwnProfile
        ? `/api/profiles/public/${username}/livestreams`
        : '/api/profiles/me/livestreams';
      const data = await apiGet<any>(endpoint, token);
      setLiveStreams(data?.items || data?.streams || []);
    } catch { /* silently fail */ }
  }, [token, username, isOwnProfile]);

  // ===== FETCH FOLLOWERS =====
  const fetchFollowersList = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = username && !isOwnProfile
        ? `/api/profiles/${username}/followers`
        : '/api/profiles/me/followers';
      const data = await apiGet<any>(endpoint, token);
      setFollowersList(data?.items || []);
    } catch { /* silently fail */ }
  }, [token, username, isOwnProfile]);

  // ===== FETCH FOLLOWING =====
  const fetchFollowingList = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = username && !isOwnProfile
        ? `/api/profiles/${username}/following`
        : '/api/profiles/me/following';
      const data = await apiGet<any>(endpoint, token);
      setFollowingList(data?.items || []);
    } catch { /* silently fail */ }
  }, [token, username, isOwnProfile]);

  // ===== FETCH TOP SUPPORTERS =====
  const fetchTopSupporters = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = username && !isOwnProfile
        ? `/api/profiles/public/${username}/top-supporters`
        : '/api/profiles/me/top-supporters';
      const data = await apiGet<any>(endpoint, token);
      setTopSupporters(data?.items || data?.supporters || []);
    } catch { /* silently fail */ }
  }, [token, username, isOwnProfile]);

  // ===== FETCH TRENDING =====
  const fetchTrending = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/discover/trending?limit=4', token);
      setTrendingCreators(data?.items || data?.creators || []);
    } catch { /* silently fail */ }
  }, [token]);

  // ===== FETCH SUGGESTED =====
  const fetchSuggested = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/discover/suggested?limit=3', token);
      setSuggestedCreators(data?.items || data?.creators || []);
    } catch { /* silently fail */ }
  }, [token]);

  // ===== FOLLOW / UNFOLLOW =====
  const handleFollow = useCallback(async () => {
    if (!token || !username || followPending) return;
    const wasFollowing = isFollowing;
    const delta = wasFollowing ? -1 : 1;
    const currentUserFollowing = getNumber(
      (authUser as any)?.followingCount,
      (authUser as any)?.following_count,
      (authUser as any)?.counts?.following
    );
    const updateOptimisticCounts = (amount: number) => {
      setProfile(prev => prev ? {
        ...prev,
        counts: { ...prev.counts, followers: Math.max(0, prev.counts.followers + amount) },
        stats: { ...prev.stats, totalFollowers: Math.max(0, prev.stats.totalFollowers + amount) },
      } : prev);
      window.dispatchEvent(new CustomEvent('sparklive:follow-state-changed', {
        detail: {
          username, following: !wasFollowing, optimistic: true,
          counts: {
            target: { followers: Math.max(0, (profile?.counts.followers ?? 0) + amount), following: profile?.counts.following ?? 0 },
            currentUser: { following: Math.max(0, currentUserFollowing + amount) },
          },
        },
      }));
    };

    setFollowPending(true);
    setIsFollowing(!wasFollowing);
    updateOptimisticCounts(delta);
    invalidateCache('api/profiles');
    invalidateCache('api/auth');

    try {
      const response = wasFollowing
        ? await apiDelete<any>(`/api/profiles/${username}/follow`, token)
        : await apiPost<any>(`/api/profiles/${username}/follow`, {}, token);
      const countsPayload = response?.counts || response?.data?.counts || response?.data || response;
      const normalizedCounts = extractFollowCountData(countsPayload);

      if (normalizedCounts.targetFollowers || normalizedCounts.targetFollowing || isFollowing) {
        setProfile(prev => prev ? {
          ...prev,
          counts: {
            ...prev.counts,
            followers: normalizedCounts.targetFollowers || prev.counts.followers,
            following: normalizedCounts.targetFollowing || prev.counts.following,
          },
          stats: {
            ...prev.stats,
            totalFollowers: normalizedCounts.targetFollowers || prev.stats.totalFollowers,
            totalFollowing: normalizedCounts.targetFollowing || prev.stats.totalFollowing,
          },
        } : prev);
      }

      await fetchProfile();
      window.dispatchEvent(new CustomEvent('sparklive:follow-state-changed', {
        detail: { username, following: !wasFollowing, counts: countsPayload, optimistic: false },
      }));

      showToast?.({ type: 'success', title: wasFollowing ? 'Unfollowed' : 'Following', message: wasFollowing ? `Unfollowed @${username}` : `Following @${username}` });
    } catch (err: any) {
      setIsFollowing(wasFollowing);
      updateOptimisticCounts(-delta);
      invalidateCache('api/profiles');
      invalidateCache('api/auth');
      window.dispatchEvent(new CustomEvent('sparklive:follow-state-changed', {
        detail: { username, following: wasFollowing, rollback: true },
      }));
      showToast?.({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setFollowPending(false);
    }
  }, [token, username, followPending, isFollowing, showToast, profile?.counts.followers, profile?.counts.following, authUser, fetchProfile]);

  const handleMessage = useCallback(async () => {
    if (!token) return;
    if (isOwnProfile || !profile?.id) {
      router.push('/messages');
      return;
    }
    try {
      const response = await apiPost<any>('/api/messages/start', { participantIds: [profile.id] }, token);
      const conversation = response?.conversation ?? response?.data?.conversation ?? response?.data;
      const conversationId = conversation?.id ?? conversation?.conversationId;
      if (conversationId) {
        router.push(`/messages/${conversationId}`);
      } else {
        router.push('/messages');
      }
    } catch {
      router.push('/messages');
    }
  }, [token, isOwnProfile, profile?.id, router]);

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({ title: `${profile?.fullName || profile?.username} on SparkLive`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast?.({ type: 'success', title: 'Link copied', message: 'Profile link copied to clipboard' });
    }
  };

  // ===== INITIAL FETCH =====
  useEffect(() => {
    fetchProfile();
    fetchAchievements();
    fetchPosts();
    fetchReels();
    fetchLiveStreams();
    fetchFollowersList();
    fetchFollowingList();
    fetchTopSupporters();
    fetchTrending();
    fetchSuggested();
    if (isOwnProfile) {
      fetchCreatorScore();
      fetchAnalytics();
      fetchWalletPreview();
    }
  }, [fetchProfile, fetchAchievements, fetchPosts, fetchReels, fetchLiveStreams,
      fetchCreatorScore, fetchAnalytics, fetchWalletPreview, fetchFollowersList,
      fetchFollowingList, fetchTopSupporters, fetchTrending, fetchSuggested, isOwnProfile]);

  // ===== ANIMATION VARIANTS =====
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-2 border-transparent border-t-[#ff007f] border-r-[#7a00cc] mx-auto mb-6"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-white/40 text-sm">Loading Creator Hub...</p>
            <div className="flex gap-1 justify-center mt-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc]"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-[#07070d] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <X size={32} className="text-red-400" />
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-white/60 mb-2"
        >
          Couldn't load this profile
        </motion.h2>
        <motion.p className="text-sm text-white/30 mb-8 max-w-md text-center">{error}</motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchProfile}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-medium shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-shadow"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  if (!profile) return null;

  const isGoldVerified = profile?.verificationType === 'gold' || profile?.verificationType === 'GOLD';
  const isVerified = profile?.verified || !!profile?.verificationType;

  // Build featured content items
  const featuredItems: any[] = [];
  if (profile.currentStream) {
    featuredItems.push({
      id: `live-${profile.currentStream.id}`,
      type: 'live',
      title: profile.currentStream.title || 'Live now',
      thumbnail: profile.currentStream.thumbnailUrl,
      viewerCount: profile.currentStream.viewerCount || 0,
      likes: 0,
      date: new Date().toISOString(),
    });
  }
  const pinned = pinnedContent[0];
  if (pinned) {
    featuredItems.push({
      id: `pinned-${pinned.id}`,
      type: 'post',
      title: pinned.content || 'Pinned post',
      thumbnail: pinned.mediaUrl || pinned.thumbnail,
      likes: pinned.likes?.length || pinned.likes || 0,
      views: pinned.views || 0,
      date: pinned.createdAt,
    });
  }
  const recentPost = posts.find((p: any) => !p.pinned) || posts[0];
  if (recentPost) {
    featuredItems.push({
      id: `recent-${recentPost.id}`,
      type: recentPost.video || recentPost.mediaUrl ? 'video' : 'media',
      title: recentPost.content || 'Recent post',
      thumbnail: recentPost.thumbnail || recentPost.mediaUrl,
      likes: recentPost.likes?.length || recentPost.likes || 0,
      views: recentPost.views || 0,
      date: recentPost.createdAt,
    });
  }
  const recentReel = reels[0];
  if (recentReel) {
    featuredItems.push({
      id: `reel-${recentReel.id}`,
      type: 'reel',
      title: recentReel.title || recentReel.description || 'Recent reel',
      thumbnail: recentReel.thumbnailUrl || recentReel.videoUrl,
      likes: recentReel.likes || 0,
      views: recentReel.views || 0,
      date: recentReel.createdAt,
    });
  }

  // Stats for the stats row
  const statsRow = [
    { value: profile.counts.followers, label: 'Followers', onClick: () => setShowFollowersModal(true) },
    { value: profile.counts.following, label: 'Following', onClick: () => setShowFollowingModal(true) },
    { value: profile.counts.posts, label: 'Posts' },
    { value: profile.stats.totalLikes, label: 'Likes' },
    { value: profile.stats.totalViews, label: 'Views' },
    { value: profile.stats.totalStreams, label: 'Streams' },
    { value: profile.stats.totalGifts, label: 'Gifts' },
  ];

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={pageLoaded ? "visible" : "hidden"}
      className="relative min-h-screen pb-24"
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,0,127,0.15), transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x - 200}px ${mousePos.y - 200}px, rgba(122,0,204,0.15), transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ===== COVER BANNER ===== */}
        <motion.div variants={fadeUpVariants} className="px-0 sm:px-0">
          <div className="relative mx-0 sm:mx-0">
            <PremiumCoverBanner
              bannerUrl={profile.bannerUrl}
              isLive={!!profile.currentStream}
              viewerCount={profile.currentStream?.viewerCount || 0}
              mousePos={mousePos}
            />
          </div>
        </motion.div>

        {/* ===== PROFILE HEADER SECTION ===== */}
        <div className="relative px-4 sm:px-6 -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28">
          <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Avatar - Larger for premium feel */}
            <FloatingProfileAvatar
              avatarUrl={profile.avatarUrl}
              username={profile.username}
              isLive={!!profile.currentStream}
              isVerified={isVerified}
              isGoldVerified={isGoldVerified}
              level={profile.loyaltyLevel || 1}
            />

            <div className="flex-1 min-w-0 pt-1 sm:pt-6 md:pt-8 lg:pt-10">
              {/* Name + Verification + Level */}
              <ProfileNameRow
                fullName={profile.fullName}
                username={profile.username}
                creatorCategory={profile.creatorCategory}
                isVerified={isVerified}
                isGoldVerified={isGoldVerified}
                level={profile.loyaltyLevel || 1}
                pronouns={profile.pronouns}
                isLive={!!profile.currentStream}
              />

              {/* Bio */}
              {profile.bio && <ProfileBio bio={profile.bio} />}

              {/* Meta Info */}
              <ProfileMeta
                city={profile.city}
                country={profile.country}
                website={profile.website}
                occupation={profile.occupation}
                languages={profile.languages}
                createdAt={profile.joinedAt}
              />

              {/* Statistics - No boxes, just typography */}
              <div className="mt-3 sm:mt-4">
                <CreatorStats
                  stats={statsRow}
                  onFollowersClick={() => setShowFollowersModal(true)}
                  onFollowingClick={() => setShowFollowingModal(true)}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-3 sm:mt-4">
                <ProfileActionButtons
                  isOwnProfile={isOwnProfile}
                  isLive={!!profile.currentStream}
                  isFollowing={isFollowing}
                  followPending={followPending}
                  onFollow={handleFollow}
                  onMessage={handleMessage}
                  onSendSparkCoin={() => router.push('/wallet')}
                  onShare={handleShareProfile}
                  onEditProfile={() => setEditModalOpen(true)}
                  onGoLive={() => setGoLiveModalOpen(true)}
                  onViewWallet={() => router.push('/wallet')}
                  onViewAnalytics={() => router.push('/creator/analytics')}
                  onViewStudio={() => router.push('/creator')}
                  onViewSettings={() => router.push('/profile/settings')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== THREE-COLUMN LAYOUT ===== */}
        <div className="mt-4 sm:mt-6 px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ===== CENTER COLUMN: Main Content ===== */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
              {/* Tab Navigation */}
              <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOwnProfile={isOwnProfile}
                counts={{
                  posts: profile.counts.posts,
                  live: profile.currentStream ? 1 : 0,
                  media: media.length,
                }}
              />

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4"
              >
                {activeTab === 'posts' && (
                  <PostsTabContent posts={posts} loading={feedLoading} hasMore={hasMoreFeed} onLoadMore={() => fetchPosts(feedCursor)} />
                )}
                {activeTab === 'reels' && <ReelsTabContent reels={reels} />}
                {activeTab === 'live' && <LiveTabContent currentStream={profile.currentStream} streams={liveStreams} />}
                {activeTab === 'media' && <MediaTabContent media={media} isOwnProfile={isOwnProfile} />}
                {activeTab === 'about' && <AboutTabContent profile={profile} />}
                {activeTab === 'achievements' && <AchievementsTabContent achievements={achievements} />}
                {activeTab === 'bookmarks' && isOwnProfile && <BookmarksTabContent />}
              </motion.div>
            </div>

            {/* ===== RIGHT SIDEBAR: Creator Widgets ===== */}
            <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 order-1 lg:order-2">
              <div className="sticky top-4 space-y-4">
                {/* Creator Score */}
                {creatorScore && (
                  <motion.div variants={fadeUpVariants}>
                    <CreatorScoreWidget score={creatorScore} />
                  </motion.div>
                )}

                {/* Achievements */}
                {achievements.length > 0 && (
                  <motion.div variants={fadeUpVariants}>
                    <AchievementBadgesWidget achievements={achievements} />
                  </motion.div>
                )}

                {/* About Widget */}
                <motion.div variants={fadeUpVariants}>
                  <AboutWidget profile={profile} />
                </motion.div>

                {/* Top Supporters */}
                <motion.div variants={fadeUpVariants}>
                  <TopSupporters supporters={topSupporters} />
                </motion.div>

                {/* Trending Creators */}
                <motion.div variants={fadeUpVariants}>
                  <TrendingCreators creators={trendingCreators} />
                </motion.div>

                {/* Suggested Creators */}
                <motion.div variants={fadeUpVariants}>
                  <SuggestedCreators creators={suggestedCreators} />
                </motion.div>

                {/* Analytics Dashboard (Owner Only) */}
                {analytics && (
                  <motion.div variants={fadeUpVariants}>
                    <AnalyticsDashboardWidget data={analytics} />
                  </motion.div>
                )}

                {/* Wallet Preview (Owner Only) */}
                {walletPreview && (
                  <motion.div variants={fadeUpVariants}>
                    <WalletPreviewWidget data={walletPreview} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {editModalOpen && (
        <SharedEditProfileModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onProfileUpdated={(updated: any) => {
            const rawUpdated = updated?.profile ?? updated?.data ?? updated;
            setProfile(prev => normalizeCreatorProfile(prev ? {
              ...prev, ...rawUpdated,
              counts: prev.counts, stats: prev.stats, wallet: prev.wallet,
              latestPosts: prev.latestPosts, currentStream: prev.currentStream,
            } : rawUpdated));
            showToast?.({ type: 'success', title: 'Saved', message: 'Profile updated successfully' });
          }}
        />
      )}
      {goLiveModalOpen && (
        <SharedGoLiveModal open={goLiveModalOpen} onClose={() => setGoLiveModalOpen(false)} />
      )}
      {showFollowersModal && (
        <FollowersModal open={showFollowersModal} onClose={() => setShowFollowersModal(false)} followers={followersList} title="Followers" />
      )}
      {showFollowingModal && (
        <FollowersModal open={showFollowingModal} onClose={() => setShowFollowingModal(false)} followers={followingList} title="Following" />
      )}
    </motion.div>
  );
}

// ============================================================
// PREMIUM COVER BANNER
// ============================================================

function PremiumCoverBanner({ bannerUrl, isLive, viewerCount, mousePos }: {
  bannerUrl?: string; isLive: boolean; viewerCount: number; mousePos: { x: number; y: number };
}) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bannerHover, setBannerHover] = useState(false);

  const { scrollYProgress } = useScroll({
    target: bannerRef as any,
    offset: ['start start', 'end start'],
  });

  const bannerScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);
  const bannerY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 4 + 2, duration: Math.random() * 10 + 8,
    delay: Math.random() * 5, opacity: Math.random() * 0.3 + 0.1,
  }));

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
    }
  };

  return (
    <div
      ref={bannerRef}
      className="relative h-[280px] sm:h-[320px] md:h-[340px] lg:h-[360px] overflow-hidden mx-0 rounded-none sm:rounded-none"
      onMouseEnter={() => setBannerHover(true)}
      onMouseLeave={() => setBannerHover(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.div className="absolute inset-0" style={{ scale: bannerScale, opacity: bannerOpacity, y: bannerY }}>
        {bannerUrl ? (
          <>
            <motion.img
              src={bannerUrl}
              alt="Cover"
              className="w-full h-[130%] object-cover"
              initial={{ scale: 1.1, filter: 'blur(20px)' }}
              animate={imageLoaded ? { scale: 1, filter: 'blur(0px)' } : {}}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              onLoad={() => setImageLoaded(true)}
            />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at ${((mousePos.x / window.innerWidth) * 100) || 50}% ${((mousePos.y / window.innerHeight) * 100) || 50}%, rgba(255,0,127,0.1), transparent 50%)`,
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a14] via-[#1a0a2e] to-[#0a0a14]">
            {/* Animated Aurora Gradient */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(800px circle at 20% 30%, rgba(255,0,127,0.12), transparent 50%)',
                  'radial-gradient(800px circle at 80% 60%, rgba(122,0,204,0.12), transparent 50%)',
                  'radial-gradient(800px circle at 40% 80%, rgba(0,216,255,0.08), transparent 50%)',
                  'radial-gradient(800px circle at 20% 30%, rgba(255,0,127,0.12), transparent 50%)',
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(600px circle at 70% 20%, rgba(0,216,255,0.08), transparent 40%)',
                  'radial-gradient(600px circle at 30% 70%, rgba(255,0,127,0.08), transparent 40%)',
                  'radial-gradient(600px circle at 60% 40%, rgba(122,0,204,0.08), transparent 40%)',
                  'radial-gradient(600px circle at 70% 20%, rgba(0,216,255,0.08), transparent 40%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-white"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
                  animate={{ y: [0, -30, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
                  transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07070d]/60 via-transparent to-[#07070d]/40" />
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.04] pointer-events-none" />

      {/* Live Badge */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
          >
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-2xl rounded-full px-3.5 py-2 border border-red-500/30 shadow-lg shadow-red-500/20">
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-red-500"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">LIVE</span>
              <span className="text-[10px] text-white/50">{viewerCount >= 1000 ? `${(viewerCount / 1000).toFixed(1)}K` : viewerCount} watching</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ============================================================
// FLOATING PROFILE AVATAR (120-140px for premium feel)
// ============================================================

function FloatingProfileAvatar({
  avatarUrl, username, isLive, isVerified, isGoldVerified, level,
}: {
  avatarUrl?: string; username?: string; isLive: boolean;
  isVerified: boolean; isGoldVerified: boolean; level: number;
}) {
  const [avatarHover, setAvatarHover] = useState(false);

  return (
    <motion.div
      className="relative shrink-0 z-20"
      onMouseEnter={() => setAvatarHover(true)}
      onMouseLeave={() => setAvatarHover(false)}
      initial={{ scale: 0.6, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-2 rounded-full pointer-events-none"
        animate={isLive ? { opacity: [0.15, 0.3, 0.15], scale: [1, 1.04, 1] } : avatarHover ? { opacity: [0.2, 0.35, 0.2], scale: [1, 1.02, 1] } : { opacity: 0.08, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: isGoldVerified ? 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,0,127,0.12) 0%, rgba(124,58,237,0.12) 50%, rgba(0,216,255,0.12) 100%)' }}
      />
      <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[130px] md:h-[130px] lg:w-[140px] lg:h-[140px] rounded-full bg-gradient-to-br from-[#ff007f] via-[#7a00cc] to-[#00d8ff] p-[3px] shadow-xl shadow-black/50">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#07070d]">
          <img
            src={avatarUrl || '/branding/sparklive-icon.svg'}
            alt={username || 'User'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Online Indicator */}
        <motion.span
          className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-[#07070d] shadow-lg shadow-emerald-500/40"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Verification Badge */}
        {isVerified && (
          <motion.div
            className={cn(
              'absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-[3px] border-[#07070d]',
              isGoldVerified ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/40' : 'bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] shadow-cyan-500/40'
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
          >
            {isGoldVerified ? <Crown size={12} className="text-white" strokeWidth={2.5} /> : <Check size={13} className="text-white" strokeWidth={3} />}
          </motion.div>
        )}

        {/* Level Badge */}
        {level > 0 && (
          <motion.div
            className="absolute -bottom-1 -left-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white shadow-lg shadow-amber-500/30 border border-amber-300/20"
            initial={{ y: 10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            Lvl {level}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// PROFILE NAME ROW
// ============================================================

function ProfileNameRow({
  fullName, username, creatorCategory, isVerified, isGoldVerified, level, pronouns, isLive,
}: {
  fullName?: string; username?: string; creatorCategory?: string;
  isVerified: boolean; isGoldVerified: boolean; level: number;
  pronouns?: string; isLive: boolean;
}) {
  const categoryIcon = creatorCategory ? getCategoryIcon(creatorCategory) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {fullName || username || 'User'}
        </motion.h1>
        {isVerified && (
          <motion.span
            className={cn(
              'shrink-0 w-6 h-6 rounded-full flex items-center justify-center shadow-lg',
              isGoldVerified ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/20' : 'bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] shadow-cyan-500/20'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
          >
            {isGoldVerified ? <Crown size={12} className="text-white" strokeWidth={2.5} /> : <Star size={12} className="text-white" fill="white" />}
          </motion.span>
        )}
        {level > 0 && (
          <motion.span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Crown size={11} className="text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400">Lvl {level}</span>
          </motion.span>
        )}
        {isLive && (
          <motion.span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.span className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">LIVE</span>
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <p className="text-sm sm:text-base text-white/40 font-medium">@{username || 'user'}</p>
        {categoryIcon && (
          <span className="flex items-center gap-1 text-[11px] text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-full">
            <span>{categoryIcon}</span>
            {creatorCategory}
          </span>
        )}
        {pronouns && (
          <span className="text-[10px] text-white/20 px-1.5 py-0.5 rounded-md bg-white/[0.03]">{pronouns}</span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// PROFILE BIO
// ============================================================

function ProfileBio({ bio }: { bio: string }) {
  const [showFullBio, setShowFullBio] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-2"
    >
      <p className="text-sm sm:text-[15px] text-white/60 max-w-2xl leading-relaxed">
        {bio.length > 150 && !showFullBio ? `${bio.slice(0, 150)}...` : bio}
        {bio.length > 150 && (
          <button onClick={() => setShowFullBio(!showFullBio)} className="ml-1 text-[#00d8ff] hover:text-[#06f7ff] text-xs font-medium transition-colors">
            {showFullBio ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
    </motion.div>
  );
}

// ============================================================
// PROFILE META INFO
// ============================================================

function ProfileMeta({
  city, country, website, occupation, languages, createdAt,
}: {
  city?: string; country?: string; website?: string; occupation?: string;
  languages?: string[]; createdAt?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2"
    >
      {website && (
        <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-[#00d8ff] hover:text-[#06f7ff] transition-colors group">
          <LinkIcon size={12} className="group-hover:rotate-12 transition-transform" />
          {website.replace(/^https?:\/\//, '')}
        </a>
      )}
      {city && (
        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
          <MapPin size={12} />
          {city}{country ? `, ${country}` : ''}
        </span>
      )}
      {createdAt && (
        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
          <Calendar size={12} />
          Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      )}
      {occupation && (
        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
          <Shield size={12} />
          {occupation}
        </span>
      )}
      {languages && languages.length > 0 && (
        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
          <Globe size={12} />
          {languages.join(', ')}
        </span>
      )}
    </motion.div>
  );
}

// ============================================================
// PROFILE ACTION BUTTONS
// ============================================================

function ProfileActionButtons({
  isOwnProfile, isLive, isFollowing, followPending, onFollow, onMessage, onSendSparkCoin,
  onShare, onEditProfile, onGoLive, onViewWallet, onViewAnalytics, onViewStudio, onViewSettings,
}: {
  isOwnProfile: boolean; isLive: boolean; isFollowing: boolean; followPending?: boolean;
  onFollow?: () => void; onMessage?: () => void; onSendSparkCoin?: () => void;
  onShare?: () => void; onEditProfile?: () => void; onGoLive?: () => void;
  onViewWallet?: () => void; onViewAnalytics?: () => void; onViewStudio?: () => void; onViewSettings?: () => void;
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (isOwnProfile) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onEditProfile}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-xs font-medium hover:bg-white/18 transition-all">
          <Edit3 size={13} /> Edit Profile
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onGoLive}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-xs font-bold hover:shadow-lg hover:shadow-pink-500/20 transition-all">
          <Radio size={13} /> {isLive ? 'Manage Stream' : 'Go Live'}
        </motion.button>
        <div className="relative">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] text-white/75 text-xs font-medium hover:text-white hover:bg-white/[0.14] transition-all">
            Manage <ChevronDown size={12} />
          </motion.button>
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-52 py-2 rounded-2xl bg-[#0e0e16]/96 backdrop-blur-2xl border border-white/10 shadow-2xl z-50"
              >
                {[
                  { label: 'Creator Studio', icon: PenSquare, action: onViewStudio },
                  { label: 'Wallet', icon: Wallet, action: onViewWallet },
                  { label: 'Analytics', icon: BarChart3, action: onViewAnalytics },
                  { label: 'Settings', icon: Settings, action: onViewSettings },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    onClick={() => { setShowMoreMenu(false); action?.(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onShare}
          className="p-2 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.14] transition-all" aria-label="Share">
          <Share2 size={16} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onFollow} disabled={followPending}
        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-70 ${isFollowing ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15' : 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white hover:shadow-lg hover:shadow-pink-500/20'}`}>
        {followPending ? <Loader2 size={15} className="animate-spin" /> : isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
        {isFollowing ? 'Following' : 'Follow'}
      </motion.button>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onMessage}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/18 transition-all">
        <MessageCircle size={15} /> Message
      </motion.button>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSendSparkCoin}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all">
        <Gift size={15} /> <span className="hidden sm:inline">Send Spark</span> <Sparkles size={12} className="text-amber-400" />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onShare}
        className="p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/18 transition-all" aria-label="Share">
        <Share2 size={16} />
      </motion.button>
      <div className="relative">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/18 transition-all" aria-label="More options">
          <MoreHorizontal size={16} />
        </motion.button>
        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 py-2 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50"
            >
              {[
                { label: 'Copy Profile Link', icon: Copy, action: () => navigator.clipboard?.writeText(window.location.href) },
                { label: 'Share Profile', icon: ExternalLink, action: onShare },
                { label: 'Report Profile', icon: Flag, action: () => { window.location.href = '/privacy-center'; } },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onClick={() => { setShowMoreMenu(false); action?.(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE TABS
// ============================================================

function ProfileTabs({
  activeTab, onTabChange, isOwnProfile, counts,
}: {
  activeTab: string; onTabChange: (tab: string) => void;
  isOwnProfile: boolean; counts: Record<string, number>;
}) {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: Video },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'media', label: 'Media', icon: ImageIcon2 },
    { id: 'about', label: 'About', icon: Info },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  if (isOwnProfile) {
    tabs.push({ id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon });
  }

  return (
    <div className="relative">
      <div className="flex border-b border-white/[0.06] overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 outline-none whitespace-nowrap"
              aria-selected={isActive}
              role="tab"
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-white/30'} />
              <span className={isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}>
                {tab.label}
              </span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  'text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-[#ff007f]/15 text-[#ff007f]' : 'bg-white/[0.04] text-white/30'
                )}>
                  {count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="tabGlow"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="h-full bg-gradient-to-r from-[#ff007f] via-[#7a00cc] to-[#00d8ff] rounded-full" />
                  <div className="absolute inset-0 h-full bg-gradient-to-r from-[#ff007f] via-[#7a00cc] to-[#00d8ff] rounded-full blur-sm opacity-50" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// TAB CONTENT COMPONENTS
// ============================================================

function PostsTabContent({ posts, loading, hasMore, onLoadMore }: {
  posts: any[]; loading: boolean; hasMore: boolean; onLoadMore: () => void;
}) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [postSaves, setPostSaves] = useState<Record<string, number>>({});
  const [postShares, setPostShares] = useState<Record<string, number>>({});
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Initialize state from posts
  useEffect(() => {
    const initialLikes: Record<string, boolean> = {};
    const initialSaves: Record<string, boolean> = {};
    const initialLikesCount: Record<string, number> = {};
    const initialSavesCount: Record<string, number> = {};
    const initialSharesCount: Record<string, number> = {};
    const initialComments: Record<string, number> = {};

    posts.forEach((post: any) => {
      initialLikes[post.id] = post.isLiked || post.liked || false;
      initialSaves[post.id] = post.isSaved || post.saved || false;
      initialLikesCount[post.id] = post.likesCount || post.likes?.length || post.likes || 0;
      initialSavesCount[post.id] = post.savesCount || 0;
      initialSharesCount[post.id] = post.shareCount || 0;
      initialComments[post.id] = post.commentsCount || post.comments?.length || post.comments || 0;
    });

    setLikedPosts(initialLikes);
    setSavedPosts(initialSaves);
    setPostLikes(initialLikesCount);
    setPostSaves(initialSavesCount);
    setPostShares(initialSharesCount);
    setCommentCounts(initialComments);
  }, [posts]);

  const handleLike = async (postId: string) => {
    if (!token) return;
    const wasLiked = likedPosts[postId];
    // Optimistic update
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    setPostLikes(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (wasLiked ? -1 : 1)) }));
    try {
      const result = await apiPost<any>(`/api/feed/${postId}/like`, {}, token);
      if (result) {
        setLikedPosts(prev => ({ ...prev, [postId]: result.liked ?? !wasLiked }));
      }
    } catch {
      // Rollback on error
      setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
      setPostLikes(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (wasLiked ? 1 : -1)) }));
    }
  };

  const handleSave = async (postId: string) => {
    if (!token) return;
    const wasSaved = savedPosts[postId];
    setSavedPosts(prev => ({ ...prev, [postId]: !wasSaved }));
    setPostSaves(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (wasSaved ? -1 : 1)) }));
    try {
      if (wasSaved) {
        await apiPost<any>(`/api/feed/${postId}/save`, {}, token);
      } else {
        await apiPost<any>(`/api/feed/${postId}/save`, {}, token);
      }
    } catch {
      setSavedPosts(prev => ({ ...prev, [postId]: wasSaved }));
      setPostSaves(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (wasSaved ? 1 : -1)) }));
    }
  };

  const handleShare = async (postId: string) => {
    if (!token) return;
    if (navigator.share) {
      navigator.share({ title: 'Check this out on SparkLive!', url: `${window.location.origin}/post/${postId}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      showToast?.({ type: 'success', title: 'Link copied', message: 'Post link copied to clipboard' });
    }
    // Increment share count
    try {
      const result = await apiPost<any>(`/api/feed/${postId}/share`, {}, token);
      if (result?.shareCount) {
        setPostShares(prev => ({ ...prev, [postId]: result.shareCount }));
      }
    } catch { /* silently fail */ }
  };

  const handleReply = async (postId: string) => {
    const content = replyInput[postId]?.trim();
    if (!token || !content) return;
    try {
      await apiPost<any>(`/api/feed/${postId}/comments`, { content }, token);
      setReplyInput(prev => ({ ...prev, [postId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [postId]: false }));
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      showToast?.({ type: 'success', title: 'Replied', message: 'Comment added successfully' });
    } catch (err: any) {
      showToast?.({ type: 'error', title: 'Error', message: err.message || 'Failed to add comment' });
    }
  };

  if (posts.length === 0 && !loading) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
        <Video size={32} className="mx-auto text-white/20 mb-3" />
        <p className="text-white/40 text-sm font-medium">No posts yet</p>
        <p className="text-white/20 text-xs mt-1">Your content will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any, i: number) => (
        <motion.div
          key={post.id || i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden backdrop-blur-xl hover:bg-white/[0.03] transition-colors group"
        >
          {/* Post Content */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 flex items-center justify-center shrink-0">
                {post.video || post.mediaUrl ? (
                  <Play size={16} className="text-[#ff007f]" />
                ) : post.images?.length ? (
                  <ImageIcon2 size={16} className="text-[#00d8ff]" />
                ) : (
                  <MessageCircle size={16} className="text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 line-clamp-3">{post.content || 'No content'}</p>
                {post.createdAt && (
                  <p className="text-[10px] text-white/20 mt-1">{formatTimeAgo(post.createdAt)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 px-4 pb-3 border-t border-white/[0.04] pt-3">
            <button
              onClick={() => handleLike(post.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                likedPosts[post.id] ? 'text-[#ff007f] bg-[#ff007f]/10' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Heart size={13} className={likedPosts[post.id] ? 'fill-[#ff007f]' : ''} />
              <span>{postLikes[post.id] > 0 ? postLikes[post.id] : ''}</span>
            </button>

            <button
              onClick={() => setShowReplyInput(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <MessageCircle size={13} />
              <span>{commentCounts[post.id] > 0 ? commentCounts[post.id] : ''}</span>
            </button>

            <button
              onClick={() => handleShare(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <Share2 size={13} />
              <span>{postShares[post.id] > 0 ? postShares[post.id] : ''}</span>
            </button>

            <button
              onClick={() => handleSave(post.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ml-auto',
                savedPosts[post.id] ? 'text-[#00d8ff] bg-[#00d8ff]/10' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Bookmark size={13} className={savedPosts[post.id] ? 'fill-[#00d8ff]' : ''} />
            </button>
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {showReplyInput[post.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 pb-3">
                  <input
                    type="text"
                    value={replyInput[post.id] || ''}
                    onChange={e => setReplyInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] py-2 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleReply(post.id);
                    }}
                  />
                  <button
                    onClick={() => handleReply(post.id)}
                    disabled={!replyInput[post.id]?.trim()}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-xs font-bold disabled:opacity-50 transition-all"
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {hasMore && (
        <div className="text-center py-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</span>
            ) : 'Load More'}
          </motion.button>
        </div>
      )}
    </div>
  );
}

function ReelsTabContent({ reels }: { reels: any[] }) {
  if (reels.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
        <Film size={32} className="mx-auto text-white/20 mb-3" />
        <p className="text-white/40 text-sm font-medium">No reels yet</p>
        <p className="text-white/20 text-xs mt-1">Your short-form videos will appear here</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {reels.map((reel: any, i: number) => (
        <motion.div
          key={reel.id || i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group cursor-pointer"
        >
          {reel.thumbnailUrl || reel.videoUrl ? (
            <img src={reel.thumbnailUrl || reel.videoUrl} alt={reel.title || 'Reel'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Play size={24} className="text-white/20" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs text-white/80 font-medium truncate">{reel.title || 'Untitled'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[9px] text-white/50"><Heart size={8} /> {formatNumber(reel.likes || 0)}</span>
              <span className="flex items-center gap-1 text-[9px] text-white/50"><Eye size={8} /> {formatNumber(reel.views || 0)}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function LiveTabContent({ currentStream, streams }: { currentStream?: any; streams: any[] }) {
  const activeStreams = streams.filter((s: any) => s.status === 'LIVE' || s.active);
  const pastStreams = streams.filter((s: any) => s.status === 'ENDED' || !s.active);
  const upcomingStreams = streams.filter((s: any) => s.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      {currentStream && (
        <div className="rounded-2xl bg-gradient-to-br from-red-500/5 to-rose-500/5 border border-red-500/15 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <motion.span className="w-2 h-2 rounded-full bg-red-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">LIVE NOW</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-1">{currentStream.title || 'Untitled Stream'}</h4>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1"><Eye size={12} /> {currentStream.viewerCount || 0} viewers</span>
            {currentStream.categoryName && <span>{currentStream.categoryName}</span>}
          </div>
        </div>
      )}
      {upcomingStreams.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Upcoming Streams</h4>
          <div className="space-y-2">
            {upcomingStreams.map((stream: any, i: number) => (
              <div key={stream.id || i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-sm text-white/70 font-medium">{stream.title}</p>
                <p className="text-[10px] text-white/30 mt-1">{stream.scheduledFor ? new Date(stream.scheduledFor).toLocaleDateString() : 'Date TBD'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {pastStreams.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Past Streams</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pastStreams.slice(0, 4).map((stream: any, i: number) => (
              <div key={stream.id || i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                  <Play size={16} className="text-purple-400 ml-0.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white/70 truncate">{stream.title || 'Untitled Stream'}</p>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 mt-0.5">
                    <span>{stream.viewerCount || 0} viewers</span>
                    {stream.duration && <span>{Math.floor(stream.duration / 60)}m</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!currentStream && pastStreams.length === 0 && upcomingStreams.length === 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
          <Radio size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40 text-sm font-medium">No streams yet</p>
          <p className="text-white/20 text-xs mt-1">Live streams will appear here</p>
        </div>
      )}
    </div>
  );
}

function MediaTabContent({ media, isOwnProfile }: { media: any[]; isOwnProfile: boolean }) {
  if (media.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
        <ImageIcon2 size={32} className="mx-auto text-white/20 mb-3" />
        <p className="text-white/40 text-sm font-medium">No media yet</p>
        <p className="text-white/20 text-xs mt-1">Photos and videos will appear here</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {media.map((item: any, i: number) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group cursor-pointer"
        >
          {item.type === 'video' ? (
            <>
              <img src={item.thumbnail || item.url} alt={item.title || 'Media'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Play size={18} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
              {item.duration && <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white/80">{item.duration}</div>}
            </>
          ) : (
            <img src={item.url} alt={item.title || 'Photo'} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] text-white/70"><Heart size={8} /> {item.likes || 0}</span>
              {item.views && <span className="flex items-center gap-1 text-[9px] text-white/70"><Eye size={8} /> {formatNumber(item.views)}</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AboutTabContent({ profile }: { profile: CreatorProfile }) {
  const socialPlatforms: Record<string, { icon: any; color: string }> = {
    github: { icon: Github, color: 'text-gray-400' },
    twitter: { icon: Twitter, color: 'text-sky-400' },
    instagram: { icon: Instagram, color: 'text-pink-400' },
    youtube: { icon: Youtube, color: 'text-red-400' },
    linkedin: { icon: Linkedin, color: 'text-blue-400' },
    facebook: { icon: Facebook, color: 'text-blue-500' },
    tiktok: { icon: Music2, color: 'text-white' },
    twitch: { icon: Gamepad, color: 'text-purple-400' },
    discord: { icon: Headphones, color: 'text-indigo-400' },
    website: { icon: Globe, color: 'text-cyan-400' },
  };

  return (
    <div className="space-y-4">
      {profile.bio && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-2">Bio</h4>
          <p className="text-sm text-white/70 leading-relaxed">{profile.bio}</p>
        </div>
      )}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.creatorCategory && <div className="flex items-center gap-2 text-sm text-white/60"><span>{getCategoryIcon(profile.creatorCategory)}</span><span>{profile.creatorCategory}</span></div>}
          {profile.occupation && <div className="flex items-center gap-2 text-sm text-white/60"><BriefcaseIcon size={14} className="text-white/30" /><span>{profile.occupation}</span></div>}
          {profile.country && <div className="flex items-center gap-2 text-sm text-white/60"><Globe size={14} className="text-white/30" /><span>{profile.country}{profile.city ? `, ${profile.city}` : ''}</span></div>}
          {profile.languages && profile.languages.length > 0 && <div className="flex items-center gap-2 text-sm text-white/60"><MessageCircle size={14} className="text-white/30" /><span>{profile.languages.join(', ')}</span></div>}
          {profile.pronouns && <div className="flex items-center gap-2 text-sm text-white/60"><span className="text-white/30">⚧</span><span>{profile.pronouns}</span></div>}
          {profile.businessEmail && <div className="flex items-center gap-2 text-sm text-white/60"><MailIcon size={14} className="text-white/30" /><span>{profile.businessEmail}</span></div>}
          <div className="flex items-center gap-2 text-sm text-white/60"><Calendar size={14} className="text-white/30" /><span>Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div>
        </div>
      </div>
      {profile.socialLinks && profile.socialLinks.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Social Links</h4>
          <div className="flex flex-wrap gap-2">
            {profile.socialLinks.map((link: any, i: number) => {
              const platform = socialPlatforms[link.platform?.toLowerCase()] || { icon: Globe, color: 'text-white/40' };
              const Icon = platform.icon;
              return (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-all">
                  <Icon size={14} className={platform.color} /> {link.platform}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementsTabContent({ achievements }: { achievements: Achievement[] }) {
  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-purple-500',
    epic: 'from-purple-400 to-pink-500',
    legendary: 'from-amber-400 to-orange-500',
  };
  const iconMap: Record<string, any> = {
    award: Award, crown: Crown, star: Star, zap: Zap, shield: Shield,
    sparkles: Sparkles, trophy: Trophy, medal: Medal, target: TargetIcon, flame: Flame,
  };

  if (achievements.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
        <Award size={32} className="mx-auto text-white/20 mb-3" />
        <p className="text-white/40 text-sm font-medium">No achievements yet</p>
        <p className="text-white/20 text-xs mt-1">Start creating to unlock achievements</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {achievements.map((achievement, i) => {
        const Icon = iconMap[achievement.icon] || Award;
        const isUnlocked = achievement.unlocked;
        const rarity = achievement.rarity || 'common';
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'rounded-2xl border p-4 transition-all duration-300',
              isUnlocked ? cn('bg-gradient-to-br', rarityColors[rarity].replace('from-', 'from-').replace('to-', 'to-') + '/10', 'border-white/[0.08]') : 'bg-white/[0.02] border-white/[0.05] opacity-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', isUnlocked ? cn('bg-gradient-to-br', rarityColors[rarity]) : 'bg-white/[0.04]')}>
                <Icon size={18} className={isUnlocked ? 'text-white' : 'text-white/20'} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{achievement.title}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{achievement.description}</p>
                <span className={cn('text-[8px] font-semibold uppercase tracking-wider mt-1 inline-block', isUnlocked ? 'text-white/30' : 'text-white/20')}>
                  {rarity} • {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function BookmarksTabContent() {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
      <BookmarkIcon size={32} className="mx-auto text-white/20 mb-3" />
      <p className="text-white/40 text-sm font-medium">No bookmarks yet</p>
      <p className="text-white/20 text-xs mt-1">Save posts to view them later</p>
    </div>
  );
}

// ============================================================
// RIGHT SIDEBAR WIDGETS
// ============================================================

function CreatorScoreWidget({ score }: { score: CreatorScore }) {
  const progressPercent = (score.xp / score.xpToNext) * 100;
  const topPercent = score.topPercent || Math.max(1, 100 - Math.round((score.rank / 100000) * 100));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#ff007f]/5 to-[#7a00cc]/5 border border-[#ff007f]/15 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Creator Score</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">Rank</span>
          <span className="text-xs font-bold text-amber-400">#{score.rank.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-4xl font-bold text-white">{score.totalScore}</span>
        <span className="text-sm text-white/40 mb-1">Level {score.level}</span>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[10px] text-white/30">
          <span>XP: {score.xp} / {score.xpToNext}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
      <div className="text-center">
        <span className="text-[10px] text-white/30">Top {topPercent}% of creators</span>
      </div>
    </div>
  );
}

function AchievementBadgesWidget({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter(a => a.unlocked);
  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-purple-500',
    epic: 'from-purple-400 to-pink-500',
    legendary: 'from-amber-400 to-orange-500',
  };
  const iconMap: Record<string, any> = {
    award: Award, crown: Crown, star: Star, zap: Zap, shield: Shield,
    sparkles: Sparkles, trophy: Trophy, medal: Medal, target: TargetIcon, flame: Flame,
  };

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Achievements</h3>
        </div>
        <span className="text-[10px] text-white/30">{unlocked.length}/{achievements.length}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {achievements.slice(0, 8).map((achievement, i) => {
          const Icon = iconMap[achievement.icon] || Award;
          const isUnlocked = achievement.unlocked;
          const rarity = achievement.rarity || 'common';
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group"
            >
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                isUnlocked ? cn('bg-gradient-to-br', rarityColors[rarity], 'shadow-lg') : 'bg-white/[0.04] border border-white/[0.06]'
              )}>
                <Icon size={16} className={isUnlocked ? 'text-white' : 'text-white/20'} />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[#1a1a2e] border border-white/[0.08] text-[10px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                <p className="font-medium">{achievement.title}</p>
                <p className="text-white/50">{achievement.description}</p>
              </div>
            </motion.div>
          );
        })}
        {achievements.length > 8 && (
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-medium">
            +{achievements.length - 8}
          </div>
        )}
      </div>
    </div>
  );
}

function AboutWidget({ profile }: { profile: CreatorProfile }) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <Info size={14} className="text-white/40" />
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">About</h3>
      </div>
      <div className="space-y-2">
        {profile.bio && (
          <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">{profile.bio}</p>
        )}
        <div className="space-y-1.5">
          {profile.website && (
            <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors">
              <LinkIcon size={10} /> {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {profile.country && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <Globe size={10} /> {profile.country}{profile.city ? `, ${profile.city}` : ''}
            </div>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <MessageCircle size={10} /> {profile.languages.join(', ')}
            </div>
          )}
          {profile.creatorCategory && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <span>{getCategoryIcon(profile.creatorCategory)}</span> {profile.creatorCategory}
            </div>
          )}
          {profile.businessEmail && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <MailIcon size={10} /> {profile.businessEmail}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Calendar size={10} /> Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDashboardWidget({ data }: { data: AnalyticsData }) {
  const metrics = [
    { label: 'Total Views', value: data.totalViews, change: data.viewsGrowth, icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Total Likes', value: data.totalLikes, change: data.likesGrowth, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Followers', value: data.totalFollowers, change: data.followerGrowth, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Engagement', value: data.engagementRate, suffix: '%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Posts', value: data.totalPosts, icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Streams', value: data.totalStreams, icon: Radio, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Gifts', value: data.totalGifts, icon: Gift, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Comments', value: data.totalComments, icon: MessageCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-white/40" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Analytics Dashboard</h3>
        </div>
        <motion.button whileHover={{ x: 3 }} className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium">
          View Full →
        </motion.button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          const isPositive = metric.change !== undefined && metric.change > 0;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center', metric.bg)}>
                    <Icon size={12} className={metric.color} />
                  </div>
                </div>
                <p className="text-base font-bold text-white tabular-nums">{formatNumber(metric.value)}{metric.suffix || ''}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-white/40">{metric.label}</span>
                  {metric.change !== undefined && metric.change !== 0 && (
                    <span className={cn('flex items-center gap-0.5 text-[8px]', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                      {isPositive ? <ArrowUp size={7} /> : <ArrowDown size={7} />}
                      {Math.abs(metric.change)}%
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function WalletPreviewWidget({ data }: { data: WalletPreview }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-amber-400" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Wallet</h3>
        </div>
        <motion.button whileHover={{ x: 3 }} className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium">
          Open Full →
        </motion.button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Balance</p>
          <p className="text-2xl font-bold text-white">{formatNumber(data.balance)}</p>
          <p className="text-[9px] text-white/20">Spark Coins</p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Earnings</p>
          <p className="text-2xl font-bold text-emerald-400">{formatNumber(data.totalEarnings)}</p>
          <p className="text-[9px] text-white/20">Lifetime</p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Gifts</p>
          <p className="text-2xl font-bold text-amber-400">{formatNumber(data.totalGifts)}</p>
          <p className="text-[9px] text-white/20">Received</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ICON HELPERS
// ============================================================

function BriefcaseIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function MailIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

// ============================================================
// FOLLOWERS MODAL
// ============================================================

function FollowersModal({ open, onClose, followers, title }: { open: boolean; onClose: () => void; followers: any[]; title: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-[#0e0e16] border border-white/[0.08] p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title} ({followers.length})</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
            <X size={16} />
          </button>
        </div>
        {followers.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">No {title.toLowerCase()} yet</p>
        ) : (
          <div className="space-y-2">
            {followers.map((f: any, i: number) => (
              <div key={f.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <img src={f.avatar || f.avatarUrl || '/branding/sparklive-icon.svg'} alt={f.username} className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{f.fullName || f.username}</p>
                  <p className="text-[10px] text-white/40">@{f.username}</p>
                </div>
                {f.verified && <Check size={12} className="text-[#00d8ff] shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}