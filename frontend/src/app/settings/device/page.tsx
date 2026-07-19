'use client';

import { useState } from 'react';
import { ArrowLeft, Smartphone, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DeviceSettingsPage() {
  const [success, setSuccess] = useState<string | null>(null);

  const handleClearCache = () => {
    setSuccess('Cache cleared successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Device & Storage</h1>
            <p className="text-sm text-gray-400">Manage storage, cache, and data preferences.</p>
          </div>
        </div>
        {success && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl">{success}</div>}

        <div className="glass rounded-[28px] p-6 shadow-card space-y-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Storage</p>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-sm text-gray-300">Cache</p>
            <p className="text-xs text-gray-500 mt-1">Clear cached data to free up space.</p>
            <Button variant="outline" size="sm" icon={<Trash2 size={14} />} onClick={handleClearCache} className="mt-3">Clear cache</Button>
          </div>
        </div>

        <div className="glass rounded-[28px] p-6 shadow-card">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Data Usage</p>
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Auto-download media</p>
              <p className="text-xs text-gray-500">Automatically download media on Wi-Fi</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-white/20 bg-gray-800 text-[var(--color-spark-pink)] focus:ring-[var(--color-spark-pink)]" />
          </label>
        </div>
      </div>
    </div>
  );
}