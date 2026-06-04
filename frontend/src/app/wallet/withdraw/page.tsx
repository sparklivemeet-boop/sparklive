"use client";

import Link from 'next/link';
import { ArrowLeft, Banknote, Link2 } from 'lucide-react';
import { useState } from 'react';

export default function WithdrawPage() {
  const [method, setMethod] = useState('bank');
  const [amount, setAmount] = useState('');

  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-24">
      <div className="px-4 pt-5">
        <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow backdrop-blur-xl mb-6 flex items-center gap-4">
          <Link href="/wallet" className="rounded-full bg-white/5 p-3 transition hover:bg-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Withdraw</p>
            <h1 className="text-3xl font-bold">Cash out earnings</h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4">
        <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--color-spark-pink)] to-[var(--color-spark-purple)] flex items-center justify-center text-3xl shadow-[0_20px_50px_rgba(255,0,127,0.25)]">
              💰
            </div>
            <div>
              <p className="text-sm text-gray-400">Earnings Balance</p>
              <p className="text-4xl font-extrabold text-white">$1,250.00</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Choose your payout method and send your earnings to bank or crypto instantly.</p>
        </div>

        <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-3">Withdraw Method</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`rounded-3xl p-4 text-left border ${method === 'bank' ? 'border-[var(--color-spark-pink)] bg-white/10' : 'border-white/10'} transition`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="text-[var(--color-spark-pink)]" />
                  <div>
                    <p className="font-semibold text-white">Bank Transfer</p>
                    <p className="text-sm text-gray-400">Direct deposit to your account</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod('crypto')}
                className={`rounded-3xl p-4 text-left border ${method === 'crypto' ? 'border-[var(--color-spark-pink)] bg-white/10' : 'border-white/10'} transition`}
              >
                <div className="flex items-center gap-3">
                  <Link2 className="text-[var(--color-spark-pink)]" />
                  <div>
                    <p className="font-semibold text-white">USDT Transfer</p>
                    <p className="text-sm text-gray-400">Crypto payout via TRC20</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              placeholder="Enter amount"
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-[var(--color-spark-pink)] transition"
            />
          </div>

          <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
            <p className="text-sm text-gray-400">Fee Summary</p>
            <p className="text-white mt-1">10% processing fee applies. You will receive your payout within 1-2 business days.</p>
          </div>

          <button className="w-full rounded-3xl py-4 bg-gradient-spark text-white font-bold text-lg shadow-[0_15px_40px_rgba(255,0,127,0.25)] hover:brightness-110 transition">
            Withdraw Now
          </button>
        </div>
      </main>
    </div>
  );
}
