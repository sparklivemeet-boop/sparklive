"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiPost } from '@/lib/apiClient';

export default function GoLivePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState('Good vibes only');
  const [category, setCategory] = useState('Just Chatting');
  const [allowGifts, setAllowGifts] = useState(true);
  const [allowPK, setAllowPK] = useState(false);
  const [status, setStatus] = useState<'idle' | 'starting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startLive = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    setStatus('starting');
    setErrorMessage(null);

    try {
      await apiPost('/api/live/start', { title, category, allowGifts, allowPK }, token);
      router.push('/live');
    } catch (error: any) {
      console.error('Failed to start live stream:', error);
      setErrorMessage(error?.message || 'Unable to start live stream');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="w-full sticky top-0 z-40 glass px-4 py-4 border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/live" className="rounded-full p-2 bg-white/5 hover:bg-white/10 transition">
            <ArrowLeft size={20} className="text-white" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Go Live</p>
            <h1 className="text-3xl font-bold text-white">Start your live show</h1>
          </div>
        </div>
      </div>

      <main className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <div className="glass rounded-3xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-[28px] bg-white/10 flex items-center justify-center text-3xl">📷</div>
            <div>
              <p className="text-sm text-gray-400">Live Title</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[var(--color-spark-pink)]"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Category</p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[var(--color-spark-pink)]"
            >
              <option value="Just Chatting">Just Chatting</option>
              <option value="Music">Music</option>
              <option value="Travel">Travel</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>

          <div className="grid gap-4">
            <label className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <div>
                <p className="font-semibold text-white">Allow Gifts</p>
                <p className="text-sm text-gray-400">Fans can send gifts during your stream.</p>
              </div>
              <input type="checkbox" checked={allowGifts} onChange={() => setAllowGifts(!allowGifts)} className="w-5 h-5 accent-[var(--color-spark-pink)]" />
            </label>
            <label className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <div>
                <p className="font-semibold text-white">Allow PK</p>
                <p className="text-sm text-gray-400">Open the stage for friendly battles.</p>
              </div>
              <input type="checkbox" checked={allowPK} onChange={() => setAllowPK(!allowPK)} className="w-5 h-5 accent-[var(--color-spark-pink)]" />
            </label>
          </div>
        </div>

        <div className="glass rounded-3xl border border-white/10 p-6 grid gap-4">
          <div className="flex items-start gap-3">
            <Gift className="text-[var(--color-spark-pink)] mt-1" />
            <div>
              <p className="font-semibold text-white">Gift-ready stream</p>
              <p className="text-sm text-gray-400">Enable gifts to earn rewards during your live show.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="text-[var(--color-spark-purple)] mt-1" />
            <div>
              <p className="font-semibold text-white">Sky-high visibility</p>
              <p className="text-sm text-gray-400">Featured streams get more viewers and tips.</p>
            </div>
          </div>
        </div>

        <button
          onClick={startLive}
          className="w-full rounded-3xl py-4 bg-gradient-spark text-white font-bold text-lg shadow-[0_20px_50px_rgba(255,0,127,0.25)] hover:brightness-110 transition"
        >
          {status === 'starting' ? 'Starting...' : 'Start Live'}
        </button>
        {status === 'error' && (
          <p className="text-sm text-red-400 mt-2">
            {errorMessage || 'Could not start live stream. Please try again.'}
          </p>
        )}
      </main>
    </div>
  );
}
