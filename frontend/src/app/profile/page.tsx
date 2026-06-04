"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Edit3, Globe, Heart, Loader2, MapPin, Settings2, Share2, Sparkles, UploadCloud, X } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import { createSocket } from '@/lib/socketClient';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface ProfileCounts {
  followers: number;
  following: number;
  posts: number;
  media: number;
}

interface PostItem {
  id: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  likes: number;
  comments: number;
  author: {
    id: string;
    username: string;
    avatar?: string | null;
  };
}

interface MediaItem {
  id: string;
  url: string;
  title?: string | null;
  type: string;
  createdAt: string;
}

interface ReplyItem {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    content: string;
    author: { id: string; username: string; avatar?: string | null };
  };
}

interface LikeItem {
  id: string;
  createdAt: string;
  post: PostItem;
}

interface ProfileData {
  id: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  city?: string | null;
  country?: string | null;
  verified?: boolean;
  premium?: boolean;
  socialLinks?: SocialLink[];
  counts: ProfileCounts;
  joinedAt: string;
}

const profileTabs = ['Posts', 'Media', 'Replies', 'Likes'] as const;
type ProfileTab = (typeof profileTabs)[number];

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Posts');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    fullName: '',
    username: '',
    bio: '',
    city: '',
    country: '',
    website: '',
    socialLinks: [{ platform: 'Twitter', url: '' }, { platform: 'Instagram', url: '' }],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const displayName = profile?.fullName || profile?.username || user?.username || 'SparkLive';
  const handle = `@${(profile?.username || user?.username || 'sparklive').replace(/\s+/g, '').toLowerCase()}`;
  const locationText = profile?.city ? `${profile.city}${profile.country ? `, ${profile.country}` : ''}` : 'No location set';

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ProfileData>('/api/profiles/me', token);
      setProfile(data);
      setFormState({
        fullName: data.fullName || '',
        username: data.username || '',
        bio: data.bio || '',
        city: data.city || '',
        country: data.country || '',
        website: data.website || '',
        socialLinks: data.socialLinks?.length
          ? data.socialLinks.slice(0, 4)
          : [{ platform: 'Twitter', url: '' }, { platform: 'Instagram', url: '' }],
      });
    } catch (err) {
      setError('Unable to load profile data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabContent = async (cursor?: string) => {
    if (!token) return;
    setTabLoading(true);
    setError(null);

    const query = cursor ? `?cursor=${cursor}` : '';
    try {
      if (activeTab === 'Posts') {
        const data = await apiGet<{ items: PostItem[]; nextCursor?: string }>(`/api/profiles/me/posts${query}`, token);
        setPosts((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor || null);
      } else if (activeTab === 'Media') {
        const data = await apiGet<{ items: MediaItem[]; nextCursor?: string }>(`/api/profiles/me/media${query}`, token);
        setMedia((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor || null);
      } else if (activeTab === 'Replies') {
        const data = await apiGet<{ items: ReplyItem[]; nextCursor?: string }>(`/api/profiles/me/replies${query}`, token);
        setReplies((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor || null);
      } else {
        const data = await apiGet<{ items: LikeItem[]; nextCursor?: string }>(`/api/profiles/me/likes${query}`, token);
        setLikes((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor || null);
      }
    } catch (err) {
      setError('Unable to load content.');
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  };

  const loadMore = () => {
    if (!nextCursor || tabLoading) return;
    loadTabContent(nextCursor);
  };

  const resetTabData = () => {
    setPosts([]);
    setMedia([]);
    setReplies([]);
    setLikes([]);
    setNextCursor(null);
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    resetTabData();
    loadTabContent();
  }, [activeTab, token]);

  useEffect(() => {
    if (!token) return;

    const newSocket = createSocket(token);
    newSocket.connect();
    newSocket.on('connect', () => setSocket(newSocket));
    newSocket.on('profile_updated', (updatedProfile: ProfileData) => {
      if (updatedProfile.id === profile?.id) {
        setProfile(updatedProfile);
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token, profile?.id]);

  useEffect(() => {
    if (!observerRef.current || !nextCursor) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.5 });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [nextCursor, tabLoading, activeTab]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const openEdit = () => setEditOpen(true);
  const closeEdit = () => {
    setEditOpen(false);
    setAvatarFile(null);
    setBannerFile(null);
    setAvatarPreview(null);
    setBannerPreview(null);
    setFormError(null);
  };

  const handleFileChange = (file: File | null, type: 'avatar' | 'banner') => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    } else {
      setBannerFile(file);
      setBannerPreview(previewUrl);
    }
  };

  const handleSocialLinkChange = (index: number, key: 'platform' | 'url', value: string) => {
    setFormState((current) => {
      const updated = [...current.socialLinks];
      updated[index] = { ...updated[index], [key]: value };
      return { ...current, socialLinks: updated };
    });
  };

  const addSocialLink = () => {
    setFormState((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, { platform: 'Website', url: '' }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormState((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    if (!token) return;
    setFormError(null);
    setSaving(true);

    if (!formState.username.trim()) {
      setFormError('Username is required.');
      setSaving(false);
      return;
    }

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await apiUpload('/api/profiles/me/avatar', formData, token);
      }
      if (bannerFile) {
        const formData = new FormData();
        formData.append('banner', bannerFile);
        await apiUpload('/api/profiles/me/banner', formData, token);
      }
      const response = await apiPut<{ profile: ProfileData }>('/api/profiles/me', {
        fullName: formState.fullName,
        username: formState.username,
        bio: formState.bio,
        city: formState.city,
        country: formState.country,
        website: formState.website,
        socialLinks: formState.socialLinks,
      }, token);
      setProfile(response.profile);
      showToast('Profile saved successfully');
      socket?.emit('profile_updated', response.profile);
      closeEdit();
      loadProfile();
    } catch (err) {
      setFormError((err as Error).message || 'Unable to save profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      const url = `${window.location.origin}/profile`;
      await navigator.clipboard.writeText(url);
      showToast('Profile link copied');
    } catch {
      setError('Unable to copy link');
    }
  };

  const tabContent = useMemo(() => {
    if (tabLoading) {
      return (
        <div className="flex items-center justify-center py-24 text-slate-300">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading content...
        </div>
      );
    }

    if (error) {
      return <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{error}</div>;
    }

    if (activeTab === 'Posts') {
      if (!posts.length) {
        return <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-8 text-center text-slate-300">No posts yet. Start sharing your latest moments and updates.</div>;
      }
      return (
        <div className="space-y-5">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-white/5">
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-slate-400">@</div>
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                    <span className="font-semibold text-white">{post.author.username}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-slate-200">{post.content}</p>
                </div>
              </div>
              {post.mediaUrl && (
                <div className="mt-5 overflow-hidden rounded-3xl bg-white/5">
                  <img src={post.mediaUrl} alt="Post media" className="h-64 w-full object-cover" />
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2"><Heart size={16} /> {post.likes}</span>
                <span className="inline-flex items-center gap-2"><Heart size={16} /> {post.comments} replies</span>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === 'Media') {
      if (!media.length) {
        return <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-8 text-center text-slate-300">No uploaded media yet. Add images or highlights to your profile gallery.</div>;
      }
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
              <img src={item.url} alt={item.title || 'Profile media'} className="h-64 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{item.type}</p>
                <p className="mt-3 text-lg font-semibold text-white">{item.title || 'Profile media'}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'Replies') {
      if (!replies.length) {
        return <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-8 text-center text-slate-300">No replies yet. Join conversations and build engagement.</div>;
      }
      return (
        <div className="space-y-5">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <p className="text-sm text-slate-300">Reply to <span className="font-semibold text-white">{reply.post.author.username}</span></p>
              <p className="mt-3 text-slate-200">{reply.content}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Original post</p>
              <p className="mt-2 text-slate-300">{reply.post.content}</p>
            </div>
          ))}
        </div>
      );
    }

    if (!likes.length) {
      return <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-8 text-center text-slate-300">No likes yet. Interact with posts to build your Likes feed.</div>;
    }

    return (
      <div className="space-y-5">
        {likes.map((item) => (
          <article key={item.id} className="rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="font-semibold text-white">Liked post</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-4 text-slate-200">{item.post.content}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span>By {item.post.author.username}</span>
              <span>{item.post.likes} likes</span>
              <span>{item.post.comments} replies</span>
            </div>
          </article>
        ))}
      </div>
    );
  }, [activeTab, error, likes, media, posts, replies, tabLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-3 h-8 w-8 animate-spin" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f] pb-10 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="relative overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-black" />
            {profile?.bannerUrl ? (
              <img src={profile.bannerUrl} alt="Banner" className="h-72 w-full object-cover opacity-90" />
            ) : (
              <div className="h-72 w-full bg-gradient-to-r from-violet-700 via-fuchsia-700 to-pink-600" />
            )}
            <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1400px] items-end justify-between gap-4 px-6 pb-6">
              <div className="flex items-center gap-5">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-black/80 bg-slate-900 p-1 shadow-[0_35px_90px_rgba(125,43,255,0.24)]">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={displayName} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-5xl">{displayName.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
                  <h1 className="text-5xl font-black tracking-tight text-white">{displayName}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span>{handle}</span>
                    {profile?.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200">
                        <CheckCircle2 size={14} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={openEdit} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Edit3 className="mr-2 inline-block" /> Edit profile
                </button>
                <button onClick={() => router.push('/profile/settings')} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Settings2 className="mr-2 inline-block" /> Settings
                </button>
                <button onClick={handleShareProfile} className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110">
                  <Share2 className="mr-2 inline-block" /> Share
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-10 xl:grid-cols-[1.7fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">About</p>
                    <h2 className="mt-3 text-3xl font-bold text-white">Modern creator profile</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                    <Sparkles size={18} /> {profile?.premium ? 'Premium creator' : 'Creator'}
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">{profile?.bio || 'Welcome to your SparkLive desktop profile. Share your story, highlight your best moments, and keep your fans engaged with a polished creator presence.'}</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Followers</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{profile?.counts.followers.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Following</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{profile?.counts.following.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Posts</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{profile?.counts.posts.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Media</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{profile?.counts.media.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tabs</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">Profile stream</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          activeTab === tab ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-6">{tabContent}</div>
                {nextCursor && (
                  <div className="flex items-center justify-center pt-4">
                    <button onClick={loadMore} disabled={tabLoading} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                      Load more
                    </button>
                  </div>
                )}
                <div ref={observerRef} className="h-1" />
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile details</p>
                <div className="mt-6 space-y-4 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{locationText}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a href={profile?.website || '#'} className="text-slate-100 hover:text-white" target="_blank" rel="noreferrer">
                      {profile?.website || 'No website added'}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Joined</p>
                    <p className="mt-2 text-white">{profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Social</p>
                <div className="mt-5 space-y-3">
                  {(profile?.socialLinks?.length ? profile.socialLinks : []).map((link) => (
                    <a key={link.id} href={link.url} className="block rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-300 hover:text-white" target="_blank" rel="noreferrer">
                      <span className="font-semibold text-white">{link.platform}</span>
                      <span className="block text-slate-400">{link.url.replace(/(^https?:\/\/|^www\.)/, '')}</span>
                    </a>
                  ))}
                  {(!profile?.socialLinks?.length || profile.socialLinks.length === 0) && (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 px-4 py-6 text-sm text-slate-400">No social links configured yet.</div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/70 px-4 py-8 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl rounded-[32px] bg-slate-950 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Edit profile</h2>
                <p className="mt-2 text-sm text-slate-400">Update your avatar, banner, bio, and social details in one place.</p>
              </div>
              <button onClick={closeEdit} className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Media</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-center transition hover:border-indigo-300/40">
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleFileChange(event.target.files?.[0] || null, 'banner')} />
                      <div className="flex h-40 items-center justify-center rounded-3xl bg-slate-900/85">
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                        ) : profile?.bannerUrl ? (
                          <img src={profile.bannerUrl} alt="Banner preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                            <UploadCloud size={36} />
                            <span>Upload banner</span>
                          </div>
                        )}
                      </div>
                    </label>
                    <label className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-center transition hover:border-indigo-300/40">
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleFileChange(event.target.files?.[0] || null, 'avatar')} />
                      <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-slate-900/85">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                        ) : profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-4xl text-slate-400">{displayName.charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                      <p className="mt-4 text-sm text-slate-300">Change avatar</p>
                    </label>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile details</p>
                  <div className="mt-5 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Display name</span>
                      <input value={formState.fullName} onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Add your display name" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Username</span>
                      <input value={formState.username} onChange={(event) => setFormState((prev) => ({ ...prev, username: event.target.value }))} placeholder="username" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Bio</span>
                      <textarea value={formState.bio} onChange={(event) => setFormState((prev) => ({ ...prev, bio: event.target.value }))} rows={4} maxLength={260} placeholder="Tell your story" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                      <p className="text-xs text-slate-500">{formState.bio.length}/260</p>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-300">
                        <span>City</span>
                        <input value={formState.city} onChange={(event) => setFormState((prev) => ({ ...prev, city: event.target.value }))} placeholder="City" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                      </label>
                      <label className="space-y-2 text-sm text-slate-300">
                        <span>Country</span>
                        <input value={formState.country} onChange={(event) => setFormState((prev) => ({ ...prev, country: event.target.value }))} placeholder="Country" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                      </label>
                    </div>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Website</span>
                      <input value={formState.website} onChange={(event) => setFormState((prev) => ({ ...prev, website: event.target.value }))} placeholder="https://yourwebsite.com" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                    </label>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Social links</p>
                    <button disabled={formState.socialLinks.length >= 4} onClick={addSocialLink} className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase text-slate-300 transition hover:bg-white/10 disabled:opacity-50">
                      Add link
                    </button>
                  </div>
                  <div className="mt-5 space-y-4">
                    {formState.socialLinks.map((link, index) => (
                      <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <input value={link.platform} onChange={(event) => handleSocialLinkChange(index, 'platform', event.target.value)} placeholder="Platform" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                        <input value={link.url} onChange={(event) => handleSocialLinkChange(index, 'url', event.target.value)} placeholder="https://" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                        <button type="button" onClick={() => removeSocialLink(index)} className="rounded-full bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                {formError && <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{formError}</div>}

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button onClick={closeEdit} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Cancel</button>
                  <button disabled={saving} onClick={handleSave} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>

              <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                <p className="text-slate-400">Tip</p>
                <p className="mt-3">Upload a crisp banner and custom avatar to make your desktop profile stand out. Keep bio short and add direct social links.</p>
              </aside>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-white shadow-2xl shadow-black/40">
          {toast}
        </div>
      )}
    </div>
  );
}
