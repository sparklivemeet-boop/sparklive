'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileFeed from '@/components/profile/ProfileFeed';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PremiumGoLiveModal from '@/components/profile/PremiumGoLiveModal';
import FloatingGoLiveButton from '@/components/profile/FloatingGoLiveButton';
import { uploadAvatar as uploadAvatarService, uploadBanner as uploadBannerService, validateUploadFile } from '@/lib/uploadService';
import { Sparkles, Zap, Trophy, Crown, Activity, Target, TrendingUp, Eye } from 'lucide-react';

export default function ProfilePage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLive, setIsLive] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    posts: 0,
    streams: 0,
    shorts: 0,
    followers: 0,
    following: 0,
  });
  
  // Feed posts
  const [posts, setPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  // Sidebar data
  const [sidebarData, setSidebarData] = useState({
    liveNow: null as any,
    community: null as any,
    badges: [] as any[],
    achievements: [] as any[],
    creatorRank: null as any,
    recentActivity: [] as any[],
    upcomingStreams: [] as any[],
    topDonors: [] as any[],
  });

  // Additional profile metrics
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    totalWatchTime: '0h',
    engagement: 0,
    rank: 0,
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<any>('/api/profiles/me', token);
      const profileData = data?.profile ?? data?.data ?? data;
      setProfile(profileData);
      
      // Update stats from profile
      setStats({
        posts: profileData.postsCount ?? profileData.posts_count ?? 0,
        streams: profileData.streamsCount ?? profileData.streams_count ?? 0,
        shorts: profileData.shortsCount ?? profileData.shorts_count ?? 0,
        followers: profileData.followersCount ?? profileData.followers_count ?? 0,
        following: profileData.followingCount ?? profileData.following_count ?? 0,
      });

      // Metrics
      setMetrics({
        totalViews: profileData.totalViews ?? profileData.total_views ?? 0,
        totalWatchTime: profileData.totalWatchTime ?? profileData.total_watch_time ?? '0h',
        engagement: profileData.engagement ?? 0,
        rank: profileData.rank ?? 0,
      });

      // Sidebar data
      setSidebarData({
        liveNow: profileData.currentStream ? {
          title: profileData.currentStream.title,
          viewerCount: profileData.currentStream.viewerCount ?? 0,
          thumbnail: profileData.currentStream.thumbnail,
          streamer: {
            name: profileData.fullName || profileData.username,
            username: profileData.username,
            avatar: profileData.avatarUrl,
          },
        } : null,
        community: profileData.community ? {
          name: profileData.community.name,
          members: profileData.community.members ?? 0,
          online: profileData.community.online ?? 0,
        } : null,
        badges: profileData.badges ?? [],
        achievements: profileData.achievements ?? [],
        creatorRank: profileData.creatorRank ? {
          rank: profileData.creatorRank.rank,
          total: profileData.creatorRank.total,
          score: profileData.creatorRank.score,
          level: profileData.creatorRank.level,
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

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setFeedLoading(true);
    try {
      const data = await apiGet<any>('/api/posts/user/me', token);
      const postsData = data?.posts ?? data?.data ?? data ?? [];
      setPosts(Array.isArray(postsData) ? postsData : []);
      setHasMoreFeed(false);
    } catch {
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // Handlers
  const handleAvatarUpload = async (file: File) => {
    if (!token) return;
    
    const validationError = validateUploadFile(file, 'avatar');
    if (validationError) {
      showToast?.({ type: 'error', title: 'Invalid file', message: validationError });
      return;
    }

    try {
      const result = await uploadAvatarService(file, token, (progress) => {
        if (progress.status === 'error') {
          showToast?.({ type: 'error', title: 'Upload failed', message: progress.error || 'Failed to upload avatar' });
        }
      });
      
      if (result.url) {
        setProfile((prev: any) => prev ? { ...prev, avatarUrl: result.url } : prev);
        showToast?.({ type: 'success', title: 'Avatar updated', message: 'Profile photo updated successfully' });
        setTimeout(() => fetchProfile(), 500);
      } else if (result.error) {
        showToast?.({ type: 'error', title: 'Upload failed', message: result.error });
      }
    } catch (err: any) {
      showToast?.({ type: 'error', title: 'Upload failed', message: err.message || 'Failed to update avatar' });
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!token) return;
    
    const validationError = validateUploadFile(file, 'banner');
    if (validationError) {
      showToast?.({ type: 'error', title: 'Invalid file', message: validationError });
      return;
    }

    try {
      const result = await uploadBannerService(file, token, (progress) => {
        if (progress.status === 'error') {
          showToast?.({ type: 'error', title: 'Upload failed', message: progress.error || 'Failed to upload banner' });
        }
      });
      
      if (result.url) {
        setProfile((prev: any) => prev ? { ...prev, bannerUrl: result.url } : prev);
        showToast?.({ type: 'success', title: 'Banner updated', message: 'Cover image updated successfully' });
        setTimeout(() => fetchProfile(), 500);
      } else if (result.error) {
        showToast?.({ type: 'error', title: 'Upload failed', message: result.error });
      }
    } catch (err: any) {
      showToast?.({ type: 'error', title: 'Upload failed', message: err.message || 'Failed to update banner' });
    }
  };

  const handleProfileUpdated = (updatedProfile: any) => {
    setProfile(updatedProfile);
    showToast?.({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved' });
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.fullName || profile?.username} on SparkLive`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast?.({ type: 'success', title: 'Link copied', message: 'Profile link copied to clipboard' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="skeleton h-72 lg:h-96 rounded-3xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-12 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </motion.div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load profile</h2>
        <p className="text-sm text-white/30 mb-6 max-w-md text-center">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchProfile}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProfileHero
            profile={profile}
            isOwnProfile={true}
            isLive={isLive}
            onEditProfile={() => setEditModalOpen(true)}
            onShareProfile={handleShareProfile}
            onAvatarUpload={handleAvatarUpload}
            onBannerUpload={handleBannerUpload}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 px-4 sm:px-6"
        >
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
            <ProfileStats stats={stats} />
          </div>
        </motion.div>

        {/* Quick Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 px-4 sm:px-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00d8ff]/10 border border-[#00d8ff]/20 flex items-center justify-center">
                <Eye size={14} className="text-[#00d8ff]" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">{metrics.totalViews.toLocaleString()}</p>
                <p className="text-[9px] text-white/40">Total Views</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Activity size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">{metrics.totalWatchTime}</p>
                <p className="text-[9px] text-white/40">Watch Time</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Target size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">{metrics.engagement}%</p>
                <p className="text-[9px] text-white/40">Engagement</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ff007f]/10 border border-[#ff007f]/20 flex items-center justify-center">
                <TrendingUp size={14} className="text-[#ff007f]" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">#{metrics.rank.toLocaleString()}</p>
                <p className="text-[9px] text-white/40">Creator Rank</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content + Sidebar */}
        <div className="mt-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProfileTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  counts={{
                    posts: stats.posts,
                    streams: stats.streams,
                    shorts: stats.shorts,
                  }}
                />
              </motion.div>

              {/* Feed */}
              <motion.div
                key={`${activeTab}-${viewMode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProfileFeed
                  posts={posts}
                  activeTab={activeTab}
                  loading={feedLoading}
                  hasMore={hasMoreFeed}
                  onLoadMore={fetchPosts}
                  viewMode={viewMode}
                />
              </motion.div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
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
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Go Live Button */}
      <FloatingGoLiveButton onClick={() => setGoLiveModalOpen(true)} />

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Premium Go Live Modal */}
      <PremiumGoLiveModal
        open={goLiveModalOpen}
        onClose={() => setGoLiveModalOpen(false)}
      />
    </>
  );
}