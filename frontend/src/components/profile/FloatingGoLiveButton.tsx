'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingGoLiveButtonProps {
  onClick: () => void;
}

export default function FloatingGoLiveButton({ onClick }: FloatingGoLiveButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={onClick}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ff007f] via-[#7a00cc] to-[#3b82f6] flex items-center justify-center shadow-2xl shadow-[#ff007f]/30 hover:shadow-[#ff007f]/50 transition-shadow duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 0, 127, 0.3)',
            '0 0 40px rgba(255, 0, 127, 0.5)',
            '0 0 20px rgba(255, 0, 127, 0.3)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        aria-label="Go Live"
      >
        {/* Inner glow */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Pulse ring */}
        <motion.div
          className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          <polygon points="5 3 19 12 5 21 5 3" fill="white" />
        </svg>

        {/* Label */}
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/60 uppercase tracking-wider whitespace-nowrap">
          Go Live
        </span>
      </motion.button>
    </div>
  );
}