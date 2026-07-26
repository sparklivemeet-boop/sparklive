'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Gift, Sparkles, Loader2, History, TrendingUp, Filter, Search, ChevronRight, AlertTriangle, Shield, Clock, ExternalLink, Ban, ShoppingBag, Coins, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import BuyCoinsModal from '@/components/wallet/BuyCoinsModal';
import { GiftIcon } from '@/components/ui/GiftIcon';
import { SparkCoinIcon } from '@/components/ui/SparkCoinIcon';



export default function WalletPage() {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'gifts'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWallet = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [walletData, txData, giftData] = await Promise.all([
        apiGet<any>('/api/wallets/me', token).catch(() => null),
        apiGet<any>('/api/wallets/transactions', token).catch(() => ({ transactions: [] })),
        apiGet<any>('/api/wallets/gifts', token).catch(() => ({ gifts: [] })),
      ]);
      setWallet(walletData);
      const txList = Array.isArray(txData) ? txData : txData?.transactions ?? txData?.data ?? [];
      setTransactions(Array.isArray(txList) ? txList : []);
      const giftList = Array.isArray(giftData) ? giftData : giftData?.gifts ?? giftData?.data ?? [];
      setGifts(Array.isArray(giftList) ? giftList : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const coinBalance = wallet?.coinBalance ?? 0;
  const usdtBalance = wallet?.usdtBalance ?? 0;
  const walletAddress = wallet?.walletAddress;

  const securityStatus = {
    twoFactor: wallet?.twoFactorEnabled ?? false,
    deviceVerified: wallet?.deviceVerified ?? false,
    lastLogin: wallet?.lastLogin,
  };

  const filteredTx = transactions.filter(tx => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!tx.description?.toLowerCase().includes(q) && !tx.type?.toLowerCase().includes(q)) return false;
    }
    if (filter === 'all') return true;
    return tx.type === (filter === 'credit' ? 'CREDIT' : 'DEBIT');
  });

  const handleCoinsPurchased = (coins: number) => {
    setWallet((prev: any) => prev ? { ...prev, coinBalance: (prev.coinBalance || 0) + coins } : prev);
    setShowBuyModal(false);
    fetchWallet();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-72 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-medium text-white/60 mb-2">Failed to load wallet</h2>
        <p className="text-sm text-white/30 mb-6">{error}</p>
        <button onClick={fetchWallet} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Wallet</h1>
              <p className="text-sm text-white/40">Manage your Spark Coins and payments</p>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <WalletBalanceCard
          coinBalance={coinBalance}
          usdtBalance={usdtBalance}
          walletAddress={walletAddress}
          isConnected={!!wallet}
          securityStatus={securityStatus}
          onBuyCoins={() => setShowBuyModal(true)}
          onGiftCoins={() => setShowGiftModal(true)}
          onTransactions={() => setActiveTab('transactions')}
        />

        {/* Buy Coins / Gift Coins Quick Actions - only if balance is 0 */}
        {coinBalance === 0 && transactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/15 flex items-center justify-center mb-5">
              <Coins size={36} className="text-amber-400/40" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Spark Coins yet</h3>
            <p className="text-sm text-white/30 max-w-sm mb-6">
              Purchase coins to support your favourite creators and unlock premium features.
            </p>
            <button
              onClick={() => setShowBuyModal(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all"
            >
              <Plus size={16} className="inline mr-2" />
              Buy Spark Coins
            </button>
          </motion.div>
        )}

        {/* Tabs: Transactions & Gifts */}
        {(coinBalance > 0 || transactions.length > 0 || gifts.length > 0) && (
          <>
            {/* Tab Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 w-fit"
            >
              <button
                onClick={() => setActiveTab('transactions')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === 'transactions' ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white' : 'text-gray-500 hover:text-white'
                )}
              >
                <History size={12} className="inline mr-1.5" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('gifts')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === 'gifts' ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white' : 'text-gray-500 hover:text-white'
                )}
              >
                <Gift size={12} className="inline mr-1.5" />
                Gifts
              </button>
            </motion.div>

            {/* Search & Filter */}
            {activeTab === 'transactions' && transactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1">
                  {(['all', 'credit', 'debit'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                        filter === f ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white' : 'text-gray-500 hover:text-white'
                      )}
                    >
                      {f === 'all' ? 'All' : f === 'credit' ? 'Received' : 'Sent'}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Transactions */}
            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-white/40" />
                    <h2 className="text-lg font-bold text-white">Transaction History</h2>
                  </div>
                  {transactions.length > 0 && (
                    <span className="text-xs text-white/20">{transactions.length} total</span>
                  )}
                </div>

                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <Wallet size={32} className="text-white/10 mb-3" />
                    <h3 className="text-white/50 font-medium text-base mb-1">No transactions yet</h3>
                    <p className="text-white/25 text-sm max-w-xs">
                      Your transaction history will appear here when you send or receive coins.
                    </p>
                  </div>
                ) : filteredTx.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <Search size={28} className="text-white/10 mb-3" />
                    <p className="text-sm text-white/30">No transactions match your search</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTx.map((tx: any, i: number) => {
                      const isCredit = tx.type === 'CREDIT' || tx.type === 'PURCHASE';
                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group"
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border',
                            isCredit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                          )}>
                            {isCredit ? (
                              <ArrowDownLeft size={16} className="text-emerald-400" />
                            ) : (
                              <ArrowUpRight size={16} className="text-red-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {tx.description || (isCredit ? 'Coins Received' : 'Coins Sent')}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/30">
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                              {tx.network && (
                                <>
                                  <span className="text-[10px] text-white/20">·</span>
                                  <span className="text-[10px] text-white/30">{tx.network}</span>
                                </>
                              )}
                              {tx.status && (
                                <>
                                  <span className="text-[10px] text-white/20">·</span>
                                  <span className={cn(
                                    'text-[10px]',
                                    tx.status === 'COMPLETED' && 'text-emerald-400',
                                    tx.status === 'PENDING' && 'text-amber-400',
                                    tx.status === 'FAILED' && 'text-red-400',
                                  )}>
                                    {tx.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn('text-sm font-bold', isCredit ? 'text-emerald-400' : 'text-red-400')}>
                              {isCredit ? '+' : '-'}{(tx.amount ?? 0).toLocaleString()}
                            </p>
                            {tx.balanceAfter != null && (
                              <p className="text-[9px] text-white/20">Balance: {tx.balanceAfter.toLocaleString()}</p>
                            )}
                          </div>
                          {tx.txHash && (
                            <a
                              href={`https://bscscan.com/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-white/10 hover:text-[#00d8ff] transition-colors opacity-0 group-hover:opacity-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Gifts */}
            {activeTab === 'gifts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift size={16} className="text-white/40" />
                    <h2 className="text-lg font-bold text-white">Gift History</h2>
                  </div>
                </div>

                {gifts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <Gift size={32} className="text-white/10 mb-3" />
                    <h3 className="text-white/50 font-medium text-base mb-1">No gifts sent yet</h3>
                    <p className="text-white/25 text-sm max-w-xs">
                      You haven't sent any gifts yet. Support creators during their live streams!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {gifts.map((gift: any, i: number) => (
                      <motion.div
                        key={gift.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 flex items-center justify-center text-lg">
                          {gift.emoji || '<GiftIcon size={16} className="inline-block" />'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{gift.giftName || 'Gift'}</p>
                          <p className="text-[10px] text-white/30">
                            To {gift.receiverName || 'a creator'} · {gift.createdAt ? new Date(gift.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-400">{(gift.amount ?? 0).toLocaleString()} <SparkCoinIcon size={16} className="inline-block" /></p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Withdrawals - Under Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 border border-amber-500/15 p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Ban size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">Withdrawals</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                  Under Maintenance
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Withdrawals are temporarily unavailable while we improve our payout infrastructure. 
                Support for creator withdrawals will be enabled in a future update.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-white/30">
                  <Clock size={12} />
                  Estimated completion: Q3 2026
                </div>
              </div>
              <button
                disabled
                className="mt-4 px-5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/30 text-sm font-medium cursor-not-allowed"
              >
                <ArrowUpRight size={14} className="inline mr-2" />
                Withdraw (Coming Soon)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Security Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#00d8ff]" />
            <h2 className="text-base font-bold text-white">Security</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-xs text-white/50">Wallet Connected</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {wallet ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-xs text-white/50">Network Status</span>
              <span className="text-xs text-emerald-400">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-xs text-white/50">Two-Factor Auth</span>
              <span className={cn('text-xs', securityStatus.twoFactor ? 'text-emerald-400' : 'text-amber-400')}>
                {securityStatus.twoFactor ? 'Enabled' : 'Not Set Up'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-xs text-white/50">Device Verification</span>
              <span className={cn('text-xs', securityStatus.deviceVerified ? 'text-emerald-400' : 'text-white/30')}>
                {securityStatus.deviceVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Buy Coins Modal */}
      <BuyCoinsModal
        open={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={handleCoinsPurchased}
      />

      {/* Gift Modal (placeholder - would open gift store) */}
      <AnimatePresence>
        {showGiftModal && (
          <GiftCoinsModal
            balance={coinBalance}
            onClose={() => setShowGiftModal(false)}
            onSend={async (amount) => {
              // Would integrate with gift API
              setShowGiftModal(false);
              fetchWallet();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Simple Gift Coins Modal
function GiftCoinsModal({ balance, onClose, onSend }: { balance: number; onClose: () => void; onSend: (amount: number) => Promise<void> }) {
  const [amount, setAmount] = useState<number>(0);
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);

  const presets = [10, 50, 100, 500, 1000];

  const handleSend = async () => {
    if (amount <= 0 || amount > balance || !recipient) return;
    setSending(true);
    await onSend(amount);
    setSending(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 sm:inset-auto sm:top-[20%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[101] flex flex-col rounded-3xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">Gift Coins</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-white/50">Your balance: <span className="font-bold text-amber-400">{balance.toLocaleString()} <SparkCoinIcon size={16} className="inline-block" /></span></p>
          
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Recipient Username</label>
            <input
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="@username"
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Amount</label>
            <input
              type="number"
              value={amount || ''}
              onChange={e => setAmount(Math.min(Math.max(0, parseInt(e.target.value) || 0), balance))}
              placeholder="0"
              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
            />
            <div className="flex items-center gap-2 mt-2">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(Math.min(p, balance))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    amount === p ? 'border-[#ff007f]/30 bg-[#ff007f]/10 text-[#ff007f]' : 'border-white/[0.06] text-white/40 hover:text-white'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={amount <= 0 || amount > balance || !recipient || sending}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin mx-auto" />
            ) : (
              `Send ${amount.toLocaleString()} <SparkCoinIcon size={16} className="inline-block" />`
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}