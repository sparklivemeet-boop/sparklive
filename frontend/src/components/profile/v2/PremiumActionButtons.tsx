'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Heart, Gift, Share2, MoreHorizontal,
  Edit3, Radio, Wallet, BarChart3, PenSquare, Copy,
  ExternalLink, QrCode, Flag, Sparkles, Zap, Send,
} from 'lucide-react';

interface PremiumActionButtonsProps {
  isOwnProfile: boolean;
  isLive?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onSendSparkCoin?: () => void;
  onShare?: () => void;
  onEditProfile?: () => void;
  onGoLive?: () => void;
  onViewWallet?: () => void;
  onViewAnalytics?: () => void;
  onViewStudio?: () => void;
}

export default function PremiumActionButtons({
  isOwnProfile,
  isLive,
  onFollow,
  onMessage,
  onSendSparkCoin,
  onShare,
  onEditProfile,
  onGoLive,
  onViewWallet,
  onViewAnalytics,
  onViewStudio,
}: PremiumActionButtonsProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.();
  };

  if (isOwnProfile) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewStudio}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all"
        >
          <PenSquare size={15} />
          Studio
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewWallet}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all"
        >
          <Wallet size={15} />
          Wallet
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all"
        >
          <BarChart3 size={15} />
          Analytics
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoLive}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold hover:shadow-xl hover:shadow-pink-500/25 transition-all"
        >
          <Radio size={15} />
          {isLive ? 'Manage Stream' : 'Go Live'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all"
          aria-label="Share"
        >
          <Share2 size={16} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Follow Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleFollow}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
          isFollowing
            ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
            : 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white hover:shadow-xl hover:shadow-pink-500/25'
        }`}
      >
        <Heart size={15} className={isFollowing ? 'fill-red-400 text-red-400' : ''} />
        {isFollowing ? 'Following' : 'Follow'}
      </motion.button>

      {/* Message Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onMessage}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all"
      >
        <MessageCircle size={15} />
        Message
      </motion.button>

      {/* Send Spark Coin */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSendSparkCoin}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
      >
        <Gift size={15} />
        <span className="hidden sm:inline">Send Spark</span>
        <Sparkles size={12} className="text-amber-400" />
      </motion.button>

      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onShare}
        className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all"
        aria-label="Share"
      >
        <Share2 size={16} />
      </motion.button>

      {/* More Button */}
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
    </div>
  );
}