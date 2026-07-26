'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { TrendingUp, Users, Eye, Heart, MessageCircle, Video, Radio, Play } from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon?: string;
}

interface ProfileStatsProps {
  stats: {
    posts: number;
    streams: number;
    shorts: number;
    followers: number;
    following: number;
  };
}

function AnimatedCounter({ value, label, icon, index }: { value: number; label: string; icon?: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(0, value, {
        duration: 1.5 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value, index]);

  const formatValue = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getIcon = () => {
    switch (label.toLowerCase()) {
      case 'posts': return <Video size={14} />;
      case 'streams': return <Radio size={14} />;
      case 'shorts': return <Play size={14} />;
      case 'followers': return <Users size={14} />;
      case 'following': return <Heart size={14} />;
      default: return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      className="relative group"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center px-2 sm:px-4 py-3 sm:py-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
        {/* Icon */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-white/30">{getIcon()}</span>
        </div>
        
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums tracking-tight">
          {displayValue > 0 ? formatValue(displayValue) : '0'}
        </span>
        <span className="text-[10px] sm:text-xs text-white/40 font-medium uppercase tracking-wider mt-1">
          {label}
        </span>
      </div>
      
      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#ff007f]/5 to-transparent" />
      </div>

      {/* Bottom accent line on hover */}
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] opacity-0 group-hover:opacity-100"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    { label: 'Posts', value: stats.posts },
    { label: 'Streams', value: stats.streams },
    { label: 'Shorts', value: stats.shorts },
    { label: 'Followers', value: stats.followers },
    { label: 'Following', value: stats.following },
  ];

  const total = statItems.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatedCounter value={stat.value} label={stat.label} index={i} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}