"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';

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

export default function Wallet() {
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

  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-24">
      <div className="px-4 pt-5">
        <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow backdrop-blur-xl mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-gray-400">Wallet</p>
              <h1 className="text-3xl font-bold mt-2">Creator earnings</h1>
            </div>
            <div className="rounded-3xl bg-white/5 p-3">
              <span className="text-sm text-gray-300">Live</span>
              <p className="font-semibold text-white">1.2k viewers</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-6">
        {loading ? (
          <div className="glass rounded-[36px] border border-white/10 p-10 text-center text-gray-400 shadow-glow">Loading wallet and transactions...</div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow overflow-hidden relative">
                <div className="absolute -right-10 -top-10 text-[5rem] opacity-10">🪙</div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Coin balance</p>
                <p className="text-5xl font-extrabold text-white">
                  {wallet?.coinBalance ?? 0} <span className="text-yellow-300 text-2xl">🪙</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">Use your coins to power live gifting and VIP moments.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/gift-store" className="flex-1 rounded-full bg-gradient-spark px-6 py-4 text-center font-semibold text-white transition hover:-translate-y-0.5">
                    Top Up Coins
                  </Link>
                  <Link href="/wallet/withdraw" className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10">
                    Withdraw
                  </Link>
                </div>
              </div>

              <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-3">Earnings</p>
                <p className="text-5xl font-extrabold text-white">${wallet?.earningsBalance?.toFixed(2) ?? '0.00'}</p>
                <p className="text-sm text-gray-400 mt-2">Total revenue earned from gifts and streams.</p>
                <div className="mt-6 grid gap-3">
                  {[
                    { label: 'Revenue Today', value: '+$320' },
                    { label: 'Weekly Trend', value: '+12%' },
                    { label: 'Pending payout', value: '$420.00' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl bg-white/5 p-4 border border-white/10">
                      <p className="text-sm text-gray-400">{item.label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow mt-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Recent transactions</p>
                  <h2 className="text-xl font-bold text-white">Activity feed</h2>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-2 text-xs uppercase text-gray-300">Live</span>
              </div>

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-center text-gray-400">No recent transactions yet.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-4 rounded-3xl bg-white/5 border border-white/10 px-4 py-4">
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
          </>
        )}
      </main>
    </div>
  );
}
