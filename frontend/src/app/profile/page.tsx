'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Globe, Calendar, Heart, MessageCircle, Share2, Settings,
  Edit3, Image, Video, Users, Sparkles, Flag,
  CheckCircle2, MoreHorizontal, UserPlus, Camera, Tv, Radio,
  PenSquare, Compass, BookOpen, Loader2, ThumbsUp, MessageSquare, Briefcase,
  Clock, Play, Hash, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiDelete } from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import UserAvatar from '@/components/ui/UserAvatar';
import LiveBadge from '@/components/ui/LiveBadge';
import GradientButton from '@/components/ui/GradientButton';
import { cn, formatNumber, formatTimeAgo } from '@/lib/utils';

/* ─────────────────────────────────────────────
   Type Definitions
   ───────────────────────────────────────────── */

interface ProfileData {
  id: string;
  email?: string | null;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  interests?: string | null;
  verified?: boolean;
  premium?: boolean;
  occupation?: string | null;
  joinedAt?: string;
  socialLinks?: { id: string; platform: string; url: string }[];
  counts?: {
    followers: number;
    following: number;
    posts: number;
    media: number;
  };
  latestPosts?: PostData[];
  profile?: Record<string, unknown>;
}

interface PostData {
  id: string;
  content?: string;
  mediaUrl?: string | null;
  pinned?: boolean;
  visibility?: string;
  createdAt: string;
  likesCount?: number;
  likes?: number;
  commentsCount?: number;
  comments?: number;
  sharesCount?: number;
  viewsCount?: number;
}

interface StreamData {
  id: string;
  title?: string;
  thumbnailUrl?: string | null;
  active?: boolean;
  viewerCount?: number;
  viewers?: number;
  category?: { name?: string };
}

interface MediaItem {
  id: string;
  url: string;
  title?: string | null;
  type?: string;
  createdAt: string;
}

interface CommunityData {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  memberCount?: number;
  role?: string;
  _count?: { members?: number };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

interface AboutSection {
  label: string;
  value: string | null | undefined;
  icon: IconComponent;
  href?: string;
  hideIfEmpty?: boolean;
}

/* ─────────────────────────────────────────────
   Tab Configuration
   ───────────────────────────────────────────── */

const PROFILE_TABS = [
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'media', label: 'Media', icon: Camera },
  { id: 'streams', label: 'Streams', icon: Radio },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'about', label: 'About', icon: BookOpen },
] as const;

type TabId = (typeof PROFILE_TABS)[number]['id'];

/* ─────────────────────────────────────────────
   Loading State
   ───────────────────────────────────────────── */

function ProfileSkeleton() {
  return (
    <div className="min-h-screen pb-24 lg:pb-10" aria-label="Loading profile">
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        {/* Header skeleton */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-black/40 backdrop-blur-xl">
          <div className="skeleton h-40 sm:h-56 lg:h-64 w-full rounded-none" />
          <div className="p-5 space-y-4">
            <div className="flex items-end gap-4 -mt-16 sm:-mt-20">
              <div className="skeleton w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-[#0a0a0f]" />
              <div className="flex-1 space-y-3 pb-2">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="skeleton h-10 w-28 rounded-xl" />
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-10 w-10 rounded-xl" />
            </div>
          </div>
        </div>
        {/* Tabs skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-10 w-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Empty State Component
   ───────────────────────────────────────────── */

interface EmptyStateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionIcon?: React.ComponentType<any>;
  onAction?: () => void;
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, actionIcon: ActionIcon, onAction }: EmptyStateProps) {
  return (
    <GlassCard>
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-gray-500" />
        </div>
        <p className="text-lg font-semibold text-gray-300">{title}</p>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">{description}</p>
        {actionLabel && (actionHref || onAction) && (
          <div className="mt-6">
            {actionHref ? (
              <Link href={actionHref}>
                <GradientButton variant="primary" size="sm" icon={ActionIcon ? <ActionIcon size={14} /> : undefined}>
                  {actionLabel}
                </GradientButton>
              </Link>
            ) : onAction ? (
              <GradientButton variant="primary" size="sm" icon={ActionIcon ? <ActionIcon size={14} /> : undefined} onClick={onAction}>
                {actionLabel}
              </GradientButton>
            ) : null}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   Main Profile Page
   ───────────────────────────────────────────── */

export default function ProfilePage() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Tab data
  const [posts, setPosts] = useState<PostData[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  // UI state
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('posts');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ─────────────────────────────────────────────
     Close menu on outside click
     ───────────────────────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (ke: KeyboardEvent) => {
        if (ke.key === 'Escape') setMenuOpen(false);
      });
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', () => setMenuOpen(false));
      };
    }
  }, [menuOpen]);

  /* ─────────────────────────────────────────────
     Fetch profile header data
     ───────────────────────────────────────────── */
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      setPageLoading(true);
      try {
        const profileData = await apiGet<ProfileData>('/api/profiles/me', token);
        setProfile(profileData);
        setIsOwnProfile(user?.id === profileData.id);
      } catch {
        // Profile fetch failed — will show error state
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
  }, [token, user?.id]);

  /* ─────────────────────────────────────────────
     Lazy load tab data
     ───────────────────────────────────────────── */
  const fetchPosts = useCallback(async () => {
    if (!token || posts.length > 0 || postsLoading) return;
    setPostsLoading(true);
    try {
      const data = await apiGet<{ items?: PostData[] }>('/api/profiles/me/posts', token);
      setPosts(data.items || []);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [token, posts.length, postsLoading]);

  const fetchStreams = useCallback(async () => {
    if (!token || streams.length > 0 || streamsLoading) return;
    setStreamsLoading(true);
    try {
      const data = await apiGet<{ streams?: StreamData[]; items?: StreamData[] }>('/api/live?limit=12', token);
      setStreams(Array.isArray(data) ? data : data.streams || data.items || []);
    } catch {
      setStreams([]);
    } finally {
      setStreamsLoading(false);
    }
  }, [token, streams.length, streamsLoading]);

  const fetchMedia = useCallback(async () => {
    if (!token || media.length > 0 || mediaLoading) return;
    setMediaLoading(true);
    try {
      const data = await apiGet<{ items?: MediaItem[] }>('/api/profiles/me/media', token);
      setMedia(data.items || []);
    } catch {
      setMedia([]);
    } finally {
      setMediaLoading(false);
    }
  }, [token, media.length, mediaLoading]);

  const fetchCommunities = useCallback(async () => {
    if (!token || communities.length > 0 || communitiesLoading) return;
    setCommunitiesLoading(true);
    try {
      const data = await apiGet<CommunityData[]>('/api/communities/my', token);
      setCommunities(Array.isArray(data) ? data : []);
    } catch {
      setCommunities([]);
    } finally {
      setCommunitiesLoading(false);
    }
  }, [token, communities.length, communitiesLoading]);

  // Load tab data when tab changes
  useEffect(() => {
    if (!profile || pageLoading) return;
    switch (activeTab) {
      case 'posts': fetchPosts(); break;
      case 'streams': fetchStreams(); break;
      case 'media': fetchMedia(); break;
      case 'communities': fetchCommunities(); break;
    }
  }, [activeTab, profile, pageLoading, fetchPosts, fetchStreams, fetchMedia, fetchCommunities]);

  /* ─────────────────────────────────────────────
     Follow handler
     ───────────────────────────────────────────── */
  const handleFollow = async () => {
    if (!profile?.username || !token) return;
    try {
      if (isFollowing) {
        await apiDelete(`/api/profiles/${profile.username}/follow`, token);
        setIsFollowing(false);
        setProfile(prev => prev ? {
          ...prev,
          counts: { ...prev.counts!, followers: Math.max(0, (prev.counts?.followers || 0) - 1) }
        } : null);
      } else {
        await apiPost(`/api/profiles/${profile.username}/follow`, {}, token);
        setIsFollowing(true);
        setProfile(prev => prev ? {
          ...prev,
          counts: { ...prev.counts!, followers: (prev.counts?.followers || 0) + 1 }
        } : null);
      }
    } catch {
      // Silently fail — follow state stays unchanged
    }
  };

  /* ─────────────────────────────────────────────
     Share handler
     ───────────────────────────────────────────── */
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: profile?.fullName || profile?.username || 'Profile', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  /* ─────────────────────────────────────────────
     Loading state
     ───────────────────────────────────────────── */
  if (pageLoading) {
    return <ProfileSkeleton />;
  }

  /* ─────────────────────────────────────────────
     Error / Not found state
     ───────────────────────────────────────────── */
  if (!profile) {
    return (
      <div className="min-h-screen pb-24 lg:pb-10 flex items-center justify-center">
        <div className="glass rounded-[32px] p-12 max-w-md mx-auto text-center">
          <UserPlus size={48} className="mx-auto text-gray-500 mb-4" aria-hidden="true" />
          <p className="text-xl font-semibold text-white mb-2">Profile not found</p>
          <p className="text-sm text-gray-400 mb-6">Please log in to view your profile.</p>
          <Link href="/login">
            <GradientButton variant="primary" size="md">Sign in</GradientButton>
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Derived data
     ───────────────────────────────────────────── */
  const counts = profile.counts || { followers: 0, following: 0, posts: 0, media: 0 };

  const stats = [
    { label: 'Followers', value: counts.followers, icon: Users },
    { label: 'Following', value: counts.following, icon: UserPlus },
    { label: 'Posts', value: counts.posts, icon: FileText },
    { label: 'Media', value: counts.media, icon: Camera },
  ] as const;

  const aboutSections: AboutSection[] = [
    { label: 'Bio', value: profile.bio, icon: FileText, hideIfEmpty: true },
    { label: 'Location', value: profile.city || profile.country ? [profile.city, profile.country].filter(Boolean).join(', ') : null, icon: MapPin, hideIfEmpty: true },
    { label: 'Website', value: profile.website, icon: Globe, href: profile.website || undefined, hideIfEmpty: true },
    { label: 'Interests', value: profile.interests, icon: Hash, hideIfEmpty: true },
    { label: 'Occupation', value: profile.occupation, icon: Briefcase, hideIfEmpty: true },
    { label: 'Joined', value: profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null, icon: Calendar },
  ].filter(s => !s.hideIfEmpty || s.value);

  /* ─────────────────────────────────────────────
     Render
     ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        {/* ═══════════════════════════════════════
           PROFILE HEADER CARD
           ═══════════════════════════════════════ */}
        <section
          className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-black/40 backdrop-blur-xl"
          aria-label="Profile header"
        >
          {/* Banner */}
          <div className="relative h-40 sm:h-56 lg:h-64 overflow-hidden">
            {profile.bannerUrl ? (
              <>
                <img
                  src={profile.bannerUrl}
                  alt={`${profile.fullName || profile.username}'s banner`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#ff007f]/30 via-[#7a00cc]/30 to-[#00d8ff]/30" />
            )}
          </div>

          <div className="relative px-5 pb-5">
            {/* Avatar + Info Row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-[#0a0a0f] overflow-hidden shadow-[0_0_40px_rgba(255,0,127,0.2)]">
                  <UserAvatar
                    src={profile.avatarUrl}
                    alt={profile.fullName || profile.username || 'User'}
                    size="2xl"
                  />
                </div>
                {profile.verified && (
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#00d8ff] to-[#7a00cc] flex items-center justify-center shadow-lg"
                    aria-label="Verified account"
                  >
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
              </div>

              {/* Name + Stats */}
              <div className="flex-1 min-w-0 sm:pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                  {profile.fullName || profile.username}
                </h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                  {profile.premium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 px-2 py-0.5 text-[9px] font-semibold text-yellow-400 border border-yellow-400/20">
                      <Sparkles size={10} aria-hidden="true" /> Premium
                    </span>
                  )}
                  {isOwnProfile && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-400/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> Online
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 mt-3" aria-label="Profile statistics">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center gap-1.5">
                        <Icon size={12} className="text-gray-500 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-bold text-white tabular-nums">{formatNumber(stat.value)}</p>
                          <p className="text-[9px] text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:pb-1" role="toolbar" aria-label="Profile actions">
                {isOwnProfile ? (
                  <>
                    <Link href="/profile/editprofile">
                      <GradientButton variant="primary" size="sm" icon={<Edit3 size={14} />}>
                        Edit Profile
                      </GradientButton>
                    </Link>
                    <button
                      onClick={handleShare}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
                      aria-label="Share profile"
                    >
                      <Share2 size={16} />
                    </button>
                    <Link href="/profile/settings">
                      <button
                        className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
                        aria-label="Settings"
                      >
                        <Settings size={16} />
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <GradientButton
                      variant={isFollowing ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={handleFollow}
                      aria-pressed={isFollowing}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </GradientButton>
                    <GradientButton variant="secondary" size="sm" icon={<MessageCircle size={14} />}>
                      Message
                    </GradientButton>
                    <button
                      onClick={handleShare}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
                      aria-label="Share profile"
                    >
                      <Share2 size={16} />
                    </button>
                  </>
                )}

                {/* Three-dot menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
                    aria-label="More options"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-[#0e0e16] shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
                      >
                        <div className="py-1.5">
                          {isOwnProfile ? (
                            <>
                              <Link href="/profile/editprofile">
                                <button
                                  onClick={() => setMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition"
                                  role="menuitem"
                                >
                                  <Edit3 size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                                  Edit Profile
                                </button>
                              </Link>
                              <div className="mx-3 my-1 border-t border-white/[0.06]" role="separator" />
                              <Link href="/profile/settings">
                                <button
                                  onClick={() => setMenuOpen(false)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition"
                                  role="menuitem"
                                >
                                  <Settings size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                                  Settings
                                </button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition"
                                role="menuitem"
                              >
                                <Flag size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                                Report
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bio & Details */}
            <div className="space-y-3 max-w-2xl">
              {profile.bio && (
                <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {(profile.city || profile.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} aria-hidden="true" />
                    {profile.city}{profile.country ? `, ${profile.country}` : ''}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#00d8ff] hover:underline"
                  >
                    <Globe size={12} aria-hidden="true" /> Website
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} aria-hidden="true" /> Joined{' '}
                  {profile.joinedAt
                    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'Recently'}
                </span>
              </div>

              {/* Social Links */}
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[10px] font-medium text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
           TABS
           ═══════════════════════════════════════ */}
        <div
          className="flex gap-1 rounded-2xl bg-white/[0.03] p-1 border border-white/[0.06] overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="Profile content tabs"
        >
          {PROFILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff007f]/50',
                  isActive
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-[0_0_16px_rgba(255,0,127,0.2)]'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                <Icon size={15} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════
           TAB CONTENT
           ═══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {/* ── Posts Tab ── */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <GlassCard key={i}>
                        <div className="flex items-start gap-3">
                          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                          <div className="flex-1 space-y-3">
                            <div className="skeleton h-4 w-32" />
                            <div className="skeleton h-16 w-full" />
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <EmptyState
                    icon={PenSquare}
                    title="No posts yet"
                    description="Share your thoughts, photos, and updates with the community."
                    actionLabel="Create your first post"
                    actionHref="/create"
                    actionIcon={PenSquare}
                  />
                ) : (
                  <>
                    {posts.map((post) => (
                      <GlassCard key={post.id}>
                        <article className="flex items-start gap-3">
                          <UserAvatar
                            src={profile.avatarUrl}
                            alt={profile.fullName || profile.username || 'User'}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-white">
                                {profile.fullName || profile.username}
                              </span>
                              <span className="text-gray-500" aria-hidden="true">·</span>
                              <time
                                dateTime={post.createdAt}
                                className="text-gray-500"
                              >
                                {formatTimeAgo(post.createdAt)}
                              </time>
                              {post.pinned && (
                                <span className="text-[10px] text-[#00d8ff] font-medium">Pinned</span>
                              )}
                            </div>
                            {post.content && (
                              <p className="mt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                                {post.content}
                              </p>
                            )}
                            {post.mediaUrl && (
                              <img
                                src={post.mediaUrl}
                                alt="Post attachment"
                                className="mt-3 rounded-2xl w-full object-cover max-h-96"
                                loading="lazy"
                              />
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1.5 hover:text-[#ff007f] transition cursor-pointer" title="Likes">
                                <Heart size={14} aria-hidden="true" />
                                {formatNumber(post.likesCount || post.likes || 0)}
                              </span>
                              <span className="flex items-center gap-1.5 hover:text-[#00d8ff] transition cursor-pointer" title="Comments">
                                <MessageCircle size={14} aria-hidden="true" />
                                {formatNumber(post.commentsCount || post.comments || 0)}
                              </span>
                              {(post.sharesCount ?? 0) > 0 && (
                                <span className="flex items-center gap-1.5" title="Shares">
                                  <Share2 size={14} aria-hidden="true" />
                                  {formatNumber(post.sharesCount || 0)}
                                </span>
                              )}
                              {(post.viewsCount ?? 0) > 0 && (
                                <span className="flex items-center gap-1.5 text-gray-600" title="Views">
                                  <Tv size={14} aria-hidden="true" />
                                  {formatNumber(post.viewsCount || 0)}
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      </GlassCard>
                    ))}
                    {/* Load more indicator */}
                    {posts.length >= 10 && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => {/* TODO: load more with cursor */}}
                          className="text-sm text-gray-500 hover:text-white transition"
                          aria-label="Load more posts"
                        >
                          <Loader2 size={16} className="inline animate-spin mr-1" />
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Streams Tab ── */}
            {activeTab === 'streams' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {streamsLoading ? (
                  <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <GlassCard key={i} padding="sm">
                        <div className="skeleton aspect-video rounded-xl" />
                        <div className="flex items-center gap-3 mt-3">
                          <div className="skeleton w-8 h-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-full" />
                            <div className="skeleton h-3 w-2/3" />
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : streams.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Radio}
                      title="No live streams yet"
                      description="Start your first live stream to connect with your audience in real time."
                      actionLabel="Go Live"
                      actionHref="/live/go-live"
                      actionIcon={Radio}
                    />
                  </div>
                ) : (
                  streams.map((stream) => (
                    <GlassCard
                      key={stream.id}
                      padding="sm"
                      onClick={() => router.push('/live')}
                      className="cursor-pointer"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black/60">
                        {stream.thumbnailUrl ? (
                          <img
                            src={stream.thumbnailUrl}
                            alt={stream.title || 'Stream thumbnail'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv size={24} className="text-gray-600" aria-hidden="true" />
                          </div>
                        )}
                        {stream.active && (
                          <div className="absolute top-2 left-2">
                            <LiveBadge viewers={stream.viewerCount || stream.viewers || 0} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={profile.avatarUrl}
                          alt={profile.username || 'User'}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {stream.title || 'Untitled Stream'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {stream.category?.name || 'Live'} · {formatNumber(stream.viewerCount || stream.viewers || 0)} viewers
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            )}

            {/* ── Media Tab ── */}
            {activeTab === 'media' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mediaLoading ? (
                  <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="skeleton aspect-square rounded-2xl" />
                    ))}
                  </div>
                ) : media.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Camera}
                      title="No media uploaded yet"
                      description="Upload photos and videos to build your media gallery."
                    />
                  </div>
                ) : (
                  media.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-white/[0.06] cursor-pointer group"
                    >
                      <img
                        src={item.url}
                        alt={item.title || 'Media'}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" aria-hidden="true" />
                      {item.title && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
                          <p className="text-xs font-medium text-white truncate">{item.title}</p>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                        {item.type === 'VIDEO' ? (
                          <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                            <Play size={10} /> Video
                          </span>
                        ) : (
                          <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">
                            Photo
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Communities Tab ── */}
            {activeTab === 'communities' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communitiesLoading ? (
                  <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <GlassCard key={i} padding="sm">
                        <div className="flex items-center gap-3">
                          <div className="skeleton w-12 h-12 rounded-2xl" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-32" />
                            <div className="skeleton h-3 w-20" />
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : communities.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Users}
                      title="No communities joined yet"
                      description="Join communities and connect with like-minded people."
                      actionLabel="Discover Communities"
                      actionHref="/discover"
                      actionIcon={Compass}
                    />
                  </div>
                ) : (
                  communities.map((community) => (
                    <GlassCard
                      key={community.id}
                      padding="sm"
                      onClick={() => router.push(`/community/${community.id}`)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {community.imageUrl ? (
                          <img
                            src={community.imageUrl}
                            alt={community.name}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {community.name?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{community.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(community.memberCount || community._count?.members || 0)} members
                            {community.role ? ` · ${community.role}` : ''}
                          </p>
                        </div>
                      </div>
                      {community.description && (
                        <p className="mt-2 text-xs text-gray-400 line-clamp-2">{community.description}</p>
                      )}
                    </GlassCard>
                  ))
                )}
              </div>
            )}

            {/* ── About Tab ── */}
            {activeTab === 'about' && (
              <GlassCard>
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-[#ff007f]" aria-hidden="true" />
                    About
                  </h3>
                  {aboutSections.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No profile information has been added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {aboutSections.map((section) => {
                        if (!section.value) return null;
                        const Icon = section.icon;
                        if (section.href) {
                          return (
                            <a
                              key={section.label}
                              href={section.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition group"
                            >
                              <Icon size={16} className="text-gray-500 mt-0.5 shrink-0 group-hover:text-[#00d8ff] transition" aria-hidden="true" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{section.label}</p>
                                <p className="text-sm text-[#00d8ff] truncate">{section.value}</p>
                              </div>
                            </a>
                          );
                        }
                        return (
                          <div key={section.label} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03]">
                            <Icon size={16} className="text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{section.label}</p>
                              <p className="text-sm text-gray-300">{section.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
