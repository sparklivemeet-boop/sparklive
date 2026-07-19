'use client';

import { ArrowLeft, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function PaymentsSettingsPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
            <p className="text-sm text-gray-400">Manage your payment methods and billing.</p>
          </div>
        </div>

        <div className="glass rounded-[28px] p-6 shadow-card text-center py-12">
          <CreditCard size={40} className="mx-auto mb-4 text-gray-500" />
          <p className="text-sm font-medium text-gray-400">No payment methods yet</p>
          <p className="text-xs text-gray-500 mt-1">Add a payment method to purchase coins and subscriptions.</p>
        </div>

        <Link href="/wallet">
          <Button variant="primary" className="w-full">Go to Wallet</Button>
        </Link>
      </div>
    </div>
  );
}