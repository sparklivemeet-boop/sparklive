'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, FileText, Camera, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentCreation } from './ContentCreationContext';

interface SpeedDialAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
  onClick: () => void;
}

const actions: SpeedDialAction[] = [
  {
    id: 'go-live',
    label: 'Go Live',
    icon: <Radio size={20} />,
    description: 'Start a live stream',
    gradient: 'from-[#ff3366] to-[#ff007f]',
    onClick: () => {}, // Will be injected via hook
  },
  {
    id: 'create-post',
    label: 'Create Post',
    icon: <FileText size={20} />,
    description: 'Share your thoughts',
    gradient: 'from-[#7a00cc] to-[#a855f7]',
    onClick: () => {},
  },
  {
    id: 'upload-media',
    label: 'Upload Photo / Video',
    icon: <Camera size={20} />,
    description: 'Share media with your audience',
    gradient: 'from-[#00d8ff] to-[#0ea5e9]',
    onClick: () => {},
  },
];

export default function SpeedDial() {
  const { isSpeedDialOpen, openPostModal, openGoLiveModal, closeSpeedDial } = useContentCreation();

  // Inject real callbacks
  actions[0].onClick = openGoLiveModal;
  actions[1].onClick = openPostModal;
  actions[2].onClick = openPostModal;

  const handleBackdropClick = useCallback(() => {
    if (isSpeedDialOpen) closeSpeedDial();
  }, [isSpeedDialOpen, closeSpeedDial]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpeedDialOpen) closeSpeedDial();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSpeedDialOpen, closeSpeedDial]);

  return (
    <AnimatePresence>
      {isSpeedDialOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Speed dial menu */}
          <div className="fixed bottom-40 right-5 z-[60] lg:bottom-28 lg:right-8 flex flex-col items-end gap-3">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                onClick={action.onClick}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="group relative flex items-center gap-3 w-full"
                aria-label={action.label}
              >
                {/* Label tooltip */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="hidden sm:flex flex-col items-end mr-2"
                >
                  <span className="text-sm font-semibold text-white whitespace-nowrap drop-shadow-lg">
                    {action.label}
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {action.description}
                  </span>
                </motion.div>

                {/* Action button */}
                <div
                  className={cn(
                    'relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center',
                    'backdrop-blur-2xl border border-white/[0.12] shadow-xl',
                    'transition-all duration-200',
                    'hover:scale-110 hover:-translate-y-0.5',
                    'bg-gradient-to-br',
                    action.gradient
                  )}
                >
                  <div className="absolute inset-0 rounded-2xl bg-black/10" />
                  <span className="relative z-10 text-white">{action.icon}</span>
                </div>

                {/* Mobile label */}
                <span className="sm:hidden text-sm font-medium text-white drop-shadow-lg bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  {action.label}
                </span>
              </motion.button>
            ))}

            {/* Instruction text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] text-gray-500 mt-1"
            >
              Press Esc to cancel
            </motion.p>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}