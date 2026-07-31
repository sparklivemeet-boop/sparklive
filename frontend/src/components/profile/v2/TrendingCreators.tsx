'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingCreator {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  category?: string;
  followers: number;
  views: number;
  trend: 'hot' | 'rising' | 'new';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function TrendingCreators({ creators = [] }: { creators: TrendingCreator[] }) {
  if (creators.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-emerald-400" />
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Trending</h3>
      </div>
      <div className="space-y-2">
        {creators.slice(0, 4).map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 overflow-hidden border border-white/[0.06]">
                {creator.avatarUrl ? (
                  <img src={creator.avatarUrl} alt={creator.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/40">
                      {creator.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              {/* Trend indicator */}
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#0a0a0f]',
                creator.trend === 'hot' ? 'bg-red-500' : creator.trend === 'rising' ? 'bg-emerald-500' : 'bg-blue-500'
              )}>
                <Flame size={6} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/70 truncate group-hover:text-white transition-colors">
                {creator.fullName || creator.username}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-white/30">
                <span className="flex items-center gap-1">
                  <Users size={7} /> {formatNumber(creator.followers)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={7} /> {formatNumber(creator.views)}
                </span>
              </div>
            </div>

            {/* Trend tag */}
            <span className={cn(
              'text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
              creator.trend === 'hot' ? 'text-red-400 bg-red-500/10' : 
              creator.trend === 'rising' ? 'text-emerald-400 bg-emerald-500/10' : 
              'text-blue-400 bg-blue-500/10'
            )}>
              {creator.trend}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}