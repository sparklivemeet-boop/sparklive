'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Link as LinkIcon, Calendar, Shield, MoreHorizontal, Share2, Edit3, Check, X, Upload, Loader2 } from 'lucide-react';
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
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="relative">
      {/* Banner / Cover Image */}
      <div
        className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-3xl overflow-hidden group"
        onMouseEnter={() => setBannerHover(true)}
        onMouseLeave={() => setBannerHover(false)}
      >
        {/* Banner Image */}
        {profile?.bannerUrl ? (
          <motion.img
            src={profile.bannerUrl}
            alt="Profile banner"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, filter: 'blur(10px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/10" />
        )}

        {/* Banner Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/40 to-transparent" />

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
                <button
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
                </button>
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
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 sm:px-6 -mt-16 sm:-mt-20 md:-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-[#07070d] overflow-hidden shadow-2xl">
              <Avatar
                src={profile?.avatarUrl}
                alt={profile?.fullName || profile?.username || 'User'}
                size="2xl"
                className="w-full h-full"
              />
              
              {/* Online Indicator */}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#07070d] shadow-lg shadow-emerald-500/30" />

              {/* Verified Badge */}
              {profile?.verified && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-[#07070d]">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* LIVE Badge */}
              {isLive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-bold text-white tracking-wider shadow-lg shadow-red-500/30">
                  LIVE
                </div>
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
          </div>

          {/* Name & Bio */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {profile?.fullName || profile?.username || 'User'}
                  </h1>
                  {profile?.verified && (
                    <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#00d8ff] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Check size={13} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-white/40 font-medium mt-0.5">
                  @{profile?.username || 'user'}
                </p>
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
                            {['Report', 'Block', 'Copy Profile Link'].map((item) => (
                              <button
                                key={item}
                                className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                {item}
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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

            {/* Bio */}
            {profile?.bio && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base text-white/60 mt-3 max-w-2xl leading-relaxed"
              >
                {profile.bio}
              </motion.p>
            )}

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3"
            >
              {profile?.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-[#00d8ff] hover:text-[#06f7ff] transition-colors"
                >
                  <LinkIcon size={13} />
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
            </motion.div>

            {/* Creator Badges */}
            {profile?.badges && profile.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-2 mt-3"
              >
                {profile.badges.map((badge: any, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/20 text-pink-300"
                  >
                    {badge.icon && <span className="text-xs">{badge.icon}</span>}
                    {badge.label}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}