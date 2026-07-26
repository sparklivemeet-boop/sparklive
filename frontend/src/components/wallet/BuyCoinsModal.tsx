'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Loader2, QrCode, Wallet, ArrowRight, Clock, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/apiClient';
import { SparkCoinIcon } from '@/components/ui/SparkCoinIcon';


interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonusCoins?: number;
  isPopular?: boolean;
}

interface PaymentNetwork {
  id: string;
  name: string;
  token: string;
  network: string;
  icon: string;
  estimatedTime: string;
  contractAddress: string;
}

interface BuyCoinsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (coins: number) => void;
}

const PAYMENT_NETWORKS: PaymentNetwork[] = [
  {
    id: 'usdt-bep20',
    name: 'USDT',
    token: 'USDT',
    network: 'BNB Smart Chain (BEP-20)',
    icon: '<SparkCoinIcon size={16} className="inline-block" />',
    estimatedTime: '1-3 minutes',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
  },
  {
    id: 'usdc-base',
    name: 'USDC',
    token: 'USDC',
    network: 'Base Network',
    icon: '🔵',
    estimatedTime: '1-3 minutes',
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
];

export default function BuyCoinsModal({ open, onClose, onSuccess }: BuyCoinsModalProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<'packages' | 'payment' | 'confirming' | 'success'>('packages');
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Fetch packages from backend
  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    setError(null);
    setStep('packages');
    setSelectedPackage(null);
    setSelectedNetwork(null);
    
    apiGet<any>('/api/wallets/packages', token)
      .then(data => {
        const pkgList = Array.isArray(data) ? data : data?.packages ?? data?.data ?? [];
        if (pkgList.length > 0) {
          setPackages(pkgList);
        } else {
          // Fallback packages if backend not configured
          setPackages([
            { id: '100', name: 'Starter Pack', coins: 100, price: 1.00 },
            { id: '500', name: 'Popular Pack', coins: 500, price: 5.00, bonusCoins: 25, isPopular: true },
            { id: '1000', name: 'Standard Pack', coins: 1000, price: 10.00, bonusCoins: 50 },
            { id: '5000', name: 'Premium Pack', coins: 5000, price: 50.00, bonusCoins: 250 },
            { id: '10000', name: 'Elite Pack', coins: 10000, price: 100.00, bonusCoins: 500 },
            { id: '25000', name: 'Ultimate Pack', coins: 25000, price: 250.00, bonusCoins: 1500 },
            { id: '50000', name: 'Legendary Pack', coins: 50000, price: 500.00, bonusCoins: 3500 },
            { id: '100000', name: 'Supreme Pack', coins: 100000, price: 1000.00, bonusCoins: 7500 },
          ]);
        }
      })
      .catch(() => {
        setPackages([
          { id: '100', name: 'Starter Pack', coins: 100, price: 1.00 },
          { id: '500', name: 'Popular Pack', coins: 500, price: 5.00, bonusCoins: 25, isPopular: true },
          { id: '1000', name: 'Standard Pack', coins: 1000, price: 10.00, bonusCoins: 50 },
          { id: '5000', name: 'Premium Pack', coins: 5000, price: 50.00, bonusCoins: 250 },
          { id: '10000', name: 'Elite Pack', coins: 10000, price: 100.00, bonusCoins: 500 },
          { id: '25000', name: 'Ultimate Pack', coins: 25000, price: 250.00, bonusCoins: 1500 },
          { id: '50000', name: 'Legendary Pack', coins: 50000, price: 500.00, bonusCoins: 3500 },
          { id: '100000', name: 'Supreme Pack', coins: 100000, price: 1000.00, bonusCoins: 7500 },
        ]);
      })
      .finally(() => setLoading(false));
  }, [open, token]);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setStep('payment');
    setPaymentAmount(pkg.price);
  };

  const handleSelectNetwork = async (network: PaymentNetwork) => {
    setSelectedNetwork(network);
    setError(null);
    
    if (!token || !selectedPackage) return;
    
    try {
      const data = await apiPost<any>('/api/wallets/payment-address', {
        packageId: selectedPackage.id,
        network: network.id,
        amount: selectedPackage.price,
      }, token);
      
      setPaymentAddress(data?.address || '0x6a6251f0732730e1bfe0051a54b2cd2c6412910b');
    } catch {
      // Fallback demo address
      setPaymentAddress('0x6a6251f0732730e1bfe0051a54b2cd2c6412910b');
    }
  };

  const handleCopyAddress = () => {
    if (paymentAddress) {
      navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    if (!token || !selectedPackage || !selectedNetwork) return;
    setConfirming(true);
    setError(null);
    setStep('confirming');
    
    try {
      // Poll for transaction confirmation
      const result = await apiPost<any>('/api/wallets/verify-payment', {
        packageId: selectedPackage.id,
        network: selectedNetwork.id,
        txHash: txHash || 'pending',
      }, token);
      
      setTxHash(result?.txHash || '0x0000000000000000000000000000000000000000');
      setStep('success');
      
      if (onSuccess) {
        onSuccess(selectedPackage.coins + (selectedPackage.bonusCoins || 0));
      }
    } catch (err: any) {
      setError(err.message || 'Payment verification failed. Please contact support.');
      setStep('payment');
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    setStep('packages');
    setSelectedPackage(null);
    setSelectedNetwork(null);
    setError(null);
    setTxHash(null);
    setConfirming(false);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 sm:inset-auto sm:top-[5%] sm:bottom-[5%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-[101] flex flex-col rounded-3xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Buy Spark Coins"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Wallet size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Buy Spark Coins</h2>
                  <p className="text-[10px] text-gray-500">
                    {step === 'packages' && 'Choose a coin package'}
                    {step === 'payment' && 'Complete your payment'}
                    {step === 'confirming' && 'Verifying transaction'}
                    {step === 'success' && 'Purchase complete'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
              {/* Step 1: Select Package */}
              {step === 'packages' && (
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="animate-spin text-[#ff007f]" />
                    </div>
                  ) : (
                    packages.map((pkg, i) => (
                      <motion.button
                        key={pkg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelectPackage(pkg)}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left',
                          selectedPackage?.id === pkg.id
                            ? 'border-[#ff007f]/30 bg-[#ff007f]/5'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-lg">
                            <SparkCoinIcon size={16} className="inline-block" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{pkg.name}</p>
                            <p className="text-xs text-white/40">
                              {pkg.coins.toLocaleString()} coins
                              {pkg.bonusCoins ? ` + ${pkg.bonusCoins} bonus` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">${pkg.price.toFixed(2)}</p>
                          {pkg.isPopular && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white font-bold">
                              Best Value
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 'payment' && selectedPackage && (
                <div className="space-y-5">
                  {/* Selected Package Summary */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">Package</span>
                      <span className="text-sm font-semibold text-white">{selectedPackage.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">Spark Coins</span>
                      <span className="text-sm font-semibold text-white">
                        {selectedPackage.coins.toLocaleString()}
                        {selectedPackage.bonusCoins ? ` + ${selectedPackage.bonusCoins} bonus` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Total Price</span>
                      <span className="text-sm font-bold text-amber-400">${selectedPackage.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Select Network */}
                  <div>
                    <p className="text-xs font-medium text-white/50 mb-2">Select Payment Network</p>
                    <div className="space-y-2">
                      {PAYMENT_NETWORKS.map(network => (
                        <button
                          key={network.id}
                          onClick={() => handleSelectNetwork(network)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left',
                            selectedNetwork?.id === network.id
                              ? 'border-emerald-500/30 bg-emerald-500/5'
                              : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                          )}
                        >
                          <span className="text-xl">{network.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{network.token}</p>
                            <p className="text-[10px] text-white/40">{network.network}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <Clock size={10} />
                              {network.estimatedTime}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {selectedNetwork && paymentAddress && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/15 p-4 space-y-3"
                    >
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Send Payment</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Network</span>
                          <span className="text-white font-medium">{selectedNetwork.network}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Token</span>
                          <span className="text-white font-medium">{selectedNetwork.token}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Amount</span>
                          <span className="text-white font-bold">${paymentAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div>
                        <p className="text-[10px] text-white/30 mb-1.5">Send to this address:</p>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
                          <code className="flex-1 text-[10px] text-white/60 font-mono truncate">
                            {paymentAddress}
                          </code>
                          <button
                            onClick={handleCopyAddress}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.05] transition"
                          >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {/* Transaction Hash Input */}
                      <div>
                        <p className="text-[10px] text-white/30 mb-1.5">Transaction Hash (after sending):</p>
                        <input
                          value={txHash || ''}
                          onChange={e => setTxHash(e.target.value)}
                          placeholder="0x..."
                          className="w-full rounded-xl border border-white/[0.06] bg-black/40 px-3 py-2.5 text-xs text-white placeholder-gray-600 font-mono outline-none focus:border-emerald-500/30 transition-all"
                        />
                      </div>

                      <div className="flex items-start gap-2 text-[10px] text-white/30">
                        <AlertCircle size={10} className="shrink-0 mt-0.5" />
                        <p>Send exactly ${paymentAmount.toFixed(2)} worth of {selectedNetwork.token} on {selectedNetwork.network}. Your coins will be credited automatically after confirmation.</p>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirming */}
              {step === 'confirming' && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mb-4"
                  >
                    <Loader2 size={28} className="text-emerald-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2">Verifying Transaction</h3>
                  <p className="text-sm text-white/40 max-w-xs">
                    Please wait while we confirm your payment on the blockchain. This usually takes 1-3 minutes.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
                    <Shield size={12} />
                    Secured by blockchain
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mb-4"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl"
                    >
                      <SparkCoinIcon size={16} className="inline-block" />
                    </motion.span>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-white mb-2"
                  >
                    Purchase Complete!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-white/40 max-w-xs"
                  >
                    {selectedPackage?.coins.toLocaleString()} Spark Coins
                    {selectedPackage?.bonusCoins ? ` + ${selectedPackage.bonusCoins} bonus` : ''} have been added to your wallet.
                  </motion.p>
                  {txHash && (
                    <motion.a
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      href={`https://bscscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-1.5 text-xs text-[#00d8ff] hover:text-[#06f7ff] transition-colors"
                    >
                      <ExternalLink size={12} />
                      View on Explorer
                    </motion.a>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-white/[0.06] px-6 py-4">
              {step === 'packages' && (
                <p className="text-center text-[10px] text-white/20">
                  Secured by blockchain · Instant delivery · No hidden fees
                </p>
              )}
              {step === 'payment' && selectedNetwork && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setStep('packages'); setSelectedNetwork(null); setError(null); }}
                    className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.04] py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.08] transition"
                  >
                    Back
                  </button>
                  <motion.button
                    onClick={handleConfirmPayment}
                    disabled={confirming || !txHash}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold transition-all',
                      !confirming && txHash
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white/[0.05] text-gray-500 cursor-not-allowed'
                    )}
                  >
                    {confirming ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={14} />
                        Confirm Payment
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              {step === 'success' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-sm font-bold text-white"
                >
                  Done
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}