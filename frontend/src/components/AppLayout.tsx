'use client';

import React, { useState, useEffect, memo, lazy, Suspense, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Video,
  Bell,
  User,
  Wallet,
  Settings,
  LogOut,
  X,
  Home,
  Compass,
  Bookmark,
  Sparkles,
  Plus,
  Gift,
  Crown,
  HelpCircle,
  Menu,
} from 'lucide-react';
import SparkLiveLogo, { SparkLiveSidebarLogo, SparkLiveNavbarLogo } from '@/components/ui/SparkLiveLogo';
import GlobalSearch from '@/components/search/GlobalSearch';
import Avatar from '@/components/ui/Avatar';
import CreateHub from '@/components/create/CreateHub';
import { useContentCreation } from '@/components/create/ContentCreationContext';

// Lazy load heavy components
const BottomNavigation = lazy(() => import('./BottomNavigation'));

// Navigation items — V2 Information Architecture
const mainNavItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/live', icon: Video, label: 'Live' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/notification', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

const quickLinks = [
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/creator', icon: Sparkles, label: 'Creator Studio' },
  { href: '/gift-store', icon: Gift, label: 'Gift Store' },
  { href: '/rewards', icon: Crown, label: 'Rewards' },
];

const bottomLinks = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/help', icon: HelpCircle, label: 'Help Center' },
];

// Background effects — premium aurora
const BackgroundEffects = memo(function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#7a00cc] opacity-[0.03] blur-[150px] animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#ff007f] opacity-[0.02] blur-[180px] animate-float-delayed" />
      <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-[#00d8ff] opacity-[0.02] blur-[120px] animate-orb" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] rounded-full bg-[#3b82f6] opacity-[0.015] blur-[100px] animate-float" />
    </div>
  );
});

// Mobile menu drawer — premium redesign
const MobileMenu = memo(function MobileMenu({
  open,
  onClose,
  pathname,
  onLogout,
  user,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  onLogout: () => void;
  user?: any;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 bottom-0 z-50 w-[300px] bg-[#0e0e16]/95 backdrop-blur-2xl border-r border-white/[0.06] lg:hidden flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
                  <SparkLiveLogo size={16} className="text-white" />
                </div>
                <span className="text-base font-bold text-white">SparkLive</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/[0.05] transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* User card */}
            {user && (
              <div className="px-4 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    alt={user.username || 'User'}
                    size="md"
                    status="online"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{user.fullName || user.username || 'Guest'}</p>
                    <p className="text-[10px] text-gray-500">@{user.username || 'user'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2" role="navigation" aria-label="Main navigation">
              <div className="space-y-0.5">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 text-white border border-[#ff007f]/10'
                          : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                      )}
                    >
                      <Icon size={17} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Links */}
              <div className="mt-6 px-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-3 px-2">
                  Quick Links
                </p>
                <div className="space-y-0.5">
                  {quickLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white transition-all"
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-white/[0.06] px-3 py-2 shrink-0">
              {bottomLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white transition-all"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 w-full text-sm text-red-400 hover:bg-white/[0.04] transition mt-1"
                aria-label="Logout"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

// Main AppLayout component — V2 Redesign
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCreateHubOpen, openCreateHub, closeCreateHub } = useContentCreation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(pathname || '');
  const isChatPage = pathname?.startsWith('/messages');
  const isReelsPage = pathname?.startsWith('/reels');
  const isHomePage = pathname === '/home';

  const handleLogout = useCallback(() => {
    logout();
    setMobileMenuOpen(false);
  }, [logout]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white">
      <BackgroundEffects />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Sidebar — Desktop Navigation (V2 Redesign) */}
        <aside className="hidden lg:flex h-screen w-[280px] flex-col border-r border-white/[0.06] bg-[#0e0e16]/80 backdrop-blur-2xl fixed left-0 top-0 z-40">
          {/* Logo */}
          <div className="px-4 pt-5 pb-3">
            <Link href="/home">
              <SparkLiveSidebarLogo />
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
            <GlobalSearch />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-hide px-3" role="navigation" aria-label="Main navigation">
            <div className="space-y-0.5">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 group relative',
                      isActive
                        ? 'bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 text-white border border-[#ff007f]/10'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className={cn(
                      'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                      isActive ? 'bg-gradient-to-br from-[#ff007f] to-[#7a00cc] shadow-[0_0_16px_rgba(255,0,127,0.2)]' : 'bg-transparent'
                    )}>
                      <Icon size={17} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-[#ff007f] to-[#7a00cc]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="mt-6 px-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-3 px-2">
                Quick Links
              </p>
              <div className="space-y-0.5">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-item"
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom links */}
            <div className="mt-6 px-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-3 px-2">
                Support
              </p>
              <div className="space-y-0.5">
                {bottomLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-item"
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User profile footer */}
          <div className="border-t border-white/[0.06] px-3 py-3">
            <div
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03] transition cursor-pointer"
              onClick={() => router.push('/profile')}
            >
              <Avatar
                src={user?.avatar}
                alt={user?.username || 'User'}
                size="md"
                status="online"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName || user?.username || 'Guest'}</p>
                <p className="text-[10px] text-gray-500">@{user?.username || 'user'}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/[0.05] transition"
                aria-label="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={cn(
          'flex-1 min-h-screen',
          'lg:ml-[280px]',
          isReelsPage && 'lg:ml-0'
        )}>
          {/* Mobile header */}
          <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/[0.05] hover:text-white transition"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <Link href="/home">
                <SparkLiveNavbarLogo />
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreateHub}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20"
                  aria-label="Create"
                >
                  <Plus size={16} className="text-white" />
                </button>
                <Avatar
                  src={user?.avatar}
                  alt={user?.username || 'User'}
                  size="sm"
                  status="online"
                  onClick={() => router.push('/profile')}
                />
              </div>
            </div>
          </div>

          <div className={cn(
            'pb-24 lg:pb-10',
            !isChatPage && !isReelsPage && !isHomePage && 'px-4 py-5 lg:px-6 xl:px-8',
            isChatPage && '',
            isReelsPage && 'px-0 py-0',
            isHomePage && 'px-0 py-0'
          )}>
            <motion.div
              key={isClient ? pathname : 'initial'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Bottom Navigation for Mobile/Tablet */}
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
          <Suspense fallback={<div className="h-16 bg-[#0e0e16]/90" />}>
            <BottomNavigation onCreateClick={openCreateHub} />
          </Suspense>
        </div>

        {/* Mobile Menu Drawer */}
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          pathname={pathname || ''}
          onLogout={handleLogout}
          user={user}
        />

        {/* Create Hub Modal */}
        <CreateHub
          open={isCreateHubOpen}
          onClose={closeCreateHub}
        />

        {/* Desktop Floating Create Button - TikTok style */}
        {isHomePage && (
          <motion.button
            onClick={openCreateHub}
            className="hidden lg:flex fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7a00cc] items-center justify-center shadow-2xl shadow-[#ff007f]/30 hover:shadow-[#ff007f]/40 hover:scale-110 active:scale-95 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 20, stiffness: 200 }}
            aria-label="Create"
          >
            <Plus size={22} className="text-white" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
