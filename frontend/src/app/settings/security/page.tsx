'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Shield, Save, Key } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    if (!token || !currentPassword || !newPassword) return;
    setSaving(true); setError(null);
    try {
      const { apiPut } = await import('@/lib/apiClient');
      await apiPut('/api/settings/account', { currentPassword, newPassword }, token);
      setSuccess('Password changed successfully');
      setCurrentPassword(''); setNewPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError((err as Error).message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Security</h1>
            <p className="text-sm text-gray-400">Manage your password and account security.</p>
          </div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-4 rounded-2xl">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl">{success}</div>}

        <div className="glass rounded-[28px] p-6 shadow-card space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-pink-400" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Change Password</p>
          </div>
          <label className="space-y-2 text-sm text-gray-300">
            <span>Current password</span>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]" />
          </label>
          <label className="space-y-2 text-sm text-gray-300">
            <span>New password</span>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]" />
            <p className="text-xs text-gray-500">At least 8 characters</p>
          </label>
          <Button variant="primary" onClick={handleChangePassword} loading={saving} icon={<Save size={14} />} disabled={!currentPassword || !newPassword}>Update password</Button>
        </div>

        <div className="glass rounded-[28px] p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-cyan-400" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Two-Factor Authentication</p>
          </div>
          <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account.</p>
          <Button variant="outline" disabled>Coming soon</Button>
        </div>
      </div>
    </div>
  );
}