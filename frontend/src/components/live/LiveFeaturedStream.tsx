'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Heart, Gift, Share2, Bookmark, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';

interface LiveFeaturedStreamProps {
  stream?: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    viewerCount: number;
    likeCount?: number;
    giftCount?: number;
    category: string;
    language?: string;
    quality?: string;
    creator: {
      name: string;
      username: string;
      avatar?: string;
      verified?: boolean;
      level?: number;
      followers?: number;
    };
    topSupporters?: { name: string; avatar?: string; amount: number }[];
  } | null;
}

export default function LiveFeaturedStream({ stream }: LiveFeaturedStreamProps) {
  // Don't render if no real stream data
  if (!stream) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl group">
      <div className="relative aspect-[21/9] min-h-[350px] sm:min-h-[420px] lg:min-h-[480px] bg-gradient-to-br from-[#1a1a28] to-[#0e0e16]">
        {/* Thumbnail */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/40 to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/90 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                <motion.span
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                LIVE
              </div>
              {stream.quality && (
                <div className="px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white/80 border border-white/[0.08]">
                  {stream.quality}
                </div>
              )}
              {stream.category && (
                <div className="px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/60 border border-white/[0.08]">
                  {stream.category}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/[0.08] text-white/60 hover:text-white transition-all" aria-label="Share">
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-4">
            {/* Creator Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <div className="relative">
                <Avatar src={stream.creator?.avatar} alt={stream.creator?.name || 'Creator'} size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{stream.creator?.name || 'Creator'}</span>
                  {stream.creator?.verified && (
                    <span className="w-5 h-5 rounded-full bg-[#00d8ff] flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                  {stream.creator?.level && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff007f]/20 to-[#7a00cc]/20 text-[10px] font-bold text-[#ff007f] border border-[#ff007f]/20">
                      Lvl {stream.creator.level}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50">{stream.creator?.username || ''}</p>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-2xl leading-tight tracking-tight">
                {stream.title}
              </h2>
              {stream.description && (
                <p className="text-sm text-white/50 mt-2 max-w-xl line-clamp-2">{stream.description}</p>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/[0.06]">
                <Eye size={14} className="text-red-400" />
                <span className="text-sm font-bold text-white tabular-nums">
                  {(stream.viewerCount || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-white/40">watching</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/50">
                <Heart size={16} />
                <span>{(stream.likeCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/50">
                <Gift size={16} className="text-amber-400" />
                <span>{(stream.giftCount || 0).toLocaleString()}</span>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all">
                <Play size={16} fill="white" />
                Join Live
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}