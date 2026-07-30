'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import {
  DollarSign, TrendingUp, Users, Gift, Clock, Eye,
  ArrowUp, ArrowDown, BarChart3, Activity,
} from 'lucide-react';

interface DashboardMetric {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface CreatorDashboardPreviewProps {
  revenue?: number;
  followers?: number;
  giftRevenue?: number;
  watchTime?: string;
  views?: number;
  engagement?: number;
}

function DashboardCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(0, metric.value, {
        duration: 1.5 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, metric.value, index]);

  const formatValue = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const colorMap: Record<string, string> = {
    pink: 'from-[#ff007f]/10 to-[#7a00cc]/10 border-[#ff007f]/15',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/15',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/15',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/15',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/15',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`group relative rounded-2xl bg-gradient-to-br ${colorMap[metric.color] || colorMap.pink} border p-4 overflow-hidden transition-all duration-300`}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
            {metric.label}
          </span>
          <span className="text-white/30 group-hover:text-white/50 transition-colors">
            {metric.icon}
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          {metric.prefix && (
            <span className="text-sm text-white/50">{metric.prefix}</span>
          )}
          <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
            {displayValue > 0 ? formatValue(displayValue) : '0'}
          </span>
          {metric.suffix && (
            <span className="text-xs text-white/40">{metric.suffix}</span>
          )}
        </div>

        {/* Change indicator */}
        {metric.change !== undefined && (
          <div className={`flex items-center gap-1 mt-1.5 ${
            metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {metric.change >= 0 ? (
              <ArrowUp size={12} />
            ) : (
              <ArrowDown size={12} />
            )}
            <span className="text-[10px] font-semibold">
              {metric.change >= 0 ? '+' : ''}{metric.change}%
            </span>
            <span className="text-[9px] text-white/30 ml-0.5">vs last month</span>
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div className={`absolute bottom-0 left-3 right-3 h-[1px] rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity text-white`} />
    </motion.div>
  );
}

export default function CreatorDashboardPreview({
  revenue = 0,
  followers = 0,
  giftRevenue = 0,
  watchTime = '0h',
  views = 0,
  engagement = 0,
}: CreatorDashboardPreviewProps) {
  const metrics: DashboardMetric[] = [
    {
      label: 'Revenue This Month',
      value: revenue,
      prefix: '',
      suffix: 'Coins',
      change: 12,
      icon: <DollarSign size={14} />,
      color: 'emerald',
    },
    {
      label: 'New Followers',
      value: followers,
      change: 8,
      icon: <Users size={14} />,
      color: 'pink',
    },
    {
      label: 'Gift Revenue',
      value: giftRevenue,
      prefix: '',
      suffix: 'Coins',
      change: 15,
      icon: <Gift size={14} />,
      color: 'amber',
    },
    {
      label: 'Watch Time',
      value: parseInt(watchTime) || 0,
      suffix: 'hrs',
      change: 5,
      icon: <Clock size={14} />,
      color: 'cyan',
    },
    {
      label: 'Total Views',
      value: views,
      change: 20,
      icon: <Eye size={14} />,
      color: 'purple',
    },
    {
      label: 'Engagement',
      value: engagement,
      suffix: '%',
      change: 3,
      icon: <Activity size={14} />,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-white/40" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em]">
            Creator Dashboard
          </h3>
        </div>
        <motion.button
          whileHover={{ x: 3 }}
          className="text-[10px] text-[#00d8ff] hover:text-[#06f7ff] transition-colors font-medium"
        >
          View Full Analytics →
        </motion.button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric, i) => (
          <DashboardCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>
    </div>
  );
}