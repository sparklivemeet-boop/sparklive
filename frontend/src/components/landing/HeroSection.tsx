"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { Sparkles, Play, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4"
    >
      {/* Aurora lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/5 blur-[120px] animate-pulse-glow" />

      {/* Hero content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse-glow" />
          <span className="text-xs font-medium tracking-wider text-white/60 uppercase">
            The Future of Social Connection
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-white">Where Every</span>
          <br />
          <span className="text-gradient glow-text-pink">Connection</span>
          <br />
          <span className="text-white">Glows</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Meet new people, join live streams, chat in voice rooms, build communities, and earn rewards — all in one breathtaking experience.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25 active:scale-[0.98]"
          >
            <Sparkles size={18} className="text-white/90" />
            <span>Join SparkLive</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          <button className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/[0.1] text-white/70 font-medium text-base transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.03]">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06] group-hover:bg-white/[0.1] transition-colors">
              <Play size={16} className="ml-0.5" />
            </span>
            Watch Demo
          </button>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#07070d] to-transparent pointer-events-none" />
    </section>
  );
}