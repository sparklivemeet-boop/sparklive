'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Coins,
  CreditCard,
} from 'lucide-react';
import { fetchWallet, fetchCoinTransactions, fetchGiftHistory, fetchWithdrawals, requestWithdrawal, saveWalletAddress, getWelcomeRewardStatus, claimWelcomeReward } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/lib/i18n/context';

type Tab = 'overview' | 'coins' | 'gifts' | 'withdrawals';

const MIN_WITHDRAWAL_USD = 20;

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [wallet, setWallet] = useState<any>(null);
  const [coinTxs, setCoinTxs] = useState<any[]>([]);
  const [giftHistory, setGiftHistory] = useState<any>({ sentGifts: [], receivedGifts: [] });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdtAddress, setUsdtAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [welcomeReward, setWelcomeReward] = useState<any>(null);
  const [claimingReward, setClaimingReward] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [walletData, coinData, giftData, withdrawalData, rewardStatus] = await Promise.all([
        fetchWallet().catch(() => null),
        fetchCoinTransactions().catch(() => []),
        fetchGiftHistory().catch(() => ({ sentGifts: [], receivedGifts: [] })),
        fetchWithdrawals().catch(() => []),
        getWelcomeRewardStatus().catch(() => null),
      ]);
      if (walletData) setWallet(walletData);
      if (coinData) setCoinTxs(Array.isArray(coinData) ? coinData : []);
      if (giftData) setGiftHistory(giftData);
      if (withdrawalData) setWithdrawals(Array.isArray(withdrawalData) ? withdrawalData : []);
      if (rewardStatus) {
        setWelcomeReward(rewardStatus);
        setUsdtAddress(walletData?.usdtWalletAddress || '');
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    }
    setLoading(false);
  }

  async function handleClaimReward() {
    setClaimingReward(true);
    setMessage(null);
    try {
      const result = await claimWelcomeReward();
      setMessage({ type: 'success', text: 'Welcome reward claimed! 100 Spark Coins added.' });
      setWelcomeReward({ ...welcomeReward, claimed: true, claimedAt: new Date().toISOString() });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to claim reward' });
    }
    setClaimingReward(false);
  }

  async function handleSaveAddress() {
    if (!usdtAddress.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveWalletAddress(usdtAddress.trim());
      setMessage({ type: 'success', text: 'USDT (BEP-20) wallet address saved.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Invalid wallet address format' });
    }
    setSaving(false);
  }

  async function handleWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < MIN_WITHDRAWAL_USD) {
      setMessage({ type: 'error', text: `Minimum withdrawal is $${MIN_WITHDRAWAL_USD} USD` });
      return;
    }
    if (!withdrawAddress.trim()) {
      setMessage({ type: 'error', text: 'Wallet address is required' });
      return;
    }
    setWithdrawing(true);
    setMessage(null);
    try {
      await requestWithdrawal({ amount, walletAddress: withdrawAddress.trim() });
      setMessage({ type: 'success', text: `Withdrawal request for $${amount} USDT (BEP-20) submitted.` });
      setWithdrawAmount('');
      setWithdrawAddress('');
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Withdrawal failed' });
    }
    setWithdrawing(false);
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'coins', label: 'Coins', icon: Coins },
    { id: 'gifts', label: 'Gifts', icon: Gift },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center">
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Wallet</h1>
          <p className="text-xs text-gray-500">Manage your Spark Coins, gifts, and withdrawals</p>
        </div>
      </div>

      {/* Welcome Reward Banner */}
      {welcomeReward && !welcomeReward.claimed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/20 p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Welcome! 🎉</h3>
              <p className="text-sm text-gray-400">Claim your <span className="text-[#ff007f] font-bold">100 Spark Coins</span> welcome reward. One-time only!</p>
            </div>
            <button
              onClick={handleClaimReward}
              disabled={claimingReward}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {claimingReward ? 'Claiming...' : 'Claim Reward'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`rounded-xl p-4 text-sm ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 border border-[#ff007f]/10 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Coins size={20} className="text-[#ff007f]" />
            <span className="text-sm text-gray-400">Spark Coins</span>
          </div>
          <p className="text-3xl font-bold text-white">{wallet?.coinBalance || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Non-withdrawable. Use for gifts & features.</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard size={20} className="text-green-400" />
            <span className="text-sm text-gray-400">Earnings</span>
          </div>
          <p className="text-3xl font-bold text-white">${wallet?.earningsBalance?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">Withdrawable via USDT (BEP-20)</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Gift size={20} className="text-[#00d8ff]" />
            <span className="text-sm text-gray-400">Gifts</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {giftHistory.receivedGifts?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total gifts received</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 text-white border border-[#ff007f]/10'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Spark Coin Info */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">About Spark Coins</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] mt-1.5 flex-shrink-0" />
                  <span>Spark Coins are non-withdrawable and can only be used inside SparkLive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] mt-1.5 flex-shrink-0" />
                  <span>Spend coins on Virtual Gifts and future premium in-app features.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] mt-1.5 flex-shrink-0" />
                  <span>Coins cannot be converted to cash or transferred between users (except via official gifting).</span>
                </li>
              </ul>
            </div>

            {/* Welcome Reward Status */}
            {welcomeReward?.claimed && (
              <div className="rounded-2xl bg-green-500/5 border border-green-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-400">Welcome Reward Claimed</p>
                    <p className="text-xs text-gray-500">
                      {welcomeReward.coins} Spark Coins awarded on {new Date(welcomeReward.claimedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* USDT Wallet Address */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">USDT (BEP-20) Withdrawal Address</h3>
              <p className="text-xs text-gray-500 mb-3">Only USDT on BNB Smart Chain (BEP-20) is supported for withdrawals.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  placeholder="0x... (BEP-20 wallet address)"
                  className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff007f]/30"
                />
                <button
                  onClick={handleSaveAddress}
                  disabled={saving || !usdtAddress.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Recent Coin Transactions */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Recent Coin Activity</h3>
              {coinTxs.length === 0 ? (
                <p className="text-sm text-gray-500">No coin transactions yet.</p>
              ) : (
                <div className="space-y-2">
                  {coinTxs.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'WELCOME_REWARD' ? 'bg-[#ff007f]/10 text-[#ff007f]' :
                          tx.type === 'GIFT_SENT' ? 'bg-red-500/10 text-red-400' :
                          'bg-green-500/10 text-green-400'
                        }`}>
                          {tx.type === 'WELCOME_REWARD' ? <Sparkles size={14} /> :
                           tx.type === 'GIFT_SENT' ? <ArrowUpRight size={14} /> :
                           <ArrowDownLeft size={14} />}
                        </div>
                        <div>
                          <p className="text-sm text-white capitalize">{tx.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-400">+{tx.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coins Tab */}
        {activeTab === 'coins' && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Coin Transaction History</h3>
            {coinTxs.length === 0 ? (
              <p className="text-sm text-gray-500">No coin transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {coinTxs.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'WELCOME_REWARD' ? 'bg-[#ff007f]/10 text-[#ff007f]' :
                        tx.type === 'GIFT_SENT' ? 'bg-red-500/10 text-red-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {tx.type === 'WELCOME_REWARD' ? <Sparkles size={14} /> :
                         tx.type === 'GIFT_SENT' ? <ArrowUpRight size={14} /> :
                         <ArrowDownLeft size={14} />}
                      </div>
                      <div>
                        <p className="text-sm text-white capitalize">{tx.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500">{tx.description || ''}</p>
                        <p className="text-xs text-gray-600">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                      {tx.balance !== undefined && (
                        <p className="text-xs text-gray-600">Balance: {tx.balance}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gifts Tab */}
        {activeTab === 'gifts' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Received Gifts</h3>
              {giftHistory.receivedGifts?.length === 0 ? (
                <p className="text-sm text-gray-500">No gifts received yet.</p>
              ) : (
                <div className="space-y-2">
                  {giftHistory.receivedGifts?.map((gift: any) => (
                    <div key={gift.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Gift size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{gift.gift?.name || 'Gift'}</p>
                          <p className="text-xs text-gray-500">From @{gift.sender?.username || 'anonymous'}</p>
                        </div>
                      </div>
                      <span className="text-sm text-[#ff007f]">{gift.amount} coins</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Sent Gifts</h3>
              {giftHistory.sentGifts?.length === 0 ? (
                <p className="text-sm text-gray-500">No gifts sent yet.</p>
              ) : (
                <div className="space-y-2">
                  {giftHistory.sentGifts?.map((gift: any) => (
                    <div key={gift.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Gift size={14} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{gift.gift?.name || 'Gift'}</p>
                          <p className="text-xs text-gray-500">To @{gift.receiver?.username || 'user'}</p>
                        </div>
                      </div>
                      <span className="text-sm text-red-400">-{gift.amount} coins</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            {/* Withdrawal Form */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Request USDT (BEP-20) Withdrawal</h3>
              <p className="text-xs text-gray-500 mb-4">
                Minimum withdrawal: ${MIN_WITHDRAWAL_USD} USD. Only USDT on BNB Smart Chain (BEP-20) is supported.
                Only creators who receive gifts can withdraw.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Amount (USD)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min={MIN_WITHDRAWAL_USD}
                    step="0.01"
                    placeholder={`Min $${MIN_WITHDRAWAL_USD}`}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff007f]/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">USDT (BEP-20) Wallet Address</label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff007f]/30"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawAmount || !withdrawAddress}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {withdrawing ? 'Processing...' : `Withdraw USDT (BEP-20)`}
                </button>
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Withdrawal History</h3>
              {withdrawals.length === 0 ? (
                <p className="text-sm text-gray-500">No withdrawals yet.</p>
              ) : (
                <div className="space-y-2">
                  {withdrawals.map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-sm text-white">${w.amount.toFixed(2)} USDT</p>
                        <p className="text-xs text-gray-500">{w.walletAddress?.slice(0, 10)}...{w.walletAddress?.slice(-4)}</p>
                        <p className="text-xs text-gray-600">{new Date(w.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                        w.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                        w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                        w.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}