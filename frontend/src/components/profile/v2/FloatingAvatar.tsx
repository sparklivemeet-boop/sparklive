'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Check, Crown, Shield, Star } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface FloatingAvatarProps {
  avatarUrl?: string;
  username?: string;
  isOwnProfile: boolean;
  isLive: boolean;
  isVerified?: boolean;
  isGoldVerified?: boolean;
  level?: number;
  onAvatarUpload?: (file: File) => Promise<void>;
}

export default function FloatingAvatar({
  avatarUrl,
  username,
  isOwnProfile,
  isLive,
  isVerified,
  isGoldVerified,
  level = 1,
  onAvatarUpload,
}: FloatingAvatarProps) {
  const [avatarHover, setAvatarHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAvatarUpload) return;
    setUploading(true);
    try {
      await onAvatarUpload(file);
    } finally {
      setUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      className="relative shrink-0"
      onMouseEnter={() => setAvatarHover(true)}
      onMouseLeave={() => setAvatarHover(false)}
      initial={{ scale: 0.6, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      {/* Premium glow ring - animated */}
      <motion.div
        className="absolute -inset-4 rounded-full pointer-events-none"
        animate={
          isLive
            ? {
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.1, 1],
              }
            : avatarHover
            ? {
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.06, 1],
              }
            : { opacity: 0.2, scale: 1 }
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: isGoldVerified
            ? 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,0,127,0.3) 0%, rgba(124,58,237,0.3) 50%, rgba(0,216,255,0.3) 100%)',
        }}
      />

      {/* Avatar container */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border-[3px] border-[#07070d] overflow-hidden shadow-2xl shadow-black/50">
        <Avatar
          src={avatarUrl}
          alt={username || 'User'}
          size="2xl"
          className="w-full h-full"
        />

        {/* Online indicator */}
        <motion.span
          className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-[2.5px] border-[#07070d] shadow-lg shadow-emerald-500/40"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Verification Badge */}
        {isVerified && (
          <motion.div
            className={cn(
              'absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-[2.5px] border-[#07070d]',
              isGoldVerified
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/40'
                : 'bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] shadow-cyan-500/40'
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
          >
            {isGoldVerified ? (
              <Crown size={12} className="text-white" strokeWidth={2.5} />
            ) : (
              <Check size={14} className="text-white" strokeWidth={3} />
            )}
          </motion.div>
        )}

        {/* Level Badge */}
        {level > 0 && (
          <motion.div
            className="absolute -bottom-1 -left-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-bold text-white shadow-lg shadow-amber-500/30 border border-amber-300/20"
            initial={{ y: 10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            Lvl {level}
          </motion.div>
        )}

        {/* LIVE Badge */}
        {isLive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-bold text-white tracking-[0.1em] shadow-lg shadow-red-500/40"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            LIVE
          </motion.div>
        )}
      </div>

      {/* Editable Avatar Overlay */}
      {isOwnProfile && onAvatarUpload && (
        <AnimatePresence>
          {(avatarHover || uploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center cursor-pointer border-[3px] border-[#07070d] z-10"
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
        aria-label="Upload avatar"
      />
    </motion.div>
  );
}