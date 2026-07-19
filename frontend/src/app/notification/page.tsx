"use client";

import { useEffect, useState } from 'react';
import { Heart, UserPlus, MessageCircle, Gift, Radio, Wallet, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiDelete } from '@/lib/apiClient';
import { formatTimeAgo } from '@/lib/utils';

const notificationIcons: Record<string, any> = {
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  gift: Gift,
  live: Radio,
  message: MessageCircle,
  wallet: Wallet,
  system: Bell,
};

const notificationColors: Record<string, string> = {
  like: 'text-rose-400 bg-rose-500/10',
  follow: 'text-blue-400 bg-blue-500/10',
  comment: 'text-cyan-400 bg-cyan-500/10',
  gift: 'text-amber-400 bg-amber-500/10',
  live: 'text-red-400 bg-red-500/10',
  message: 'text-purple-400 bg-purple-500/10',
  wallet: 'text-emerald-400 bg-emerald-500/10',
  system: 'text-gray-400 bg-gray-500/10',
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const data = await apiGet<any>('/api/notifications', token);
        setNotifications(data.items || []);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await apiPut('/api/notifications/read-all', {}, token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await apiPut(`/api/notifications/${id}/read`, {}, token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await apiDelete(`/api/notifications/${id}`, token);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : activeFilter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-10">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-[24px] p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="space-y-6">
        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Inbox</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Notifications</h1>
              <p className="text-sm text-gray-400 mt-2">Stay updated with your activity and community interactions.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleMarkAllRead} className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition">
                <CheckCheck size={14} /> Mark all read
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {['all', 'unread', 'like', 'follow', 'comment', 'gift', 'live', 'message', 'wallet', 'system'].map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === filter ? 'bg-gradient-spark text-white shadow-[0_0_20px_rgba(255,0,127,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="glass rounded-[32px] p-12 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification: any) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || 'text-gray-400 bg-gray-500/10';
              return (
                <div key={notification.id} onClick={() => handleMarkRead(notification.id)}
                  className={`glass rounded-[20px] p-4 transition-all hover:bg-white/[0.06] cursor-pointer ${
                    !notification.read ? 'border-l-2 border-[#ff007f]' : ''
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{notification.body}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                    <button onClick={(e) => handleDelete(notification.id, e)}
                      className="p-2 text-gray-500 hover:text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}