'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Camera, Loader2, X, Upload, Globe, MapPin, Hash, Link2, Sparkles, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import GradientButton from '@/components/ui/GradientButton';
import UserAvatar from '@/components/ui/UserAvatar';
import GlassCard from '@/components/ui/GlassCard';

interface SocialLink {
  platform: string;
  url: string;
}

interface ProfileForm {
  fullName: string;
  bio: string;
  website: string;
  city: string;
  country: string;
  interests: string;
  occupation: string;
}

interface ProfileData {
  id: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  city?: string | null;
  country?: string | null;
  interests?: string | null;
  occupation?: string | null;
  socialLinks?: SocialLink[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const { token } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    bio: '',
    website: '',
    city: '',
    country: '',
    interests: '',
    occupation: '',
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet<ProfileData>('/api/profiles/me', token)
      .then(data => {
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          bio: data.bio || '',
          website: data.website || '',
          city: data.city || '',
          country: data.country || '',
          interests: data.interests || '',
          occupation: data.occupation || '',
        });
        setSocialLinks(data.socialLinks || []);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [token]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    window.setTimeout(() => setSuccess(null), 4000);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut('/api/profiles/me', { ...form, socialLinks }, token);
      showSuccess('Profile updated successfully');
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const result = await apiUpload<{ url: string }>('/api/profiles/me/avatar', fd, token);
      setProfile(prev => prev ? { ...prev, avatarUrl: result.url } : null);
      showSuccess('Avatar updated');
    } catch {
      setError('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingBanner(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('banner', file);
      const result = await apiUpload<{ url: string }>('/api/profiles/me/banner', fd, token);
      setProfile(prev => prev ? { ...prev, bannerUrl: result.url } : null);
      showSuccess('Banner updated');
    } catch {
      setError('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-10">
        <div className="max-w-2xl mx-auto space-y-6 p-6">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="skeleton h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <button className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition" aria-label="Back to profile">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-sm text-gray-400">Update your public profile information.</p>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-4 rounded-2xl"
              role="alert"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl"
              role="status"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Upload Section */}
        <GlassCard padding="xl">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Profile Photos</p>

            {/* Banner Upload */}
            <div className="relative">
              <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/20">
                {profile?.bannerUrl ? (
                  <img src={profile.bannerUrl} alt="Profile banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={32} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition disabled:opacity-50"
                  >
                    {uploadingBanner ? (
                      <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Uploading...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Upload size={14} /> Change Banner</span>
                    )}
                  </button>
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBannerUpload}
                aria-label="Upload banner image"
              />
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-[2px] border-white/[0.08]">
                  <UserAvatar
                    src={profile?.avatarUrl}
                    alt={form.fullName || profile?.username || 'User'}
                    size="2xl"
                  />
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  aria-label="Upload avatar"
                >
                  {uploadingAvatar ? (
                    <Loader2 size={16} className="text-white animate-spin" />
                  ) : (
                    <Camera size={16} className="text-white" />
                  )}
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Profile Photo</p>
                <p className="text-xs text-gray-500 mt-0.5">JPEG, PNG or WEBP. Max 3MB.</p>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-xs text-[#00d8ff] hover:underline mt-1 transition disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Uploading...' : 'Upload new photo'}
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                aria-label="Upload avatar image"
              />
            </div>
          </div>
        </GlassCard>

        {/* Basic Info */}
        <GlassCard padding="xl">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Basic Information</p>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Display name</span>
              <input
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Your display name"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                maxLength={50}
              />
              <p className="text-[10px] text-gray-600 text-right">{form.fullName.length}/50</p>
            </label>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Bio</span>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Tell people about yourself"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition resize-none"
                maxLength={260}
              />
              <p className="text-[10px] text-gray-600 text-right">{form.bio.length}/260</p>
            </label>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Occupation</span>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  value={form.occupation}
                  onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 pl-9 pr-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                />
              </div>
            </label>
          </div>
        </GlassCard>

        {/* Location */}
        <GlassCard padding="xl">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm text-gray-300">
                <span>City</span>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Your city"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 pl-9 pr-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                  />
                </div>
              </label>
              <label className="space-y-2 text-sm text-gray-300">
                <span>Country</span>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <input
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="Your country"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 pl-9 pr-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                  />
                </div>
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Links */}
        <GlassCard padding="xl">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Links</p>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Website</span>
              <div className="relative">
                <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 pl-9 pr-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                />
              </div>
            </label>

            <label className="space-y-2 text-sm text-gray-300">
              <span>Interests</span>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                <input
                  value={form.interests}
                  onChange={e => setForm(f => ({ ...f, interests: e.target.value }))}
                  placeholder="Music, Travel, Gaming..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 pl-9 pr-4 py-3 text-white outline-none focus:border-[#ff007f]/40 transition"
                />
              </div>
            </label>
          </div>
        </GlassCard>

        {/* Social Links */}
        <GlassCard padding="xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Social Links</p>
              <button
                onClick={addSocialLink}
                className="text-xs text-[#ff007f] hover:underline transition font-medium"
              >
                + Add link
              </button>
            </div>
            {socialLinks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No social links added yet.</p>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={link.platform}
                      onChange={e => updateSocialLink(i, 'platform', e.target.value)}
                      placeholder="Platform"
                      className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#ff007f]/40 transition"
                    />
                    <input
                      value={link.url}
                      onChange={e => updateSocialLink(i, 'url', e.target.value)}
                      placeholder="URL"
                      className="flex-[2] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#ff007f]/40 transition"
                    />
                    <button
                      onClick={() => removeSocialLink(i)}
                      className="p-2.5 text-gray-500 hover:text-red-400 transition rounded-xl hover:bg-white/[0.05]"
                      aria-label="Remove social link"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/profile">
            <GradientButton variant="ghost" size="md">
              Cancel
            </GradientButton>
          </Link>
          <GradientButton
            variant="primary"
            size="md"
            icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}