"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Users, Radio, Gift, DollarSign, AlertTriangle, BarChart3, Settings, Activity, FileText, Loader2, Eye } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

const adminLinks = [
  { icon: Users, label: 'Users', href: '/admin/users', color: 'from-blue-500 to-cyan-600', count: 0 },
  { icon: Radio, label: 'Live Streams', href: '/admin/live', color: 'from-pink-500 to-rose-600', count: 0 },
  { icon: Gift, label: 'Gifts', href: '/admin/gifts', color: 'from-amber-500 to-orange-600', count: 0 },
  { icon: DollarSign, label: 'Finance', href: '/admin/finance', color: 'from-emerald-500 to-teal-600', count: 0 },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', color: 'from-purple-500 to-violet-600', count: 0 },
  { icon: AlertTriangle, label: 'Reports', href: '/admin/compliance', color: 'from-red-500 to-rose-600', count: 0 },
  { icon: FileText, label: 'Content', href: '/admin/content', color: 'from-indigo-500 to-purple-600', count: 0 },
  { icon: Settings, label: 'Settings', href: '/admin/infrastructure', color: 'from-gray-500 to-slate-600', count: 0 },
];

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/discover');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<Shield size={24} className="text-red-400" />}
          title="Admin access required"
          description="You don't have permission to access this page."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-pink-400" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="text-sm text-white/40">Manage platform users, content, and settings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4">
          <Users size={16} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-xs text-white/40">Total Users</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Radio size={16} className="text-pink-400 mb-2" />
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-xs text-white/40">Active Streams</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <AlertTriangle size={16} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-xs text-white/40">Pending Reports</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Activity size={16} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-xs text-white/40">Today's Activity</p>
        </div>
      </div>

      {/* Admin Sections */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Management</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass rounded-2xl p-4 hover:bg-white/[0.06] transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-2`}>
                <link.icon size={16} className="text-white" />
              </div>
              <p className="text-sm font-medium text-white">{link.label}</p>
              <p className="text-xs text-white/30 mt-0.5">{link.count} items</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <EmptyState
          icon={<Activity size={24} className="text-white/30" />}
          title="No recent activity"
          description="Platform activity and audit logs will appear here."
        />
      </div>
    </div>
  );
}