'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';
import { uploadAvatar as uploadAvatarService, uploadBanner as uploadBannerService, validateUploadFile } from '@/lib/uploadService';

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

// ============================================================
// PROPS
// ============================================================

interface CreatorHubPageProps {
  username?: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CreatorHubPage({ username }: CreatorHubPageProps) {
  const { token, user: authUser } = useAuth();
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
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [pinnedContent, setPinnedContent] = useState<any[]>([]);

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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
      
      // Normalize profile data to handle different API response formats
      const normalized: CreatorProfile = {
        id: raw.id || '',
        username: raw.username || '',
        fullName: raw.fullName || raw.full_name || '',
        avatarUrl: raw.avatarUrl || raw.avatar_url || raw.avatar || null,
        bannerUrl: raw.bannerUrl || raw.banner_url || null,
        bio: raw.bio || '',
        website: raw.website || null,
        country: raw.country || null,
        city: raw.city || null,
        verified: raw.verified || false,
        premium: raw.premium || false,
        creatorCategory: raw.creatorCategory || raw.creator_category || null,
        occupation: raw.occupation || null,
        languages: raw.languages || [],
        pronouns: raw.pronouns || null,
        businessEmail: raw.businessEmail || raw.business_email || null,
        theme: raw.theme || null,
        featuredContent: raw.featuredContent || raw.featured_content || [],
        socialLinks: raw.socialLinks || raw.social_links || [],
        media: raw.media || [],
        isOnline: raw.isOnline || raw.is_online || false,
        lastActive: raw.lastActive || raw.last_active || null,
        verificationType: raw.verificationType || raw.verification_type || null,
        verificationStatus: raw.verificationStatus || raw.verification_status || null,
        creatorMembership: raw.creatorMembership || raw.creator_membership || null,
        loyaltyLevel: raw.loyaltyLevel || raw.loyalty_level || 1,
        loyaltyTier: raw.loyaltyTier || raw.loyalty_tier || 'BRONZE',
        loyaltyXp: raw.loyaltyXp || raw.loyalty_xp || 0,
        currentStream: raw.currentStream || raw.current_stream || null,
        counts: {
          followers: raw.counts?.followers || raw.followersCount || raw.followers_count || 0,
          following: raw.counts?.following || raw.followingCount || raw.following_count || 0,
          posts: raw.counts?.posts || raw.postsCount || raw.posts_count || 0,
          media: raw.counts?.media || raw.mediaCount || raw.media_count || 0,
        },
        stats: {
          totalLikes: raw.stats?.totalLikes || raw.totalLikes || raw.likesReceived || raw.likes_received || 0,
          totalComments: raw.stats?.totalComments || raw.totalComments || 0,
          totalGifts: raw.stats?.totalGifts || raw.totalGifts || raw.giftsReceived || raw.gifts_received || 0,
          totalViews: raw.stats?.totalViews || raw.totalViews || raw.total_views || 0,
          totalStreams: raw.stats?.totalStreams || raw.totalStreams || raw.streamsCount || raw.streams_count || 0,
          totalPosts: raw.stats?.totalPosts || raw.totalPosts || raw.postsCount || raw.posts_count || 0,
          totalFollowers: raw.stats?.totalFollowers || raw.totalFollowers || raw.followersCount || raw.followers_count || 0,
          totalFollowing: raw.stats?.totalFollowing || raw.totalFollowing || raw.followingCount || raw.following_count || 0,
        },
        wallet: {
          coinBalance: raw.wallet?.coinBalance || raw.coinBalance || raw.coin_balance || 0,
          earningsBalance: raw.wallet?.earningsBalance || raw.earningsBalance || raw.earnings_balance || 0,
          lifetimeEarnings: raw.wallet?.lifetimeEarnings || raw.lifetimeEarnings || raw.lifetime_earnings || 0,
          totalGiftsReceived: raw.wallet?.totalGiftsReceived || raw.totalGiftsReceived || raw.total_gifts_received || 0,
        },
        latestPosts: raw.latestPosts || raw.latest_posts || [],
        joinedAt: raw.joinedAt || raw.joined_at || raw.createdAt || raw.created_at || new Date().toISOString(),
      };
      
      setProfile(normalized);

      // Set following status for other profiles
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
    } catch {
      // Silently fail
    }
  }, [token, isOwnProfile]);

  // ===== FETCH ACHIEVEMENTS =====
  const fetchAchievements = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/achievements', token);
      setAchievements(Array.isArray(data) ? data : data?.achievements || []);
    } catch {
      // Silently fail
    }
  }, [token]);

  // ===== FETCH ANALYTICS =====
  const fetchAnalytics = useCallback(async () => {
    if (!token || !isOwnProfile) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/analytics', token);
      setAnalytics(data);
    } catch {
      // Silently fail
    }
  }, [token, isOwnProfile]);

  // ===== FETCH WALLET PREVIEW =====
  const fetchWalletPreview = useCallback(async () => {
    if (!token || !isOwnProfile) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/wallet-preview', token);
      setWalletPreview(data);
    } catch {
      // Silently fail
    }
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

      // Extract media from posts
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
      if (!cursor) {
        setPosts([]);
        setMedia([]);
      }
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
    } catch {
      // Silently fail
    }
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
    } catch {
      // Silently fail
    }
  }, [token, username, isOwnProfile]);

  // ===== FETCH FOLLOWERS =====
  const fetchFollowersList = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/followers', token);
      setFollowersList(data?.items || []);
    } catch {
      // Silently fail
    }
  }, [token]);

  // ===== FETCH FOLLOWING =====
  const fetchFollowingList = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me/following', token);
      setFollowingList(data?.items || []);
    } catch {
      // Silently fail
    }
  }, [token]);

  // ===== FOLLOW / UNFOLLOW =====
  const handleFollow = useCallback(async () => {
    if (!token || !username) return;
    try {
      if (isFollowing) {
        await apiDelete(`/api/profiles/${username}/follow`, token);
        setIsFollowing(false);
        setProfile(prev => prev ? {
          ...prev,
          counts: { ...prev.counts, followers: Math.max(0, prev.counts.followers - 1) },
          stats: { ...prev.stats, totalFollowers: Math.max(0, prev.stats.totalFollowers - 1) },
        } : prev);
        showToast?.({ type: 'success', title: 'Unfollowed', message: `Unfollowed @${username}` });
      } else {
        await apiPost(`/api/profiles/${username}/follow`, {}, token);
        setIsFollowing(true);
        setProfile(prev => prev ? {
          ...prev,
          counts: { ...prev.counts, followers: prev.counts.followers + 1 },
          stats: { ...prev.stats, totalFollowers: prev.stats.totalFollowers + 1 },
        } : prev);
        showToast?.({ type: 'success', title: 'Following', message: `Following @${username}` });
      }
    } catch (err: any) {
      showToast?.({ type: 'error', title: 'Error', message: err.message });
    }
  }, [token, username, isFollowing, showToast]);

  // ===== UPLOAD HANDLERS =====
  const handleAvatarUpload = async (file: File) => {
    if (!token) return;
    const err = validateUploadFile(file, 'avatar');
    if (err) { showToast?.({ type: 'error', title: 'Invalid file', message: err }); return; }
    try {
      const result = await uploadAvatarService(file, token);
      if (result.url) {
        setProfile((prev: any) => prev ? { ...prev, avatarUrl: result.url } : prev);
        showToast?.({ type: 'success', title: 'Avatar updated', message: 'Profile photo updated' });
        setTimeout(() => fetchProfile(), 500);
      }
    } catch (err: any) {
      showToast?.({ type: 'error', title: 'Upload failed', message: err.message });
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!token) return;
    const err = validateUploadFile(file, 'banner');
    if (err) { showToast?.({ type: 'error', title: 'Invalid file', message: err }); return; }
    try {
      const result = await uploadBannerService(file, token);
      if (result.url) {
        setProfile((prev: any) => prev ? { ...prev, bannerUrl: result.url } : prev);
        showToast?.({ type: 'success', title: 'Banner updated', message: 'Cover image updated' });
        setTimeout(() => fetchProfile(), 500);
      }
    } catch (err: any) {
      showToast?.({ type: 'error', title: 'Upload failed', message: err.message });
    }
  };

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
    if (isOwnProfile) {
      fetchCreatorScore();
      fetchAnalytics();
      fetchWalletPreview();
      fetchFollowersList();
      fetchFollowingList();
    }
  }, [fetchProfile, fetchAchievements, fetchPosts, fetchReels, fetchLiveStreams, fetchCreatorScore, fetchAnalytics, fetchWalletPreview, fetchFollowersList, fetchFollowingList, isOwnProfile]);

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
      opacity: 1,
      y: 0,
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
        <motion.p className="text-sm text-white/30 mb-8 max-w-md text-center">
          {error}
        </motion.p>
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
  const categoryIcon = profile.creatorCategory ? getCategoryIcon(profile.creatorCategory) : null;

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
        {/* ===== HERO COVER ===== */}
        <HeroCover
          bannerUrl={profile.bannerUrl}
          isOwnProfile={isOwnProfile}
          isLive={!!profile.currentStream}
          viewerCount={profile.currentStream?.viewerCount || 0}
          onBannerUpload={isOwnProfile ? handleBannerUpload : undefined}
        />

        {/* ===== FLOATING PROFILE CARD ===== */}
        <div className="relative px-4 sm:px-6 -mt-20 sm:-mt-24 md:-mt-28 lg:-mt-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            <FloatingProfileAvatar
              avatarUrl={profile.avatarUrl}
              username={profile.username}
              isOwnProfile={isOwnProfile}
              isLive={!!profile.currentStream}
              isVerified={isVerified}
              isGoldVerified={isGoldVerified}
              level={profile.loyaltyLevel || 1}
              onAvatarUpload={isOwnProfile ? handleAvatarUpload : undefined}
            />

            <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-4">
              {/* ===== CREATOR SUMMARY ===== */}
              <CreatorSummary
                fullName={profile.fullName}
                username={profile.username}
                bio={profile.bio}
                creatorCategory={profile.creatorCategory}
                isLive={!!profile.currentStream}
                isVerified={isVerified}
                isGoldVerified={isGoldVerified}
                level={profile.loyaltyLevel || 1}
                city={profile.city}
                country={profile.country}
                website={profile.website}
                occupation={profile.occupation}
                languages={profile.languages}
                pronouns={profile.pronouns}
                createdAt={profile.joinedAt}
                creatorScore={creatorScore?.totalScore || 0}
              />

              {/* ===== ACTION BUTTONS ===== */}
              <ActionButtons
                isOwnProfile={isOwnProfile}
                isLive={!!profile.currentStream}
                isFollowing={isFollowing}
                onFollow={handleFollow}
                onMessage={() => showToast?.({ type: 'info', title: 'Messages', message: 'Messaging feature coming soon' })}
                onSendSparkCoin={() => showToast?.({ type: 'info', title: 'Spark Coins', message: 'Send Spark Coins feature coming soon' })}
                onShare={handleShareProfile}
                onEditProfile={() => setEditModalOpen(true)}
                onGoLive={() => setGoLiveModalOpen(true)}
                onViewWallet={() => showToast?.({ type: 'info', title: 'Wallet', message: 'Wallet feature coming soon' })}
                onViewAnalytics={() => showToast?.({ type: 'info', title: 'Analytics', message: 'Analytics feature coming soon' })}
                onViewStudio={() => showToast?.({ type: 'info', title: 'Studio', message: 'Studio feature coming soon' })}
              />
            </div>
          </div>
        </div>

        {/* ===== CREATOR STATISTICS ===== */}
        <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
          <CreatorStatistics
            followers={profile.counts.followers}
            following={profile.counts.following}
            posts={profile.counts.posts}
            likes={profile.stats.totalLikes}
            views={profile.stats.totalViews}
            streams={profile.stats.totalStreams}
            gifts={profile.stats.totalGifts}
            onFollowersClick={() => { setShowFollowersModal(true); }}
            onFollowingClick={() => { setShowFollowingModal(true); }}
          />
        </motion.div>

        {/* ===== CREATOR SCORE (OWNER ONLY) ===== */}
        {isOwnProfile && creatorScore && (
          <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
            <CreatorScoreCard score={creatorScore} />
          </motion.div>
        )}

        {/* ===== ACHIEVEMENT BADGES ===== */}
        {achievements.length > 0 && (
          <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
            <AchievementBadges achievements={achievements} />
          </motion.div>
        )}

        {/* ===== ANALYTICS DASHBOARD (OWNER ONLY) ===== */}
        {isOwnProfile && analytics && (
          <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
            <AnalyticsDashboard data={analytics} />
          </motion.div>
        )}

        {/* ===== WALLET PREVIEW (OWNER ONLY) ===== */}
        {isOwnProfile && walletPreview && (
          <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
            <WalletPreviewCard data={walletPreview} />
          </motion.div>
        )}

        {/* ===== FEATURED CONTENT ===== */}
        {pinnedContent.length > 0 && (
          <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
            <FeaturedContent items={pinnedContent} />
          </motion.div>
        )}

        {/* ===== DIVIDER ===== */}
        <motion.div variants={fadeUpVariants} className="my-8 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] opacity-40"
            />
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
        </motion.div>

        {/* ===== TAB NAVIGATION ===== */}
        <div className="px-4 sm:px-6">
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

          {/* ===== TAB CONTENT ===== */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6"
          >
            {activeTab === 'posts' && (
              <PostsTab
                posts={posts}
                loading={feedLoading}
                hasMore={hasMoreFeed}
                onLoadMore={() => fetchPosts(feedCursor)}
              />
            )}
            {activeTab === 'reels' && (
              <ReelsTab reels={reels} />
            )}
            {activeTab === 'live' && (
              <LiveTab
                currentStream={profile.currentStream}
                streams={liveStreams}
              />
            )}
            {activeTab === 'media' && (
              <MediaTab media={media} isOwnProfile={isOwnProfile} />
            )}
            {activeTab === 'about' && (
              <AboutTab profile={profile} />
            )}
            {activeTab === 'achievements' && (
              <AchievementsTab achievements={achievements} />
            )}
            {activeTab === 'bookmarks' && isOwnProfile && (
              <BookmarksTab />
            )}
          </motion.div>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {editModalOpen && (
        <EditProfileModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onProfileUpdated={(updated: any) => {
            setProfile(updated);
            showToast?.({ type: 'success', title: 'Saved', message: 'Profile updated successfully' });
          }}
        />
      )}
      {goLiveModalOpen && (
        <GoLiveModal
          open={goLiveModalOpen}
          onClose={() => setGoLiveModalOpen(false)}
        />
      )}
      {showFollowersModal && (
        <FollowersModal
          open={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          followers={followersList}
          title="Followers"
        />
      )}
      {showFollowingModal && (
        <FollowersModal
          open={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          followers={followingList}
          title="Following"
        />
      )}
    </motion.div>
  );
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    music: '🎵', gaming: '🎮', creative: '🎨', education: '📚',
    sports: '🏆', tech: '💻', lifestyle: '❤️', mobile: '📱',
    chatting: '💬',
  };
  return icons[category.toLowerCase()] || '⭐';
}

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

// ============================================================
// HERO COVER
// ============================================================

function HeroCover({
  bannerUrl, isOwnProfile, isLive, viewerCount, onBannerUpload,
}: {
  bannerUrl?: string; isOwnProfile: boolean; isLive: boolean;
  viewerCount: number; onBannerUpload?: (file: File) => Promise<void>;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerHover, setBannerHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start start', 'end start'],
  });

  const bannerScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 4 + 2, duration: Math.random() * 10 + 8,
    delay: Math.random() * 5, opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div
      ref={bannerRef}
      className="relative h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-3xl overflow-hidden group mx-4 sm:mx-6 mt-4 sm:mt-6"
      onMouseMove={(e) => {
        const rect = bannerRef.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
      }}
      onMouseEnter={() => setBannerHover(true)}
      onMouseLeave={() => setBannerHover(false)}
    >
      <motion.div className="absolute inset-0" style={{ scale: bannerScale, opacity: bannerOpacity }}>
        {bannerUrl ? (
          <motion.img
            src={bannerUrl} alt="Cover"
            className="w-full h-[130%] object-cover"
            initial={{ scale: 1.1, filter: 'blur(20px)' }}
            animate={imageLoaded ? { scale: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a14] via-[#1a0a2e] to-[#0a0a14]">
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
          </div>
        )}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,0,127,0.08), transparent 50%)` }}
        />
        {!bannerUrl && (
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
        )}
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07070d]/50 via-transparent to-[#07070d]/30" />
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />

      {/* Live Badge */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 z-20"
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

      {/* Premium badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-4 right-4 z-20"
      >
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-2xl rounded-full px-3 py-1.5 border border-amber-500/20">
          <Sparkles size={10} className="text-amber-400" />
          <span className="text-[9px] font-semibold text-amber-400/80 uppercase tracking-wider">Premium</span>
        </div>
      </motion.div>

      {/* Upload overlay */}
      {isOwnProfile && onBannerUpload && (
        <AnimatePresence>
          {(bannerHover || uploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/20 text-white text-sm font-medium hover:bg-white/25 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                {uploading ? 'Uploading...' : 'Change Cover'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file || !onBannerUpload) return;
        setUploading(true);
        try { await onBannerUpload(file); } finally { setUploading(false); if (bannerInputRef.current) bannerInputRef.current.value = ''; }
      }} />
    </div>
  );
}

// ============================================================
// FLOATING PROFILE AVATAR
// ============================================================

function FloatingProfileAvatar({
  avatarUrl, username, isOwnProfile, isLive, isVerified, isGoldVerified, level, onAvatarUpload,
}: {
  avatarUrl?: string; username?: string; isOwnProfile: boolean; isLive: boolean;
  isVerified: boolean; isGoldVerified: boolean; level: number; onAvatarUpload?: (file: File) => Promise<void>;
}) {
  const [avatarHover, setAvatarHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className="relative shrink-0"
      onMouseEnter={() => setAvatarHover(true)}
      onMouseLeave={() => setAvatarHover(false)}
      initial={{ scale: 0.6, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <motion.div
        className="absolute -inset-4 rounded-full pointer-events-none"
        animate={isLive ? { opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] } : avatarHover ? { opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] } : { opacity: 0.2, scale: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: isGoldVerified ? 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,0,127,0.3) 0%, rgba(124,58,237,0.3) 50%, rgba(0,216,255,0.3) 100%)' }}
      />
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border-[3px] border-[#07070d] overflow-hidden shadow-2xl shadow-black/50">
        <img
          src={avatarUrl || '/branding/sparklive-logo.png'}
          alt={username || 'User'}
          className="w-full h-full object-cover"
        />
        <motion.span
          className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-[2.5px] border-[#07070d] shadow-lg shadow-emerald-500/40"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {isVerified && (
          <motion.div
            className={cn(
              'absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-[2.5px] border-[#07070d]',
              isGoldVerified ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/40' : 'bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] shadow-cyan-500/40'
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
          >
            {isGoldVerified ? <Crown size={12} className="text-white" strokeWidth={2.5} /> : <Check size={14} className="text-white" strokeWidth={3} />}
          </motion.div>
        )}
        {level > 0 && (
          <motion.div
            className="absolute -bottom-1 -left-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-bold text-white shadow-lg shadow-amber-500/30 border border-amber-300/20"
            initial={{ y: 10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            Lvl {level}
          </motion.div>
        )}
        {isLive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-bold text-white tracking-[0.1em] shadow-lg shadow-red-500/40"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            LIVE
          </motion.div>
        )}
      </div>
      {isOwnProfile && onAvatarUpload && (
        <AnimatePresence>
          {(avatarHover || uploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center cursor-pointer border-[3px] border-[#07070d] z-10"
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file || !onAvatarUpload) return;
        setUploading(true);
        try { await onAvatarUpload(file); } finally { setUploading(false); if (avatarInputRef.current) avatarInputRef.current.value = ''; }
      }} />
    </motion.div>
  );
}

// ============================================================
// CREATOR SUMMARY
// ============================================================

function CreatorSummary({
  fullName, username, bio, creatorCategory, isLive, isVerified, isGoldVerified,
  level, city, country, website, occupation, languages, pronouns, createdAt, creatorScore,
}: {
  fullName?: string; username?: string; bio?: string; creatorCategory?: string;
  isLive: boolean; isVerified: boolean; isGoldVerified: boolean; level: number;
  city?: string; country?: string; website?: string; occupation?: string;
  languages?: string[]; pronouns?: string; createdAt?: string; creatorScore?: number;
}) {
  const [showFullBio, setShowFullBio] = useState(false);
  const categoryIcon = creatorCategory ? getCategoryIcon(creatorCategory) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
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
                {isGoldVerified ? <Crown size={11} className="text-white" strokeWidth={2.5} /> : <Star size={11} className="text-white" fill="white" />}
              </motion.span>
            )}
            <motion.div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Crown size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400">Lvl {level}</span>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
        </div>
      </div>

      {/* Score + Status */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {creatorScore !== undefined && creatorScore > 0 && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/15"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Sparkles size={14} className="text-[#ff007f]" />
            <span className="text-xs font-semibold text-white/80">Creator Score <span className="text-[#ff007f]">{creatorScore}</span></span>
          </motion.div>
        )}
        {isLive && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.span className="w-2 h-2 rounded-full bg-red-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">LIVE</span>
          </motion.div>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-3"
        >
          <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
            {bio.length > 150 && !showFullBio ? `${bio.slice(0, 150)}...` : bio}
            {bio.length > 150 && (
              <button onClick={() => setShowFullBio(!showFullBio)} className="ml-1 text-[#00d8ff] hover:text-[#06f7ff] text-xs font-medium transition-colors">
                {showFullBio ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        </motion.div>
      )}

      {/* Meta */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3"
      >
        {website && (
          <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#00d8ff] hover:text-[#06f7ff] transition-colors group">
            <LinkIcon size={13} className="group-hover:rotate-12 transition-transform" />
            {website.replace(/^https?:\/\//, '')}
          </a>
        )}
        {city && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <MapPin size={13} />
            {city}{country ? `, ${country}` : ''}
          </span>
        )}
        {createdAt && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <Calendar size={13} />
            Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        )}
        {occupation && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <Shield size={13} />
            {occupation}
          </span>
        )}
        {languages && languages.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <Globe size={13} />
            {languages.join(', ')}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// ACTION BUTTONS
// ============================================================

function ActionButtons({
  isOwnProfile, isLive, isFollowing, onFollow, onMessage, onSendSparkCoin,
  onShare, onEditProfile, onGoLive, onViewWallet, onViewAnalytics, onViewStudio,
}: {
  isOwnProfile: boolean; isLive: boolean; isFollowing: boolean;
  onFollow?: () => void; onMessage?: () => void; onSendSparkCoin?: () => void;
  onShare?: () => void; onEditProfile?: () => void; onGoLive?: () => void;
  onViewWallet?: () => void; onViewAnalytics?: () => void; onViewStudio?: () => void;
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (isOwnProfile) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onEditProfile}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all shadow-lg">
          <Edit3 size={15} /> Edit Profile
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onViewStudio}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all">
          <PenSquare size={15} /> Studio
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onViewWallet}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all">
          <Wallet size={15} /> Wallet
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onViewAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all">
          <BarChart3 size={15} /> Analytics
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onGoLive}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold hover:shadow-xl hover:shadow-pink-500/25 transition-all">
          <Radio size={15} /> {isLive ? 'Manage Stream' : 'Go Live'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onShare}
          className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all" aria-label="Share">
          <Share2 size={16} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mt-4">
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onFollow}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${isFollowing ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15' : 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white hover:shadow-xl hover:shadow-pink-500/25'}`}>
        {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
        {isFollowing ? 'Following' : 'Follow'}
      </motion.button>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onMessage}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all">
        <MessageCircle size={15} /> Message
      </motion.button>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSendSparkCoin}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all">
        <Gift size={15} /> <span className="hidden sm:inline">Send Spark</span> <Sparkles size={12} className="text-amber-400" />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onShare}
        className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all" aria-label="Share">
        <Share2 size={16} />
      </motion.button>
      <div className="relative">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all" aria-label="More options">
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
                { label: 'Copy Profile Link', icon: Copy },
                { label: 'Share via...', icon: ExternalLink },
                { label: 'QR Code', icon: QrCode },
                { label: 'Report', icon: Flag },
              ].map(({ label, icon: Icon }) => (
                <button key={label} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
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
// CREATOR STATISTICS
// ============================================================

function AnimatedStatValue({ value }: { value: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(0, value, {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <p ref={ref} className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
      {displayValue > 0 ? formatNumber(displayValue) : '0'}
    </p>
  );
}

function CreatorStatistics({
  followers, following, posts, likes, views, streams, gifts,
  onFollowersClick, onFollowingClick,
}: {
  followers: number; following: number; posts: number; likes: number;
  views: number; streams: number; gifts: number;
  onFollowersClick?: () => void; onFollowingClick?: () => void;
}) {
  const stats = [
    { value: followers, label: 'Followers', color: 'pink', onClick: onFollowersClick },
    { value: following, label: 'Following', color: 'purple', onClick: onFollowingClick },
    { value: posts, label: 'Posts', color: 'blue' },
    { value: likes, label: 'Likes', color: 'amber' },
    { value: views, label: 'Views', color: 'cyan' },
    { value: streams, label: 'Streams', color: 'emerald' },
    { value: gifts, label: 'Gifts', color: 'amber' },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    pink: { bg: 'bg-[#ff007f]/5', border: 'border-[#ff007f]/15', text: 'text-[#ff007f]', iconBg: 'bg-[#ff007f]/10' },
    purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/15', text: 'text-purple-400', iconBg: 'bg-purple-500/10' },
    cyan: { bg: 'bg-[#00d8ff]/5', border: 'border-[#00d8ff]/15', text: 'text-[#00d8ff]', iconBg: 'bg-[#00d8ff]/10' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/15', text: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/15', text: 'text-amber-400', iconBg: 'bg-amber-500/10' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/15', text: 'text-blue-400', iconBg: 'bg-blue-500/10' },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {stats.map((stat, i) => {
        const c = colorMap[stat.color] || colorMap.pink;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={stat.onClick}
            className={cn(
              'group relative rounded-2xl border p-4 sm:p-5 overflow-hidden transition-all duration-300',
              c.bg, c.border,
              stat.onClick ? 'cursor-pointer' : ''
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative z-10">
              <AnimatedStatValue value={stat.value} />
              <p className="text-[11px] sm:text-xs text-white/40 font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================
// CREATOR SCORE CARD
// ============================================================

function CreatorScoreCard({ score }: { score: CreatorScore }) {
  const progressPercent = (score.xp / score.xpToNext) * 100;

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

      {/* XP Progress Bar */}
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

      {/* Score Components */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.entries(score.components).map(([key, value]) => (
          <div key={key} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <p className="text-xs font-bold text-white">{value}</p>
            <p className="text-[9px] text-white/30 capitalize mt-0.5">{key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ACHIEVEMENT BADGES
// ============================================================

function AchievementBadges({ achievements }: { achievements: Achievement[] }) {
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

// ============================================================
// ANALYTICS DASHBOARD (OWNER ONLY)
// ============================================================

function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
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
          View Full Analytics →
        </motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', metric.bg)}>
                    <Icon size={14} className={metric.color} />
                  </div>
                </div>
                <p className="text-xl font-bold text-white tabular-nums">
                  {formatNumber(metric.value)}{metric.suffix || ''}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-white/40">{metric.label}</span>
                  {metric.change !== undefined && metric.change !== 0 && (
                    <span className={cn('flex items-center gap-0.5 text-[9px]', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                      {isPositive ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
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

// ============================================================
// WALLET PREVIEW (OWNER ONLY)
// ============================================================

function WalletPreviewCard({ data }: { data: WalletPreview }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-amber-400" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Wallet</h3>
        </div>
        <motion.button whileHover={{ x: 3 }} className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium">
          Open Full Wallet →
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
// FEATURED CONTENT
// ============================================================

function FeaturedContent({ items }: { items: any[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <Star size={14} className="text-amber-400" />
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Featured Content</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 3).map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.05] transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                <PinIcon size={16} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/70 line-clamp-2">{item.content || 'No content'}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                    <Heart size={10} /> {item.likes || 0}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                    <MessageCircle size={10} /> {item.comments || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PinIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
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
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-200 outline-none whitespace-nowrap"
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
// POSTS TAB
// ============================================================

function PostsTab({
  posts, loading, hasMore, onLoadMore,
}: {
  posts: any[]; loading: boolean; hasMore: boolean; onLoadMore: () => void;
}) {
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
          className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl hover:bg-white/[0.03] transition-colors group"
        >
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
              <p className="text-sm text-white/70 line-clamp-2">{post.content || 'No content'}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-white/30">
                  <Heart size={10} /> {post.likes?.length || post.likes || 0}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/30">
                  <MessageCircle size={10} /> {post.comments?.length || post.comments || 0}
                </span>
                {post.createdAt && (
                  <span className="text-[10px] text-white/20">{formatTimeAgo(post.createdAt)}</span>
                )}
              </div>
            </div>
          </div>
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
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading...
              </span>
            ) : 'Load More'}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// REELS TAB
// ============================================================

function ReelsTab({ reels }: { reels: any[] }) {
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
            <div className="w-full h-full flex items-center justify-center">
              <Play size={24} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs text-white/80 font-medium truncate">{reel.title || 'Untitled'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[9px] text-white/50">
                <Heart size={8} /> {formatNumber(reel.likes || 0)}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-white/50">
                <Eye size={8} /> {formatNumber(reel.views || 0)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// LIVE TAB
// ============================================================

function LiveTab({
  currentStream, streams,
}: {
  currentStream?: any; streams: any[];
}) {
  const activeStreams = streams.filter((s: any) => s.status === 'LIVE' || s.active);
  const pastStreams = streams.filter((s: any) => s.status === 'ENDED' || !s.active);
  const upcomingStreams = streams.filter((s: any) => s.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      {/* Current Live */}
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

      {/* Upcoming Streams */}
      {upcomingStreams.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Upcoming Streams</h4>
          <div className="space-y-2">
            {upcomingStreams.map((stream: any, i: number) => (
              <div key={stream.id || i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-sm text-white/70 font-medium">{stream.title}</p>
                <p className="text-[10px] text-white/30 mt-1">
                  {stream.scheduledFor ? new Date(stream.scheduledFor).toLocaleDateString() : 'Date TBD'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Streams */}
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

// ============================================================
// MEDIA TAB
// ============================================================

function MediaTab({ media, isOwnProfile }: { media: any[]; isOwnProfile: boolean }) {
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
              {item.duration && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white/80">
                  {item.duration}
                </div>
              )}
            </>
          ) : (
            <img src={item.url} alt={item.title || 'Photo'} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] text-white/70">
                <Heart size={8} /> {item.likes || 0}
              </span>
              {item.views && (
                <span className="flex items-center gap-1 text-[9px] text-white/70">
                  <Eye size={8} /> {formatNumber(item.views)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// ABOUT TAB
// ============================================================

function AboutTab({ profile }: { profile: CreatorProfile }) {
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
      {/* Bio */}
      {profile.bio && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-2">Bio</h4>
          <p className="text-sm text-white/70 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Details */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.creatorCategory && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>{getCategoryIcon(profile.creatorCategory)}</span>
              <span>{profile.creatorCategory}</span>
            </div>
          )}
          {profile.occupation && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <BriefcaseIcon size={14} className="text-white/30" />
              <span>{profile.occupation}</span>
            </div>
          )}
          {profile.country && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Globe size={14} className="text-white/30" />
              <span>{profile.country}{profile.city ? `, ${profile.city}` : ''}</span>
            </div>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MessageCircle size={14} className="text-white/30" />
              <span>{profile.languages.join(', ')}</span>
            </div>
          )}
          {profile.pronouns && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="text-white/30">⚧</span>
              <span>{profile.pronouns}</span>
            </div>
          )}
          {profile.businessEmail && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MailIcon size={14} className="text-white/30" />
              <span>{profile.businessEmail}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar size={14} className="text-white/30" />
            <span>Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Social Links */}
      {profile.socialLinks && profile.socialLinks.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 backdrop-blur-xl">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">Social Links</h4>
          <div className="flex flex-wrap gap-2">
            {profile.socialLinks.map((link: any, i: number) => {
              const platform = socialPlatforms[link.platform?.toLowerCase()] || { icon: Globe, color: 'text-white/40' };
              const Icon = platform.icon;
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  <Icon size={14} className={platform.color} />
                  {link.platform}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
// ACHIEVEMENTS TAB
// ============================================================

function AchievementsTab({ achievements }: { achievements: Achievement[] }) {
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
              isUnlocked
                ? cn('bg-gradient-to-br', rarityColors[rarity].replace('from-', 'from-').replace('to-', 'to-') + '/10', 'border-white/[0.08]')
                : 'bg-white/[0.02] border-white/[0.05] opacity-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isUnlocked ? cn('bg-gradient-to-br', rarityColors[rarity]) : 'bg-white/[0.04]'
              )}>
                <Icon size={18} className={isUnlocked ? 'text-white' : 'text-white/20'} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{achievement.title}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{achievement.description}</p>
                <span className={cn(
                  'text-[8px] font-semibold uppercase tracking-wider mt-1 inline-block',
                  isUnlocked ? 'text-white/30' : 'text-white/20'
                )}>
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

// ============================================================
// BOOKMARKS TAB (OWNER ONLY)
// ============================================================

function BookmarksTab() {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
      <BookmarkIcon size={32} className="mx-auto text-white/20 mb-3" />
      <p className="text-white/40 text-sm font-medium">No bookmarks yet</p>
      <p className="text-white/20 text-xs mt-1">Save posts to view them later</p>
    </div>
  );
}

// ============================================================
// MODALS
// ============================================================

function EditProfileModal({ open, onClose, onProfileUpdated }: { open: boolean; onClose: () => void; onProfileUpdated: (profile: any) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl bg-[#0e0e16] border border-white/[0.08] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-white/40 text-center py-8">Edit profile modal - coming soon</p>
      </motion.div>
    </div>
  );
}

function GoLiveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl bg-[#0e0e16] border border-white/[0.08] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Go Live</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-white/40 text-center py-8">Go live modal - coming soon</p>
      </motion.div>
    </div>
  );
}

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
                <img src={f.avatar || f.avatarUrl || '/branding/sparklive-logo.png'} alt={f.username} className="w-10 h-10 rounded-full object-cover" />
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