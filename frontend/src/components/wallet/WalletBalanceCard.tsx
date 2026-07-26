'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparkCoinIcon } from '@/components/ui/SparkCoinIcon';


interface WalletBalanceCardProps {
  coinBalance: number;
  usdtBalance: number;
  walletAddress?: string;
  isConnected: boolean;
  securityStatus: {
    twoFactor: boolean;
    deviceVerified: boolean;
    lastLogin?: string;
  };
  onBuyCoins?: () => void;
  onGiftCoins?: () => void;
  onTransactions?: () => void;
}

export default function WalletBalanceCard({
  coinBalance,
  usdtBalance,
  walletAddress,
  isConnected,
  securityStatus,
  onBuyCoins,
  onGiftCoins,
  onTransactions,
}: WalletBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/10 border border-white/[0.08] p-6 sm:p-8"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#ff007f] opacity-[0.05] blur-[100px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7a00cc] opacity-[0.03] blur-[120px] animate-float-delayed" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Spark Wallet</p>
              <p className="text-xs text-white/20">Premium Digital Wallet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] text-emerald-400 font-medium">Connected</span>
              </div>
            )}
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Spark Coins */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-2">Spark Coins</p>
            <motion.p
              key={coinBalance}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums"
            >
              {(coinBalance ?? 0).toLocaleString()}
              <span className="text-base sm:text-lg font-semibold text-white/40 ml-2"><SparkCoinIcon size={16} className="inline-block" /></span>
            </motion.p>
          </div>

          {/* USDT Balance */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-2">USDT Balance</p>
            <motion.p
              key={usdtBalance}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums"
            >
              {(usdtBalance ?? 0).toFixed(2)}
              <span className="text-base sm:text-lg font-semibold text-white/40 ml-2">USDT</span>
            </motion.p>
          </div>
        </div>

        {/* Security Status */}
        <div className="flex flex-wrap items-center gap-3">
          {securityStatus.twoFactor && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Shield size={10} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400">2FA Enabled</span>
            </div>
          )}
          {securityStatus.deviceVerified && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <CheckCircle size={10} className="text-cyan-400" />
              <span className="text-[9px] text-cyan-400">Device Verified</span>
            </div>
          )}
          {securityStatus.lastLogin && (
            <span className="text-[9px] text-white/20">
              Last login: {new Date(securityStatus.lastLogin).toLocaleDateString()}
            </span>
          )}
          {walletAddress && (
            <span className="text-[9px] text-white/20 truncate max-w-[120px]">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBuyCoins}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white text-sm font-bold shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Buy Coins
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGiftCoins}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] text-white text-sm font-bold hover:bg-white/[0.12] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M11 3v4a2 2 0 0 0 2 2h4"/></svg>
            Gift Coins
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTransactions}
            className="p-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.12] transition-all"
            aria-label="Transaction History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}