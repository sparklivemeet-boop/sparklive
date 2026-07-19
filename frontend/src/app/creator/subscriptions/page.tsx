"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, TrendingUp, DollarSign, Check, Plus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { apiGet } from '@/lib/apiClient';

export default function SubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const d = await apiGet('/api/creator/subscriptions'); setData(d); }
      catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={14} className="text-pink-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Subscriptions</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your subscription tiers and view subscriber analytics.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>New Tier</Button>
      </div>
      <GlassCard>
        <p className="text-sm text-gray-500">Subscription data will appear here. Create your first subscription tier to start.</p>
      </GlassCard>
    </div>
  );
}