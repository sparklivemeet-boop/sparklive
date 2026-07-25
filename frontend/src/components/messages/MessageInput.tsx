'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Smile, Paperclip, Send, Mic, Image, Camera, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string) => void;
  onAttachment: (type: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  const attachments = [
    { icon: Image, label: 'Photo', color: 'text-emerald-400' },
    { icon: Camera, label: 'Camera', color: 'text-[#00d8ff]' },
    { icon: Paperclip, label: 'File', color: 'text-[#ff007f]' },
    { icon: Smile, label: 'Sticker', color: 'text-amber-400' },
  ];

  return (
    <div className="border-t border-white/[0.06] bg-[#0e0e16]/50 backdrop-blur-xl">
      {/* Attachments Menu */}
      {showAttachments && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]"
        >
          {attachments.map((att, i) => {
            const Icon = att.icon;
            return (
              <motion.button
                key={att.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn('w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all', att.color)}>
                  <Icon size={16} />
                </div>
                <span className="text-[9px] text-gray-500">{att.label}</span>
              </motion.button>
            );
          })}
          <button
            onClick={() => setShowAttachments(false)}
            className="ml-auto p-2 text-gray-500 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 p-3">
        {/* Attachment Button */}
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="shrink-0 p-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <Paperclip size={16} />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={e => { setMessage(e.target.value); handleInput(); }}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 pr-12 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 focus:bg-white/[0.06] transition-all resize-none max-h-[120px]"
            disabled={disabled}
          />
          <button
            className="absolute right-3 bottom-1/2 translate-y-1/2 text-gray-500 hover:text-white transition"
          >
            <Smile size={16} />
          </button>
        </div>

        {/* Voice / Send */}
        {message.trim() ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all disabled:opacity-50"
          >
            <Send size={15} className="text-white ml-0.5" />
          </motion.button>
        ) : (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/[0.04] text-gray-500 hover:text-white hover:bg-white/[0.08]'
            )}
          >
            <Mic size={15} />
          </motion.button>
        )}
      </div>
    </div>
  );
}