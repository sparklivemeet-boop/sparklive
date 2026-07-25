"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, MessageCircle, Heart, Globe, Zap, Shield, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Live Streaming",
    description: "Go live in HD with real-time chat, gifts, and interactive features. Connect with your audience like never before.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: MessageCircle,
    title: "Voice Rooms",
    description: "Join or create voice rooms for real conversations. From casual chats to live podcasts and debates.",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: Globe,
    title: "Communities",
    description: "Build and grow communities around your interests. Share content, host events, and connect with like-minded people.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Heart,
    title: "Digital Gifts",
    description: "Send and receive premium digital gifts during live streams. Show appreciation and stand out with exclusive gifts.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Creator Tools",
    description: "Powerful analytics, monetization, and growth tools. Turn your passion into a career with SparkLive.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Match & Discover",
    description: "Find new friends and creators with AI-powered recommendations. Discover content that matches your interests.",
    gradient: "from-indigo-500 to-purple-600",
  },
];

export default function ProductFeatures() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6">
            <Sparkles size={12} className="text-pink-400" />
            <span className="text-xs font-medium text-white/60">Everything You Need</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            All-in-One{" "}
            <span className="text-gradient">Social Platform</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            From live streaming to community building, SparkLive provides everything you need to create, connect, and earn.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[24px] bg-white/[0.03] border border-white/[0.06] p-6 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.1]"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}