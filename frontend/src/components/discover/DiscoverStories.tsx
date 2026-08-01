'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Story {
  id: string;
  userId: string;
  username: string;
  fullName?: string;
  avatar?: string;
  hasStory: boolean;
  viewed: boolean;
}

export default function DiscoverStories() {
  const { token } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchStories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGet<any>('/api/stories', token).catch(() => ({ stories: [] }));
      setStories(Array.isArray(data) ? data : data?.stories ?? data?.data ?? []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] animate-pulse" />
            <div className="w-10 h-2 rounded-full bg-white/[0.03] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {stories.length > 4 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
            aria-label="Scroll stories left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
            aria-label="Scroll stories right"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
        {/* Create Story */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7c3aed] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center border-2 border-[#0a0a0f] group-hover:bg-white/[0.08] transition-colors">
                <Plus size={20} className="text-white/50 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-white/40">Your Story</span>
        </div>

        {/* Stories */}
        {stories.slice(0, 10).map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className={cn(
              'w-16 h-16 rounded-full p-[2px] relative',
              story.viewed
                ? 'bg-white/[0.1]'
                : 'bg-gradient-to-br from-[#ff007f] via-[#7c3aed] to-[#06f7ff]'
            )}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                {story.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.avatar} alt={story.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff007f]/20 to-[#7c3aed]/20">
                    <span className="text-base font-bold text-white/60">
                      {(story.fullName || story.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {story.hasStory && !story.viewed && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" />
              )}
            </div>
            <span className="text-[10px] text-white/50 truncate max-w-[64px]">{story.username}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}