'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/apiClient';
import { Bell, Heart, MessageCircle, UserPlus, Radio, Gift, Loader2, Settings, Check, X, Sparkles, TrendingUp, Calendar, Star, MoreHorizontal, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';

const notificationConfig: Record<string, { icon: any; color: string; gradient: string }> = {
  like: { icon: Heart, color: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-500/10' },
  follow: { icon: UserPlus, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-500/10' },
  comment: { icon: MessageCircle, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-500/10' },
  stream: { icon: Radio, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-500/10' },
  gift: { icon: Gift, color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-500/10' },
  message: { icon: MessageCircle, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-500/10' },
  mention: { icon: Bell, color: 'text-[#ff007f]', gradient: 'from-[#ff007f]/20 to-[#7a00cc]/20' },
  milestone: { icon: Star, color: 'text-amber-400', gradient: 'from-amber-500/20 to-orange-500/20' },
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/notifications', token);
      const list = Array.isArray(data) ? data : data?.notifications ?? data?.data ?? [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    if (!token) return;
    setMarkingAll(true);
    try {
      await apiPost('/api/notifications/read-all', {}, token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
    setMarkingAll(false);
  };

  const markRead = async (id: string) => {
    if (!token) return;
    try {
      await apiPost(`/api/notifications/${id}/read`, {}, token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const pinnedNotifications = notifications.filter((n: any) => n.pinned || (n.type === 'milestone'));
  const normalNotifications = filtered.filter((n: any) => !n.pinned && n.type !== 'milestone');

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load notifications</h2>
        <p className="text-sm text-white/30 mb-6">{error}</p>
        <button onClick={fetchNotifications} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
          Try Again
        </button>
      </div>
    );
  }

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
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
            <Bell size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-white/40">Stay updated with your activity</p>
          </div>
        </div>
        <Link href="/settings/notifications" className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <Settings size={15} />
        </Link>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                filter === f ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white' : 'text-gray-500 hover:text-white'
              )}
            >
              {f === 'all' ? 'All' : 'Unread'}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1 text-[9px] opacity-70">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors"
          >
            {markingAll ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
            Mark all read
          </button>
        )}
      </motion.div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/[0.04]">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/15 flex items-center justify-center mb-5">
            <Bell size={36} className="text-[#ff007f]/30" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No notifications yet</h3>
          <p className="text-sm text-white/30 max-w-sm">
            When someone likes your content, follows you, or sends you a gift, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {/* Pinned / Milestones */}
          {pinnedNotifications.map((notif: any, i: number) => {
            const config = notificationConfig[notif.type] || { icon: Bell, color: 'text-white/40', gradient: 'from-white/[0.04] to-white/[0.02]' };
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br border transition-all duration-200 cursor-pointer group',
                  !notif.read
                    ? 'bg-gradient-to-r from-[#ff007f]/5 to-[#7a00cc]/5 border-[#ff007f]/10'
                    : 'border-transparent hover:bg-white/[0.02]'
                )}
                onClick={() => !notif.read && markRead(notif.id)}
              >
                <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br border border-white/[0.06] flex items-center justify-center shrink-0', config.gradient)}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 leading-relaxed">
                    {notif.message || notif.title || 'New notification'}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {formatTimeAgo(notif.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc]" />
                  )}
                  <button className="p-1.5 rounded-lg text-white/10 hover:text-white/40 transition opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Normal Notifications */}
          {normalNotifications.length > 0 && (
            <>
              {pinnedNotifications.length > 0 && (
                <div className="h-2" />
              )}
              {normalNotifications.map((notif: any, i: number) => {
                const config = notificationConfig[notif.type] || { icon: Bell, color: 'text-white/40', gradient: 'from-white/[0.04] to-white/[0.02]' };
                const Icon = config.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer group',
                      !notif.read
                        ? 'bg-white/[0.03] border border-white/[0.06]'
                        : 'hover:bg-white/[0.02] border border-transparent'
                    )}
                    onClick={() => !notif.read && markRead(notif.id)}
                  >
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br border border-white/[0.06] flex items-center justify-center shrink-0', config.gradient)}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 leading-relaxed">
                        {notif.message || notif.title || 'New notification'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/30">{formatTimeAgo(notif.createdAt)}</span>
                        {notif.type === 'stream' && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-[8px] font-bold text-red-400">LIVE</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc]" />
                      )}
                      <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}