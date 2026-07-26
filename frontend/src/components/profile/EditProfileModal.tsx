'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Camera, Upload, Save, Loader2, User, Globe, MapPin, Link2,
  Hash, Briefcase, Calendar, Heart, Shield, Palette, Languages,
  Eye, Bell, Check, AlertCircle, Image, Trash2, Undo2, RotateCw,
  ZoomIn, ZoomOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import Avatar from '@/components/ui/Avatar';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: any) => void;
}

interface ProfileForm {
  fullName: string;
  username: string;
  bio: string;
  website: string;
  city: string;
  country: string;
  occupation: string;
  interests: string;
  birthday: string;
  pronouns: string;
  socialLinks: { platform: string; url: string }[];
  creatorCategory: string;
  skills: string;
  privacy: string;
  notifications: boolean;
  theme: string;
  language: string;
}

const CREATOR_CATEGORIES = [
  'Gaming', 'Music', 'Art', 'Technology', 'Education',
  'Lifestyle', 'Sports', 'Entertainment', 'News', 'Other'
];

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'Any', 'Other', 'Prefer not to say'];

export default function EditProfileModal({ open, onClose, onProfileUpdated }: EditProfileModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bioCharCount, setBioCharCount] = useState(0);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPronounsDropdown, setShowPronounsDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const pronounsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    username: '',
    bio: '',
    website: '',
    city: '',
    country: '',
    occupation: '',
    interests: '',
    birthday: '',
    pronouns: '',
    socialLinks: [],
    creatorCategory: '',
    skills: '',
    privacy: 'public',
    notifications: true,
    theme: 'dark',
    language: 'en',
  });

  const [originalForm, setOriginalForm] = useState<ProfileForm>(form);

  // Load profile data
  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    setError(null);
    apiGet<any>('/api/profiles/me', token)
      .then((data: any) => {
        const p = data?.profile ?? data?.data ?? data;
        const newForm: ProfileForm = {
          fullName: p.fullName || p.full_name || '',
          username: p.username || '',
          bio: p.bio || '',
          website: p.website || '',
          city: p.city || '',
          country: p.country || '',
          occupation: p.occupation || '',
          interests: p.interests || '',
          birthday: p.birthday || '',
          pronouns: p.pronouns || '',
          socialLinks: p.socialLinks || p.social_links || [],
          creatorCategory: p.creatorCategory || p.creator_category || '',
          skills: p.skills || '',
          privacy: p.privacy || 'public',
          notifications: p.notifications ?? true,
          theme: p.theme || 'dark',
          language: p.language || 'en',
        };
        setForm(newForm);
        setOriginalForm(JSON.parse(JSON.stringify(newForm)));
        setBioCharCount(newForm.bio.length);
        setAvatarPreview(p.avatarUrl || p.avatar_url || null);
        setBannerPreview(p.bannerUrl || p.banner_url || null);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [open, token]);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(form) !== JSON.stringify(originalForm) || !!avatarFile || !!bannerFile);
  }, [form, originalForm, avatarFile, bannerFile]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        if (hasChanges) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasChanges, onClose]);

  // Click outside dropdowns
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (pronounsRef.current && !pronounsRef.current.contains(e.target as Node)) setShowPronounsDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateField = (field: keyof ProfileForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'bio') setBioCharCount(value.length);
    if (field === 'username' && value.length > 2) {
      setCheckingUsername(true);
      setTimeout(() => {
        setUsernameAvailable(value !== originalForm.username);
        setCheckingUsername(false);
      }, 500);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Must be JPEG, PNG or WebP'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Must be JPEG, PNG or WebP'); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // Upload file using direct fetch with FormData (POST, matches backend multer config)
  const uploadFile = async (file: File, path: string, fieldName: string): Promise<string | undefined> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = `${apiUrl}${path}`;
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Upload failed');
      }
      
      // Backend returns: { message, profile, url }
      return result?.url || result?.data?.url || undefined;
    } catch (err) {
      console.error(`Upload failed for ${path}:`, err);
      return undefined;
    }
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      // Upload avatar if changed - field name 'avatar' matches backend multer config
      if (avatarFile) {
        const avatarUrl = await uploadFile(avatarFile, '/api/profiles/me/avatar', 'avatar');
        if (avatarUrl) {
          setAvatarPreview(avatarUrl);
        } else {
          setError('Failed to upload avatar. Please try again.');
          setSaving(false);
          return;
        }
      }
      // Upload banner if changed - field name 'banner' matches backend multer config
      if (bannerFile) {
        const bannerUrl = await uploadFile(bannerFile, '/api/profiles/me/banner', 'banner');
        if (bannerUrl) {
          setBannerPreview(bannerUrl);
        } else {
          setError('Failed to upload banner. Please try again.');
          setSaving(false);
          return;
        }
      }
      // Update profile data
      const updated = await apiPut<any>('/api/profiles/me', {
        fullName: form.fullName,
        username: form.username,
        bio: form.bio,
        website: form.website,
        city: form.city,
        country: form.country,
        occupation: form.occupation,
        interests: form.interests,
        birthday: form.birthday,
        pronouns: form.pronouns,
        socialLinks: form.socialLinks,
        creatorCategory: form.creatorCategory,
        skills: form.skills,
        privacy: form.privacy,
        notifications: form.notifications,
        theme: form.theme,
        language: form.language,
      }, token);
      setSuccess('Profile updated successfully!');
      onProfileUpdated(updated?.profile ?? updated?.data ?? updated);
      setTimeout(() => { setSuccess(null); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'media', label: 'Photos', icon: Image },
    { id: 'details', label: 'Details', icon: Heart },
    { id: 'links', label: 'Links', icon: Link2 },
    { id: 'settings', label: 'Settings', icon: Shield },
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (hasChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to close?')) onClose();
              } else onClose();
            }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 sm:inset-auto sm:top-[3%] sm:bottom-[3%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl z-[101] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
          >
            <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Edit Profile</h2>
                    <p className="text-[10px] text-gray-500">Customize your public profile</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
                    onClose();
                  }}
                  className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="hidden sm:flex flex-col w-48 border-r border-white/[0.06] p-3 space-y-1">
                  {sections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all text-left',
                          isActive
                            ? 'bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 text-white border border-[#ff007f]/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        )}
                      >
                        <Icon size={15} />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="skeleton h-8 w-48" />
                      <div className="skeleton h-12 w-full" />
                      <div className="skeleton h-12 w-full" />
                      <div className="skeleton h-24 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-8 max-w-2xl">
                      {/* Notifications */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                          >
                            <AlertCircle size={14} />
                            {error}
                          </motion.div>
                        )}
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"
                          >
                            <Check size={14} />
                            {success}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Section: Basic Info */}
                      {activeSection === 'basic' && (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
                            <input
                              value={form.fullName}
                              onChange={e => updateField('fullName', e.target.value)}
                              placeholder="Your display name"
                              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 focus:bg-white/[0.06] transition-all"
                              maxLength={50}
                            />
                            <p className="text-[10px] text-gray-600 mt-1 text-right">{form.fullName.length}/50</p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                              <input
                                value={form.username}
                                onChange={e => updateField('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                placeholder="username"
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-8 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 focus:bg-white/[0.06] transition-all"
                                maxLength={30}
                              />
                              {checkingUsername && (
                                <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />
                              )}
                              {usernameAvailable === true && !checkingUsername && (
                                <Check size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                              )}
                              {usernameAvailable === false && !checkingUsername && (
                                <X size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" />
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
                            <textarea
                              value={form.bio}
                              onChange={e => updateField('bio', e.target.value)}
                              rows={4}
                              placeholder="Tell people about yourself"
                              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 focus:bg-white/[0.06] transition-all resize-none"
                              maxLength={260}
                            />
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] text-gray-600">Tell your story in 260 characters</p>
                              <p className={cn('text-[10px]', bioCharCount > 200 ? 'text-amber-400' : 'text-gray-600')}>{bioCharCount}/260</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Pronouns</label>
                            <div className="relative" ref={pronounsRef}>
                              <button
                                onClick={() => setShowPronounsDropdown(!showPronounsDropdown)}
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-left text-white/70 hover:text-white transition-all"
                              >
                                {form.pronouns || 'Select pronouns (optional)'}
                              </button>
                              <AnimatePresence>
                                {showPronounsDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-20 mt-1 w-full rounded-2xl border border-white/[0.08] bg-[#0e0e16] backdrop-blur-2xl shadow-2xl overflow-hidden"
                                  >
                                    <div className="p-1">
                                      {PRONOUNS.map(p => (
                                        <button
                                          key={p}
                                          onClick={() => { updateField('pronouns', p); setShowPronounsDropdown(false); }}
                                          className={cn(
                                            'w-full text-left px-4 py-2.5 text-sm rounded-xl transition',
                                            form.pronouns === p ? 'bg-[#ff007f]/10 text-[#ff007f]' : 'text-gray-300 hover:bg-white/[0.04] hover:text-white'
                                          )}
                                        >
                                          {p}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section: Photos */}
                      {activeSection === 'media' && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Cover Photo</label>
                            <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/20 group">
                              {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Camera size={32} className="text-gray-600" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => bannerInputRef.current?.click()}
                                  disabled={uploadingBanner}
                                  className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs text-white hover:bg-white/30 transition"
                                >
                                  {uploadingBanner ? 'Uploading...' : 'Change'}
                                </button>
                                {bannerPreview && (
                                  <button
                                    onClick={removeBanner}
                                    className="p-2 rounded-xl bg-red-500/30 backdrop-blur-md text-white hover:bg-red-500/50 transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerSelect} />
                            <p className="text-[10px] text-gray-600 mt-1">Recommended: 1500x500px. Max 10MB.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                              <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/[0.08]">
                                  <Avatar src={avatarPreview} alt="Avatar" size="2xl" className="w-full h-full" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => avatarInputRef.current?.click()}>
                                  <Camera size={18} className="text-white" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <button
                                  onClick={() => avatarInputRef.current?.click()}
                                  className="text-xs text-[#00d8ff] hover:underline"
                                >
                                  Upload new photo
                                </button>
                                {avatarPreview && (
                                  <button onClick={removeAvatar} className="text-xs text-red-400 hover:underline block">
                                    Remove
                                  </button>
                                )}
                                <p className="text-[10px] text-gray-600">JPEG, PNG or WebP. Max 5MB.</p>
                              </div>
                            </div>
                            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarSelect} />
                          </div>
                        </div>
                      )}

                      {/* Section: Details */}
                      {activeSection === 'details' && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Occupation</label>
                              <div className="relative">
                                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  value={form.occupation}
                                  onChange={e => updateField('occupation', e.target.value)}
                                  placeholder="e.g. Software Engineer"
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Birthday (optional)</label>
                              <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  type="date"
                                  value={form.birthday}
                                  onChange={e => updateField('birthday', e.target.value)}
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff007f]/30 transition-all [color-scheme:dark]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">City</label>
                              <div className="relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  value={form.city}
                                  onChange={e => updateField('city', e.target.value)}
                                  placeholder="Your city"
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Country</label>
                              <div className="relative">
                                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  value={form.country}
                                  onChange={e => updateField('country', e.target.value)}
                                  placeholder="Your country"
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Creator Category</label>
                            <div className="relative" ref={categoryRef}>
                              <button
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-left text-white/70 hover:text-white transition-all"
                              >
                                {form.creatorCategory || 'Select a category'}
                              </button>
                              <AnimatePresence>
                                {showCategoryDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-20 mt-1 w-full rounded-2xl border border-white/[0.08] bg-[#0e0e16] backdrop-blur-2xl shadow-2xl overflow-hidden"
                                  >
                                    <div className="max-h-[200px] overflow-y-auto p-1">
                                      {CREATOR_CATEGORIES.map(cat => (
                                        <button
                                          key={cat}
                                          onClick={() => { updateField('creatorCategory', cat); setShowCategoryDropdown(false); }}
                                          className={cn(
                                            'w-full text-left px-4 py-2.5 text-sm rounded-xl transition',
                                            form.creatorCategory === cat ? 'bg-[#ff007f]/10 text-[#ff007f]' : 'text-gray-300 hover:bg-white/[0.04] hover:text-white'
                                          )}
                                        >
                                          {cat}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Skills</label>
                            <input
                              value={form.skills}
                              onChange={e => updateField('skills', e.target.value)}
                              placeholder="e.g. Singing, Dancing, Coding"
                              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Interests</label>
                            <input
                              value={form.interests}
                              onChange={e => updateField('interests', e.target.value)}
                              placeholder="Music, Travel, Gaming..."
                              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Section: Links */}
                      {activeSection === 'links' && (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Website</label>
                            <div className="relative">
                              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                              <input
                                value={form.website}
                                onChange={e => updateField('website', e.target.value)}
                                placeholder="https://example.com"
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-gray-400">Social Links</label>
                              <button
                                onClick={() => updateField('socialLinks', [...form.socialLinks, { platform: '', url: '' }])}
                                className="text-xs text-[#ff007f] hover:underline"
                              >
                                + Add link
                              </button>
                            </div>
                            <div className="space-y-2">
                              {form.socialLinks.map((link, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input
                                    value={link.platform}
                                    onChange={e => {
                                      const updated = [...form.socialLinks];
                                      updated[i] = { ...updated[i], platform: e.target.value };
                                      updateField('socialLinks', updated);
                                    }}
                                    placeholder="Platform"
                                    className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                                  />
                                  <input
                                    value={link.url}
                                    onChange={e => {
                                      const updated = [...form.socialLinks];
                                      updated[i] = { ...updated[i], url: e.target.value };
                                      updateField('socialLinks', updated);
                                    }}
                                    placeholder="URL"
                                    className="flex-[2] rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff007f]/30 transition-all"
                                  />
                                  <button
                                    onClick={() => updateField('socialLinks', form.socialLinks.filter((_, j) => j !== i))}
                                    className="p-2 text-gray-500 hover:text-red-400 transition"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section: Settings */}
                      {activeSection === 'settings' && (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Privacy</label>
                            <div className="space-y-2">
                              {[
                                { id: 'public', label: 'Public', desc: 'Everyone can see your profile' },
                                { id: 'followers', label: 'Followers Only', desc: 'Only your followers' },
                                { id: 'private', label: 'Private', desc: 'Only people you approve' },
                              ].map(option => (
                                <button
                                  key={option.id}
                                  onClick={() => updateField('privacy', option.id)}
                                  className={cn(
                                    'w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all',
                                    form.privacy === option.id
                                      ? 'border-[#ff007f]/30 bg-[#ff007f]/5'
                                      : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                                  )}
                                >
                                  <div className={cn(
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    form.privacy === option.id ? 'border-[#ff007f]' : 'border-white/20'
                                  )}>
                                    {form.privacy === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#ff007f]" />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{option.label}</p>
                                    <p className="text-[10px] text-gray-500">{option.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] p-4">
                            <div className="flex items-center gap-3">
                              <Bell size={16} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-white">Push Notifications</p>
                                <p className="text-[10px] text-gray-500">Receive notifications from SparkLive</p>
                              </div>
                            </div>
                            <button
                              onClick={() => updateField('notifications', !form.notifications)}
                              className={cn(
                                'w-10 h-6 rounded-full transition-all duration-300 relative',
                                form.notifications ? 'bg-[#ff007f]' : 'bg-white/[0.1]'
                              )}
                            >
                              <div className={cn(
                                'w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300',
                                form.notifications ? 'left-5' : 'left-1'
                              )} />
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Theme</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'dark', label: 'Dark', icon: '🌙' },
                                { id: 'light', label: 'Light', icon: '☀️' },
                              ].map(option => (
                                <button
                                  key={option.id}
                                  onClick={() => updateField('theme', option.id)}
                                  className={cn(
                                    'flex items-center gap-2 rounded-2xl border p-3 transition-all',
                                    form.theme === option.id
                                      ? 'border-[#ff007f]/30 bg-[#ff007f]/5'
                                      : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                                  )}
                                >
                                  <span>{option.icon}</span>
                                  <span className="text-sm text-white">{option.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">Language</label>
                            <select
                              value={form.language}
                              onChange={e => updateField('language', e.target.value)}
                              className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff007f]/30 transition-all"
                            >
                              <option value="en">English</option>
                              <option value="fr">Français</option>
                              <option value="es">Español</option>
                              <option value="de">Deutsch</option>
                              <option value="pt">Português</option>
                              <option value="ar">العربية</option>
                              <option value="ja">日本語</option>
                              <option value="ko">한국어</option>
                              <option value="zh">中文</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-white/[0.06] px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-600">
                    {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (hasChanges && !window.confirm('Discard changes?')) return;
                        onClose();
                      }}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.08] transition"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all',
                        hasChanges && !saving
                          ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30'
                          : 'bg-white/[0.05] text-gray-500 cursor-not-allowed'
                      )}
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}