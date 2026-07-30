'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Link as LinkIcon, Calendar, Shield, Globe, Star,
  Sparkles, Crown, Trophy, Target, TrendingUp, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatorHeroCardProps {
  fullName?: string;
  username?: string;
  bio?: string;
  creatorCategory?: string;
  creatorScore?: number;
  level?: number;
  isLive?: boolean;
  isVerified?: boolean;
  isGoldVerified?: boolean;
  city?: string;
  country?: string;
  website?: string;
  occupation?: string;
  languages?: string[];
  pronouns?: string;
  createdAt?: string;
  topPercent?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  music: '🎵', gaming: '🎮', creative: '🎨', education: '📚',
  sports: '🏆', tech: '💻', lifestyle: '❤️', mobile: '📱',
  chatting: '💬',
};

export default function CreatorHeroCard({
  fullName,
  username,
  bio,
  creatorCategory,
  creatorScore = 0,
  level = 1,
  isLive,
  isVerified,
  isGoldVerified,
  city,
  country,
  website,
  occupation,
  languages,
  pronouns,
  createdAt,
  topPercent = 0,
}: CreatorHeroCardProps) {
  const [showFullBio, setShowFullBio] = useState(false);
  const categoryIcon = creatorCategory ? CATEGORY_ICONS[creatorCategory.toLowerCase()] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="relative"
    >
      {/* Name and username row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {fullName || username || 'User'}
            </motion.h1>
            {isVerified && (
              <motion.span
                className={cn(
                  'shrink-0 w-6 h-6 rounded-full flex items-center justify-center shadow-lg',
                  isGoldVerified
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/20'
                    : 'bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] shadow-cyan-500/20'
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
              >
                {isGoldVerified ? (
                  <Crown size={11} className="text-white" strokeWidth={2.5} />
                ) : (
                  <Star size={11} className="text-white" fill="white" />
                )}
              </motion.span>
            )}
            {/* Level Badge */}
            <motion.div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Crown size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400">Lvl {level}</span>
            </motion.div>
          </div>

          {/* Username + Category */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-sm sm:text-base text-white/40 font-medium">
              @{username || 'user'}
            </p>
            {categoryIcon && (
              <span className="flex items-center gap-1 text-[11px] text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-full">
                <span>{categoryIcon}</span>
                {creatorCategory}
              </span>
            )}
            {pronouns && (
              <span className="text-[10px] text-white/20 px-1.5 py-0.5 rounded-md bg-white/[0.03]">
                {pronouns}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Creator Score + Live Status Row */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {/* Creator Score */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/15"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Sparkles size={14} className="text-[#ff007f]" />
          <span className="text-xs font-semibold text-white/80">
            Creator Score <span className="text-[#ff007f]">{creatorScore}</span>
          </span>
        </motion.div>

        {/* Live Status */}
        {isLive && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">LIVE</span>
          </motion.div>
        )}

        {/* Top Percent */}
        {topPercent > 0 && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Trophy size={12} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400">Top {topPercent}%</span>
          </motion.div>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-3"
        >
          <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
            {bio.length > 150 && !showFullBio
              ? `${bio.slice(0, 150)}...`
              : bio
            }
            {bio.length > 150 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="ml-1 text-[#00d8ff] hover:text-[#06f7ff] text-xs font-medium transition-colors"
              >
                {showFullBio ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        </motion.div>
      )}

      {/* Meta Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3"
      >
        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#00d8ff] hover:text-[#06f7ff] transition-colors group"
          >
            <LinkIcon size={13} className="group-hover:rotate-12 transition-transform" />
            {website.replace(/^https?:\/\//, '')}
          </a>
        )}
        {city && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <MapPin size={13} />
            {city}{country ? `, ${country}` : ''}
          </span>
        )}
        {createdAt && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <Calendar size={13} />
            Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        )}
        {occupation && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <Shield size={13} />
            {occupation}
          </span>
        )}
        {languages && languages.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
            <Globe size={13} />
            {languages.join(', ')}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}