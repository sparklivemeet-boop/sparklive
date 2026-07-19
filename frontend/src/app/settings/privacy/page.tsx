'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Save, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function PrivacySettingsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [privacy, setPrivacy] = useState({
    privacyProfile: 'public',
    privacyMessages: 'everyone',
    privacyFollows: 'everyone',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet<any>('/api/settings/privacy', token)
      .then(data => setPrivacy(prev => ({ ...prev, ...data })))
      .catch(err => setError('Failed to load privacy settings'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut('/api/settings/privacy', privacy, token);
      setSuccess('Privacy settings saved');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen pb-24 lg:pb-10 max-w-2xl mx-auto p-6"><div className="skeleton h-8 w-48 mb-6" /><div className="skeleton h-40 w-full rounded-2xl" /></div>;

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy</h1>
            <p className="text-sm text-gray-400">Control who can see your content and interact with you.</p>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-4 rounded-2xl">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl">{success}</div>}

        <div className="glass rounded-[28px] p-6 shadow-card space-y-5">
          <label className="space-y-2 text-sm text-gray-300">
            <span className="font-medium">Profile visibility</span>
            <select value={privacy.privacyProfile} onChange={e => setPrivacy(p => ({ ...p, privacyProfile: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]">
              <option value="public">Public - Anyone can see your profile</option>
              <option value="private">Private - Only followers can see your profile</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-gray-300">
            <span className="font-medium">Message permissions</span>
            <select value={privacy.privacyMessages} onChange={e => setPrivacy(p => ({ ...p, privacyMessages: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]">
              <option value="everyone">Everyone can message you</option>
              <option value="following">Only people you follow</option>
              <option value="noone">No one can message you</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-gray-300">
            <span className="font-medium">Follow permissions</span>
            <select value={privacy.privacyFollows} onChange={e => setPrivacy(p => ({ ...p, privacyFollows: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]">
              <option value="everyone">Everyone can follow you</option>
              <option value="followers">Only people you follow</option>
              <option value="noone">No one can follow you</option>
            </select>
          </label>
          <Button variant="primary" onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save privacy settings</Button>
        </div>
      </div>
    </div>
  );
}