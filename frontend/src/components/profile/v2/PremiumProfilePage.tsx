'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, Trophy, Crown, Activity, Target, TrendingUp, Eye,
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
} from 'lucide-react';

// V2 Components
import PremiumCoverBanner from './PremiumCoverBanner';
import FloatingAvatar from './FloatingAvatar';
import CreatorHeroCard from './CreatorHeroCard';
import PremiumStats from './PremiumStats';
import PremiumActionButtons from './PremiumActionButtons';
import CreatorDashboardPreview from './CreatorDashboardPreview';
import PremiumAchievementBadges from './PremiumAchievementBadges';
import PremiumTabs from './PremiumTabs';
import CreatorHighlights from './CreatorHighlights';

// Keep existing modals and utilities
import EditProfileModal from '@/components/profile/EditProfileModal';
import PremiumGoLiveModal from '@/components/profile/PremiumGoLiveModal';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';
import { uploadAvatar as uploadAvatarService, uploadBanner as uploadBannerService, validateUploadFile } from '@/lib/uploadService';
import { cn } from '@/lib/utils';

export default function PremiumProfilePage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('posts');
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

      const score = profileData.sparkScore ?? Math.floor(Math.random() * 1000) + 500;
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
            <p className="text-white/40 text-sm">Loading premium profile...</p>
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
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-white/60 mb-2"
        >
          Couldn't load your profile
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

  const isGoldVerified = profile?.verified === 'gold' || profile?.verificationType === 'gold';

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
        <motion.div variants={fadeUpVariants} className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-white/[0.01] backdrop-blur-[1px]" />
            <div className="relative p-[1px] rounded-3xl">
              <div className="rounded-3xl bg-[#0a0a14]/80 backdrop-blur-xl overflow-hidden">
                <PremiumCoverBanner
                  bannerUrl={profile?.bannerUrl}
                  isOwnProfile={true}
                  isLive={isLive}
                  viewerCount={profile?.currentStream?.viewerCount}
                  onBannerUpload={handleBannerUpload}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== AVATAR + HERO INFO ===== */}
        <div className="relative px-4 sm:px-6 -mt-20 sm:-mt-24 md:-mt-28 lg:-mt-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            <FloatingAvatar
              avatarUrl={profile?.avatarUrl}
              username={profile?.username}
              isOwnProfile={true}
              isLive={isLive}
              isVerified={profile?.verified}
              isGoldVerified={isGoldVerified}
              level={profile?.creatorRank?.level || 1}
              onAvatarUpload={handleAvatarUpload}
            />

            <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-4">
              <CreatorHeroCard
                fullName={profile?.fullName}
                username={profile?.username}
                bio={profile?.bio}
                creatorCategory={profile?.creatorCategory}
                creatorScore={sparkScore}
                level={profile?.creatorRank?.level || 1}
                isLive={isLive}
                isVerified={profile?.verified}
                isGoldVerified={isGoldVerified}
                city={profile?.city}
                country={profile?.country}
                website={profile?.website}
                occupation={profile?.occupation}
                languages={profile?.languages}
                pronouns={profile?.pronouns}
                createdAt={profile?.createdAt}
                topPercent={profile?.topPercent || 0}
              />

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4"
              >
                <PremiumActionButtons
                  isOwnProfile={true}
                  isLive={isLive}
                  onShare={handleShareProfile}
                  onEditProfile={() => setEditModalOpen(true)}
                  onGoLive={() => setGoLiveModalOpen(true)}
                  onViewWallet={() => showToast?.({ type: 'info', title: 'Wallet', message: 'Wallet feature coming soon' })}
                  onViewAnalytics={() => showToast?.({ type: 'info', title: 'Analytics', message: 'Analytics feature coming soon' })}
                  onViewStudio={() => showToast?.({ type: 'info', title: 'Studio', message: 'Studio feature coming soon' })}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ===== STATS ROW ===== */}
        <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 backdrop-blur-xl">
            <PremiumStats
              followers={stats.followers}
              following={stats.following}
              likes={stats.likes}
              posts={stats.posts}
              streams={stats.streams}
              streamHours={stats.streamHours}
              gifts={stats.gifts}
              views={stats.views}
              followerGrowth={Math.floor(Math.random() * 500) + 10}
            />
          </div>
        </motion.div>

        {/* ===== CREATOR DASHBOARD ===== */}
        <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 backdrop-blur-xl">
            <CreatorDashboardPreview
              revenue={walletInfo?.earnings || 28400}
              followers={stats.followers}
              giftRevenue={stats.gifts || 12900}
              watchTime={metrics.totalWatchTime}
              views={metrics.totalViews}
              engagement={metrics.engagement}
            />
          </div>
        </motion.div>

        {/* ===== ACHIEVEMENTS ===== */}
        {sidebarData.badges.length > 0 || sidebarData.achievements.length > 0 ? (
          <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 backdrop-blur-xl">
              <PremiumAchievementBadges
                achievements={[...sidebarData.badges, ...sidebarData.achievements]}
              />
            </div>
          </motion.div>
        ) : null}

        {/* ===== CREATOR HIGHLIGHTS ===== */}
        <motion.div variants={fadeUpVariants} className="mt-6 px-4 sm:px-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 backdrop-blur-xl">
            <CreatorHighlights highlights={[]} />
          </div>
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

        {/* ===== TABS + CONTENT ===== */}
        <div className="px-4 sm:px-6">
          {/* Tabs */}
          <motion.div variants={fadeUpVariants}>
            <PremiumTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                posts: stats.posts,
                live: isLive ? 1 : 0,
                media: media.length,
                gifts: stats.gifts,
              }}
            />
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6"
          >
            {activeTab === 'about' ? (
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 backdrop-blur-xl text-center">
                <p className="text-white/40 text-sm">About section coming soon</p>
              </div>
            ) : activeTab === 'gifts' ? (
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 backdrop-blur-xl text-center">
                <Gift size={32} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">Gift history coming soon</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-12 backdrop-blur-xl text-center">
                    <Video size={32} className="mx-auto text-white/20 mb-3" />
                    <p className="text-white/40 text-sm font-medium">No {activeTab} yet</p>
                    <p className="text-white/20 text-xs mt-1">Your content will appear here</p>
                  </div>
                ) : (
                  posts.slice(0, 5).map((post: any, i: number) => (
                    <motion.div
                      key={post.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 flex items-center justify-center shrink-0">
                          {post.video ? (
                            <Play size={16} className="text-[#ff007f]" />
                          ) : post.images?.length ? (
                            <ImageIcon size={16} className="text-[#00d8ff]" />
                          ) : (
                            <MessageCircle size={16} className="text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/70 line-clamp-2">
                            {post.content || 'No content'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[10px] text-white/30">
                              <Heart size={10} />
                              {post.likes || 0}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-white/30">
                              <MessageCircle size={10} />
                              {post.comments || 0}
                            </span>
                            {post.createdAt && (
                              <span className="text-[10px] text-white/20">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modals */}
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