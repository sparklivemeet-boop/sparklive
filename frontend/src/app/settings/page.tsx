'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Settings, Bell, Shield, Palette, Globe, Smartphone, HelpCircle, CreditCard, LogOut, ChevronRight, Sparkles, Lock, Eye, User, Moon, Sun, Wifi, Download, Users, MessageCircle, Radio, Gift, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const settingsGroups = [
  {
    title: 'General',
    items: [
      { icon: Palette, label: 'Appearance', href: '/settings/appearance', description: 'Theme, colors, layout', color: 'from-pink-500/20 to-purple-500/20', iconColor: 'text-pink-400' },
      { icon: Globe, label: 'Language', href: '/settings/language', description: 'App language & region', color: 'from-cyan-500/20 to-blue-500/20', iconColor: 'text-cyan-400' },
      { icon: Bell, label: 'Notifications', href: '/settings/notifications', description: 'Push, email, in-app alerts', color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { icon: Lock, label: 'Privacy', href: '/settings/privacy', description: 'Profile, messages, visibility', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-400' },
      { icon: Shield, label: 'Security', href: '/settings/security', description: 'Password, 2FA, sessions', color: 'from-red-500/20 to-rose-500/20', iconColor: 'text-red-400' },
      { icon: Eye, label: 'What\'s New', href: '/settings/whats-new', description: 'Latest features & updates', color: 'from-[#00d8ff]/20 to-[#3b82f6]/20', iconColor: 'text-[#00d8ff]' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: CreditCard, label: 'Payments', href: '/settings/payments', description: 'Payment methods & billing', color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
      { icon: Smartphone, label: 'Devices', href: '/settings/device', description: 'Connected devices & sessions', color: 'from-[#7a00cc]/20 to-[#3b82f6]/20', iconColor: 'text-[#7a00cc]' },
      { icon: HelpCircle, label: 'Help & Support', href: '/settings/help', description: 'FAQ, contact, feedback', color: 'from-amber-500/20 to-yellow-500/20', iconColor: 'text-amber-400' },
    ],
  },
  {
    title: 'Content & Social',
    items: [
      { icon: Radio, label: 'Stream Settings', href: '/settings/stream', description: 'Stream quality, chat, moderation', color: 'from-red-500/20 to-pink-500/20', iconColor: 'text-red-400' },
      { icon: MessageCircle, label: 'Chat Preferences', href: '/settings/chat', description: 'Message privacy, filters, blocks', color: 'from-[#ff007f]/20 to-[#7a00cc]/20', iconColor: 'text-[#ff007f]' },
      { icon: Gift, label: 'Gifts & Tips', href: '/settings/gifts', description: 'Gift settings, tipping, revenue', color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
    ],
  },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
          <Settings size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/40">Customize your SparkLive experience</p>
        </div>
      </motion.div>

      {/* Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Link
          href="/profile"
          className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-[#ff007f]/5 via-[#7a00cc]/5 to-[#00d8ff]/5 border border-white/[0.06] p-5 hover:bg-white/[0.04] transition-all duration-200 group"
        >
          <div className="relative">
            <Avatar src={user?.avatar} alt={user?.username || 'User'} size="lg" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-base">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-sm text-white/40">@{user?.username}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-medium text-emerald-400 border border-emerald-500/20">Online</span>
              <span className="text-[10px] text-white/20">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
        </Link>
      </motion.div>

      {/* Settings Groups */}
      {settingsGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + gi * 0.05 }}
        >
          <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-3 px-1">{group.title}</h2>
          <div className="rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
            {group.items.map((item, ii) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-all duration-200 group"
              >
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br border border-white/[0.06] flex items-center justify-center', item.color, item.iconColor)}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-white/30">{item.description}</p>
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-3xl bg-red-500/5 border border-red-500/10 p-5 text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <LogOut size={16} className="text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Log Out</p>
            <p className="text-xs text-red-400/60">Sign out of your account</p>
          </div>
          <ChevronRight size={14} className="text-red-400/30 group-hover:text-red-400/60 transition-colors" />
        </button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-[10px] text-white/10 pb-4">SparkLive v2.0 · Premium</p>
    </motion.div>
  );
}