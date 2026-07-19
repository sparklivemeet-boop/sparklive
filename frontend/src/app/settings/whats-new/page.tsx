'use client';

import { ArrowLeft, Sparkles, Gift, Radio, Globe, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function WhatsNewPage() {
  const updates = [
    { icon: Gift, title: 'Gift Store', desc: 'Send animated gifts during live streams.', date: 'July 2026' },
    { icon: Radio, title: 'Live Streaming', desc: 'Go live with real-time chat and viewer engagement.', date: 'June 2026' },
    { icon: Globe, title: 'Global Reach', desc: 'Multi-language support and regional settings.', date: 'June 2026' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Enhanced notification preferences and filters.', date: 'May 2026' },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">What's New</h1>
            <p className="text-sm text-gray-400">Latest features and platform updates.</p>
          </div>
        </div>

        <div className="space-y-4">
          {updates.map((u, i) => {
            const Icon = u.icon;
            return (
              <div key={i} className="glass rounded-[24px] p-5 shadow-card flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-spark flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{u.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{u.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}