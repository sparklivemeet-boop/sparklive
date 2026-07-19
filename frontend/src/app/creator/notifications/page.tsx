"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Heart, Gift, UserPlus, MessageCircle, Radio, Check, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { apiGet } from '@/lib/apiClient';

export default function CreatorNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const d: any = await apiGet('/api/creator/notifications'); setNotifications(d?.recentNotifications || d || []); }
      catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bell size={14} className="text-pink-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Notifications</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Stay updated with your latest activity.</p>
      </div>

      {notifications.length > 0 ? notifications.map((n: any, i: number) => (
        <motion.div key={n.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`glass rounded-[20px] p-4 border ${n.isRead ? 'border-white/[0.06]' : 'border-pink-500/20 bg-pink-500/[0.02]'}`}>
          <div className="flex items-center gap-3">
            <div className="text-sm text-white">{n.message || n.body}</div>
          </div>
        </motion.div>
      )) : (
        <GlassCard>
          <div className="text-center py-8">
            <Bell size={32} className="mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-400">No notifications yet.</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}