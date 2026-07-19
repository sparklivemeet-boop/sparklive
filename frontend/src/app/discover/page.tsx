"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Compass, Sparkles, Heart, MessageCircle, Filter, Users, Radio } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SkeletonFeed } from '@/components/ui/Skeleton';
import CreatePostComposer from '@/components/create/CreatePostComposer';

interface Profile {
  id: string;
  username: string;
  fullName?: string | null;
  age?: number | null;
  city?: string | null;
  bio?: string | null;
  photos?: { url: string }[];
  profile?: { profileImages?: string[]; isOnline?: boolean };
}

const filterTabs = ['For You', 'Trending', 'Live Now', 'New', 'Popular'];

export default function Discover() {
  const { token, isLoading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('For You');

  useEffect(() => {
    if (!token) return;
    const fetchProfiles = async () => {
      try {
        const data = await apiGet<Profile[]>('/api/profiles/discover', token);
        setProfiles(data);
      } catch (error) {
        console.error('Failed to fetch discover profiles', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [token]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen px-4 py-8 pb-24 lg:pb-10">
        <SkeletonFeed />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="space-y-6">
        {/* Home Feed Composer */}
        <CreatePostComposer />

        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Discover</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Explore people & trending creators</h1>
              <p className="max-w-2xl text-sm text-gray-400">Find your community, discover live streamers, and connect with like-minded people.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" icon={<Filter size={14} />}>Filters</Button>
              <Button variant="primary" size="sm" icon={<Sparkles size={14} />}>Trending now</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-4 hover-lift">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Active creators</p>
            <p className="mt-2 text-2xl font-bold text-white">{profiles.filter((p) => p.profile?.isOnline).length}</p>
            <p className="mt-1 text-xs text-gray-400">Profiles currently live or nearby.</p>
          </div>
          <div className="glass rounded-2xl p-4 hover-lift">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Recommendations</p>
            <p className="mt-2 text-2xl font-bold text-white">{profiles.length}</p>
            <p className="mt-1 text-xs text-gray-400">Fresh discover cards for you.</p>
          </div>
          <div className="glass rounded-2xl p-4 hover-lift">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Categories</p>
            <p className="mt-2 text-2xl font-bold text-white">{new Set(profiles.map(p => p.city).filter(Boolean)).size || '—'}</p>
            <p className="mt-1 text-xs text-gray-400">Unique locations represented.</p>
          </div>
        </div>

        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">Profiles</h2>
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-spark text-white shadow-[0_20px_70px_rgba(255,0,127,0.18)]'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Compass size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">No profiles found</p>
              <p className="text-sm mt-2">Check back later for new discoveries.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profiles.slice(0, 12).map((profile) => (
                <div key={profile.id} className="group overflow-hidden rounded-[24px] border border-white/10 bg-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-[0_20px_60px_rgba(255,0,127,0.12)]">
                  <div className="relative h-64 overflow-hidden bg-gray-900">
                    <img src={profile.photos?.[0]?.url || profile.profile?.profileImages?.[0] || 'https://i.pravatar.cc/600'} alt={profile.username} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${profile.profile?.isOnline ? 'bg-emerald-400/20 text-emerald-100' : 'bg-gray-500/20 text-gray-300'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${profile.profile?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                        {profile.profile?.isOnline ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{profile.fullName || profile.username}</h3>
                        <p className="text-sm text-gray-400">{profile.city || 'Global'} {profile.age ? `• ${profile.age}` : ''}</p>
                      </div>
                      <span className="text-xs text-gray-500">@{profile.username}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-gray-300 leading-relaxed">{profile.bio || 'No bio yet.'}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <button className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 transition"><Heart size={12} /> Like</button>
                      <button className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 transition"><MessageCircle size={12} /> Chat</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {profiles.length > 0 && (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="glass rounded-[28px] p-5 shadow-card">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">Trending streams</p>
              <div className="space-y-3">
                {profiles.filter(p => p.profile?.isOnline).slice(0, 3).map((profile) => (
                  <div key={profile.id} className="rounded-2xl bg-white/5 p-4 border border-white/10 hover-lift">
                    <p className="text-xs text-gray-400">Streamer</p>
                    <p className="mt-1 font-semibold text-white">{profile.fullName || profile.username}</p>
                  </div>
                ))}
                {profiles.filter(p => p.profile?.isOnline).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No creators are live right now.</p>
                )}
              </div>
            </div>
            <div className="glass rounded-[28px] p-5 shadow-card">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">Spotlight</p>
              {profiles.length > 0 ? (
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-spark p-0.5">
                    <img src={profiles[0].photos?.[0]?.url || 'https://i.pravatar.cc/150'} alt={profiles[0].username} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{profiles[0].fullName || profiles[0].username}</p>
                    <p className="text-sm text-gray-400">{profiles[0].city || 'Global'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">No spotlight profiles available.</p>
              )}
            </div>
            <div className="glass rounded-[28px] p-5 shadow-card">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">Activity</p>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gradient-spark" />{profiles.length} profiles available to discover</p>
                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gradient-spark" />{profiles.filter(p => p.profile?.isOnline).length} creators currently online</p>
                <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gradient-spark" />{new Set(profiles.map(p => p.city).filter(Boolean)).size} cities represented</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}