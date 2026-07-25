'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Heart, Gift, Bookmark, Share2, Check, Clock, Radio, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { formatNumber } from '@/lib/utils';

interface LiveStreamCardProps {
  stream: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    viewerCount: number;
    likeCount?: number;
    giftCount?: number;
    category: string;
    language?: string;
    quality?: string;
    duration?: string;
    trending?: boolean;
    creator: {
      name: string;
      username: string;
      avatar?: string;
      verified?: boolean;
      level?: number;
    };
  };
  index?: number;
}

export default function LiveStreamCard({ stream, index = 0 }: LiveStreamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-[#ff007f]/20 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-[#1a1a28] to-[#0e0e16] overflow-hidden">
        {stream.thumbnailUrl ? (
          <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio size={32} className="text-[#ff007f]/20" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/90 text-[9px] font-bold text-white shadow-lg">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-white"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE
          </div>
          {stream.quality && (
            <div className="px-1.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white/70">
              {stream.quality}
            </div>
          )}
        </div>

        {/* Bottom Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[9px] text-white/80">
            <Eye size={10} />
            <span className="tabular-nums">{formatNumber(stream.viewerCount)}</span>
          </div>
          {stream.duration && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[9px] text-white/60">
              <Clock size={10} />
              {stream.duration}
            </div>
          )}
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div initial={{ scale: 0.8 }} whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </motion.div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="text-sm font-semibold text-white truncate">{stream.title}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={stream.creator.avatar} alt={stream.creator.name} size="xs" />
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs text-white/50 truncate max-w-[80px]">{stream.creator.name}</span>
              {stream.creator.verified && (
                <span className="w-3 h-3 rounded-full bg-[#00d8ff] flex items-center justify-center shrink-0">
                  <Check size={6} className="text-white" strokeWidth={3} />
                </span>
              )}
            </div>
          </div>
          <span className="text-[9px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.04] shrink-0 ml-2">
            {stream.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}