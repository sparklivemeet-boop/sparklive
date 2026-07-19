"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Sparkles, Headphones, Palette, Infinity } from "lucide-react";

const reasons = [
  { icon: Shield, title: "Privacy First", desc: "Enterprise-grade encryption. Your data belongs to you.", color: "from-emerald-500 to-teal-600" },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed. Streams start in under a second.", color: "from-cyan-500 to-blue-600" },
  { icon: Sparkles, title: "AI-Powered", desc: "Smart recommendations that get better the more you use it.", color: "from-purple-500 to-violet-600" },
  { icon: Headphones, title: "24/7 Support", desc: "Our team is always here to help you shine.", color: "from-pink-500 to-rose-600" },
  { icon: Palette, title: "Beautiful Design", desc: "Every pixel crafted with love. A joy to use every day.", color: "from-amber-500 to-orange-600" },
  { icon: Infinity, title: "Unlimited Potential", desc: "No limits on connections, streams, or creativity.", color: "from-indigo-500 to-purple-600" },
];

export default function WhySparkLiveSection() {
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
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse-glow" />
            <span className="text-xs font-medium tracking-wider text-white/60 uppercase">Why SparkLive</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white"
          >
            Built Different.{" "}
            <span className="text-gradient-primary">Built Better.</span>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${reason.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <reason.icon size={18} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{reason.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 rounded-[32px] border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12 max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-bold text-white text-center mb-8">SparkLive vs. Traditional Social</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { label: "Privacy", ours: "End-to-end encrypted", theirs: "Data mining" },
              { label: "Design", ours: "Premium & intuitive", theirs: "Cluttered" },
              { label: "Monetization", ours: "Built-in tools", theirs: "Ads only" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-wider text-white/30 mb-3">{item.label}</p>
                <p className="text-sm font-semibold text-white mb-1">{item.ours}</p>
                <p className="text-xs text-white/30 line-through">{item.theirs}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}