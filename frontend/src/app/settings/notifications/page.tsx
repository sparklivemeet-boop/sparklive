"use client";

import { useState } from 'react';
import { ArrowLeft, Bell, Mail, Smartphone, MessageCircle, Radio, Heart } from 'lucide-react';
import Link from 'next/link';

const notificationOptions = [
  { id: 'push', icon: Smartphone, label: 'Push Notifications', description: 'Receive push notifications on your device' },
  { id: 'email', icon: Mail, label: 'Email Alerts', description: 'Get email notifications for important updates' },
  { id: 'likes', icon: Heart, label: 'Likes & Reactions', description: 'When someone likes your content' },
  { id: 'comments', icon: MessageCircle, label: 'Comments & Replies', description: 'When someone comments on your posts' },
  { id: 'follows', icon: Bell, label: 'New Followers', description: 'When someone follows you' },
  { id: 'streams', icon: Radio, label: 'Live Streams', description: 'When creators you follow go live' },
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    push: true, email: true, likes: true, comments: true, follows: true, streams: true,
  });

  const toggle = (id: string) => setSettings(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 pb-6 max-w-2xl">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <h1 className="text-2xl font-bold text-white">Notifications</h1>

      <div className="glass rounded-[var(--radius-2xl)] overflow-hidden divide-y divide-white/[0.04]">
        {notificationOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40">
                <option.icon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{option.label}</p>
                <p className="text-xs text-white/30">{option.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(option.id)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${settings[option.id] ? 'bg-pink-500' : 'bg-white/[0.1]'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings[option.id] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}