'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Loader2,
  Gift,
  User,
  MoreHorizontal,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface Reel {
  id: string;
  videoUrl?: string;
  thumbnail?: string;
  description?: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  music?: string;
  hashtags?: string[];
  liked?: boolean;
  saved?: boolean;
}

export default function ReelsPage() {
  const { token } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/reels', token).catch(() => ({ reels: [] }));
      const reelList = Array.isArray(data) ? data : data?.reels ?? data?.data ?? [];
      setReels(reelList);
    } catch (err: any) {
      setError(err.message || 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setCurrentIndex(prev => Math.min(reels.length - 1, prev + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setPlaying(prev => !prev);
      } else if (e.key === 'm') {
        setMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reels.length]);

  const currentReel = reels[currentIndex];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Loader2 size={28} className="text-white/40 animate-spin" />
          </div>
          <p className="text-sm text-white/30">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Loader2 size={24} className="text-red-400" />
          </div>
          <p className="text-sm text-white/50">{error}</p>
          <button onClick={fetchReels} className="btn-primary text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff007f]/10 to-[#7c3aed]/10 border border-[#ff007f]/15 flex items-center justify-center">
            <Play size={36} className="text-[#ff007f]/30 ml-1" />
          </div>
          <h3 className="text-lg font-bold text-white">No reels yet</h3>
          <p className="text-sm text-white/30 max-w-sm">
            Reels from creators you follow will appear here.
          </p>
          <button onClick={fetchReels} className="btn-primary text-sm">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black lg:static lg:min-h-screen lg:bg-[#0a0a0f] flex items-center justify-center"
    >
      {/* Reels Container */}
      <div className="relative w-full h-full lg:max-w-[420px] lg:max-h-[90vh] lg:rounded-3xl lg:overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReel.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Video Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff007f]/5 via-[#7c3aed]/5 to-[#06f7ff]/5">
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end p-4 pb-20 lg:pb-4">
              {/* Top info */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.1] text-[10px] font-bold text-white/80 backdrop-blur-sm">
                    Reels
                  </span>
                  {currentReel.music && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.1] text-[10px] text-white/60 backdrop-blur-sm">
                      <Music size={10} />
                      {currentReel.music}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMuted(!muted)}
                  className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] transition"
                >
                  {muted ? <VolumeX size={14} className="text-white/80" /> : <Volume2 size={14} className="text-white/80" />}
                </button>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                  {currentReel.description}
                </p>
                {currentReel.hashtags && currentReel.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentReel.hashtags.map(tag => (
                      <span key={tag} className="text-xs text-[#06f7ff]">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    src={currentReel.author.avatar}
                    alt={currentReel.author.username}
                    size="md"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7c3aed] flex items-center justify-center">
                    <Plus size={8} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{currentReel.author.fullName}</p>
                  <p className="text-[10px] text-white/50">@{currentReel.author.username}</p>
                </div>
                <button className="ml-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7c3aed] text-[10px] font-bold text-white">
                  Follow
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-24 lg:bottom-4 z-20 flex flex-col items-center gap-4">
              <button className="flex flex-col items-center gap-1 group">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  currentReel.liked ? 'bg-[#ff007f]/20' : 'bg-white/[0.1] hover:bg-white/[0.2] backdrop-blur-sm'
                )}>
                  <Heart size={18} className={currentReel.liked ? 'text-[#ff007f] fill-[#ff007f]' : 'text-white'} />
                </div>
                <span className="text-[10px] text-white/60 font-medium">
                  {currentReel.likes > 0 ? (currentReel.likes >= 1000 ? `${(currentReel.likes / 1000).toFixed(1)}K` : currentReel.likes) : ''}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] transition">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <span className="text-[10px] text-white/60 font-medium">
                  {currentReel.comments > 0 ? (currentReel.comments >= 1000 ? `${(currentReel.comments / 1000).toFixed(1)}K` : currentReel.comments) : ''}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] transition">
                  <Share2 size={18} className="text-white" />
                </div>
                <span className="text-[10px] text-white/60 font-medium">
                  {currentReel.shares > 0 ? (currentReel.shares >= 1000 ? `${(currentReel.shares / 1000).toFixed(1)}K` : currentReel.shares) : ''}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition',
                  currentReel.saved ? 'bg-[#06f7ff]/20' : 'bg-white/[0.1] hover:bg-white/[0.2]'
                )}>
                  <Bookmark size={18} className={currentReel.saved ? 'text-[#06f7ff] fill-[#06f7ff]' : 'text-white'} />
                </div>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] transition">
                  <Gift size={18} className="text-white" />
                </div>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] transition z-20"
          >
            <ChevronUp size={16} className="text-white" />
          </button>
        )}
        {currentIndex < reels.length - 1 && (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center backdrop-blur-sm hover:bg-white/[0.2] transition z-20"
          >
            <ChevronDown size={16} className="text-white" />
          </button>
        )}

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-0.5 p-1">
          {reels.slice(0, Math.min(reels.length, 10)).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-0.5 rounded-full transition-all duration-300',
                i === currentIndex ? 'bg-white' : 'bg-white/30',
                i > currentIndex && 'bg-white/15'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}