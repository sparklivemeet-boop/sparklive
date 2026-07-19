"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Monitor, Play, Clock, Users, MessageCircle, Gift, Eye, Activity } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { apiGet } from '@/lib/apiClient';

export default function CreatorLivePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { await apiGet('/api/creator/live/config'); } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radio size={14} className="text-pink-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Live Streams</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Go Live</h1>
        <p className="text-sm text-gray-400 mt-1">Configure and start your live stream.</p>
      </div>
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">Live stream configuration available. Set up your stream to go live.</p>
        </div>
      </GlassCard>
    </div>
  );
}