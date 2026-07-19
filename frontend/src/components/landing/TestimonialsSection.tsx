"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "SparkLive completely changed how I connect with my audience. The live streaming quality is unmatched.",
    name: "Sarah Chen",
    role: "Music Creator",
    avatar: "SC",
    color: "from-pink-500 to-rose-600",
  },
  {
    quote: "The community features are incredible. I've found my people here. It feels like home.",
    name: "Marcus Johnson",
    role: "Community Builder",
    avatar: "MJ",
    color: "from-purple-500 to-violet-600",
  },
  {
    quote: "As a creator, the monetization tools are exactly what I needed. Best platform for building a real income.",
    name: "Elena Rodriguez",
    role: "Live Streamer",
    avatar: "ER",
    color: "from-cyan-500 to-blue-600",
  },
  {
    quote: "The design is stunning. Every interaction feels premium. This is what social media should look like.",
    name: "Alex Kim",
    role: "Tech Reviewer",
    avatar: "AK",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse-glow" />
            <span className="text-xs font-medium tracking-wider text-white/60 uppercase">Testimonials</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white"
          >
            Loved by{" "}
            <span className="text-gradient-primary">Thousands</span>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
            >
              <Quote size={20} className="text-white/10 mb-4" />
              <p className="text-sm text-white/60 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}