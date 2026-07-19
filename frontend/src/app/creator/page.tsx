"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, DollarSign, Gift, Crown, Eye, TrendingUp, Heart,
  Radio, Clock, Bell, ChevronRight, Activity, Target, Play,
  Calendar, PenSquare, Sparkles
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { apiGet } from "@/lib/apiClient";

interface CreatorHomeData {
  todayFollowers: number;
  todayRevenue: number;
  todayGifts: number;
  todaySubscribers: number;
  liveViewers: number;
  videoViews: number;
  watchTimeLabel: string;
  engagementRate: number;
  estimatedEarnings: number;
  growthChart: Array<{ date: string; followers: number; views: number }>;
  recentNotifications: Array<{
    id: string; type: string; message: string;
    createdAt: string; isRead: boolean;
  }>;
}

const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toLocaleString();
const fmtCurrency = (n: number) => "$" + fmt(n);

export default function CreatorDashboard() {
  const [data, setData] = useState<CreatorHomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiGet<CreatorHomeData>('/api/creator/dashboard');
        setData(result);
      } catch (err) {
        console.error('Failed to load creator dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-[24px] p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
              <div className="h-8 bg-white/10 rounded w-3/4" />
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
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Creator</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-2">Your creator overview and performance metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Users size={18} className="text-rose-400" />
              </div>
              <p className="text-sm text-gray-400">Today Followers</p>
            </div>
            <p className="text-2xl font-bold text-white">{data ? fmt(data.todayFollowers) : '—'}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <p className="text-sm text-gray-400">Today Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">{data ? fmtCurrency(data.todayRevenue) : '—'}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Gift size={18} className="text-amber-400" />
              </div>
              <p className="text-sm text-gray-400">Today Gifts</p>
            </div>
            <p className="text-2xl font-bold text-white">{data ? fmt(data.todayGifts) : '—'}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Crown size={18} className="text-purple-400" />
              </div>
              <p className="text-sm text-gray-400">Subscribers</p>
            </div>
            <p className="text-2xl font-bold text-white">{data ? fmt(data.todaySubscribers) : '—'}</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}