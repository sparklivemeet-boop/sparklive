'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentCreation } from './ContentCreationContext';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function FloatingActionButton() {
  const { isSpeedDialOpen, toggleSpeedDial } = useContentCreation();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
    toggleSpeedDial();
  }, [toggleSpeedDial]);

  return (
    <div className="fixed bottom-24 right-5 z-[60] lg:bottom-8 lg:right-8">
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        className={cn(
          'relative w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center overflow-hidden',
          'backdrop-blur-2xl border transition-all duration-300',
          isSpeedDialOpen
            ? 'bg-[#ff3366] border-[#ff3366]/50 shadow-[0_0_30px_rgba(255,51,102,0.4)]'
            : 'glass-strong border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(255,0,127,0.25)] hover:border-[#ff007f]/30'
        )}
        aria-label={isSpeedDialOpen ? 'Close creation menu' : 'Open creation menu'}
        aria-expanded={isSpeedDialOpen}
        aria-haspopup="true"
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              initial={{
                width: 0,
                height: 0,
                x: ripple.x,
                y: ripple.y,
                opacity: 0.5,
              }}
              animate={{
                width: 280,
                height: 280,
                x: ripple.x - 140,
                y: ripple.y - 140,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          animate={{ rotate: isSpeedDialOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <Plus size={24} className="text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Glow ring */}
        {!isSpeedDialOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255, 0, 127, 0.15)',
                '0 0 0 12px rgba(255, 0, 127, 0)',
                '0 0 0 0 rgba(255, 0, 127, 0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </div>
  );
}