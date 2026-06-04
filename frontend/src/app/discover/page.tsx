"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Filter, MapPin, Sparkles, Star } from 'lucide-react';

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

const filterTabs = ['For You', 'Trending', 'Live Now'];

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
      <div className="min-h-screen flex items-center justify-center px-4 py-24 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white/20 border-r-[4px] border-[var(--color-spark-pink)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-4 py-6 lg:px-6 xl:px-8">
        <header className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Discover</p>
              <h1 className="text-4xl font-bold text-white">Explore people, live creators, and trending communities.</h1>
              <p className="max-w-2xl text-sm text-gray-300">SparkLive desktop is built like a modern social hub, with rich discover grids, active status, and immersive content panels.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-black/40 p-4">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
                <Sparkles size={16} /> Trending now
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-[var(--color-spark-pink)] to-[var(--color-spark-purple)] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_80px_rgba(255,0,127,0.2)]">
                <Star size={16} /> Live creator feed
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Filters</p>
                  <h2 className="text-3xl font-bold text-white">Refine your discover stream</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                        activeTab === tab ? 'bg-gradient-spark text-white shadow-[0_20px_70px_rgba(255,0,127,0.18)]' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Active creators</p>
                <p className="mt-3 text-3xl font-bold text-white">{profiles.filter((profile) => profile.profile?.isOnline).length}</p>
                <p className="mt-2 text-sm text-gray-400">Profiles currently live or nearby.</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Recommendations</p>
                <p className="mt-3 text-3xl font-bold text-white">{profiles.length}</p>
                <p className="mt-2 text-sm text-gray-400">Fresh discover cards from your network.</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Live categories</p>
                <p className="mt-3 text-3xl font-bold text-white">Music, Travel, VIP</p>
                <p className="mt-2 text-sm text-gray-400">Curated content for desktop audiences.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {profiles.slice(0, 12).map((profile) => (
                  <div key={profile.id} className="group overflow-hidden rounded-[32px] border border-white/10 bg-black/40 transition hover:-translate-y-0.5 hover:border-white/20">
                    <div className="relative h-72 overflow-hidden bg-gray-900">
                      <img
                        src={profile.photos?.[0]?.url || profile.profile?.profileImages?.[0] || 'https://i.pravatar.cc/600'}
                        alt={profile.username}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">{profile.profile?.isOnline ? 'Live' : 'Offline'}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{profile.fullName || profile.username}</h3>
                          <p className="text-sm text-gray-400">{profile.city || 'Global'} • {profile.age ?? 24}</p>
                        </div>
                        <span className="text-sm text-gray-300">{profile.username}</span>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm text-gray-300">{profile.bio || 'VIP creator with premium streams and exclusive social drops.'}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Music', 'Travel', 'Pro'].map((tag) => (
                          <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-300">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Discover pulse</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Trending streams</h2>
              <div className="mt-6 space-y-4">
                {['Party Beats', 'Late Night Talks', 'VIP Lounge'].map((category) => (
                  <div key={category} className="rounded-3xl bg-white/5 p-4 border border-white/10">
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="mt-2 font-semibold text-white">{category}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Spotlight</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Creator of the hour</h2>
              <div className="mt-5 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--color-spark-pink)] to-[var(--color-spark-purple)] p-1">
                  <img src="https://i.pravatar.cc/150?img=68" alt="Spotlight" className="h-full w-full rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-white">NovaStar</p>
                  <p className="text-sm text-gray-400">Live now • 14.3K viewers</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Activity</p>
              <div className="mt-5 space-y-3 text-sm text-gray-300">
                <p>• 278 people joined discover in the last hour</p>
                <p>• 42 creators went live</p>
                <p>• 8 new premium matches available</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
