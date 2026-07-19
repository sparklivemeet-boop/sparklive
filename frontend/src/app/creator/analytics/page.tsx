"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Clock, Heart, MessageCircle, Share2, DollarSign, Activity } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { apiGet } from '@/lib/apiClient';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const d = await apiGet('/api/creator/analytics'); setData(d); }
      catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-pink-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Analytics</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Creator Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Track your performance and growth metrics.</p>
      </div>
      <GlassCard>
        <p className="text-sm text-gray-500">Analytics data will appear here once you have sufficient activity. Start creating content and streaming to see your metrics.</p>
      </GlassCard>
    </div>
  );
}