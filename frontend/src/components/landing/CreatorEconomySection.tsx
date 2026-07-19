"use client";

import { motion } from "framer-motion";
import { Zap, DollarSign, TrendingUp, Users, Gift, Crown } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const creatorStats = [
  { icon: DollarSign, value: "$0", label: "Start earning", color: "from-emerald-500 to-teal-600" },
  { icon: Users, value: "50K+", label: "Creators", color: "from-blue-500 to-indigo-600" },
  { icon: Gift, value: "1M+", label: "Gifts sent", color: "from-pink-500 to-rose-600" },
  { icon: TrendingUp, value: "250%", label: "Avg. growth", color: "from-purple-500 to-violet-600" },
];

export default function CreatorEconomySection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-glow" />
            <span className="text-xs font-medium tracking-wider text-white/60 uppercase">Creator Economy</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
          >
            Turn Passion Into{" "}
            <span className="text-gradient-primary">Profit</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/40 max-w-2xl mx-auto"
          >
            From live streaming to digital gifts, SparkLive gives creators the tools to build, grow, and monetize like never before.
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {creatorStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 text-center"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Monetization Tools",
              desc: "Gifts, subscriptions, tips, and paid streams — multiple ways to earn.",
              color: "from-pink-500 to-rose-600",
            },
            {
              icon: Crown,
              title: "Premium Features",
              desc: "Exclusive analytics, priority support, and advanced streaming tools.",
              color: "from-purple-500 to-violet-600",
            },
            {
              icon: TrendingUp,
              title: "Growth Analytics",
              desc: "Deep insights into your audience, earnings, and content performance.",
              color: "from-cyan-500 to-blue-600",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="group rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                <item.icon size={18} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"
          >
            Start Creating <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}