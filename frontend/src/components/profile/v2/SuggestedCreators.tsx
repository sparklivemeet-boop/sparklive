'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedCreator {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  category?: string;
  followers: number;
  mutualFollowers?: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function SuggestedCreators({ creators = [] }: { creators: SuggestedCreator[] }) {
  if (creators.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-[#00d8ff]" />
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">Suggested Creators</h3>
      </div>
      <div className="space-y-2">
        {creators.slice(0, 3).map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 overflow-hidden border border-white/[0.06] shrink-0">
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

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/70 truncate group-hover:text-white transition-colors">
                {creator.fullName || creator.username}
              </p>
              <p className="text-[9px] text-white/30">
                {formatNumber(creator.followers)} followers
                {creator.mutualFollowers && creator.mutualFollowers > 0 && (
                  <span> · {creator.mutualFollowers} mutual</span>
                )}
              </p>
            </div>

            {/* Follow Button */}
            <button className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] flex items-center justify-center hover:shadow-lg hover:shadow-pink-500/20 transition-all">
              <UserPlus size={11} className="text-white" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}