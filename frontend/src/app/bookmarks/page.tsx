'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Bookmark, Heart, MessageCircle, Play, X, Search, Loader2, Clock, Film, FileText, Link2, FolderOpen, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';

export default function BookmarksPage() {
  const { token } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'posts' | 'streams' | 'videos'>('all');

  const fetchBookmarks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/bookmarks', token);
      const list = Array.isArray(data) ? data : data?.bookmarks ?? data?.data ?? [];
      setBookmarks(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-10 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load bookmarks</h2>
        <p className="text-sm text-white/30 mb-6">{error}</p>
        <button onClick={fetchBookmarks} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
          Try Again
        </button>
      </div>
    );
  }

  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.type === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Bookmark size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
            <p className="text-sm text-white/40">Your saved content</p>
          </div>
        </div>
        {bookmarks.length > 0 && (
          <span className="text-xs text-white/30">{bookmarks.length} items</span>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 w-fit"
      >
        {(['all', 'posts', 'streams', 'videos'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all capitalize',
              filter === f ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white' : 'text-gray-500 hover:text-white'
            )}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </motion.div>

      {/* Bookmarks Grid */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/[0.04]">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/15 flex items-center justify-center mb-5">
            <Bookmark size={36} className="text-amber-400/30" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No bookmarks yet</h3>
          <p className="text-sm text-white/30 max-w-sm">
            Save your favorite streams, posts, and videos by tapping the bookmark icon.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <FolderOpen size={32} className="text-white/10 mb-3" />
          <p className="text-sm text-white/30">No {filter} bookmarks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((bookmark: any, i: number) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-[#1a1a28] to-[#0e0e16]">
                {bookmark.thumbnailUrl ? (
                  <img src={bookmark.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {bookmark.type === 'stream' ? (
                      <Play size={28} className="text-[#ff007f]/20" />
                    ) : bookmark.type === 'video' ? (
                      <Film size={28} className="text-[#00d8ff]/20" />
                    ) : (
                      <FileText size={28} className="text-white/10" />
                    )}
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider',
                    bookmark.type === 'stream' && 'bg-red-500/80 text-white',
                    bookmark.type === 'video' && 'bg-[#00d8ff]/80 text-white',
                    bookmark.type === 'post' && 'bg-white/20 text-white',
                  )}>
                    {bookmark.type || 'Saved'}
                  </span>
                </div>

                {/* Remove Button */}
                <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#ff007f] group-hover:to-[#7a00cc] transition-all">
                  {bookmark.title || 'Untitled'}
                </p>
                {bookmark.description && (
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{bookmark.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Avatar src={bookmark.author?.avatar} alt={bookmark.author?.name || 'User'} size="xs" />
                    <span className="text-[10px] text-white/40">{bookmark.author?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-[10px] text-white/20">
                    {bookmark.createdAt ? formatTimeAgo(bookmark.createdAt) : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}