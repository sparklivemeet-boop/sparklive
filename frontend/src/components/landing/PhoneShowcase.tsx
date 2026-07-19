"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Heart, Users, Radio, Gift } from "lucide-react";

const screenshots = [
  { label: "Live Stream", icon: Radio, color: "from-pink-500 to-rose-600" },
  { label: "Messages", icon: MessageCircle, color: "from-purple-500 to-violet-600" },
  { label: "Discover", icon: Sparkles, color: "from-cyan-500 to-blue-600" },
];

export default function PhoneShowcase() {
  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse-glow" />
              <span className="text-xs font-medium tracking-wider text-white/60 uppercase">Beautiful Design</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
            >
              Experience the{" "}
              <span className="text-gradient-cyan">Future</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/40 max-w-lg mb-8 leading-relaxed"
            >
              Immersive design, fluid animations, and intuitive gestures. SparkLive feels like nothing you've used before.
            </motion.p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: Heart, text: "Swipe through profiles and discover new connections" },
                { icon: Users, text: "Join live streams with millions of viewers worldwide" },
                { icon: Gift, text: "Send animated gifts with stunning visual effects" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <item.icon size={14} className="text-pink-400" />
                  </div>
                  <span className="text-sm text-white/60">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Glow behind phone */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/5 blur-[100px]" />

            {/* Phone frame */}
            <div className="relative w-[320px] h-[660px] rounded-[48px] border border-white/[0.1] bg-gradient-to-b from-[#1a1a2e] to-[#0a0a1a] shadow-2xl shadow-purple-500/10 overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-2xl z-10" />

              {/* Screen content */}
              <div className="absolute inset-0 p-5 pt-10">
                {/* Status bar */}
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-4 px-1">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2 rounded-sm border border-white/30" />
                    <div className="w-2 h-2 rounded-full border border-white/30" />
                  </div>
                </div>

                {/* App content - animated */}
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-semibold text-sm">Discover</p>
                      <p className="text-[10px] text-white/30">Recommended for you</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  </div>

                  {/* Live cards */}
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3 + item * 0.5, repeat: Infinity, ease: "easeInOut" }}
                      className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center">
                        <Radio size={16} className="text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-medium">Live Stream</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-white/40 truncate">Username · 12.4K watching</p>
                      </div>
                      <Heart size={12} className="text-pink-400/60" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-center">
                <div className="w-24 h-1 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-32 glass-strong rounded-2xl px-4 py-3 border border-white/[0.08] shadow-2xl hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/70">12.4K watching</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-8 bottom-32 glass-strong rounded-2xl px-4 py-3 border border-white/[0.08] shadow-2xl hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={12} className="text-cyan-400" />
                <span className="text-xs text-white/70">Chat active</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}