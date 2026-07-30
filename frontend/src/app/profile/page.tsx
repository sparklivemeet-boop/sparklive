'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';
import {
  Sparkles, Zap, Trophy, Crown, Activity, Target, TrendingUp, Eye,
  Radio, Users, Award, Flame, Gift, Heart, MessageCircle,
  Clock, Calendar, Shield, MapPin, Link as LinkIcon, Share2,
  Edit3, Check, X, MoreHorizontal, ChevronDown, ChevronRight,
  Play, Grid3X3, List, Video, Film, Bookmark, Repeat2,
  Music, Gamepad2, BookOpen, Monitor, Smartphone,
  DollarSign, BarChart3, Rocket, Infinity, Globe, Disc3, Waves,
  PenSquare, Wallet, Search, Filter,
  Plus, Hash, Bot, Code, Headphones, Mic, Settings, LogOut,
  Github, Twitter, Instagram, Youtube, Linkedin, Facebook,
  Music2, Gamepad, Book, Code2, Atom,
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLive, setIsLive] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [stats, setStats] = useState({
    posts: 0, streams: 0, shorts: 0, followers: 0, following: 0,
    likes: 0, gifts: 0, views: 0, streamHours: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [media, setMedia] = useState<any[]>([]);
  const [sparkScore, setSparkScore] = useState(0);

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

  // Track mouse for parallax effects
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

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me', token);
      const profileData = data?.profile ?? data?.data ?? data;
      setProfile(profileData);

      const postsCount = profileData.postsCount ?? profileData.posts_count ?? 0;
      const streamsCount = profileData.streamsCount ?? profileData.streams_count ?? 0;
      const followersCount = profileData.followersCount ?? profileData.followers_count ?? 0;
      const followingCount = profileData.followingCount ?? profileData.following_count ?? 0;
      const totalViews = profileData.totalViews ?? profileData.total_views ?? 0;

      setStats({
        posts: postsCount,
        streams: streamsCount,
        shorts: profileData.shortsCount ?? profileData.shorts_count ?? 0,
        followers: followersCount,
        following: followingCount,
        likes: profileData.likesReceived ?? profileData.likes_received ?? 0,
        gifts: profileData.giftsReceived ?? profileData.gifts_received ?? 0,
        views: totalViews,
        streamHours: profileData.totalStreamHours ?? profileData.total_stream_hours ?? 0,
      });

      const score = Math.floor(Math.random() * 1000) + 500;
      setSparkScore(score);

      setMetrics({
        totalViews,
        totalWatchTime: profileData.totalWatchTime ?? profileData.total_watch_time ?? '0h',
        engagement: profileData.engagement ?? 0,
        rank: profileData.rank ?? 0,
        sparkScore: score,
        influence: profileData.influence ?? profileData.influence_score ?? Math.floor(Math.random() * 100),
        growth: profileData.growth ?? profileData.growth_rate ?? Math.floor(Math.random() * 50) + 5,
      });

      setCreatorStats({
        profileVisits: totalViews,
        followerGrowth: followersCount,
        engagementRate: profileData.engagement ?? 0,
        postImpressions: profileData.postImpressions ?? totalViews,
        liveViewers: profileData.currentStream?.viewerCount ?? 0,
        giftRevenue: profileData.giftRevenue ?? 0,
        watchTime: profileData.totalWatchTime ?? '0h',
        totalStreams: streamsCount,
        totalPosts: postsCount,
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

  // Animation variants
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

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <div className="relative">
          {/* Animated logo */}
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
            <p className="text-white/40 text-sm">Loading your profile...</p>
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
          <motion.div
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl bg-red-500/5 blur-xl"
          />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-white/60 mb-2"
        >
          Couldn't load your profile
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

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={pageLoaded ? "visible" : "hidden"}
      className="relative min-h-screen pb-24"
    >
      {/* Ambient background gradient */}
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
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ===== HERO SECTION ===== */}
        <motion.div variants={fadeUpVariants} className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-white/[0.01] backdrop-blur-[1px]" />

            {/* Animated gradient border */}
            <div
              className="absolute inset-0 rounded-3xl opacity-[0.15]"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255,0,127,0.3), transparent, rgba(122,0,204,0.3), transparent)',
                animation: 'spin 8s linear infinite',
              }}
            />

            <div className="relative p-[1px] rounded-3xl">
              <div className="rounded-3xl bg-[#0a0a14]/80 backdrop-blur-xl overflow-hidden">
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
            </div>
          </div>
        </motion.div>

        {/* ===== STATS ROW ===== */}
        <motion.div variants={fadeUpVariants} className="mt-5 px-4 sm:px-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl">
            <ProfileStats stats={stats} />
          </div>
        </motion.div>

        {/* ===== METRICS GRID ===== */}
        <motion.div variants={fadeUpVariants} className="mt-4 px-4 sm:px-6">
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

        {/* ===== QUICK ACTIONS ===== */}
        <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
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

        {/* ===== MAIN CONTENT + SIDEBAR ===== */}
        <div className="px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <motion.div variants={fadeUpVariants}>
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
                <motion.div variants={fadeUpVariants}>
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
      </div>

      {/* Modals */}
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
    </motion.div>
  );
}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

function MetricCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan: { bg: 'bg-[#00d8ff]/5', border: 'border-[#00d8ff]/15', text: 'text-[#00d8ff]', glow: 'group-hover:shadow-[#00d8ff]/20' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/15', text: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/15', text: 'text-amber-400', glow: 'group-hover:shadow-amber-500/20' },
    pink: { bg: 'bg-[#ff007f]/5', border: 'border-[#ff007f]/15', text: 'text-[#ff007f]', glow: 'group-hover:shadow-[#ff007f]/20' },
    purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/15', text: 'text-purple-400', glow: 'group-hover:shadow-purple-500/20' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/15', text: 'text-blue-400', glow: 'group-hover:shadow-blue-500/20' },
    green: { bg: 'bg-green-500/5', border: 'border-green-500/15', text: 'text-green-400', glow: 'group-hover:shadow-green-500/20' },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={`group rounded-2xl ${c.bg} ${c.border} border p-3 flex items-center gap-3 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${c.glow}`}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-white tracking-tight truncate">{value}</p>
        <p className="text-[9px] text-white/40 truncate">{label}</p>
      </div>
    </motion.div>
  );
}