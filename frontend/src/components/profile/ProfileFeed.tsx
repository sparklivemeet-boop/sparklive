'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Repeat2, MoreHorizontal, Image, Video, BarChart3, Check, Pin, Play, X, Grid3X3, List, ChevronLeft, ChevronRight, Share2, Download, ExternalLink, Radio, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';

interface Post {
  id: string;
  type: 'text' | 'image' | 'video' | 'poll';
  content: string;
  images?: string[];
  video?: string;
  poll?: {
    question: string;
    options: { label: string; votes: number }[];
    totalVotes: number;
  };
  pinned?: boolean;
  createdAt: string;
  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  liked?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
}

interface ProfileFeedProps {
  posts: Post[];
  activeTab: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  viewMode?: 'grid' | 'list';
}

function ImageLightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(index);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 transition-all z-10"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-xs text-white/70">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 text-white hover:bg-white/20 transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Image */}
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      />

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

function PostCard({ post, index, viewMode }: { post: Post; index: number; viewMode?: 'grid' | 'list' }) {
  const [liked, setLiked] = useState(post.liked || false);
  const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
  const [reposted, setReposted] = useState(post.reposted || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showPoll, setShowPoll] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const openLightbox = (imgIndex: number) => {
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now.getTime() - postDate.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return postDate.toLocaleDateString();
  };

  // Grid view - compact card
  if (viewMode === 'grid') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="group relative aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
        >
          {/* Thumbnail */}
          {post.images && post.images[0] ? (
            <img
              src={post.images[0]}
              alt={post.content}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onClick={() => openLightbox(0)}
            />
          ) : post.type === 'video' ? (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a28] to-[#0e0e16] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition">
                <Play size={20} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a28] to-[#0e0e16] p-4 flex items-center justify-center">
              <p className="text-xs text-white/40 text-center line-clamp-4">{post.content}</p>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <div className="flex items-center gap-3 text-white/80">
              <span className="flex items-center gap-1 text-[10px]">
                <Heart size={11} className={liked ? 'fill-[#ff007f] text-[#ff007f]' : ''} />
                {likeCount}
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <MessageCircle size={11} />
                {post.comments}
              </span>
              <span className="flex items-center gap-1 text-[10px] ml-auto">
                <Bookmark size={11} className={bookmarked ? 'fill-amber-400 text-amber-400' : ''} />
              </span>
            </div>
          </div>

          {/* Type badge */}
          {post.type === 'video' && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/60 text-[8px] text-white/80">
              Video
            </div>
          )}
          {post.pinned && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-black/60 text-[8px] text-white/80 flex items-center gap-1">
              <Pin size={8} />
              Pinned
            </div>
          )}
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && post.images && (
            <ImageLightbox
              images={post.images}
              index={lightboxIndex}
              onClose={() => setLightboxOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // List view - full card
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="group relative"
      >
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 p-4 sm:p-5">
          {/* Pinned indicator */}
          {post.pinned && (
            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-medium text-white/30 uppercase tracking-wider">
              <Pin size={10} />
              Pinned
            </div>
          )}

          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar 
              src={post.author.avatar} 
              alt={post.author.name} 
              size="md" 
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {post.author.name}
                  </span>
                  <span className="text-xs text-white/30 truncate">
                    @{post.author.username} · {timeAgo(post.createdAt)}
                  </span>
                </div>
                <button className="shrink-0 p-1.5 rounded-xl text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2 space-y-3">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Images with lightbox */}
                {post.images && post.images.length > 0 && (
                  <div className={cn(
                    'grid gap-2 rounded-2xl overflow-hidden',
                    post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  )}>
                    {post.images.map((img, i) => (
                      <motion.img
                        key={i}
                        src={img}
                        alt={`Post image ${i + 1}`}
                        className="w-full h-48 object-cover rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => openLightbox(i)}
                      />
                    ))}
                  </div>
                )}

                {/* Video */}
                {post.video && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 group/video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Play size={20} className="text-white ml-0.5" fill="white" />
                      </motion.div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-[10px] text-white/80">
                      {post.type === 'video' ? 'Video' : 'Stream'}
                    </div>
                    {/* Duration placeholder */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-[10px] text-white/80">
                      12:34
                    </div>
                  </div>
                )}

                {/* Poll */}
                {post.poll && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">{post.poll.question}</p>
                    {post.poll.options.map((option: any, i: number) => {
                      const percentage = post.poll!.totalVotes > 0
                        ? Math.round((option.votes / post.poll!.totalVotes) * 100)
                        : 0;
                      return (
                        <button
                          key={i}
                          onClick={() => setShowPoll(true)}
                          className="relative w-full text-left p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10"
                            initial={{ width: '0%' }}
                            animate={{ width: showPoll ? `${percentage}%` : '0%' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          />
                          <span className="relative text-sm text-white/80 z-10">{option.label}</span>
                          {showPoll && (
                            <span className="relative text-xs text-white/40 float-right mt-0.5 z-10">{percentage}%</span>
                          )}
                        </button>
                      );
                    })}
                    <p className="text-[10px] text-white/30">{post.poll.totalVotes} votes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/[0.03]">
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 0.8 }}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#ff007f] transition-colors group"
            >
              <Heart
                size={15}
                className={cn(
                  'transition-all',
                  liked ? 'fill-[#ff007f] text-[#ff007f]' : 'group-hover:scale-110'
                )}
              />
              <span className={liked ? 'text-[#ff007f]' : ''}>{likeCount}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.8 }}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#00d8ff] transition-colors"
            >
              <MessageCircle size={15} />
              {post.comments}
            </motion.button>

            <motion.button
              onClick={() => setReposted(!reposted)}
              whileTap={{ scale: 0.8 }}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-emerald-400 transition-colors"
            >
              <Repeat2 size={15} className={reposted ? 'text-emerald-400' : ''} />
              <span className={reposted ? 'text-emerald-400' : ''}>{post.reposts + (reposted ? 1 : 0)}</span>
            </motion.button>

            <motion.button
              onClick={() => setBookmarked(!bookmarked)}
              whileTap={{ scale: 0.8 }}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-amber-400 transition-colors ml-auto"
            >
              <Bookmark size={15} className={bookmarked ? 'fill-amber-400 text-amber-400' : ''} />
            </motion.button>
          </div>

          {/* Hover Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-[#ff007f]/[0.02] to-transparent" />
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && post.images && (
          <ImageLightbox
            images={post.images}
            index={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function ProfileFeed({ posts, activeTab, onLoadMore, hasMore, loading, viewMode = 'list' }: ProfileFeedProps) {
  if (loading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'space-y-4'}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={cn(
            'rounded-2xl bg-white/[0.02] border border-white/[0.04]',
            viewMode === 'grid' ? 'aspect-square' : 'p-5'
          )}>
            {viewMode === 'list' && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-48" />
                  <div className="skeleton h-16 w-full mt-3" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    const tabMessages: Record<string, { title: string; description: string; icon: any }> = {
      posts: { title: 'No posts yet', description: 'Your posts will appear here.', icon: Video },
      streams: { title: 'No streams yet', description: 'Your past streams will appear here.', icon: Radio },
      shorts: { title: 'No shorts yet', description: 'Your short videos will appear here.', icon: Film },
      media: { title: 'No media yet', description: 'Your photos and videos will appear here.', icon: Image },
      likes: { title: 'No likes yet', description: 'Posts you like will appear here.', icon: Heart },
    };

    const msg = tabMessages[activeTab] || { title: 'No content', description: 'Nothing here yet.', icon: Video };
    const Icon = msg.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Icon size={24} className="text-white/20" />
        </div>
        <h3 className="text-white/50 font-medium text-base mb-1">{msg.title}</h3>
        <p className="text-white/25 text-sm max-w-xs">{msg.description}</p>
      </motion.div>
    );
  }

  // Filter by tab
  const filteredPosts = activeTab === 'all' || activeTab === 'posts' 
    ? posts 
    : activeTab === 'media' 
      ? posts.filter(p => p.type === 'image' || p.type === 'video')
      : activeTab === 'likes'
        ? posts.filter(p => p.liked)
        : [];

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} viewMode="grid" />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div className="flex justify-center pt-2">
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
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filteredPosts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} viewMode="list" />
        ))}
      </AnimatePresence>

      {hasMore && (
        <div className="flex justify-center pt-4">
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
    </div>
  );
}