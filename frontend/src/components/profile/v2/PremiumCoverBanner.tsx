'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, ChevronDown, Sparkles } from 'lucide-react';

interface PremiumCoverBannerProps {
  bannerUrl?: string;
  isOwnProfile: boolean;
  isLive: boolean;
  viewerCount?: number;
  onBannerUpload?: (file: File) => Promise<void>;
}

export default function PremiumCoverBanner({
  bannerUrl,
  isOwnProfile,
  isLive,
  viewerCount = 0,
  onBannerUpload,
}: PremiumCoverBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerHover, setBannerHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ['start start', 'end start'],
  });

  const bannerScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  }, []);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onBannerUpload) return;
    setUploading(true);
    try {
      await onBannerUpload(file);
    } finally {
      setUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  }, [onBannerUpload]);

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div
      ref={bannerRef}
      className="relative h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-3xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setBannerHover(true)}
      onMouseLeave={() => setBannerHover(false)}
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0"
        style={{ scale: bannerScale, opacity: bannerOpacity }}
      >
        {/* Banner Image or Animated Gradient */}
        {bannerUrl ? (
          <motion.img
            src={bannerUrl}
            alt="Cover"
            className="w-full h-[130%] object-cover"
            initial={{ scale: 1.1, filter: 'blur(20px)' }}
            animate={imageLoaded ? { scale: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a14] via-[#1a0a2e] to-[#0a0a14]">
            {/* Aurora gradient animation */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(800px circle at 20% 30%, rgba(255,0,127,0.12), transparent 50%)',
                  'radial-gradient(800px circle at 80% 60%, rgba(122,0,204,0.12), transparent 50%)',
                  'radial-gradient(800px circle at 40% 80%, rgba(0,216,255,0.08), transparent 50%)',
                  'radial-gradient(800px circle at 20% 30%, rgba(255,0,127,0.12), transparent 50%)',
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            {/* Animated gradient lines */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)',
              }}
            />
          </div>
        )}

        {/* Mouse-following spotlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,0,127,0.08), transparent 50%)`,
          }}
        />

        {/* Floating particles */}
        {!bannerUrl && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  opacity: p.opacity,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [p.opacity, p.opacity * 2, p.opacity],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Gradient Overlays */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: overlayOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-[#07070d]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070d]/50 via-transparent to-[#07070d]/30" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#07070d]/70 to-transparent" />
      </motion.div>

      {/* Glass overlay effect */}
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />

      {/* Inner border ring */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />

      {/* Live Stream Badge */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 z-20"
          >
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-2xl rounded-full px-3.5 py-2 border border-red-500/30 shadow-lg shadow-red-500/20">
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-red-500"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">LIVE</span>
              <span className="text-[10px] text-white/50">
                {viewerCount >= 1000
                  ? `${(viewerCount / 1000).toFixed(1)}K`
                  : viewerCount} watching
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-4 right-4 z-20"
      >
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-2xl rounded-full px-3 py-1.5 border border-amber-500/20">
          <Sparkles size={10} className="text-amber-400" />
          <span className="text-[9px] font-semibold text-amber-400/80 uppercase tracking-wider">Premium</span>
        </div>
      </motion.div>

      {/* Editable Banner Overlay */}
      {isOwnProfile && onBannerUpload && (
        <AnimatePresence>
          {(bannerHover || uploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-30"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/20 text-white text-sm font-medium hover:bg-white/25 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                {uploading ? 'Uploading...' : 'Change Cover'}
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
        onChange={handleUpload}
        aria-label="Upload banner"
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-white/20" />
        </motion.div>
      </motion.div>
    </div>
  );
}