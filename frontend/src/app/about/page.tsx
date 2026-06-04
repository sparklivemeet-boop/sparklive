import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-24">
      <div className="px-4 pt-6">
        <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow backdrop-blur-xl max-w-4xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr] items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">About SparkLive</p>
              <h1 className="text-4xl font-bold mt-3">Exclusive social streaming for creators and fans.</h1>
              <p className="mt-4 text-gray-300 leading-relaxed">SparkLive blends discovery, real-time chat, and premium live gifting into one luxurious mobile experience. Build your profile, grow your audience, and earn from every engagement.</p>
            </div>
            <div className="rounded-[32px] bg-white/5 p-5 border border-white/10 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Creator revenue</p>
              <p className="mt-4 text-4xl font-bold text-white">$12.5k</p>
              <p className="mt-2 text-gray-400">Earn from live sessions, gifts, and premium fans.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Discover', description: 'Swipe with beautiful profile cards, smart filters, and nearby matches.' },
              { title: 'Live', description: 'Go live with animated gifts, chat, viewer count, and creator rewards.' },
              { title: 'Chat', description: 'Neon message bubbles, voice notes, and private story interactions.' },
              { title: 'Wallet', description: 'Track coin balance, earnings, crypto withdrawals, and gift history.' }
            ].map((item) => (
              <div key={item.title} className="glass rounded-[32px] border border-white/10 p-5 shadow-glow">
                <h2 className="text-xl font-semibold text-white mb-2">{item.title}</h2>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="flex-1 rounded-full bg-gradient-spark px-6 py-4 text-center font-semibold text-white transition hover:-translate-y-0.5">
              Create an account
            </Link>
            <Link href="/discover" className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10">
              View discover
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
