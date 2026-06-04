import Link from 'next/link';
import ConnectSection from '@/components/ConnectSection';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,0,127,0.18),_transparent_18%),radial-gradient(circle_at_20%_80%,_rgba(122,0,204,0.12),_transparent_16%)]" />
      <div className="relative max-w-6xl mx-auto flex flex-col gap-10 lg:flex-row items-center justify-between py-12">
        <div className="w-full lg:w-1/2 space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 glass-soft text-sm font-semibold uppercase tracking-[0.28em] text-white/80 shadow-glow">
            Premium social streaming & discovery
          </span>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
            SparkLive — <span className="text-gradient">where every connection glows.</span>
          </h1>

          <p className="max-w-xl text-lg text-gray-300 leading-relaxed">
            Discover beautiful profiles, swipe with style, chat in neon glass rooms, and go live to earn real rewards. The app experience is built for creators and premium social explorers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-gradient-spark px-8 py-4 text-lg font-bold text-white shadow-[0_20px_60px_rgba(255,0,127,0.25)] transition hover:-translate-y-0.5">
              Join SparkLive
            </Link>
            <Link href="/discover" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10">
              Explore Discover
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {['Live', 'Matches', 'Gifts', 'Wallet'].map((item) => (
              <div key={item} className="glass-soft rounded-3xl p-4 text-center">
                <p className="text-sm text-gray-400">{item}</p>
                <p className="mt-2 text-xl font-bold text-white">Fast</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative flex justify-center">
          <div className="relative w-full max-w-sm rounded-[48px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.35)] border border-white/10 bg-black/70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,0,127,0.32),_transparent_28%),radial-gradient(circle_at_100%_100%,_rgba(122,0,204,0.2),_transparent_24%)] pointer-events-none" />
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" alt="SparkLive preview" className="h-[520px] w-full object-cover" />
            <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-white text-xl font-bold">Ella, 24</p>
                  <p className="text-sm text-gray-400">Lagos, Nigeria</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[0.75rem] uppercase tracking-[0.2em] text-white/80">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">Love good vibes, travel, music and amazing conversations.</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {['Nearby', 'Verified', 'Premium'].map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-4 sm:grid-cols-3 mt-10">
        <div className="glass-soft rounded-[32px] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-3">Creator Rewards</p>
          <h2 className="text-3xl font-semibold text-white">$12.5k</h2>
          <p className="text-sm text-gray-400 mt-2">Earn from gifts, streams, and fan subscriptions.</p>
        </div>
        <div className="glass-soft rounded-[32px] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-3">Active Live</p>
          <h2 className="text-3xl font-semibold text-white">142</h2>
          <p className="text-sm text-gray-400 mt-2">Streamers currently broadcasting in premium rooms.</p>
        </div>
        <div className="glass-soft rounded-[32px] border border-white/10 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-3">Matches Today</p>
          <h2 className="text-3xl font-semibold text-white">689</h2>
          <p className="text-sm text-gray-400 mt-2">High-quality connections with smart recommendations.</p>
        </div>
      </div>

      {/* Connect With Us Section */}
      <ConnectSection />
    </div>
  );
}
