'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Smile, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useContentCreation } from './ContentCreationContext';

const quickActions = [
  { id: 'photo', icon: Image, label: 'Photo', color: 'from-emerald-400 to-green-500' },
  { id: 'live', icon: Video, label: 'Live', color: 'from-[#ff3366] to-[#ff007f]' },
  { id: 'emoji', icon: Smile, label: 'Emoji', color: 'from-amber-400 to-orange-500' },
  { id: 'post', icon: FileText, label: 'Post', color: 'from-[#7a00cc] to-[#a855f7]' },
];

export default function CreatePostComposer() {
  const { user } = useAuth();
  const { openPostModal, openGoLiveModal } = useContentCreation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    openPostModal();
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'live':
        openGoLiveModal();
        break;
      default:
        openPostModal();
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[28px] p-4 sm:p-5 shadow-card border border-white/[0.08]"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* User avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7a00cc] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0e0e16] overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.username || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {(user?.username || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleFocus}
            className="w-full text-left rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 sm:py-3.5 text-sm text-gray-400 hover:text-gray-300 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200 cursor-text"
            aria-label="Create a new post"
          >
            <span>What's happening today?</span>
          </button>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className={cn(
                    'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200',
                    'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/[0.04] hover:border-white/[0.1]'
                  )}
                  aria-label={`Add ${action.label}`}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}