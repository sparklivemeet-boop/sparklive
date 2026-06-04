'use client';

import React from 'react';
import BottomNavigation from './BottomNavigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Video, Bell, User, Sparkles, Shield, Bookmark } from 'lucide-react';

const navItems = [
  { href: '/discover', icon: Home, label: 'Discover' },
  { href: '/messages', icon: MessageCircle, label: 'Chat' },
  { href: '/live', icon: Video, label: 'Live' },
  { href: '/notification', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/register', '/'].includes(pathname || '');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,0,127,0.16),_transparent_24%),radial-gradient(circle_at_10%_20%,_rgba(122,0,204,0.12),_transparent_16%),radial-gradient(circle_at_80%_10%,_rgba(0,216,255,0.08),_transparent_14%)]" />
      <div className="relative flex min-h-screen w-full">
        <aside className="hidden lg:flex h-full w-72 flex-col gap-6 border-r border-white/10 bg-black/30 px-4 py-6 backdrop-blur-xl">
          <div className="space-y-4">
            <Link href="/discover" className="inline-flex items-center gap-3 text-2xl font-black tracking-tight text-white">
              <Sparkles size={28} /> SparkLive
            </Link>
            <p className="text-sm text-gray-400">A modern desktop social hub for discovery, livestreams, and real-time chat.</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-3xl px-4 py-3 transition ${
                    isActive ? 'bg-white/10 text-white shadow-[0_0_30px_rgba(255,255,255,0.08)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 text-sm text-gray-300 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
            <p className="uppercase tracking-[0.3em] text-xs text-gray-400">Profile</p>
            <p className="mt-3 font-semibold text-white">Julian Spark</p>
            <p className="mt-1 text-sm text-gray-400">Creator & host</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/5 px-3 py-2 text-xs text-gray-300">Live</span>
              <span className="rounded-full bg-white/5 px-3 py-2 text-xs text-gray-300">23 following</span>
            </div>
          </div>

          <div className="mt-auto space-y-3 rounded-[32px] border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
            <p className="uppercase tracking-[0.25em] text-xs text-gray-400">Workspace</p>
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-black/30 p-3">
              <div>
                <p className="text-sm font-semibold text-white">Recommended</p>
                <p className="text-xs text-gray-400">Live creators & trending posts</p>
              </div>
              <Bookmark size={18} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-3xl bg-black/30 p-3">
              <div>
                <p className="text-sm font-semibold text-white">Security</p>
                <p className="text-xs text-gray-400">Privacy controls</p>
              </div>
              <Shield size={18} />
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 lg:px-6 xl:px-8">
          {children}
        </main>

        <aside className="hidden xl:flex h-full w-80 flex-col gap-6 border-l border-white/10 bg-black/30 px-4 py-6 backdrop-blur-xl">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <p className="uppercase tracking-[0.25em] text-sm text-gray-400">Trending</p>
            <h2 className="mt-3 text-xl font-bold">Live creators</h2>
            <div className="mt-5 space-y-3">
              {['NovaStar', 'EchoPulse', 'VibeQueen'].map((creator) => (
                <div key={creator} className="rounded-3xl bg-black/50 p-3">
                  <p className="font-semibold text-white">{creator}</p>
                  <p className="text-xs text-gray-400">Live now • {Math.floor(Math.random()*9)+1}k viewers</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <p className="uppercase tracking-[0.25em] text-sm text-gray-400">Online</p>
            <div className="mt-4 space-y-3">
              {['Ari', 'Luna', 'Noah'].map((friend) => (
                <div key={friend} className="flex items-center justify-between rounded-3xl bg-black/50 p-3">
                  <span>{friend}</span>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200">Online</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <p className="uppercase tracking-[0.25em] text-sm text-gray-400">Activity</p>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <p>• 12 new messages</p>
              <p>• 4 streams trending</p>
              <p>• 6 profiles matched</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
        <BottomNavigation />
      </div>
    </div>
  );
}
