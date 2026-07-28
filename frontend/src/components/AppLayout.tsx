'use client';

import React, { useState, useEffect, memo, lazy, Suspense, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import {
  MessageCircle,
  Video,
  Bell,
  User,
  Search,
  Wallet,
  Settings,
  LogOut,
  X,
  Home,
  Compass,
  Users,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import SparkLiveLogo, { SparkLiveSidebarLogo, SparkLiveNavbarLogo } from '@/components/ui/SparkLiveLogo';
import GlobalSearch from '@/components/search/GlobalSearch';
import Avatar from '@/components/ui/Avatar';

// Lazy load heavy components
const BottomNavigation = lazy(() => import('./BottomNavigation'));

// Navigation items
const mainNavItems = [
  { href: '/discover', icon: Compass, label: 'Explore' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/live', icon: Video, label: 'Live' },
  { href: '/notification', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

// Background effects
const BackgroundEffects = memo(function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#7a00cc] opacity-[0.03] blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#ff007f] opacity-[0.02] blur-[180px]" />
      <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-[#00d8ff] opacity-[0.02] blur-[120px]" />
    </div>
  );
});

// Mobile menu drawer
const MobileMenu = memo(function MobileMenu({
  open,
  onClose,
  pathname,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  onLogout: () => void;
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
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-[#0e0e16] border-r border-white/[0.06] lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center">
                  <SparkLiveLogo size={14} className="text-white" />
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

            <nav className="p-3 space-y-0.5">
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
                        ? 'bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 text-white'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    )}
                  >
                    <Icon size={17} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 w-full text-sm text-red-400 hover:bg-white/[0.04] transition"
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

// Main AppLayout component
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(pathname || '');
  const isChatPage = pathname?.startsWith('/messages');

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
        {/* Left Sidebar - Desktop Navigation */}
        <aside className="hidden lg:flex h-screen w-[280px] flex-col border-r border-white/[0.06] bg-[#0e0e16]/80 backdrop-blur-2xl fixed left-0 top-0 z-40">
          {/* Logo */}
          <div className="px-4 pt-5 pb-3">
              <Link href="/discover">
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
                <Link href="/bookmarks" className="nav-item">
                  <Bookmark size={16} />
                  <span>Bookmarks</span>
                </Link>
                <Link href="/creator" className="nav-item">
                  <Sparkles size={16} />
                  <span>Creator Studio</span>
                </Link>
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
        <main className={cn('flex-1 min-h-screen', 'lg:ml-[280px]')}>
          {/* Mobile header */}
          <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/[0.05] hover:text-white transition"
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              </button>
              <Link href="/discover">
                <SparkLiveNavbarLogo />
              </Link>
              <Avatar
                src={user?.avatar}
                alt={user?.username || 'User'}
                size="sm"
                status="online"
                onClick={() => router.push('/profile')}
              />
            </div>
          </div>

          <div className={cn('pb-24 lg:pb-10', !isChatPage && 'px-4 py-5 lg:px-6 xl:px-8', isChatPage && '')}>
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
            <BottomNavigation />
          </Suspense>
        </div>

        {/* Mobile Menu Drawer */}
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          pathname={pathname || ''}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}