'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { TrendingUp, Users, Eye, Heart, Gift, Clock, Radio, Play, Video, ArrowUp } from 'lucide-react';

interface PremiumStatsProps {
  followers: number;
  following: number;
  likes: number;
  posts: number;
  streams: number;
  streamHours: number;
  gifts: number;
  views: number;
  followerGrowth?: number;
}

function AnimatedStatCard({
  value,
  label,
  icon,
  growth,
  color,
  index,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  growth?: number;
  color: string;
  index: number;
}) {
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

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    pink: { bg: 'bg-[#ff007f]/5', border: 'border-[#ff007f]/15', text: 'text-[#ff007f]', iconBg: 'bg-[#ff007f]/10' },
    purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/15', text: 'text-purple-400', iconBg: 'bg-purple-500/10' },
    cyan: { bg: 'bg-[#00d8ff]/5', border: 'border-[#00d8ff]/15', text: 'text-[#00d8ff]', iconBg: 'bg-[#00d8ff]/10' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/15', text: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/15', text: 'text-amber-400', iconBg: 'bg-amber-500/10' },
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/15', text: 'text-blue-400', iconBg: 'bg-blue-500/10' },
  };

  const c = colorMap[color] || colorMap.pink;

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`group relative rounded-2xl ${c.bg} ${c.border} border p-4 sm:p-5 overflow-hidden transition-all duration-300`}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      {/* Glow on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${c.bg}`} />

      <div className="relative z-10">
        {/* Icon + Growth */}
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} border ${c.border} flex items-center justify-center ${c.text}`}>
            {icon}
          </div>
          {growth !== undefined && growth > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ArrowUp size={10} className="text-emerald-400" />
              <span className="text-[9px] font-semibold text-emerald-400">+{growth}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
          {displayValue > 0 ? formatValue(displayValue) : '0'}
        </p>

        {/* Label */}
        <p className="text-[11px] sm:text-xs text-white/40 font-medium mt-1 uppercase tracking-wider">
          {label}
        </p>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 ${c.text}`}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default function PremiumStats({
  followers,
  following,
  likes,
  posts,
  streams,
  streamHours,
  gifts,
  views,
  followerGrowth,
}: PremiumStatsProps) {
  const stats = [
    { value: followers, label: 'Followers', icon: <Users size={16} />, growth: followerGrowth, color: 'pink' },
    { value: following, label: 'Following', icon: <Heart size={16} />, color: 'purple' },
    { value: likes, label: 'Likes', icon: <Heart size={16} />, color: 'amber' },
    { value: views, label: 'Views', icon: <Eye size={16} />, color: 'cyan' },
    { value: posts, label: 'Posts', icon: <Video size={16} />, color: 'blue' },
    { value: streams, label: 'Streams', icon: <Radio size={16} />, color: 'emerald' },
    { value: streamHours, label: 'Live Hours', icon: <Clock size={16} />, color: 'purple' },
    { value: gifts, label: 'Gifts', icon: <Gift size={16} />, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatedStatCard
            value={stat.value}
            label={stat.label}
            icon={stat.icon}
            growth={stat.growth}
            color={stat.color}
            index={i}
          />
        </motion.div>
      ))}
    </div>
  );
}