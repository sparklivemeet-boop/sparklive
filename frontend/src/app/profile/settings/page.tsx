"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Sparkles, Bell, Lock, X, ArrowLeft, User, Eye, Globe,
  Monitor, Smartphone, LogOut, Trash2, Moon, Sun, CheckCircle2,
  AlertTriangle, Loader2, Users, MessageCircle, Ban, VolumeX,
  ChevronRight, Settings as SettingsIcon,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
import GradientButton from '@/components/ui/GradientButton';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ProfileData {
  id: string;
  username: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}

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

interface SessionItem {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  expiresAt: string;
}

interface UserReference {
  id: string;
  username: string;
}

/* ─────────────────────────────────────────────
   Settings Section Wrapper
   ───────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComp = React.ComponentType<any>;

function SettingsSection({ title, subtitle, icon: Icon, children }: {
  title: string;
  subtitle?: string;
  icon: IconComp;
  children: React.ReactNode;
}) {
  return (
    <GlassCard padding="xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-[#ff007f]" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   Toast Notification
   ───────────────────────────────────────────── */

function Toast({ message, type = 'success', onClose }: {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl',
        type === 'success'
          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/20 border-red-500/30 text-red-300'
      )}
      role="alert"
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} className="shrink-0" />
      ) : (
        <AlertTriangle size={18} className="shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:text-white transition" aria-label="Dismiss">
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserReference[]>([]);
  const [mutedUsers, setMutedUsers] = useState<UserReference[]>([]);
  const [accountEmail, setAccountEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [blockTarget, setBlockTarget] = useState('');
  const [muteTarget, setMuteTarget] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const themeLabel = useMemo(() => (privacy.theme === 'dark' ? 'Dark mode' : 'Light mode'), [privacy.theme]);

  const loadSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [profileData, privacyData, notificationsData, sessionsData, blockedData, mutedData] = await Promise.all([
        apiGet<ProfileData>('/api/profiles/me', token),
        apiGet<PrivacySettings>('/api/settings/privacy', token),
        apiGet<NotificationPreferences>('/api/settings/notifications', token),
        apiGet<{ sessions: SessionItem[] }>('/api/settings/sessions', token),
        apiGet<{ blocked: UserReference[] }>('/api/settings/blocked', token),
        apiGet<{ muted: UserReference[] }>('/api/settings/muted', token),
      ]);

      setProfile(profileData);
      setAccountEmail(profileData.email || '');
      setPrivacy(privacyData);
      setNotifications(notificationsData);
      setSessions(sessionsData.sessions || []);
      setBlockedUsers(blockedData.blocked || []);
      setMutedUsers(mutedData.muted || []);
    } catch {
      showToast('Unable to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [token]);

  const withSaving = async (key: string, fn: () => Promise<void>) => {
    setSaving(key);
    try {
      await fn();
    } catch (err) {
      showToast((err as Error).message || 'Operation failed', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleSavePrivacy = async () => {
    if (!token) return;
    await withSaving('privacy', async () => {
      await apiPut('/api/settings/privacy', privacy, token);
      showToast('Privacy settings saved');
    });
  };

  const handleSaveNotifications = async () => {
    if (!token) return;
    await withSaving('notifications', async () => {
      await apiPut('/api/settings/notifications', notifications, token);
      showToast('Notification preferences saved');
    });
  };

  const handleSaveAccount = async () => {
    if (!token) return;
    await withSaving('account', async () => {
      await apiPut('/api/settings/account', {
        email: accountEmail,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }, token);
      showToast('Account settings updated');
      setCurrentPassword('');
      setNewPassword('');
    });
  };

  const handleLogoutAll = async () => {
    if (!token) return;
    await withSaving('logoutAll', async () => {
      await apiDelete('/api/settings/sessions', token);
      logout();
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!token) return;
    await withSaving(`session-${sessionId}`, async () => {
      await apiDelete(`/api/settings/sessions/${sessionId}`, token);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showToast('Session revoked');
    });
  };

  const handleBlockUser = async () => {
    if (!token || !blockTarget.trim()) return;
    await withSaving('block', async () => {
      await apiPost('/api/settings/blocked', { targetUsername: blockTarget.trim() }, token);
      setBlockTarget('');
      await loadSettings();
      showToast('User blocked');
    });
  };

  const handleUnblockUser = async (userId: string) => {
    if (!token) return;
    await withSaving(`unblock-${userId}`, async () => {
      await apiDelete(`/api/settings/blocked/${userId}`, token);
      setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User unblocked');
    });
  };

  const handleMuteUser = async () => {
    if (!token || !muteTarget.trim()) return;
    await withSaving('mute', async () => {
      await apiPost('/api/settings/muted', { targetUsername: muteTarget.trim() }, token);
      setMuteTarget('');
      await loadSettings();
      showToast('User muted');
    });
  };

  const handleUnmuteUser = async (userId: string) => {
    if (!token) return;
    await withSaving(`unmute-${userId}`, async () => {
      await apiDelete(`/api/settings/muted/${userId}`, token);
      setMutedUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User unmuted');
    });
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    const confirmed = window.confirm('Delete your account and all profile data? This action cannot be undone.');
    if (!confirmed) return;
    await withSaving('delete', async () => {
      await apiDelete('/api/settings/account', token);
      logout();
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#ff007f]/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-10 bg-[var(--background)]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <button
              className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
              aria-label="Back to profile"
            >
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-gray-400">Manage your account, privacy, and preferences.</p>
          </div>
          {profile && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-gray-400 border border-white/[0.06]">
              <User size={12} aria-hidden="true" />
              @{profile.username}
            </span>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Account Section */}
            <SettingsSection title="Account" subtitle="Profile & login information" icon={User}>
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-gray-300">
                  <span>Email address</span>
                  <input
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                    type="email"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-gray-300">
                    <span>Current password</span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                      placeholder="Leave blank to keep current"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-300">
                    <span>New password</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                      placeholder="Min 8 characters"
                    />
                  </label>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <GradientButton
                    variant="primary"
                    size="sm"
                    icon={saving === 'account' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    onClick={handleSaveAccount}
                    disabled={saving === 'account'}
                  >
                    {saving === 'account' ? 'Saving...' : 'Save account'}
                  </GradientButton>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!!saving}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Delete account
                  </button>
                </div>
              </div>
            </SettingsSection>

            {/* Privacy Section */}
            <SettingsSection title="Privacy" subtitle="Profile visibility & permissions" icon={Eye}>
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-gray-300">
                  <span>Profile visibility</span>
                  <select
                    value={privacy.privacyProfile}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, privacyProfile: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                  >
                    <option value="public">Public profile</option>
                    <option value="private">Private profile</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-300">
                  <span>Message permissions</span>
                  <select
                    value={privacy.privacyMessages}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, privacyMessages: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                  >
                    <option value="everyone">Everyone can message</option>
                    <option value="following">Only people I follow</option>
                    <option value="noone">No one can message</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-gray-300">
                  <span>Follow permissions</span>
                  <select
                    value={privacy.privacyFollows}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, privacyFollows: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                  >
                    <option value="everyone">Everyone can follow</option>
                    <option value="followers">Only approved followers</option>
                    <option value="noone">No one can follow</option>
                  </select>
                </label>
                <div className="flex items-center justify-between pt-2">
                  <GradientButton
                    variant="primary"
                    size="sm"
                    icon={saving === 'privacy' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    onClick={handleSavePrivacy}
                    disabled={saving === 'privacy'}
                  >
                    {saving === 'privacy' ? 'Saving...' : 'Save privacy'}
                  </GradientButton>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    {privacy.theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                    {themeLabel}
                  </span>
                </div>
              </div>
            </SettingsSection>

            {/* Notifications Section */}
            <SettingsSection title="Notifications" subtitle="Alerts & updates" icon={Bell}>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { key: 'emailAlerts', label: 'Email alerts', desc: 'Receive email notifications' },
                  { key: 'pushAlerts', label: 'Push notifications', desc: 'Push alerts on your devices' },
                  { key: 'chatAlerts', label: 'Chat alerts', desc: 'New message notifications' },
                  { key: 'liveAlerts', label: 'Live stream alerts', desc: 'When creators go live' },
                ] as const).map(({ key, label, desc }) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:bg-white/[0.04] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(notifications[key as keyof NotificationPreferences])}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-[#ff007f] focus:ring-[#ff007f]/30"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <GradientButton
                  variant="primary"
                  size="sm"
                  icon={saving === 'notifications' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  onClick={handleSaveNotifications}
                  disabled={saving === 'notifications'}
                >
                  {saving === 'notifications' ? 'Saving...' : 'Save notifications'}
                </GradientButton>
              </div>
            </SettingsSection>

            {/* Sessions Section */}
            <SettingsSection title="Active Sessions" subtitle="Devices & browsers" icon={Monitor}>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No active sessions.</p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} className="text-gray-500 shrink-0" aria-hidden="true" />
                          <p className="text-sm font-medium text-white truncate">
                            {session.userAgent || 'Unknown browser'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {session.ipAddress || 'Private'} · Started {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={saving === `session-${session.id}`}
                        className="shrink-0 rounded-xl border border-white/[0.06] px-3 py-1.5 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white transition disabled:opacity-50"
                      >
                        {saving === `session-${session.id}` ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  ))
                )}
              </div>
              {sessions.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleLogoutAll}
                    disabled={!!saving}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white transition disabled:opacity-50"
                  >
                    <LogOut size={12} />
                    Logout all sessions
                  </button>
                </div>
              )}
            </SettingsSection>

            {/* Blocked & Muted Section */}
            <SettingsSection title="Safety" subtitle="Blocked & muted users" icon={Lock}>
              {/* Block User */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  <Ban size={14} className="text-red-400" aria-hidden="true" />
                  Blocked users
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={blockTarget}
                    onChange={(e) => setBlockTarget(e.target.value)}
                    placeholder="Enter username to block"
                    className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#ff007f]/40 transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleBlockUser()}
                  />
                  <GradientButton
                    variant="danger"
                    size="sm"
                    onClick={handleBlockUser}
                    disabled={saving === 'block' || !blockTarget.trim()}
                  >
                    {saving === 'block' ? '...' : 'Block'}
                  </GradientButton>
                </div>
                {blockedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {blockedUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <span className="text-sm text-gray-300">@{u.username}</span>
                        <button
                          onClick={() => handleUnblockUser(u.id)}
                          disabled={saving === `unblock-${u.id}`}
                          className="text-xs text-gray-500 hover:text-white transition disabled:opacity-50"
                        >
                          {saving === `unblock-${u.id}` ? '...' : 'Unblock'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">No blocked accounts.</p>
                )}
              </div>

              {/* Mute User */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  <VolumeX size={14} className="text-yellow-400" aria-hidden="true" />
                  Muted users
                </p>
                <div className="flex items-center gap-2">
                  <input
                    value={muteTarget}
                    onChange={(e) => setMuteTarget(e.target.value)}
                    placeholder="Enter username to mute"
                    className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#ff007f]/40 transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleMuteUser()}
                  />
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={handleMuteUser}
                    disabled={saving === 'mute' || !muteTarget.trim()}
                  >
                    {saving === 'mute' ? '...' : 'Mute'}
                  </GradientButton>
                </div>
                {mutedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {mutedUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <span className="text-sm text-gray-300">@{u.username}</span>
                        <button
                          onClick={() => handleUnmuteUser(u.id)}
                          disabled={saving === `unmute-${u.id}`}
                          className="text-xs text-gray-500 hover:text-white transition disabled:opacity-50"
                        >
                          {saving === `unmute-${u.id}` ? '...' : 'Unmute'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">No muted accounts.</p>
                )}
              </div>
            </SettingsSection>
          </div>

          {/* Right Column - Quick Actions */}
          <aside className="space-y-6">
            <GlassCard padding="xl">
              <div className="flex items-center gap-3 mb-4">
                <SettingsIcon size={18} className="text-gray-400" aria-hidden="true" />
                <h2 className="text-sm font-bold text-white">Quick actions</h2>
              </div>
              <div className="space-y-2">
                <Link href="/profile">
                  <button className="w-full flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-gray-300 hover:bg-white/[0.04] hover:text-white transition">
                    <span>Return to profile</span>
                    <ChevronRight size={14} className="text-gray-600" />
                  </button>
                </Link>
                <button
                  onClick={handleLogoutAll}
                  disabled={!!saving}
                  className="w-full flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                >
                  <span>Logout all sessions</span>
                  <LogOut size={14} />
                </button>
              </div>
            </GlassCard>

            <GlassCard padding="xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={18} className="text-gray-400" aria-hidden="true" />
                <h2 className="text-sm font-bold text-white">Security</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Review your security logs regularly to monitor logins, password updates, and profile changes. 
                Enable two-factor authentication for enhanced account protection.
              </p>
            </GlassCard>
          </aside>
        </div>
      </div>
    </div>
  );
}