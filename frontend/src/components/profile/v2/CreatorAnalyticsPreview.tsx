'use client';

import { cn } from '@/lib/utils';
import { Eye, Heart, Users, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface AnalyticsData {
  views?: number;
  likes?: number;
  followers?: number;
  engagement?: number;
  viewsChange?: number;
  likesChange?: number;
  followersChange?: number;
  engagementChange?: number;
}

interface CreatorAnalyticsPreviewProps {
  data?: AnalyticsData;
  loading?: boolean;
}

export default function CreatorAnalyticsPreview({ data, loading }: CreatorAnalyticsPreviewProps) {
  if (loading) {
    return (
      <div className="card-premium p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    { icon: Eye, label: 'Views', value: data.views ?? 0, change: data.viewsChange, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Heart, label: 'Likes', value: data.likes ?? 0, change: data.likesChange, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { icon: Users, label: 'Followers', value: data.followers ?? 0, change: data.followersChange, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: TrendingUp, label: 'Engagement', value: `${data.engagement ?? 0}%`, change: data.engagementChange, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#06f7ff]" />
          <h3 className="text-sm font-bold text-white">Analytics Preview</h3>
        </div>
        <button className="text-[10px] text-white/30 hover:text-white/60 transition">View full stats</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change && metric.change > 0;
          return (
            <div key={metric.label}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', metric.bg)}>
                  <Icon size={12} className={metric.color} />
                </div>
              </div>
              <p className="text-lg font-bold text-white">
                {typeof metric.value === 'number' ? formatValue(metric.value) : metric.value}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/40">{metric.label}</span>
                {metric.change !== undefined && metric.change !== 0 && (
                  <span className={cn(
                    'flex items-center gap-0.5 text-[9px]',
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {isPositive ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
                    {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}