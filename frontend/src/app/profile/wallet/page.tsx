"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { ArrowLeft, Wallet } from 'lucide-react';

interface WalletData {
  coinBalance: number;
  earningsBalance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function ProfileWalletPage() {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [walletRes, txRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/wallets/me`, { headers: authHeaders(token) }),
          fetch(`${API_BASE_URL}/api/wallets/transactions`, { headers: authHeaders(token) }),
        ]);

        if (walletRes.ok) {
          setWallet(await walletRes.json());
        }

        if (txRes.ok) {
          setTransactions(await txRes.json());
        }
      } catch (error) {
        console.error('Failed to load wallet', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f] pb-10 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6 xl:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-3 text-sm text-gray-300">
            <Wallet size={18} className="text-pink-400" />
            <span className="font-semibold text-white">Wallet</span>
          </div>
        </div>

        <main className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[32px] border border-white/10 bg-black/50 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="absolute -right-10 -top-10 text-[5rem] opacity-10 pointer-events-none">🪙</div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Coin Balance</p>
              <p className="text-5xl font-extrabold text-white">
                {wallet?.coinBalance ?? 0} <span className="text-yellow-300 text-2xl">🪙</span>
              </p>
              <p className="text-sm text-gray-400 mt-2">Use your coins to power live gifting and VIP moments.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/gift-store" className="flex-1 rounded-full bg-gradient-spark px-6 py-4 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(255,0,127,0.25)]">
                  Top Up Coins
                </Link>
                <Link href="/wallet/withdraw" className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10">
                  Withdraw
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-black/50 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Earnings</p>
              <p className="text-5xl font-extrabold text-white">${wallet?.earningsBalance?.toFixed(2) ?? '0.00'}</p>
              <p className="text-sm text-gray-400 mt-2">Total revenue earned from gifts and streams.</p>
              <div className="mt-6 grid gap-3">
                {[
                  { label: 'Revenue Today', value: '+$320' },
                  { label: 'Weekly Trend', value: '+12%' },
                  { label: 'Pending payout', value: '$420.00' }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/50 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Recent transactions</p>
                <h2 className="text-2xl font-bold text-white">Activity Feed</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-xs uppercase text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center text-gray-400">
                  No recent transactions yet. Start earning by going live and receiving gifts.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 hover:bg-white/10 transition">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{tx.type}</p>
                      <p className="text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`text-right ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <p className="font-semibold">{tx.amount >= 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}</p>
                      <p className="text-xs text-gray-500">{tx.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}