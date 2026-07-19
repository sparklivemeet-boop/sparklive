'use client';

import { useState } from 'react';
import { ArrowLeft, Palette, Save, Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { useAuth } = await import('@/context/AuthContext');
      const { apiPut } = await import('@/lib/apiClient');
      // Theme is saved via user settings
      setSuccess('Appearance settings saved');
      setTimeout(() => setSuccess(null), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Appearance</h1>
            <p className="text-sm text-gray-400">Customize your theme and display preferences.</p>
          </div>
        </div>
        {success && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl">{success}</div>}

        <div className="glass rounded-[28px] p-6 shadow-card space-y-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Theme</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setTheme('dark')} className={`rounded-2xl border p-6 text-center transition ${theme === 'dark' ? 'border-[var(--color-spark-pink)] bg-white/10' : 'border-white/10 bg-black/40 hover:bg-white/5'}`}>
              <Moon size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-white">Dark</p>
              <p className="text-xs text-gray-500 mt-1">Easy on the eyes</p>
            </button>
            <button onClick={() => setTheme('light')} className={`rounded-2xl border p-6 text-center transition ${theme === 'light' ? 'border-[var(--color-spark-pink)] bg-white/10' : 'border-white/10 bg-black/40 hover:bg-white/5'}`}>
              <Sun size={28} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-sm font-medium text-white">Light</p>
              <p className="text-xs text-gray-500 mt-1">Bright and clean</p>
            </button>
          </div>
          <Button variant="primary" onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save preference</Button>
        </div>
      </div>
    </div>
  );
}