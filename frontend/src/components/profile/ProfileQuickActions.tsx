'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Calendar, Wallet, TrendingUp, BarChart3, PenSquare,
  Award, Sparkles, Zap, Crown, Gift, Eye, Clock, DollarSign,
  Activity, Target, Users, Star, ChevronRight, Play, Film
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  badge?: string | number;
  onClick?: () => void;
  href?: string;
}

interface ProfileQuickActionsProps {
  isLive?: boolean;
  liveViewers?: number;
  upcomingStream?: { title: string; date: string } | null;
  walletBalance?: number;
  creatorEarnings?: number;
  draftPosts?: number;
  analytics?: {
    views: number;
    followers: number;
    engagement: number;
  } | null;
  badges?: any[];
  onGoLive?: () => void;
  onCreatePost?: () => void;
  onViewStudio?: () => void;
  onViewAnalytics?: () => void;
  onViewWallet?: () => void;
  onViewBadges?: () => void;
}

export default function ProfileQuickActions({
  isLive,
  liveViewers,
  upcomingStream,
  walletBalance,
  creatorEarnings,
  draftPosts,
  analytics,
  badges,
  onGoLive,
  onCreatePost,
  onViewStudio,
  onViewAnalytics,
  onViewWallet,
  onViewBadges,
}: ProfileQuickActionsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards: QuickActionCard[] = [
    ...(isLive !== undefined ? [{
      id: 'live-status',
      title: isLive ? '🔴 Live Now' : 'Go Live',
      description: isLive ? `${liveViewers?.toLocaleString() || 0} watching` : 'Start streaming',
      icon: <Radio size={18} />,
      gradient: isLive
        ? 'from-red-500/20 to-rose-600/20'
        : 'from-[#ff007f]/10 to-[#7a00cc]/10',
      glowColor: isLive ? 'shadow-red-500/20' : 'shadow-[#ff007f]/20',
      badge: isLive ? 'LIVE' : undefined,
      onClick: onGoLive,
    }] : []),
    ...(upcomingStream ? [{
      id: 'upcoming-stream',
      title: upcomingStream.title,
      description: upcomingStream.date,
      icon: <Calendar size={18} />,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      glowColor: 'shadow-blue-500/20',
      badge: 'Scheduled',
      onClick: () => {},
    }] : []),
    ...(walletBalance !== undefined ? [{
      id: 'wallet',
      title: 'Wallet Balance',
      description: `$${walletBalance.toLocaleString()}`,
      icon: <Wallet size={18} />,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      glowColor: 'shadow-emerald-500/20',
      onClick: onViewWallet,
    }] : []),
    ...(creatorEarnings !== undefined ? [{
      id: 'earnings',
      title: 'Creator Earnings',
      description: `$${creatorEarnings.toLocaleString()} this month`,
      icon: <DollarSign size={18} />,
      gradient: 'from-amber-500/10 to-orange-500/10',
      glowColor: 'shadow-amber-500/20',
      badge: '+12%',
      onClick: onViewWallet,
    }] : []),
    {
      id: 'creator-studio',
      title: 'Creator Studio',
      description: 'Manage your content',
      icon: <PenSquare size={18} />,
      gradient: 'from-purple-500/10 to-pink-500/10',
      glowColor: 'shadow-purple-500/20',
      onClick: onViewStudio,
    },
    ...(draftPosts && draftPosts > 0 ? [{
      id: 'drafts',
      title: 'Draft Posts',
      description: `${draftPosts} draft${draftPosts > 1 ? 's' : ''} pending`,
      icon: <PenSquare size={18} />,
      gradient: 'from-slate-500/10 to-gray-500/10',
      glowColor: 'shadow-slate-500/20',
      badge: draftPosts,
      onClick: onCreatePost,
    }] : []),
    ...(analytics ? [{
      id: 'analytics',
      title: 'Analytics Snapshot',
      description: `${analytics.views.toLocaleString()} views · ${analytics.engagement}% eng.`,
      icon: <BarChart3 size={18} />,
      gradient: 'from-cyan-500/10 to-blue-500/10',
      glowColor: 'shadow-cyan-500/20',
      onClick: onViewAnalytics,
    }] : []),
    ...(badges && badges.length > 0 ? [{
      id: 'badges',
      title: 'Badges Collection',
      description: `${badges.length} badge${badges.length > 1 ? 's' : ''} earned`,
      icon: <Award size={18} />,
      gradient: 'from-amber-500/10 to-yellow-500/10',
      glowColor: 'shadow-amber-500/20',
      badge: badges.length,
      onClick: onViewBadges,
    }] : []),
  ];

  if (cards.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">
          Quick Actions
        </h3>
        <span className="text-[9px] text-white/20">{cards.length} available</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={card.onClick}
            className={cn(
              'relative rounded-2xl border p-4 text-left transition-all duration-300 overflow-hidden group',
              `bg-gradient-to-br ${card.gradient}`,
              'border-white/[0.06] hover:border-white/[0.12]',
              card.glowColor
            )}
          >
            {/* Hover glow effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.03), transparent 40%)`,
              }}
            />

            {/* Animated border glow on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 20px rgba(255,0,127,0.05)`,
              }}
            />

            {/* Icon container */}
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300',
              'bg-white/[0.04] border border-white/[0.06]',
              'group-hover:bg-white/[0.08] group-hover:border-white/[0.1]'
            )}>
              <span className="text-white/60 group-hover:text-white/80 transition-colors">
                {card.icon}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                {card.title}
              </p>
              <p className="text-[10px] text-white/40 mt-1 line-clamp-1">
                {card.description}
              </p>
            </div>

            {/* Badge */}
            {card.badge && (
              <div className="absolute top-3 right-3">
                <span className={cn(
                  'px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider',
                  card.id === 'live-status'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/[0.06] text-white/50'
                )}>
                  {card.badge}
                </span>
              </div>
            )}

            {/* Arrow indicator */}
            <motion.div
              className="absolute bottom-3 right-3 text-white/20 group-hover:text-white/40 transition-colors"
              animate={hoveredCard === card.id ? { x: 2 } : { x: 0 }}
            >
              <ChevronRight size={14} />
            </motion.div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-3 right-3 h-[1px] rounded-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}