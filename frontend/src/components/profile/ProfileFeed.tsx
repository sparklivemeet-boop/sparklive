'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Repeat2, MoreHorizontal, Image, Video, BarChart3, Check, Pin } from 'lucide-react';
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
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(post.liked || false);
  const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
  const [reposted, setReposted] = useState(post.reposted || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showPoll, setShowPoll] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
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

  return (
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

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className={cn(
                  'grid gap-2 rounded-2xl overflow-hidden',
                  post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                )}>
                  {post.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Post image ${i + 1}`}
                      className="w-full h-48 object-cover rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              )}

              {/* Video */}
              {post.video && (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-[10px] text-white/80">
                    {post.type === 'video' ? 'Video' : 'Stream'}
                  </div>
                </div>
              )}

              {/* Poll */}
              {post.poll && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">{(post as any).poll.question}</p>
                  {(post as any).poll.options.map((option: any, i: number) => {
                    const percentage = (post as any).poll.totalVotes > 0
                      ? Math.round((option.votes / (post as any).poll.totalVotes) * 100)
                      : 0;
                    return (
                      <button
                        key={i}
                        onClick={() => setShowPoll(true)}
                        className="relative w-full text-left p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 transition-all duration-500"
                          style={{ width: showPoll ? `${percentage}%` : '0%' }}
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
          <button
            onClick={handleLike}
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
          </button>

          <button className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#00d8ff] transition-colors">
            <MessageCircle size={15} />
            {post.comments}
          </button>

          <button
            onClick={() => setReposted(!reposted)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-emerald-400 transition-colors"
          >
            <Repeat2 size={15} className={reposted ? 'text-emerald-400' : ''} />
            <span className={reposted ? 'text-emerald-400' : ''}>{post.reposts + (reposted ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-amber-400 transition-colors ml-auto"
          >
            <Bookmark size={15} className={bookmarked ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-[#ff007f]/[0.02] to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfileFeed({ posts, activeTab, onLoadMore, hasMore, loading }: ProfileFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full skeleton" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
                <div className="skeleton h-16 w-full mt-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    const tabMessages: Record<string, { title: string; description: string }> = {
      posts: { title: 'No posts yet', description: 'Your posts will appear here.' },
      streams: { title: 'No streams yet', description: 'Your past streams will appear here.' },
      shorts: { title: 'No shorts yet', description: 'Your short videos will appear here.' },
      media: { title: 'No media yet', description: 'Your photos and videos will appear here.' },
      likes: { title: 'No likes yet', description: 'Posts you like will appear here.' },
    };

    const msg = tabMessages[activeTab] || { title: 'No content', description: 'Nothing here yet.' };

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Heart size={24} className="text-white/20" />
        </div>
        <h3 className="text-white/50 font-medium text-base mb-1">{msg.title}</h3>
        <p className="text-white/25 text-sm max-w-xs">{msg.description}</p>
      </div>
    );
  }

  // Filter by tab - in production this would be server-filtered
  const filteredPosts = activeTab === 'all' || activeTab === 'posts' 
    ? posts 
    : activeTab === 'media' 
      ? posts.filter(p => p.type === 'image' || p.type === 'video')
      : [];

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filteredPosts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </AnimatePresence>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}