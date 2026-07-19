"use client";

import { motion } from "framer-motion";
import { 
  Users, Sparkles, Radio, MessageCircle, Video, Globe, 
  Gift, Zap, Crown, Trophy, Calendar, Shield 
} from "lucide-react";

const features = [
  { icon: Users, title: "Meet People", description: "Discover and connect with amazing people from around the world who share your interests.", color: "from-pink-500 to-rose-600" },
  { icon: Sparkles, title: "AI Discovery", description: "Smart recommendations that help you find the perfect communities, streams, and connections.", color: "from-purple-500 to-violet-600" },
  { icon: Radio, title: "Live Streaming", description: "Go live in seconds. Stream your moments, talents, and passions to a global audience.", color: "from-cyan-500 to-blue-600" },
  { icon: MessageCircle, title: "Voice Rooms", description: "Drop into real-time voice conversations. Chat, laugh, and connect like you're in the same room.", color: "from-emerald-500 to-teal-600" },
  { icon: Video, title: "Video Calls", description: "Crystal-clear video calls with premium audio, effects, and real-time reactions.", color: "from-amber-500 to-orange-600" },
  { icon: Globe, title: "Communities", description: "Build or join communities around your passions. Create spaces that matter.", color: "from-indigo-500 to-purple-600" },
  { icon: Gift, title: "Digital Gifts", description: "Express yourself with stunning animated gifts. Make every interaction memorable.", color: "from-rose-500 to-pink-600" },
  { icon: Zap, title: "Creator Economy", description: "Monetize your content, earn rewards, and build your brand on your terms.", color: "from-yellow-500 to-amber-600" },
  { icon: Crown, title: "Premium Membership", description: "Unlock exclusive features, badges, and perks with SparkPremium.", color: "from-violet-500 to-purple-600" },
  { icon: Trophy, title: "Rewards & Badges", description: "Earn achievements, climb leaderboards, and unlock exclusive rewards.", color: "from-cyan-500 to-teal-600" },
  { icon: Calendar, title: "Events & Meetups", description: "Host virtual events, workshops, and meetups with powerful tools.", color: "from-blue-500 to-indigo-600" },
  { icon: Shield, title: "Secure & Private", description: "Enterprise-grade security with end-to-end encryption and privacy controls.", color: "from-green-500 to-emerald-600" },
];

export default function ProductFeatures() {
  return (
    <section className="relative py-24 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse-glow" />
            <span className="text-xs font-medium tracking-wider text-white/60 uppercase">Everything You Need</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
          >
            One Platform,{" "}
            <span className="text-gradient-primary">Infinite</span>{" "}
            Possibilities
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/40 max-w-2xl mx-auto"
          >
            Everything you need to connect, create, and thrive — beautifully designed and seamlessly integrated.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-lg hover:shadow-pink-500/5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon size={18} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}