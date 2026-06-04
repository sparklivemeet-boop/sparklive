"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Bell, Lock, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';

interface ProfileData {
  id: string;
  username: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  city?: string | null;
  country?: string | null;
  socialLinks?: { id: string; platform: string; url: string }[];
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

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings>({ theme: 'dark', privacyProfile: 'public', privacyMessages: 'everyone', privacyFollows: 'everyone' });
  const [notifications, setNotifications] = useState<NotificationPreferences>({ emailAlerts: true, pushAlerts: true, chatAlerts: true, liveAlerts: true });
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserReference[]>([]);
  const [mutedUsers, setMutedUsers] = useState<UserReference[]>([]);
  const [accountEmail, setAccountEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [blockTarget, setBlockTarget] = useState('');
  const [muteTarget, setMuteTarget] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const themeLabel = useMemo(() => (privacy.theme === 'dark' ? 'Dark mode' : 'Light mode'), [privacy.theme]);

  const loadSettings = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

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
    } catch (err) {
      setError('Unable to load settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [token]);

  const showToast = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 4000);
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

  const handleSaveAccount = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut('/api/settings/account', { email: accountEmail, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }, token);
      showToast('Account settings updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError((err as Error).message || 'Unable to update account settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiDelete('/api/settings/sessions', token);
      logout();
    } catch (err) {
      setError((err as Error).message || 'Unable to log out all sessions');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiDelete(`/api/settings/sessions/${sessionId}`, token);
      await loadSettings();
      showToast('Session revoked');
    } catch (err) {
      setError((err as Error).message || 'Unable to revoke session');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockUser = async () => {
    if (!token || !blockTarget.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiPost('/api/settings/blocked', { targetUsername: blockTarget.trim() }, token);
      setBlockTarget('');
      await loadSettings();
      showToast('User blocked');
    } catch (err) {
      setError((err as Error).message || 'Unable to block user');
    } finally {
      setSaving(false);
    }
  };

  const handleMuteUser = async () => {
    if (!token || !muteTarget.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiPost('/api/settings/muted', { targetUsername: muteTarget.trim() }, token);
      setMuteTarget('');
      await loadSettings();
      showToast('User muted');
    } catch (err) {
      setError((err as Error).message || 'Unable to mute user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    const confirmed = window.confirm('Delete your account and all profile data? This action cannot be undone.');
    if (!confirmed) return;
    setSaving(true);
    setError(null);
    try {
      await apiDelete('/api/settings/account', token);
      logout();
    } catch (err) {
      setError((err as Error).message || 'Unable to delete account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f] pb-10 text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6 xl:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile settings</p>
            <h1 className="mt-2 text-4xl font-black text-white">Manage your SparkLive settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Keep your account secure and personalize your profile, privacy, notifications, and active sessions.</p>
          </div>
          <button onClick={() => router.push('/profile')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            <X size={16} /> Back to profile
          </button>
        </div>

        {error && <div className="mb-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
        {success && <div className="mb-4 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{success}</div>}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Account</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Profile & login</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Sparkles size={18} /> {profile?.username}
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Email address</span>
                  <input value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Current password</span>
                    <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>New password</span>
                    <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button disabled={saving} onClick={handleSaveAccount} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Save account</button>
                  <button disabled={saving} onClick={handleDeleteAccount} className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50">Delete account</button>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Privacy</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Profile visibility</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Shield size={18} /> {privacy.privacyProfile === 'private' ? 'Private' : 'Public'}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Profile visibility</span>
                  <select value={privacy.privacyProfile} onChange={(event) => setPrivacy((prev) => ({ ...prev, privacyProfile: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500">
                    <option value="public">Public profile</option>
                    <option value="private">Private profile</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Message permissions</span>
                  <select value={privacy.privacyMessages} onChange={(event) => setPrivacy((prev) => ({ ...prev, privacyMessages: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500">
                    <option value="everyone">Everyone can message</option>
                    <option value="following">Only people I follow</option>
                    <option value="noone">No one can message</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Follow permissions</span>
                  <select value={privacy.privacyFollows} onChange={(event) => setPrivacy((prev) => ({ ...prev, privacyFollows: event.target.value }))} className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500">
                    <option value="everyone">Everyone can follow</option>
                    <option value="followers">Only approved followers</option>
                    <option value="noone">No one can follow</option>
                  </select>
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button disabled={saving} onClick={handleSavePrivacy} className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Save privacy</button>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{themeLabel}</div>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notifications</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Alerts & updates</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Bell size={18} /> Notifications
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(['emailAlerts', 'pushAlerts', 'chatAlerts', 'liveAlerts'] as const).map((field) => (
                  <label key={field} className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300 transition hover:border-fuchsia-500">
                    <input type="checkbox" checked={Boolean(notifications[field])} onChange={(event) => setNotifications((prev) => ({ ...prev, [field]: event.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-slate-900 text-fuchsia-500 focus:ring-fuchsia-500" />
                    <span>{field === 'emailAlerts' ? 'Email alerts' : field === 'pushAlerts' ? 'Push notifications' : field === 'chatAlerts' ? 'Chat alerts' : 'Live stream alerts'}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button disabled={saving} onClick={handleSaveNotifications} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Save notifications</button>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Session management</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Active devices</h2>
                </div>
                <button disabled={saving} onClick={handleLogoutAll} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">Logout all</button>
              </div>
              <div className="mt-6 space-y-4">
                {sessions.length ? sessions.map((session) => (
                  <div key={session.id} className="rounded-3xl border border-white/10 bg-black/40 p-5 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{session.userAgent || 'Unknown browser'}</p>
                        <p className="mt-1 text-slate-400">IP: {session.ipAddress || 'Private'}</p>
                      </div>
                      <button disabled={saving} onClick={() => handleRevokeSession(session.id)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">Revoke</button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-slate-500">
                      <span>Started: {new Date(session.createdAt).toLocaleString()}</span>
                      <span>Expires: {new Date(session.expiresAt).toLocaleString()}</span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-6 text-sm text-slate-400">No active sessions detected.</div>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Safety</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Blocked & muted users</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Lock size={18} /> Protection
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Block username</span>
                  <input value={blockTarget} onChange={(event) => setBlockTarget(event.target.value)} placeholder="Type username" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                </label>
                <button disabled={saving} onClick={handleBlockUser} className="self-end rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Block user</button>
              </div>
              <div className="mt-6 space-y-4">
                {blockedUsers.length ? blockedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-slate-300">
                    <span>{user.username}</span>
                    <button disabled={saving} onClick={async () => {
                      if (!token) return;
                      setSaving(true);
                      setError(null);
                      try {
                        await apiDelete(`/api/settings/blocked/${user.id}`, token);
                        await loadSettings();
                        showToast('User unblocked');
                      } catch (err) {
                        setError((err as Error).message || 'Unable to unblock user');
                      } finally {
                        setSaving(false);
                      }
                    }} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">Unblock</button>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-6 text-sm text-slate-400">No blocked accounts.</div>
                )}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Mute username</span>
                  <input value={muteTarget} onChange={(event) => setMuteTarget(event.target.value)} placeholder="Type username" className="w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500" />
                </label>
                <button disabled={saving} onClick={handleMuteUser} className="self-end rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Mute user</button>
              </div>
              <div className="mt-6 space-y-4">
                {mutedUsers.length ? mutedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-slate-300">
                    <span>{user.username}</span>
                    <button disabled={saving} onClick={async () => {
                      if (!token) return;
                      setSaving(true);
                      setError(null);
                      try {
                        await apiDelete(`/api/settings/muted/${user.id}`, token);
                        await loadSettings();
                        showToast('User unmuted');
                      } catch (err) {
                        setError((err as Error).message || 'Unable to unmute user');
                      } finally {
                        setSaving(false);
                      }
                    }} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">Unmute</button>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-6 text-sm text-slate-400">No muted accounts.</div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quick actions</p>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <button onClick={() => router.push('/profile')} className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-4 text-left text-white transition hover:bg-white/5">Return to profile</button>
                <button onClick={handleLogoutAll} disabled={saving} className="w-full rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-4 text-left text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Logout all sessions</button>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Security logs</p>
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="text-sm text-slate-400">Recent changes and account access appear here once available.</p>
                <p className="mt-3 text-slate-500">This helps you monitor logins, password updates, and profile changes.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
