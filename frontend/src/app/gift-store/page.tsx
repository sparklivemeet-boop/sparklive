"use client";

import Link from 'next/link';
import { Sparkles, Heart, Crown, Gift, Diamond } from 'lucide-react';

const categories = ['All', 'Popular', 'Love', 'Luxury', 'Special'];

const gifts = [
  { id: 'rose', icon: '🌹', name: 'Rose', price: 10, description: 'A sweet love token' },
  { id: 'heart', icon: '💖', name: 'Heart', price: 50, description: 'Show real affection' },
  { id: 'teddy', icon: '🐻', name: 'Teddy', price: 100, description: 'Cute and luxurious' },
  { id: 'crown', icon: '👑', name: 'Crown', price: 500, description: 'Royal appreciation' },
  { id: 'diamond', icon: '💎', name: 'Diamond', price: 1000, description: 'Top-tier glam' },
  { id: 'yacht', icon: '🚤', name: 'Yacht', price: 2500, description: 'Ultimate premium gift' },
];

export default function GiftStorePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-28 text-white">
      <div className="px-4 pt-5">
        <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow backdrop-blur-xl mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Gift Store</p>
              <h1 className="text-3xl font-bold mt-2">Send premium gifts live</h1>
            </div>
            <Link href="/wallet" className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              Back to wallet
            </Link>
          </div>
          <div className="mt-5 rounded-[28px] bg-black/40 border border-white/10 p-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-400">Coin balance</p>
              <p className="text-4xl font-bold text-white">12,580 <span className="text-yellow-300">🪙</span></p>
            </div>
            <button className="h-full rounded-3xl bg-gradient-spark px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(255,0,127,0.25)] transition hover:brightness-110">
              Top Up Coins
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4">
        <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow mb-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button key={category} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10">
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {gifts.map((gift) => (
            <div key={gift.id} className="glass-soft rounded-[32px] border border-white/10 p-5 shadow-glow transition hover:-translate-y-1 hover:border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-5xl">
                  {gift.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{gift.name}</h2>
                  <p className="text-sm text-gray-400">{gift.description}</p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-white">{gift.price}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">coins</p>
                </div>
                <button className="rounded-full bg-gradient-spark px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
