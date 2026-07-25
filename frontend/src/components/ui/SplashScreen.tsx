'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onComplete?.(), 500);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07070d]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ff007f] opacity-[0.04] blur-[150px] animate-float" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7a00cc] opacity-[0.03] blur-[120px] animate-float-delayed" />
            <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#00d8ff] opacity-[0.02] blur-[100px] animate-float" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <div className="relative">
              {/* Outer glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(255, 0, 127, 0.1)',
                    '0 0 80px rgba(255, 0, 127, 0.2)',
                    '0 0 40px rgba(255, 0, 127, 0.1)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Logo SVG */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative"
              >
                <defs>
                  <linearGradient id="splashGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF2E8B" />
                    <stop offset="35%" stopColor="#FF3EA5" />
                    <stop offset="65%" stopColor="#8B3DFF" />
                    <stop offset="100%" stopColor="#C45CFF" />
                  </linearGradient>
                </defs>
                <g transform="translate(256, 256)">
                  <path d="M 0,-200 C 60,-170 110,-110 120,-50 C 132,20 120,80 90,130 C 55,190 20,220 0,230 C -20,220 -55,190 -90,130 C -120,80 -132,20 -120,-50 C -110,-110 -60,-170 0,-200 Z" fill="url(#splashGrad)"/>
                  <path d="M 0,50 C -25,10 -80,-5 -105,25 C -130,55 -125,95 -95,115 C -65,135 -30,135 0,105 Z" fill="url(#splashGrad)"/>
                  <path d="M 0,50 C 25,10 80,-5 105,25 C 130,55 125,95 95,115 C 65,135 30,135 0,105 Z" fill="url(#splashGrad)"/>
                  <path d="M 0,-200 C -45,-165 -85,-100 -100,-40 C -55,-75 -25,-95 0,-105 Z" fill="url(#splashGrad)" opacity="0.85"/>
                  <path d="M 0,-200 C 45,-165 85,-100 100,-40 C 55,-75 25,-95 0,-105 Z" fill="url(#splashGrad)" opacity="0.85"/>
                </g>
              </svg>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mt-6"
          >
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF3EA5] to-[#8B3DFF]">Live</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative z-10 mt-2 text-xs text-white/20 tracking-[0.3em] uppercase"
          >
            Where Every Connection Glows
          </motion.p>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF3EA5] to-[#8B3DFF]"
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 z-10 text-[8px] text-white/10"
          >
            v2.0.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}