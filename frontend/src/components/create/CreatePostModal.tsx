'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Image, Video, Smile, Send, Eye, FileText, Save,
  Globe, Users, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useContentCreation } from './ContentCreationContext';
import EmojiPicker from './EmojiPicker';
import MediaUploader from './MediaUploader';
import CharacterCounter from './CharacterCounter';
import { savePostDraft, deleteDraft } from './DraftManager';
import { apiPost } from '@/lib/apiClient';
import type { MediaFile } from './MediaUploader';

const MAX_CHARS = 5000;
const VISIBILITY_OPTIONS = [
  { id: 'public' as const, label: 'Public', icon: Globe, description: 'Everyone can see this post' },
  { id: 'followers' as const, label: 'Followers', icon: Users, description: 'Only your followers can see this post' },
];

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { user, token } = useAuth();
  const { closeAll } = useContentCreation();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const hasContent = content.trim().length > 0 || media.length > 0;
  const isOverLimit = content.length > MAX_CHARS;

  // Focus textarea when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        if (showEmojiPicker) setShowEmojiPicker(false);
        else handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, showEmojiPicker]);

  // Click outside emoji picker to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showEmojiPicker]);

  const handleClose = useCallback(() => {
    if (hasContent && !isSubmitting) {
      const confirmed = window.confirm('You have unsaved content. Do you want to save as a draft?');
      if (confirmed) {
        savePostDraft(content, media.map((m) => ({ type: m.type, url: m.url, name: m.name })), visibility);
      }
    }
    setContent('');
    setMedia([]);
    setVisibility('public');
    setShowEmojiPicker(false);
    setShowPreview(false);
    setError(null);
    onClose();
    closeAll();
  }, [content, media, visibility, hasContent, isSubmitting, onClose, closeAll]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!hasContent && media.length === 0) return;
    if (isOverLimit) {
      setError(`Content exceeds the ${MAX_CHARS.toLocaleString()} character limit.`);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const uploadedMediaUrls = media
        .filter((m) => m.uploadedUrl)
        .map((m) => m.uploadedUrl);

      const mediaUrl = uploadedMediaUrls.length > 0 ? uploadedMediaUrls[0] : undefined;

      await apiPost('/api/feed', { content: content.trim(), mediaUrl }, token ?? undefined);
      setContent('');
      setMedia([]);
      onClose();
      closeAll();
    } catch (err) {
      setError('Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, media, hasContent, isOverLimit, onClose, closeAll, token]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!showEmojiPicker) handleClose(); }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 sm:inset-auto sm:top-[5%] sm:bottom-[5%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-[101] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Create a post"
          >
            <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Create Post</h2>
                  {hasContent && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-2 h-2 rounded-full bg-[#ff007f]"
                    />
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition"
                  aria-label="Close create post"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-5 space-y-5">
                  {/* User info + visibility selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7a00cc] p-[2px] shrink-0">
                        <div className="w-full h-full rounded-full bg-[#0e0e16] overflow-hidden flex items-center justify-center">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {(user?.username || 'U')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user?.fullName || user?.username || 'Guest'}
                        </p>
                        <p className="text-[10px] text-gray-500">@{user?.username || 'user'}</p>
                      </div>
                    </div>

                    {/* Visibility selector */}
                    <div className="relative group">
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as 'public' | 'followers')}
                        className="appearance-none rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 pr-8 text-[11px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] focus:outline-none focus:border-[#ff007f]/30 transition-all cursor-pointer"
                        aria-label="Post visibility"
                      >
                        <option value="public">🌍 Public</option>
                        <option value="followers">👥 Followers</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 3L4 6L7 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={handleTextareaInput}
                      placeholder="What's on your mind?"
                      className="w-full min-h-[140px] bg-transparent text-white text-base sm:text-lg placeholder-gray-600 resize-none focus:outline-none leading-relaxed"
                      maxLength={MAX_CHARS + 100}
                      aria-label="Post content"
                    />
                  </div>

                  {/* Media uploader */}
                  <MediaUploader
                    onMediaChange={setMedia}
                    maxFiles={10}
                  />

                  {/* Emoji picker */}
                  <div className="relative" ref={emojiPickerRef}>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 left-0 z-10">
                          <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-4 py-3"
                      >
                        <AlertCircle size={14} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Preview */}
                  {showPreview && content && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <p className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500 mb-3">
                        <Eye size={12} /> Preview
                      </p>
                      <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                        {content}
                      </p>
                      {media.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {media.slice(0, 3).map((m) => (
                            <div key={m.id} className="w-16 h-16 rounded-lg overflow-hidden border border-white/[0.06]">
                              {m.type === 'image' ? (
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <video src={m.url} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                          {media.length > 3 && (
                            <div className="w-16 h-16 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs text-gray-400">
                              +{media.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  {/* Left actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn(
                        'rounded-xl p-2.5 transition-all',
                        showEmojiPicker
                          ? 'bg-[#ff007f]/15 text-[#ff007f]'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      )}
                      aria-label="Add emoji"
                    >
                      <Smile size={18} />
                    </button>

                    {/* Save as draft */}
                    <button
                      onClick={() => {
                        if (hasContent) {
                          savePostDraft(content, media.map((m) => ({ type: m.type, url: m.url, name: m.name })), visibility);
                        }
                      }}
                      disabled={!hasContent}
                      className="rounded-xl p-2.5 text-gray-400 hover:text-white hover:bg-white/[0.05] transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Save as draft"
                    >
                      <Save size={18} />
                    </button>

                    {/* Toggle preview */}
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={cn(
                        'rounded-xl p-2.5 transition-all',
                        showPreview
                          ? 'bg-white/[0.08] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      )}
                      aria-label={showPreview ? 'Hide preview' : 'Show preview'}
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  {/* Right: char counter + submit */}
                  <div className="flex items-center gap-3">
                    <CharacterCounter current={content.length} max={MAX_CHARS} />

                    <motion.button
                      onClick={handleSubmit}
                      disabled={(!hasContent && media.length === 0) || isOverLimit || isSubmitting}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200',
                        hasContent && !isOverLimit
                          ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-[0_4px_20px_rgba(255,0,127,0.25)] hover:shadow-[0_6px_30px_rgba(255,0,127,0.35)]'
                          : 'bg-white/[0.05] text-gray-500 cursor-not-allowed'
                      )}
                      aria-label="Post"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Post
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}