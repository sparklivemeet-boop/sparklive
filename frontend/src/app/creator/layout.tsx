"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, FileText, Radio, DollarSign, Crown, Users, BarChart3,
  MessageCircle, Wallet, Bell, Sparkles, Shield, ChevronLeft,
  ChevronRight, Menu, LogOut, Search, Settings, Activity,
  Video, Lightbulb
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import GlassCard from '@/components/ui/GlassCard';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { href: '/creator', label: 'Home', icon: Home },
      { href: '/creator/content', label: 'Content Manager', icon: FileText },
    ],
  },
  {
    label: 'Studio',
    items: [
      { href: '/creator/live', label: 'Live Studio', icon: Radio },
    ],
  },
  {
    label: 'Earnings',
    items: [
      { href: '/creator/earnings', label: 'Earnings', icon: DollarSign },
      { href: '/creator/subscriptions', label: 'Subscriptions', icon: Crown },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/creator/community', label: 'Community', icon: Users },
      { href: '/creator/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/creator/inbox', label: 'Inbox', icon: MessageCircle },
    ],
  },
  {
    label: 'Monetization',
    items: [
      { href: '/creator/monetization', label: 'Monetization', icon: Wallet },
      { href: '/creator/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/creator/ai', label: 'AI Tools', icon: Sparkles },
      { href: '/creator/security', label: 'Security', icon: Shield },
    ],
  },
];

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isCreator = user?.role === 'creator' || user?.role === 'admin' || user?.role === 'moderator';

  // Show a loading state while auth is being restored
  // This prevents showing the login prompt on page refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500/60" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass rounded-[28px] p-12 text-center max-w-md mx-4">
          <Radio size={48} className="text-pink-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Creator Studio</h2>
          <p className="text-sm text-gray-400 mt-2">Sign in to access your creator dashboard.</p>
          <button onClick={() => router.push('/login')} className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:brightness-110 transition-all">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} glass-strong border-r border-white/[0.06] flex flex-col`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06]">
          <Link href="/creator" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-white text-sm tracking-tight">SparkLive <span className="text-pink-400">Studio</span></span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {sidebarOpen && <p className="px-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-semibold">{section.label}</p>}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive ? 'bg-gradient-to-r from-pink-500/15 to-purple-600/15 text-white border border-pink-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}>
                      <Icon size={sidebarOpen ? 18 : 20} className="shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut size={18} /> {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-white/[0.06] glass flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-1.5 border border-white/[0.06]">
              <Search size={14} className="text-gray-500" />
              <input type="text" placeholder="Search studio..." className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-40 lg:w-60" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">ONLINE</span>
            </div>

            <button className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center">5</span>
            </button>

            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                <Avatar src={user?.avatar} alt={user?.username || 'Creator'} size="sm" status="online" />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white leading-tight">{user?.fullName || user?.username}</p>
                  <p className="text-[10px] text-gray-400">Creator</p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl border border-white/[0.08] shadow-elevated overflow-hidden z-50">
                    <div className="p-3 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings size={14} /> Settings
                      </button>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Activity size={14} /> Dashboard
                      </button>
                      <hr className="border-white/[0.06] my-1" />
                      <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}