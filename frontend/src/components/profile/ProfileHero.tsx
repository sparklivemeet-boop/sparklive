'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Camera, MapPin, Link as LinkIcon, Calendar, Shield, MoreHorizontal,
  Share2, Edit3, Check, X, Upload, Loader2, Heart, MessageCircle,
  Eye, Star, Sparkles, Music, Gamepad2, Palette, BookOpen, Trophy,
  Monitor, Smartphone, Users, ChevronDown, Gift, Zap, Crown, Award,
  Flame, Mail, Bell, Copy, ExternalLink, Flag, Volume2,
  Target, Activity, Circle, Diamond, QrCode, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

interface ProfileHeroProps {
  profile: any;
  isOwnProfile: boolean;
  isLive: boolean;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onAvatarUpload: (file: File) => Promise<void>;
  onBannerUpload: (file: File) => Promise<void>;
}

const CATEGORY_ICONS: Record<string, any> = {
  music: Music, gaming: Gamepad2, creative: Palette, education: BookOpen,
  sports: Trophy, tech: Monitor, lifestyle: Heart, mobile: Smartphone,
  chatting: MessageCircle,
};

export default function ProfileHero({
  profile,
  isOwnProfile,
  isLive,
  onEditProfile,
  onShareProfile,
  onAvatarUpload,
  onBannerUpload,
}: ProfileHeroProps) {
  const [bannerHover, setBannerHover] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const bannerParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bannerScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6]);
  const infoY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const infoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  }, []);

  const handleBannerUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      await onBannerUpload(file);
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  }, [onBannerUpload]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await onAvatarUpload(file);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }, [onAvatarUpload]);

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const CategoryIcon = profile?.creatorCategory ? CATEGORY_ICONS[profile.creatorCategory.toLowerCase()] : null;
  const isGoldVerified = profile?.verified === 'gold' || profile?.verificationType === 'gold';
  const profileCompletion = profile?.profileCompletion ?? 
    (profile?.bio ? 20 : 0) + 
    (profile?.avatarUrl ? 20 : 0) + 
    (profile?.bannerUrl ? 20 : 0) + 
    (profile?.website ? 15 : 0) + 
    (profile?.city ? 15 : 0) + 
    (profile?.occupation ? 10 : 0);

  return (
    <div
      ref={heroRef}
      className="relative"
      onMouseMove={handleMouseMove}
    >
      {/* Banner / Cover Image with Parallax */}
      <div
        className="relative h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 rounded-3xl overflow-hidden group"
        onMouseEnter={() => setBannerHover(true)}
        onMouseLeave={() => setBannerHover(false)}
      >
        {/* Parallax Wrapper */}
        <motion.div
          className="absolute inset-0"
          style={{ y: bannerParallaxY, scale: bannerScale, opacity: bannerOpacity }}
        >
          {/* Animated gradient lighting effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(800px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,0,127,0.15), transparent 50%)`,
            }}
          />

          {/* Banner Image */}
          {profile?.bannerUrl ? (
            <motion.img
              src={profile.bannerUrl}
              alt="Profile banner"
              className="w-full h-[130%] object-cover"
              initial={{ scale: 1.1, filter: 'blur(20px)' }}
              animate={imageLoaded ? { scale: 1, filter: 'blur(0px)' } : {}}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/10">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#ff007f]/10 via-transparent to-[#00d8ff]/10"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              />
            </div>
          )}
        </motion.div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070d]/40 via-transparent to-[#07070d]/20" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#07070d]/60 to-transparent" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.03] pointer-events-none" />

        {/* Live Stream Overlay */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xl rounded-full px-3 py-1.5 border border-red-500/30 shadow-lg shadow-red-500/20">
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-red-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
              <span className="text-[10px] text-white/50 ml-1">
                {formatCount(profile?.currentStream?.viewerCount || 0)} watching
              </span>
            </div>
            {profile?.currentStream?.category && (
              <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/[0.08]">
                {CategoryIcon && <CategoryIcon size={10} className="text-white/60" />}
                <span className="text-[10px] text-white/60">{profile.currentStream.category}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Profile completion indicator */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4"
          >
            <div className="group relative">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/[0.08]">
                <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center relative">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, #ff007f ${profileCompletion}%, transparent ${profileCompletion}%)`,
                    }}
                  />
                  <div className="absolute inset-[2px] rounded-full bg-black/80 flex items-center justify-center">
                    <Check size={8} className={profileCompletion >= 80 ? 'text-emerald-400' : 'text-white/40'} />
                  </div>
                </div>
                <span className="text-[9px] text-white/60 font-medium">
                  {profileCompletion}% complete
                </span>
              </div>
              <div className="absolute right-0 top-full mt-2 px-3 py-2 rounded-xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <p className="text-[10px] text-white/70">Profile Strength</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden min-w-[80px]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#ff007f] to-[#00d8ff]"
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="text-[9px] text-white/50">{profileCompletion}%</span>
                </div>
                {profileCompletion < 100 && (
                  <p className="text-[8px] text-white/30 mt-1">Complete your profile to appear in search</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Editable Banner Overlay */}
        {isOwnProfile && (
          <AnimatePresence>
            {(bannerHover || uploadingBanner) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-white text-sm font-medium hover:bg-white/25 transition-all disabled:opacity-50"
                >
                  {uploadingBanner ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                  {uploadingBanner ? 'Uploading...' : 'Change Cover'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleBannerUpload}
          aria-label="Upload banner image"
        />

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} className="text-white/30" />
          </motion.div>
        </motion.div>
      </div>

      {/* Profile Info Section */}
      <motion.div
        style={{ y: infoY, opacity: infoOpacity }}
        className="relative px-4 sm:px-6 -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          {/* Avatar with Enhanced Effects */}
          <motion.div
            className="relative shrink-0"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {/* Premium glow ring */}
            <motion.div
              className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
              animate={isLive ? {
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.08, 1],
              } : avatarHover ? {
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: isGoldVerified
                  ? 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,0,127,0.3) 0%, rgba(124,58,237,0.3) 50%, rgba(0,216,255,0.3) 100%)',
              }}
            />

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-[#07070d] overflow-hidden shadow-2xl">
              <Avatar
                src={profile?.avatarUrl}
                alt={profile?.fullName || profile?.username || 'User'}
                size="2xl"
                className="w-full h-full"
              />
              
              {/* Online Indicator with pulse */}
              <motion.span
                className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#07070d] shadow-lg shadow-emerald-500/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Verification Badge - Blue or Gold */}
              {profile?.verified && (
                <motion.div
                  className={cn(
                    'absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#07070d]',
                    isGoldVerified
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/30'
                      : 'bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] shadow-cyan-500/30'
                  )}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                >
                  {isGoldVerified ? (
                    <Crown size={10} className="text-white" strokeWidth={2.5} />
                  ) : (
                    <Check size={12} className="text-white" strokeWidth={3} />
                  )}
                </motion.div>
              )}

              {/* LIVE Badge */}
              {isLive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-bold text-white tracking-wider shadow-lg shadow-red-500/30"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  LIVE
                </motion.div>
              )}
            </div>

            {/* Editable Avatar Overlay */}
            {isOwnProfile && (
              <AnimatePresence>
                {(avatarHover || uploadingAvatar) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center cursor-pointer border-4 border-[#07070d]"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {uploadingAvatar ? (
                      <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                      <Camera size={20} className="text-white" />
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
              onChange={handleAvatarUpload}
              aria-label="Upload avatar image"
            />
          </motion.div>

          {/* Name & Bio */}
          <motion.div
            className="flex-1 min-w-0 pt-2 sm:pt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <motion.h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {profile?.fullName || profile?.username || 'User'}
                  </motion.h1>
                  {profile?.verified && (
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
                        <Check size={13} className="text-white" strokeWidth={3} />
                      )}
                    </motion.span>
                  )}
                  {/* Creator Level Badge */}
                  {profile?.creatorRank?.level && (
                    <motion.div
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Crown size={12} className="text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400">Lvl {profile.creatorRank.level}</span>
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-sm sm:text-base text-white/40 font-medium">
                    @{profile?.username || 'user'}
                  </p>
                  {/* Category Badge */}
                  {CategoryIcon && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-white/30">
                      <CategoryIcon size={10} />
                      {profile.creatorCategory}
                    </span>
                  )}
                  {/* Pronouns */}
                  {profile?.pronouns && (
                    <span className="text-[10px] text-white/20 px-1.5 py-0.5 rounded-md bg-white/[0.03]">
                      {profile.pronouns}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:ml-auto">
                {isOwnProfile ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onEditProfile}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all shadow-lg"
                    >
                      <Edit3 size={15} />
                      Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onShareProfile}
                      className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                      aria-label="Share profile"
                    >
                      <Share2 size={16} />
                    </motion.button>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                        aria-label="More options"
                      >
                        <MoreHorizontal size={16} />
                      </motion.button>
                      <AnimatePresence>
                        {showMoreMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 top-full mt-2 w-48 py-2 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50"
                          >
                            {[
                              { label: 'Copy Profile Link', icon: Copy },
                              { label: 'Share via...', icon: ExternalLink },
                              { label: 'QR Code', icon: QrCode },
                              { label: 'Report', icon: Flag },
                            ].map(({ label, icon: Icon }) => (
                              <button
                                key={label}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Icon size={13} />
                                {label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold hover:shadow-xl hover:shadow-pink-500/25 transition-all"
                    >
                      Follow
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                      aria-label="Send message"
                    >
                      <Mail size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={16} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Bio with Read More */}
            {profile?.bio && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3"
              >
                <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
                  {profile.bio.length > 150 && !showBio
                    ? `${profile.bio.slice(0, 150)}...`
                    : profile.bio
                  }
                  {profile.bio.length > 150 && (
                    <button
                      onClick={() => setShowBio(!showBio)}
                      className="ml-1 text-[#00d8ff] hover:text-[#06f7ff] text-xs font-medium transition-colors"
                    >
                      {showBio ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </p>
              </motion.div>
            )}

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3"
            >
              {profile?.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-[#00d8ff] hover:text-[#06f7ff] transition-colors group"
                >
                  <LinkIcon size={13} className="group-hover:rotate-12 transition-transform" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile?.city && (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
                  <MapPin size={13} />
                  {profile.city}{profile?.country ? `, ${profile.country}` : ''}
                </span>
              )}
              {profile?.createdAt && (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
                  <Calendar size={13} />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {profile?.occupation && (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
                  <Shield size={13} />
                  {profile.occupation}
                </span>
              )}
              {profile?.languages && profile.languages.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40">
                  <Globe size={13} />
                  {profile.languages.join(', ')}
                </span>
              )}
            </motion.div>

            {/* Creator Badges */}
            {profile?.badges && profile.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-2 mt-3"
              >
                {profile.badges.slice(0, 5).map((badge: any, i: number) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/20 text-pink-300 hover:bg-[#ff007f]/20 transition-colors cursor-default"
                  >
                    {badge.icon && <span className="text-xs">{badge.icon}</span>}
                    {badge.label}
                  </motion.span>
                ))}
                {profile.badges.length > 5 && (
                  <span className="text-[10px] text-white/30">+{profile.badges.length - 5} more</span>
                )}
              </motion.div>
            )}

            {/* Social Proof - Top Fans / Recent Supporters */}
            {profile?.topFans && profile.topFans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex items-center gap-3 mt-4"
              >
                <div className="flex -space-x-2">
                  {profile.topFans.slice(0, 5).map((fan: any, i: number) => (
                    <motion.div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#07070d] overflow-hidden"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                    >
                      <Avatar src={fan.avatar} alt={fan.name} size="xs" className="w-full h-full" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-[10px] text-white/40">
                  <span className="text-white/60 font-medium">{profile.topFans.length}</span> top fans
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}