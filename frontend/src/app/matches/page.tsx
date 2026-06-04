"use client";

import Link from 'next/link';

export default function MatchesPage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto glass rounded-3xl p-8 shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-4">Your Matches</h1>
        <p className="text-gray-400 mb-6">
          This section will show your top matches once you start connecting with people. For now, explore discover and start meeting new people.
        </p>
        <div className="space-y-3">
          <Link href="/discover" className="block w-full text-center py-3 rounded-2xl bg-gradient-spark text-white font-semibold transition hover:opacity-90">
            Go to Discover
          </Link>
          <Link href="/messages" className="block w-full text-center py-3 rounded-2xl border border-white/10 text-white/90 transition hover:bg-white/5">
            Open Chats
          </Link>
        </div>
      </div>
    </div>
  );
}
