'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';
import {
  Sparkles, Zap, Trophy, Crown, Activity, Target, TrendingUp, Eye,
  Radio, Users, Award, Star, Flame, Gift, Heart, MessageCircle,
  Clock, Calendar, Shield, MapPin, Link as LinkIcon, Share2,
  Edit3, Camera, Check, X, MoreHorizontal, ChevronDown, ChevronRight,
  Play, Grid3X3, List, Video, Film, Image, Bookmark, Repeat2,
  Music, Gamepad2, Palette, BookOpen, Monitor, Smartphone,
  DollarSign, BarChart3, Rocket, Infinity, Globe, Disc3, Waves,
  PenSquare, Wallet, TrendingUp as TrendingIcon, Search, Filter,
  Plus, Hash, Bot, Code, Headphones, Mic, Settings, LogOut
} from 'lucide-react';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileFeed from '@/components/profile/ProfileFeed';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PremiumGoLiveModal from '@/components/profile/PremiumGoLiveModal';
import FloatingGoLiveButton from '@/components/profile/FloatingGoLiveButton';
import ProfileQuickActions from '@/components/profile/ProfileQuickActions';
import ProfileBadgesShowcase from '@/components/profile/ProfileBadgesShowcase';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileCreatorStats from '@/components/profile/ProfileCreatorStats';
import ProfileMediaGallery from '@/components/profile/ProfileMediaGallery';
import { uploadAvatar as uploadAvatarService, uploadBanner as uploadBannerService, validateUploadFile } from '@/lib/uploadService';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLive, setIsLive] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [showAllSections, setShowAllSections] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [stats, setStats] = useState({
    posts: 0, streams: 0, shorts: 0, followers: 0, following: 0,
    likes: 0, gifts: 0, views: 0, streamHours: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [media, setMedia] = useState<any[]>([]);

  const [sidebarData, setSidebarData] = useState({
    liveNow: null as any, community: null as any,
    badges: [] as any[], achievements: [] as any[],
    creatorRank: null as any, recentActivity: [] as any[],
    upcomingStreams: [] as any[], topDonors: [] as any[],
  });

  const [metrics, setMetrics] = useState({
    totalViews: 0, totalWatchTime: '0h', engagement: 0, rank: 0,
    sparkScore: 0, influence: 0, growth: 0,
  });

  const [creatorStats, setCreatorStats] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  // Trigger page loaded animation
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Futuristic particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number }> = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.2 + 0.05,
        hue: Math.random() * 60 + 280, // purple-pink range
      });
    }

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha * glowIntensity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            const avgHue = (a.hue + b.hue) / 2;
            ctx.strokeStyle = `hsla(${avgHue}, 100%, 60%, ${(1 - dist / 120) * 0.1 * glowIntensity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animFrame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [glowIntensity]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me', token);
      const profileData = data?.profile ?? data?.data ?? data;
      setProfile(profileData);

      setStats({
        posts: profileData.postsCount ?? profileData.posts_count ?? 0,
        streams: profileData.streamsCount ?? profileData.streams_count ?? 0,
        shorts: profileData.shortsCount ?? profileData.shorts_count ?? 0,
        followers: profileData.followersCount ?? profileData.followers_count ?? 0,
        following: profileData.followingCount ?? profileData.following_count ?? 0,
        likes: profileData.likesReceived ?? profileData.likes_received ?? 0,
        gifts: profileData.giftsReceived ?? profileData.gifts_received ?? 0,
        views: profileData.totalViews ?? profileData.total_views ?? 0,
        streamHours: profileData.totalStreamHours ?? profileData.total_stream_hours ?? 0,
      });

      setMetrics({
        totalViews: profileData.totalViews ?? profileData.total_views ?? 0,
        totalWatchTime: profileData.totalWatchTime ?? profileData.total_watch_time ?? '0h',
        engagement: profileData.engagement ?? 0,
        rank: profileData.rank ?? 0,
        sparkScore: profileData.sparkScore ?? Math.floor(Math.random() * 1000) + 500,
        influence: profileData.influence ?? profileData.influence_score ?? Math.floor(Math.random() * 100),
        growth: profileData.growth ?? profileData.growth_rate ?? Math.floor(Math.random() * 50) + 5,
      });

      setCreatorStats({
        profileVisits: profileData.totalViews ?? 0,
        followerGrowth: profileData.followersCount ?? 0,
        engagementRate: profileData.engagement ?? 0,
        postImpressions: profileData.postImpressions ?? profileData.totalViews ?? 0,
        liveViewers: profileData.currentStream?.viewerCount ?? 0,
        giftRevenue: profileData.giftRevenue ?? 0,
        watchTime: profileData.totalWatchTime ?? '0h',
        totalStreams: profileData.streamsCount ?? 0,
        totalPosts: profileData.postsCount ?? 0,
        totalShorts: profileData.shortsCount ?? 0,
        avgWatchTime: profileData.avgWatchTime ?? '0m',
        peakViewers: profileData.peakViewers ?? 0,
        totalGifts: profileData.giftsReceived ?? 0,
        sparksReceived: profileData.sparksReceived ?? 0,
      });

      setWalletInfo({
        balance: profileData.walletBalance ?? 0,
        earnings: profileData.creatorEarnings ?? 0,
      });

      setSidebarData({
        liveNow: profileData.currentStream ? {
          title: profileData.currentStream.title,
          viewerCount: profileData.currentStream.viewerCount ?? 0,
          thumbnail: profileData.currentStream.thumbnail,
          streamer: { name: profileData.fullName || profileData.username, username: profileData.username, avatar: profileData.avatarUrl },
        } : null,
        community: profileData.community ? {
          name: profileData.community.name, members: profileData.community.members ?? 0, online: profileData.community.online ?? 0,
        } : null,
        badges: profileData.badges ?? [],
        achievements: profileData.achievements ?? [],
        creatorRank: profileData.creatorRank ? {
          rank: profileData.creatorRank.rank, total: profileData.creatorRank.total,
          score: profileData.creatorRank.score, level: profileData.creatorRank.level,
        } : null,
        recentActivity: profileData.recentActivity ?? profileData.recent_activity ?? [],
        upcomingStreams: profileData.upcomingStreams ?? profileData.upcoming_streams ?? [],
        topDonors: profileData.topDonors ?? profileData.top_donors ?? [],
      });

      setIsLive(!!profileData.currentStream);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setFeedLoading(true);
    try {
      const data = await apiGet<any>('/api/posts/user/me', token);
      const postsData = data?.posts ?? data?.data ?? data ?? [];
      setPosts(Array.isArray(postsData) ? postsData : []);
      setHasMoreFeed(false);

      // Extract media from posts
      const extractedMedia = (Array.isArray(postsData) ? postsData : []).flatMap((post: any) => {
        const mediaItems: any[] = [];
        if (post.images) {
          post.images.forEach((img: string, i: number) => {
            mediaItems.push({
              id: `${post.id}-img-${i}`,
              type: 'image',
              url: img,
              thumbnail: img,
              title: post.content?.slice(0, 50),
              likes: post.likes,
              comments: post.comments,
              createdAt: post.createdAt,
            });
          });
        }
        if (post.video) {
          mediaItems.push({
            id: `${post.id}-video`,
            type: 'video',
            url: post.video,
            thumbnail: post.thumbnail || post.video,
            title: post.content?.slice(0, 50),
            duration: post.duration,
            likes: post.likes,
            comments: post.comments,
            views: post.views,
            createdAt: post.createdAt,
          });
        }
        return mediaItems;
      });
      setMedia(extractedMedia);
    } catch {
      setPosts([]);
      setMedia([]);
    } finally {
      setFeedLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProfile(); fetchPosts(); }, [fetchProfile, fetchPosts]);

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

  const handleProfileUpdated = (updatedProfile: any) => {
    setProfile(updatedProfile);
    showToast?.({ type: 'success', title: 'Saved', message: 'Profile updated successfully' });
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({ title: `${profile?.fullName || profile?.username} on SparkLive`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast?.({ type: 'success', title: 'Link copied', message: 'Profile link copied to clipboard' });
    }
  };

  // Staggered page entrance animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  if (loading) {
    return (
      <div ref={containerRef} className="max-w-7xl mx-auto relative min-h-screen">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-30" />
        <div className="relative z-10 px-4 sm:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Banner skeleton */}
            <div className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 rounded-3xl bg-gradient-to-br from-[#1a1a28] to-[#0e0e16] border border-white/[0.04] overflow-hidden">
              <div className="w-full h-full animate-pulse" style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }} />
            </div>

            {/* Profile info skeleton */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 -mt-16 sm:-mt-20 relative px-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-[#07070d] skeleton shrink-0" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-4 w-full max-w-md" />
                <div className="flex gap-4">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-3 w-28" />
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-12 rounded-2xl" />
                <div className="skeleton h-40 rounded-2xl" />
                <div className="skeleton h-40 rounded-2xl" />
                <div className="skeleton h-40 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <div className="skeleton h-48 rounded-2xl" />
                <div className="skeleton h-32 rounded-2xl" />
                <div className="skeleton h-40 rounded-2xl" />
              </div>
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-xl shadow-red-500/10"
        >
          <X size={28} className="text-red-400" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-white/60 mb-2"
        >
          Failed to load profile
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-white/30 mb-8 max-w-md text-center"
        >
          {error}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255,0,127,0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchProfile}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold shadow-lg shadow-[#ff007f]/20"
        >
          <span className="flex items-center gap-2">
            <RotateCw size={14} />
            Try Again
          </span>
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {/* Particle Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      <motion.div
        ref={containerRef}
        variants={pageVariants}
        initial="hidden"
        animate={pageLoaded ? "visible" : "hidden"}
        className="max-w-7xl mx-auto relative z-10 pb-24"
      >
        {/* Hero Section */}
        <motion.div variants={sectionVariants}>
          <div className="px-4 sm:px-6 pt-4 sm:pt-6">
            <ProfileHero
              profile={profile}
              isOwnProfile={true}
              isLive={isLive}
              onEditProfile={() => setEditModalOpen(true)}
              onShareProfile={handleShareProfile}
              onAvatarUpload={handleAvatarUpload}
              onBannerUpload={handleBannerUpload}
            />
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={sectionVariants} className="mt-6 px-4 sm:px-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
            <ProfileStats stats={stats} />
          </div>
        </motion.div>

        {/* Premium Metrics Grid */}
        <motion.div variants={sectionVariants} className="mt-4 px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <MetricCard icon={<Eye size={14} />} value={metrics.totalViews.toLocaleString()} label="Views" color="cyan" />
            <MetricCard icon={<Activity size={14} />} value={metrics.totalWatchTime} label="Watch Time" color="emerald" />
            <MetricCard icon={<Target size={14} />} value={`${metrics.engagement}%`} label="Engagement" color="amber" />
            <MetricCard icon={<TrendingUp size={14} />} value={`#${metrics.rank.toLocaleString()}`} label="Rank" color="pink" />
            <MetricCard icon={<Rocket size={14} />} value={metrics.sparkScore.toLocaleString()} label="Spark Score" color="purple" />
            <MetricCard icon={<Globe size={14} />} value={`${metrics.influence}%`} label="Influence" color="blue" />
            <MetricCard icon={<TrendingUp size={14} />} value={`+${metrics.growth}%`} label="Growth" color="green" />
          </div>
        </motion.div>

        {/* Quick Actions Cards */}
        <motion.div variants={sectionVariants} className="mt-6 px-4 sm:px-6">
          <ProfileQuickActions
            isLive={isLive}
            liveViewers={profile?.currentStream?.viewerCount}
            upcomingStream={sidebarData.upcomingStreams?.[0] ? {
              title: sidebarData.upcomingStreams[0].title,
              date: sidebarData.upcomingStreams[0].date,
            } : null}
            walletBalance={walletInfo?.balance}
            creatorEarnings={walletInfo?.earnings}
            draftPosts={profile?.draftPosts ?? 0}
            analytics={creatorStats ? {
              views: creatorStats.profileVisits,
              followers: creatorStats.followerGrowth,
              engagement: creatorStats.engagementRate,
            } : null}
            badges={sidebarData.badges}
            onGoLive={() => setGoLiveModalOpen(true)}
            onViewAnalytics={() => {}}
            onViewWallet={() => {}}
            onViewStudio={() => {}}
            onViewBadges={() => {}}
          />
        </motion.div>

        {/* Extended Profile Sections (Togglable) */}
        <AnimatePresence>
          {showAllSections && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 space-y-6 mt-6">
                {/* Creator Analytics */}
                <motion.div variants={sectionVariants}>
                  <ProfileCreatorStats stats={creatorStats} />
                </motion.div>

                {/* Badges Showcase */}
                {sidebarData.badges && sidebarData.badges.length > 0 && (
                  <motion.div variants={sectionVariants}>
                    <ProfileBadgesShowcase badges={sidebarData.badges} />
                  </motion.div>
                )}

                {/* Achievements */}
                {sidebarData.achievements && sidebarData.achievements.length > 0 && (
                  <motion.div variants={sectionVariants}>
                    <ProfileAchievements achievements={sidebarData.achievements} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle extended sections */}
        {sidebarData.badges?.length > 0 || sidebarData.achievements?.length > 0 || creatorStats ? (
          <motion.div variants={sectionVariants} className="flex justify-center mt-4 px-4 sm:px-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllSections(!showAllSections)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <span>{showAllSections ? 'Hide' : 'Show'} extended profile</span>
              <motion.div
                animate={{ rotate: showAllSections ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </motion.button>
          </motion.div>
        ) : null}

        {/* Divider */}
        <motion.div variants={sectionVariants} className="my-6 px-4 sm:px-6">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </motion.div>

        {/* Main Content + Sidebar */}
        <div className="px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <motion.div variants={sectionVariants}>
                <ProfileTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  counts={{ posts: stats.posts, streams: stats.streams, shorts: stats.shorts, media: media.length, likes: stats.likes }}
                />
              </motion.div>

              {/* Tab Content */}
              <motion.div
                key={`${activeTab}-${viewMode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'media' ? (
                  <ProfileMediaGallery
                    media={media}
                    loading={feedLoading}
                    hasMore={hasMoreFeed}
                    onLoadMore={fetchPosts}
                  />
                ) : (
                  <ProfileFeed
                    posts={posts}
                    activeTab={activeTab}
                    loading={feedLoading}
                    hasMore={hasMoreFeed}
                    onLoadMore={fetchPosts}
                    viewMode={viewMode}
                  />
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <motion.div variants={sectionVariants}>
                  <ProfileSidebar
                    liveNow={sidebarData.liveNow}
                    community={sidebarData.community}
                    badges={sidebarData.badges}
                    achievements={sidebarData.achievements}
                    creatorRank={sidebarData.creatorRank}
                    recentActivity={sidebarData.recentActivity}
                    upcomingStreams={sidebarData.upcomingStreams}
                    topDonors={sidebarData.topDonors}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals & Floating Actions */}
      <FloatingGoLiveButton onClick={() => setGoLiveModalOpen(true)} />
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
      <PremiumGoLiveModal
        open={goLiveModalOpen}
        onClose={() => setGoLiveModalOpen(false)}
      />
    </>
  );
}

// Holographic metric card component
function MetricCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan: { bg: 'bg-[#00d8ff]/5', border: 'border-[#00d8ff]/15', text: 'text-[#00d8ff]', glow: 'shadow-[#00d8ff]/10' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/15', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/15', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
    pink: { bg: 'bg-[#ff007f]/5', border: 'border-[#ff007f]/15', text: 'text-[#ff007f]', glow: 'shadow-[#ff007f]/10' },
    purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/15', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/15', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
    green: { bg: 'bg-green-500/5', border: 'border-green-500/15', text: 'text-green-400', glow: 'shadow-green-500/10' },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={`rounded-2xl ${c.bg} ${c.border} border p-3 flex items-center gap-3 relative overflow-hidden group transition-all duration-300 ${c.glow} shadow-sm hover:shadow-md`}
    >
      {/* Holographic shimmer */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${color === 'pink' ? 'rgba(255,0,127,0.03)' : 'rgba(0,216,255,0.03)'} 50%, transparent 100%)`,
        }}
      />
      <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-white tracking-tight">{value}</p>
        <p className="text-[9px] text-white/40">{label}</p>
      </div>
    </motion.div>
  );
}

// Loading spinner for retry button
function RotateCw({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}