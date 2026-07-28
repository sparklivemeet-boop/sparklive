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
  DollarSign, BarChart3, Rocket, Infinity, Globe, Disc3, Waves
} from 'lucide-react';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileFeed from '@/components/profile/ProfileFeed';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PremiumGoLiveModal from '@/components/profile/PremiumGoLiveModal';
import FloatingGoLiveButton from '@/components/profile/FloatingGoLiveButton';
import { uploadAvatar as uploadAvatarService, uploadBanner as uploadBannerService, validateUploadFile } from '@/lib/uploadService';

export default function ProfilePage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLive, setIsLive] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.5);

  const [stats, setStats] = useState({
    posts: 0, streams: 0, shorts: 0, followers: 0, following: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

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

  // Futuristic particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
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
        ctx.fillStyle = `rgba(255, 0, 127, ${p.alpha * glowIntensity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${(1 - dist / 150) * 0.15 * glowIntensity})`;
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
    } catch {
      setPosts([]);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto relative">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />
        <div className="relative z-10">
          <div className="skeleton h-72 lg:h-96 rounded-3xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="skeleton h-24 rounded-2xl" />
              <div className="skeleton h-12 rounded-2xl" />
              <div className="skeleton h-64 rounded-2xl" />
            </div>
            <div className="space-y-4">
              <div className="skeleton h-48 rounded-2xl" />
              <div className="skeleton h-32 rounded-2xl" />
              <div className="skeleton h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <X size={24} className="text-red-400" />
        </motion.div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load profile</h2>
        <p className="text-sm text-white/30 mb-6 max-w-md text-center">{error}</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={fetchProfile}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {/* Particle Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <ProfileHero
            profile={profile} isOwnProfile={true} isLive={isLive}
            onEditProfile={() => setEditModalOpen(true)}
            onShareProfile={handleShareProfile}
            onAvatarUpload={handleAvatarUpload}
            onBannerUpload={handleBannerUpload}
          />
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 px-4 sm:px-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
            <ProfileStats stats={stats} />
          </div>
        </motion.div>

        {/* Futuristic Metrics Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 px-4 sm:px-6">
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

        {/* Main Content + Sidebar */}
        <div className="mt-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <ProfileTabs
                  activeTab={activeTab} onTabChange={setActiveTab}
                  viewMode={viewMode} onViewModeChange={setViewMode}
                  counts={{ posts: stats.posts, streams: stats.streams, shorts: stats.shorts }}
                />
              </motion.div>

              <motion.div key={`${activeTab}-${viewMode}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <ProfileFeed
                  posts={posts} activeTab={activeTab}
                  loading={feedLoading} hasMore={hasMoreFeed}
                  onLoadMore={fetchPosts} viewMode={viewMode}
                />
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-24">
                <ProfileSidebar
                  liveNow={sidebarData.liveNow} community={sidebarData.community}
                  badges={sidebarData.badges} achievements={sidebarData.achievements}
                  creatorRank={sidebarData.creatorRank} recentActivity={sidebarData.recentActivity}
                  upcomingStreams={sidebarData.upcomingStreams} topDonors={sidebarData.topDonors}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <FloatingGoLiveButton onClick={() => setGoLiveModalOpen(true)} />
      <EditProfileModal open={editModalOpen} onClose={() => setEditModalOpen(false)} onProfileUpdated={handleProfileUpdated} />
      <PremiumGoLiveModal open={goLiveModalOpen} onClose={() => setGoLiveModalOpen(false)} />
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