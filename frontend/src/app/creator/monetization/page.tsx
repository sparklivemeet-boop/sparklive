"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Gift, Crown, Shield, CheckCircle, XCircle, CreditCard, Download, FileText } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { apiGet } from '@/lib/apiClient';

export default function MonetizationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const d = await apiGet('/api/creator/monetization'); setData(d); }
      catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const m = data || { giftsEnabled: false, subscriptionsEnabled: false, adsEnabled: false, sparkCoinBalance: 0, pendingWithdrawal: 0, totalWithdrawn: 0, availableForWithdrawal: 0, taxDocuments: [] };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={14} className="text-pink-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Monetization</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Monetization Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your monetization features and payouts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Gifts', enabled: m.giftsEnabled },
          { label: 'Subscriptions', enabled: m.subscriptionsEnabled },
          { label: 'Ads', enabled: m.adsEnabled },
        ].map(item => (
          <GlassCard key={item.label}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">{item.label}</span>
              {item.enabled ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-gray-500" />}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-pink-400" />
          <h3 className="text-sm font-bold text-white">Wallet</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-[10px] text-gray-500">SparkCoin Balance</p><p className="text-lg font-bold text-white">{m.sparkCoinBalance?.toLocaleString()}</p></div>
          <div><p className="text-[10px] text-gray-500">Available</p><p className="text-lg font-bold text-green-400">${m.availableForWithdrawal?.toFixed(2)}</p></div>
          <div><p className="text-[10px] text-gray-500">Pending</p><p className="text-lg font-bold text-yellow-400">${m.pendingWithdrawal?.toFixed(2)}</p></div>
          <div><p className="text-[10px] text-gray-500">Total Withdrawn</p><p className="text-lg font-bold text-blue-400">${m.totalWithdrawn?.toFixed(2)}</p></div>
        </div>
      </GlassCard>
    </div>
  );
}