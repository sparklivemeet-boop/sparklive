"use client";

import { motion } from "framer-motion";
import { Globe, Users, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const communities = [
  { name: "Music Lovers", members: "12.4K", color: "from-pink-500 to-rose-600", active: true },
  { name: "Tech Innovators", members: "8.2K", color: "from-cyan-500 to-blue-600", active: true },
  { name: "Art & Design", members: "6.9K", color: "from-purple-500 to-violet-600", active: true },
  { name: "Gaming Hub", members: "15.1K", color: "from-emerald-500 to-teal-600", active: true },
  { name: "Wellness Circle", members: "4.3K", color: "from-amber-500 to-orange-600", active: true },
  { name: "Travel Explorers", members: "7.8K", color: "from-indigo-500 to-purple-600", active: true },
];

export default function CommunitiesSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4">
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-xs font-medium tracking-wider text-white/60 uppercase">Communities</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
            >
              Find Your{" "}
              <span className="text-gradient-primary">Tribe</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/40 max-w-lg mb-8 leading-relaxed"
            >
              Join communities built around your passions. Connect with like-minded people from every corner of the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.12]"
              >
                Explore Communities <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Community cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            {communities.map((community, i) => (
              <motion.div
                key={community.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${community.color} flex items-center justify-center`}>
                    <Globe size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{community.name}</h3>
                    <p className="text-[10px] text-white/40">{community.members} members</p>
                  </div>
                </div>
                {community.active && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400/60">Active now</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}