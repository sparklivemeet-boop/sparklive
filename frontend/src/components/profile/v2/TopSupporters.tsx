'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Crown, Medal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Supporter {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  amount: number;
  rank: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function TopSupporters({ supporters = [] }: { supporters: Supporter[] }) {
  if (supporters.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={14} className="text-amber-400" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Top Supporters</h3>
        </div>
        <p className="text-[11px] text-white/30 text-center py-3">No supporters yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <Gift size={14} className="text-amber-400" />
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Top Supporters</h3>
      </div>
      <div className="space-y-2">
        {supporters.slice(0, 5).map((supporter, i) => {
          const rankIcons = [Crown, Medal, Medal];
          const RankIcon = rankIcons[i];
          const isTop3 = i < 3;

          return (
            <motion.div
              key={supporter.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
            >
              {/* Rank Badge */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                isTop3 ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20' : 'bg-white/[0.04] border border-white/[0.06]'
              )}>
                {isTop3 ? (
                  <RankIcon size={12} className="text-amber-400" />
                ) : (
                  <span className="text-[10px] font-bold text-white/40">{supporter.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 overflow-hidden border border-white/[0.06]">
                  {supporter.avatarUrl ? (
                    <img src={supporter.avatarUrl} alt={supporter.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/40">
                        {supporter.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                {i === 0 && (
                  <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/70 truncate group-hover:text-white transition-colors">
                  {supporter.fullName || supporter.username}
                </p>
                <p className="text-[9px] text-white/30">@{supporter.username}</p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-[11px] font-bold text-amber-400">{formatNumber(supporter.amount)}</p>
                <p className="text-[7px] text-white/20 uppercase tracking-wider">Coins</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}