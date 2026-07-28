'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Video, Play, Heart, MessageCircle, Download, Share2,
  ExternalLink, X, ChevronLeft, ChevronRight, Grid3X3, LayoutGrid,
  Maximize2, Clock, Eye, Film, Music, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'gif' | 'audio';
  url: string;
  thumbnail?: string;
  title?: string;
  width?: number;
  height?: number;
  duration?: string;
  likes?: number;
  comments?: number;
  views?: number;
  createdAt: string;
  album?: string;
}

interface ProfileMediaGalleryProps {
  media: MediaItem[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function MediaLightbox({ items, index, onClose }: { items: MediaItem[]; index: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const current = items[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 transition-all z-10"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-xs text-white/70">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Media */}
      <motion.div
        key={currentIndex}
        className="max-w-[90vw] max-h-[85vh] relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === 'video' ? (
          <video
            src={current.url}
            controls
            className="max-w-[90vw] max-h-[85vh] rounded-2xl"
            poster={current.thumbnail}
            autoPlay
          />
        ) : (
          <img
            src={current.url}
            alt={current.title || `Media ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
          />
        )}

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div>
              {current.title && (
                <p className="text-sm font-medium text-white">{current.title}</p>
              )}
              <p className="text-[10px] text-white/50">
                {current.duration && `${current.duration} · `}
                {new Date(current.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {current.likes !== undefined && (
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Heart size={12} />
                  {current.likes}
                </span>
              )}
              {current.views !== undefined && (
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Eye size={12} />
                  {current.views}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom actions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all">
          <Download size={16} />
        </button>
        <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all">
          <Share2 size={16} />
        </button>
        <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all">
          <ExternalLink size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function MediaCard({ item, index, onClick }: { item: MediaItem; index: number; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <img
        src={item.thumbnail || item.url}
        alt={item.title || 'Media'}
        className={cn(
          'w-full h-full object-cover transition-all duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          'group-hover:scale-110'
        )}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />

      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a28] to-[#0e0e16] animate-pulse" />
      )}

      {/* Type badge */}
      {item.type === 'video' && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] text-white/80 flex items-center gap-1">
          <Play size={10} fill="white" />
          {item.duration || 'Video'}
        </div>
      )}
      {item.type === 'gif' && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] text-white/80 font-bold">
          GIF
        </div>
      )}
      {item.type === 'audio' && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] text-white/80 flex items-center gap-1">
          <Music size={10} />
          Audio
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        {item.title && (
          <p className="text-xs font-medium text-white truncate">{item.title}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-white/70">
          {item.likes !== undefined && (
            <span className="flex items-center gap-1 text-[10px]">
              <Heart size={10} />
              {item.likes}
            </span>
          )}
          {item.comments !== undefined && (
            <span className="flex items-center gap-1 text-[10px]">
              <MessageCircle size={10} />
              {item.comments}
            </span>
          )}
          {item.views !== undefined && (
            <span className="flex items-center gap-1 text-[10px]">
              <Eye size={10} />
              {item.views}
            </span>
          )}
        </div>
      </div>

      {/* Album indicator */}
      {item.album && (
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[8px] text-white/60">
          {item.album}
        </div>
      )}
    </motion.div>
  );
}

export default function ProfileMediaGallery({ media, loading, onLoadMore, hasMore }: ProfileMediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square rounded-2xl bg-white/[0.02] border border-white/[0.04] skeleton" />
        ))}
      </div>
    );
  }

  if (!media || media.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Image size={24} className="text-white/20" />
        </div>
        <h3 className="text-white/50 font-medium text-base mb-1">No media yet</h3>
        <p className="text-white/25 text-sm max-w-xs">Photos and videos will appear here</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Media</h3>
          <span className="text-[10px] text-white/30">{media.length} items</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
            )}
          >
            <Grid3X3 size={13} />
          </button>
          <button
            onClick={() => setViewMode('masonry')}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'masonry' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
            )}
          >
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={cn(
        'gap-3',
        viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'columns-2 sm:columns-3 lg:columns-4'
      )}>
        <AnimatePresence mode="popLayout">
          {media.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              index={index}
              onClick={() => openLightbox(index)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoadMore}
            className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            Load More
          </motion.button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <MediaLightbox
            items={media}
            index={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}