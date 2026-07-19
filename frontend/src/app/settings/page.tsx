'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiDelete, apiPost } from '@/lib/apiClient';
import Link from 'next/link';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  ChevronRight,
  Sparkles,
  LogOut,
  Smartphone,
  CreditCard,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface PrivacySettings {
  theme?: string;
  privacyProfile?: string;
  privacyMessages?: string;
  privacyFollows?: string;
}

interface NotificationPreferences {
  emailAlerts?: boolean;
  pushAlerts?: boolean;
  chatAlerts?: boolean;
  liveAlerts?: boolean;
}

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', description: 'Edit your public profile', href: '/profile/settings' },
      { icon: Lock, label: 'Privacy', description: 'Control who can see your content', href: '/settings/privacy' },
      { icon: Bell, label: 'Notifications', description: 'Manage notification preferences', href: '/settings/notifications' },
      { icon: Shield, label: 'Security', description: 'Password, 2FA, and devices', href: '/settings/security' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Palette, label: 'Appearance', description: 'Theme, colors, and display', href: '/settings/appearance' },
      { icon: Globe, label: 'Language & Region', description: 'Content language and timezone', href: '/settings/language' },
      { icon: Smartphone, label: 'Device & Storage', description: 'Cache, downloads, and data', href: '/settings/device' },
      { icon: CreditCard, label: 'Payments', description: 'Payment methods and billing', href: '/settings/payments' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', description: 'Guides, FAQs, and support', href: '/settings/help' },
      { icon: Sparkles, label: "What's New", description: 'Latest features and updates', href: '/settings/whats-new' },
    ],
  },
];

export default function SettingsPage() {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    theme: 'dark',
    privacyProfile: 'public',
    privacyMessages: 'everyone',
    privacyFollows: 'everyone',
  });
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailAlerts: true,
    pushAlerts: true,
    chatAlerts: true,
    liveAlerts: true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [privacyData, notificationsData] = await Promise.all([
        apiGet<PrivacySettings>('/api/settings/privacy', token),
        apiGet<NotificationPreferences>('/api/settings/notifications', token),
      ]);
      setPrivacy(privacyData);
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [token]);

  const showToast = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3500);
  };

  const handleSavePrivacy = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut('/api/settings/privacy', privacy, token);
      showToast('Privacy settings saved');
    } catch (err) {
      setError((err as Error).message || 'Unable to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut('/api/settings/notifications', notifications, token);
      showToast('Notification preferences saved');
    } catch (err) {
      setError((err as Error).message || 'Unable to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">
                Settings
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Preferences & account
              </h1>
              <p className="text-sm text-gray-400">
                Manage your profile, privacy, notifications, and account settings.
              </p>
            </div>
            <Link href="/profile">
              <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />}>
                Back to profile
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-4 rounded-2xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl animate-in">
            {success}
          </div>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <div key={section.title} className="glass rounded-[28px] p-5 shadow-card">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-white/[0.03] transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
                      <Icon size={17} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Privacy Settings */}
        <div className="glass rounded-[28px] p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-cyan-400" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Privacy
            </p>
          </div>
          <div className="space-y-4">
            <label className="space-y-2 text-sm text-gray-300">
              <span>Profile visibility</span>
              <select
                value={privacy.privacyProfile}
                onChange={(e) =>
                  setPrivacy((prev) => ({
                    ...prev,
                    privacyProfile: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]"
              >
                <option value="public">Public profile</option>
                <option value="private">Private profile</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-gray-300">
              <span>Message permissions</span>
              <select
                value={privacy.privacyMessages}
                onChange={(e) =>
                  setPrivacy((prev) => ({
                    ...prev,
                    privacyMessages: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]"
              >
                <option value="everyone">Everyone can message</option>
                <option value="following">Only people I follow</option>
                <option value="noone">No one can message</option>
              </select>
            </label>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSavePrivacy}
            >
              Save privacy settings
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass rounded-[28px] p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} className="text-pink-400" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Notifications
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              ['emailAlerts', 'pushAlerts', 'chatAlerts', 'liveAlerts'] as const
            ).map((field) => (
              <label
                key={field}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-gray-300 transition hover:border-[var(--color-spark-pink)]/30"
              >
                <input
                  type="checkbox"
                  checked={Boolean(notifications[field])}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [field]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-white/20 bg-gray-800 text-[var(--color-spark-pink)] focus:ring-[var(--color-spark-pink)]"
                />
                <span>
                  {field === 'emailAlerts'
                    ? 'Email alerts'
                    : field === 'pushAlerts'
                    ? 'Push notifications'
                    : field === 'chatAlerts'
                    ? 'Chat alerts'
                    : 'Live stream alerts'}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSaveNotifications}
            >
              Save notification preferences
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="text-center pt-4">
          <Button
            variant="danger"
            size="md"
            icon={<LogOut size={14} />}
            onClick={() => logout()}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}