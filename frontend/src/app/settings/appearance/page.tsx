"use client";

import { useState } from 'react';
import { ArrowLeft, Palette, Monitor, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export default function AppearanceSettings() {
  const [theme, setTheme] = useState('dark');

  return (
    <div className="space-y-6 pb-6 max-w-2xl">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <h1 className="text-2xl font-bold text-white">Appearance</h1>

      <div className="glass rounded-[var(--radius-2xl)] p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Theme</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'system', icon: Monitor, label: 'System' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 border transition-all ${
                  theme === option.id
                    ? 'border-pink-500/30 bg-pink-500/10'
                    : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <option.icon size={20} className={theme === option.id ? 'text-pink-400' : 'text-white/40'} />
                <span className="text-xs font-medium text-white">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Layout Density</h2>
          <div className="space-y-2">
            {['Comfortable', 'Compact', 'Cozy'].map((option) => (
              <label key={option} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer">
                <input type="radio" name="density" className="accent-pink-500" />
                <span className="text-sm text-white/70">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}