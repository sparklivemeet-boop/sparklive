"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, UserCog, FileText, Radio, Wallet, Gift,
  Building2, Bell, TrendingUp, ScrollText, Server, Shield,
  ChevronLeft, ChevronRight, Menu, X, LogOut, Search,
  Settings, BellDot, Activity, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR', 'SUPPORT_AGENT', 'FINANCE_MANAGER', 'CONTENT_REVIEWER'];

interface NavSection {
  label: string;
  items: { href: string; label: string; icon: any; roles: string[] }[];
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { href: '/admin', label: 'Overview', icon: BarChart3, roles: ADMIN_ROLES },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR', 'SUPPORT_AGENT'] },
      { href: '/admin/communication', label: 'Communication', icon: Bell, roles: ['SUPER_ADMIN', 'ADMINISTRATOR'] },
      { href: '/admin/creators', label: 'Creators', icon: UserCog, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR', 'CONTENT_REVIEWER'] },
      { href: '/admin/content', label: 'Content', icon: FileText, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR', 'CONTENT_REVIEWER'] },
      { href: '/admin/live', label: 'Live Streams', icon: Radio, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/finance', label: 'Finance', icon: Wallet, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'FINANCE_MANAGER'] },
      { href: '/admin/gifts', label: 'Gifts', icon: Gift, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'FINANCE_MANAGER'] },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/admin/communities', label: 'Communities', icon: Building2, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'] },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell, roles: ['SUPER_ADMIN', 'ADMINISTRATOR'] },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'FINANCE_MANAGER'] },
      { href: '/admin/audit', label: 'Audit Logs', icon: ScrollText, roles: ['SUPER_ADMIN', 'ADMINISTRATOR'] },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/admin/compliance', label: 'Compliance', icon: Shield, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR', 'CONTENT_REVIEWER'] },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { href: '/admin/infrastructure', label: 'Infrastructure', icon: Server, roles: ['SUPER_ADMIN', 'ADMINISTRATOR'] },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const hasAdminAccess = user && ADMIN_ROLES.includes(user.role as any);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Redirect non-admin users — only after auth finishes loading
  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.push('/login');
    }
  }, [isLoading, token, router]);

  if (!user || !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass rounded-[28px] p-12 text-center max-w-md mx-4">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Admin Access Required</h2>
          <p className="text-sm text-gray-400 mt-2">
            You need admin privileges to access this dashboard.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-6"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const roleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-500/20 text-red-300',
      ADMINISTRATOR: 'bg-purple-500/20 text-purple-300',
      MODERATOR: 'bg-blue-500/20 text-blue-300',
      SUPPORT_AGENT: 'bg-green-500/20 text-green-300',
      FINANCE_MANAGER: 'bg-yellow-500/20 text-yellow-300',
      CONTENT_REVIEWER: 'bg-cyan-500/20 text-cyan-300',
    };
    return colors[role] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          glass-strong border-r border-white/[0.06] flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-white text-sm tracking-tight">SparkLive <span className="text-pink-400">Admin</span></span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {sidebarOpen && (
                <p className="px-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-semibold">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items
                  .filter((item) => item.roles.includes(user?.role as any))
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-200
                          ${isActive
                            ? 'bg-gradient-to-r from-pink-500/15 to-purple-600/15 text-white border border-pink-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <Icon size={sidebarOpen ? 18 : 20} className="shrink-0" />
                        {sidebarOpen && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/[0.06] p-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/[0.06] glass flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-1.5 border border-white/[0.06]">
              <Search size={14} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search admin..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-40 lg:w-60"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">LIVE</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
              <BellDot size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Avatar src={user?.avatar} alt={user?.username || 'Admin'} size="sm" status="online" />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white leading-tight">{user?.fullName || user?.username}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleBadgeColor(user?.role || '')}`}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl border border-white/[0.08] shadow-elevated overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings size={14} /> Settings
                      </button>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Activity size={14} /> Activity Log
                      </button>
                      <hr className="border-white/[0.06] my-1" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}