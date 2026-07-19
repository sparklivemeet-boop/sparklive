'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut } from '@/lib/apiClient';
import { ArrowLeft, Bell, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function NotificationsSettingsPage() {
  const { token } = useAuth();
  const [prefs, setPrefs] = useState({ emailAlerts: true, pushAlerts: true, chatAlerts: true, liveAlerts: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet<any>('/api/settings/notifications', token)
      .then(data => setPrefs(prev => ({ ...prev, ...data })))
      .catch(() => setError('Failed to load notification preferences'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true); setError(null);
    try {
      await apiPut('/api/settings/notifications', prefs, token);
      setSuccess('Notification preferences saved');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError((err as Error).message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen pb-24 lg:pb-10 max-w-2xl mx-auto p-6"><div className="skeleton h-8 w-48 mb-6" /><div className="skeleton h-40 w-full rounded-2xl" /></div>;

  const fields = [
    { key: 'emailAlerts' as const, label: 'Email alerts', desc: 'Receive notifications via email' },
    { key: 'pushAlerts' as const, label: 'Push notifications', desc: 'Receive push notifications on your device' },
    { key: 'chatAlerts' as const, label: 'Chat alerts', desc: 'Get notified when you receive a message' },
    { key: 'liveAlerts' as const, label: 'Live stream alerts', desc: 'Get notified when creators go live' },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-gray-400">Manage your notification preferences.</p>
          </div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-4 rounded-2xl">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl">{success}</div>}

        <div className="glass rounded-[28px] p-6 shadow-card space-y-4">
          {fields.map(f => (
            <label key={f.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 transition hover:border-[var(--color-spark-pink)]/30">
              <div>
                <p className="text-sm font-medium text-white">{f.label}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
              <input type="checkbox" checked={Boolean(prefs[f.key])}
                onChange={e => setPrefs(p => ({ ...p, [f.key]: e.target.checked }))}
                className="h-5 w-5 rounded border-white/20 bg-gray-800 text-[var(--color-spark-pink)] focus:ring-[var(--color-spark-pink)]" />
            </label>
          ))}
          <Button variant="primary" onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save preferences</Button>
        </div>
      </div>
    </div>
  );
}