'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import CreatePostModal from '@/components/create/CreatePostModal';
import GoLiveModal from '@/components/create/GoLiveModal';
import {
  Plus,
  FileText,
  Image,
  Film,
  Video,
  Radio,
  Sparkles,
  Clock,
  Calendar,
  Layout,
  X,
  ChevronRight,
  Zap,
  MessageSquare,
  Users,
} from 'lucide-react';

interface CreateHubProps {
  open: boolean;
  onClose: () => void;
}

// Creation options
const creationOptions = [
  {
    id: 'post',
    icon: FileText,
    label: 'Post',
    description: 'Share your thoughts',
    gradient: 'from-[#ff007f] to-[#7c3aed]',
    path: '/create/post',
    color: 'text-pink-400',
  },
  {
    id: 'photo',
    icon: Image,
    label: 'Photo',
    description: 'Upload a photo',
    gradient: 'from-[#7c3aed] to-[#3b82f6]',
    path: '/create/photo',
    color: 'text-purple-400',
  },
  {
    id: 'video',
    icon: Film,
    label: 'Video',
    description: 'Share a video',
    gradient: 'from-[#3b82f6] to-[#06f7ff]',
    path: '/create/video',
    color: 'text-blue-400',
  },
  {
    id: 'reel',
    icon: Video,
    label: 'Reel',
    description: 'Short vertical video',
    gradient: 'from-[#06f7ff] to-[#ff007f]',
    path: '/reels/create',
    color: 'text-cyan-400',
  },
  {
    id: 'livestream',
    icon: Radio,
    label: 'Livestream',
    description: 'Go live now',
    gradient: 'from-[#f43f5e] to-[#ff007f]',
    path: '/live/go-live',
    color: 'text-rose-400',
  },
  {
    id: 'story',
    icon: Zap,
    label: 'Story',
    description: 'Share a moment',
    gradient: 'from-[#f59e0b] to-[#f43f5e]',
    path: '/create/story',
    color: 'text-amber-400',
  },
  {
    id: 'poll',
    icon: MessageSquare,
    label: 'Poll',
    description: 'Ask your audience',
    gradient: 'from-[#10b981] to-[#06f7ff]',
    path: '/create/poll',
    color: 'text-emerald-400',
  },
  {
    id: 'event',
    icon: Calendar,
    label: 'Event',
    description: 'Create an event',
    gradient: 'from-[#a855f7] to-[#f43f5e]',
    path: '/create/event',
    color: 'text-purple-400',
  },
  {
    id: 'spark-ai',
    icon: Sparkles,
    label: 'Spark AI',
    description: 'AI-powered content',
    gradient: 'from-[#ff007f] to-[#06f7ff]',
    path: '/create/ai',
    color: 'text-pink-400',
    comingSoon: true,
  },
  {
    id: 'drafts',
    icon: Clock,
    label: 'Drafts',
    description: 'Continue editing',
    gradient: 'from-[#6b7280] to-[#9ca3af]',
    path: '/create/drafts',
    color: 'text-gray-400',
  },
  {
    id: 'schedule',
    icon: Calendar,
    label: 'Schedule',
    description: 'Plan your content',
    gradient: 'from-[#3b82f6] to-[#a855f7]',
    path: '/create/schedule',
    color: 'text-blue-400',
  },
];

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function CreateHub({ open, onClose }: CreateHubProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
  const [composerIntent, setComposerIntent] = useState<'post' | 'photo' | 'video' | 'story' | 'poll' | 'event'>('post');

  const contextHint = pathname?.startsWith('/live')
    ? { title: 'Go live', subtitle: 'Ready to broadcast to your audience?', recommendedIds: ['livestream', 'post', 'story'] as string[] }
    : pathname?.startsWith('/profile') || pathname?.startsWith('/creator')
      ? { title: 'Creator tools', subtitle: 'Share fresh momentum with your community.', recommendedIds: ['post', 'photo', 'livestream'] as string[] }
      : pathname?.startsWith('/messages')
        ? { title: 'Stay social', subtitle: 'Share a quick update or start a live moment.', recommendedIds: ['post', 'story', 'livestream'] as string[] }
        : { title: 'Create', subtitle: 'What would you like to share?', recommendedIds: ['post', 'photo', 'livestream'] as string[] };

  const handleSelect = (option: typeof creationOptions[0]) => {
    onClose();

    switch (option.id) {
      case 'post':
        setComposerIntent('post');
        setPostModalOpen(true);
        break;
      case 'photo':
        setComposerIntent('photo');
        setPostModalOpen(true);
        break;
      case 'video':
        setComposerIntent('video');
        setPostModalOpen(true);
        break;
      case 'story':
        setComposerIntent('story');
        setPostModalOpen(true);
        break;
      case 'poll':
        setComposerIntent('poll');
        setPostModalOpen(true);
        break;
      case 'event':
        setComposerIntent('event');
        setPostModalOpen(true);
        break;
      case 'livestream':
        setGoLiveModalOpen(true);
        break;
      case 'reel':
        router.push('/reels');
        break;
      default:
        router.push(option.path);
        break;
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:bottom-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-[var(--z-modal)] flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
                    <Plus size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{contextHint.title}</h2>
                    <p className="text-[10px] text-white/40">{contextHint.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Creation Options Grid */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {creationOptions.map((option, i) => {
                    const Icon = option.icon;
                    const isHovered = hoveredId === option.id;
                    const isRecommended = contextHint.recommendedIds.includes(option.id);

                    return (
                      <motion.button
                        key={option.id}
                        custom={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        onMouseEnter={() => setHoveredId(option.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          'relative flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all duration-300 group',
                          'bg-white/[0.02] border border-white/[0.06]',
                          'hover:bg-white/[0.04] hover:border-white/[0.1]',
                          isHovered && 'bg-white/[0.05] border-white/[0.12]',
                          isRecommended && 'border-[#ff007f]/20 bg-[#ff007f]/5'
                        )}
                      >
                        {/* Icon container */}
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                          `bg-gradient-to-br ${option.gradient} bg-opacity-20`,
                          isHovered && 'scale-110 shadow-lg'
                        )}>
                          <Icon size={20} className="text-white" />
                        </div>

                        {/* Label */}
                        <div>
                          <p className="text-sm font-semibold text-white">{option.label}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{option.description}</p>
                        </div>

                        {isRecommended && (
                          <span className="absolute top-2 right-2 rounded-full border border-[#ff007f]/20 bg-[#ff007f]/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#ff79b8]">
                            Suggested
                          </span>
                        )}

                        {/* Hover glow */}
                        <div className={cn(
                          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none',
                          isHovered && 'opacity-100'
                        )}>
                          <div className={cn(
                            'absolute inset-0 rounded-2xl opacity-10',
                            `bg-gradient-to-br ${option.gradient}`
                          )} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between shrink-0">
                <p className="text-[10px] text-white/30">
                  <Zap size={10} className="inline mr-1 text-amber-400" />
                  Create anything with SparkLive
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[10px] font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreatePostModal open={postModalOpen} initialIntent={composerIntent} onClose={() => setPostModalOpen(false)} />
      <GoLiveModal open={goLiveModalOpen} onClose={() => setGoLiveModalOpen(false)} />
    </>
  );
}