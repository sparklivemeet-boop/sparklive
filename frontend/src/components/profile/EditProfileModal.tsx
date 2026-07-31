'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Camera, Upload, Save, Loader2, User, Globe, MapPin, Link2,
  Hash, Briefcase, Calendar, Heart, Shield, Palette, Languages,
  Eye, Bell, Check, AlertCircle, Image, Trash2, Undo2, RotateCw,
  ZoomIn, ZoomOut, Sparkles, Zap, Crown, Star, Flame, Gem, Move,
  Music, Gamepad2, BookOpen, Trophy, Monitor, Smartphone,
  Palette as PaletteIcon, MessageCircle, Gift, Target, TrendingUp,
  Atom, Radio, Users, Quote, Smile, Frown, Meh,
  Code, Github, Twitter, Instagram, Youtube, Linkedin, Twitch,
  ExternalLink, RefreshCw, Plus, Minus, Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, apiUpload } from '@/lib/apiClient';
import { uploadAvatar as uploadAvatarService, uploadBanner as uploadBannerService, validateUploadFile } from '@/lib/uploadService';
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

const SOCIAL_PLATFORMS = [
  { name: 'Twitter', icon: '𝕏', color: 'text-white' },
  { name: 'Instagram', icon: '📸', color: 'text-pink-400' },
  { name: 'YouTube', icon: '▶️', color: 'text-red-400' },
  { name: 'TikTok', icon: '🎵', color: 'text-cyan-400' },
  { name: 'Twitch', icon: '🎮', color: 'text-purple-400' },
  { name: 'Discord', icon: '💬', color: 'text-indigo-400' },
  { name: 'GitHub', icon: '💻', color: 'text-white' },
  { name: 'LinkedIn', icon: '💼', color: 'text-blue-400' },
  { name: 'Website', icon: '🌐', color: 'text-emerald-400' },
];

const PRIVACY_OPTIONS = [
  { id: 'public', label: 'Public', desc: 'Everyone can see your profile', icon: Globe },
  { id: 'followers', label: 'Followers Only', desc: 'Only your followers', icon: Users },
  { id: 'private', label: 'Private', desc: 'Only people you approve', icon: Shield },
];

const LANGUAGES = [
  { code: 'en', label: 'English', emoji: '🇺🇸' },
  { code: 'fr', label: 'Français', emoji: '🇫🇷' },
  { code: 'es', label: 'Español', emoji: '🇪🇸' },
  { code: 'de', label: 'Deutsch', emoji: '🇩🇪' },
  { code: 'pt', label: 'Português', emoji: '🇧🇷' },
  { code: 'ar', label: 'العربية', emoji: '🇸🇦' },
  { code: 'ja', label: '日本語', emoji: '🇯🇵' },
  { code: 'ko', label: '한국어', emoji: '🇰🇷' },
  { code: 'zh', label: '中文', emoji: '🇨🇳' },
];

// Profile strength calculation
const calculateProfileStrength = (form: ProfileForm, avatarPreview: string | null, bannerPreview: string | null) => {
  let score = 0;
  if (form.fullName.trim()) score += 15;
  if (form.username.trim()) score += 10;
  if (form.bio.trim().length > 20) score += 15;
  else if (form.bio.trim()) score += 8;
  if (avatarPreview) score += 15;
  if (bannerPreview) score += 10;
  if (form.website.trim()) score += 8;
  if (form.city.trim() || form.country.trim()) score += 7;
  if (form.occupation.trim()) score += 5;
  if (form.pronouns) score += 3;
  if (form.socialLinks.length > 0) score += 5;
  if (form.creatorCategory) score += 4;
  if (form.interests.trim()) score += 3;
  return Math.min(100, score);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

async function cropImageFile(
  file: File,
  options: { zoom: number; offsetX: number; offsetY: number; width: number; height: number; prefix: string }
) {
  const src = URL.createObjectURL(file);
  try {
    const image = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    const targetAspect = options.width / options.height;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let cropWidth = image.naturalWidth;
    let cropHeight = image.naturalHeight;

    if (imageAspect > targetAspect) {
      cropHeight = image.naturalHeight / options.zoom;
      cropWidth = cropHeight * targetAspect;
    } else {
      cropWidth = image.naturalWidth / options.zoom;
      cropHeight = cropWidth / targetAspect;
    }

    cropWidth = Math.min(cropWidth, image.naturalWidth);
    cropHeight = Math.min(cropHeight, image.naturalHeight);

    const maxX = Math.max(0, image.naturalWidth - cropWidth);
    const maxY = Math.max(0, image.naturalHeight - cropHeight);
    const sourceX = clamp(maxX / 2 + (options.offsetX / 100) * maxX, 0, maxX);
    const sourceY = clamp(maxY / 2 + (options.offsetY / 100) * maxY, 0, maxY);

    ctx.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, options.width, options.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
    if (!blob) return file;
    return new File([blob], `${options.prefix}-${Date.now()}.webp`, { type: 'image/webp' });
  } finally {
    URL.revokeObjectURL(src);
  }
}

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
  const [profileStrength, setProfileStrength] = useState(0);
  const [avatarRotate, setAvatarRotate] = useState(0);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarOffset, setAvatarOffset] = useState({ x: 0, y: 0 });
  const [bannerZoom, setBannerZoom] = useState(1);
  const [bannerOffset, setBannerOffset] = useState({ x: 0, y: 0 });
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const pronounsRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    fullName: '', username: '', bio: '', website: '', city: '',
    country: '', occupation: '', interests: '', birthday: '', pronouns: '',
    socialLinks: [], creatorCategory: '', skills: '', privacy: 'public',
    notifications: true, theme: 'dark', language: 'en',
  });

  const [originalForm, setOriginalForm] = useState<ProfileForm>(form);

  // Track mouse for parallax glow
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  }, []);

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
        setAvatarZoom(1);
        setAvatarOffset({ x: 0, y: 0 });
        setBannerZoom(1);
        setBannerOffset({ x: 0, y: 0 });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [open, token]);

  // Track changes & strength
  useEffect(() => {
    setHasChanges(JSON.stringify(form) !== JSON.stringify(originalForm) || !!avatarFile || !!bannerFile);
    setProfileStrength(calculateProfileStrength(form, avatarPreview, bannerPreview));
  }, [form, originalForm, avatarFile, bannerFile, avatarPreview, bannerPreview]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        if (hasChanges) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) onClose();
        } else onClose();
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
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) setShowPlatformPicker(false);
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
    setAvatarZoom(1);
    setAvatarOffset({ x: 0, y: 0 });
    setError(null);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Must be JPEG, PNG or WebP'); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setBannerZoom(1);
    setBannerOffset({ x: 0, y: 0 });
    setError(null);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarZoom(1);
    setAvatarOffset({ x: 0, y: 0 });
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };
  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerZoom(1);
    setBannerOffset({ x: 0, y: 0 });
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const resetAvatarCrop = () => {
    setAvatarZoom(1);
    setAvatarOffset({ x: 0, y: 0 });
  };

  const resetBannerCrop = () => {
    setBannerZoom(1);
    setBannerOffset({ x: 0, y: 0 });
  };

  const handleMediaDragStart = (type: 'avatar' | 'banner', e: React.PointerEvent<HTMLDivElement>) => {
    if (type === 'avatar' && !avatarFile) return;
    if (type === 'banner' && !bannerFile) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (type === 'avatar') setIsDraggingAvatar(true);
    if (type === 'banner') setIsDraggingBanner(true);
  };

  const handleMediaDragMove = (type: 'avatar' | 'banner', e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (type === 'avatar') {
      setAvatarOffset(prev => ({
        x: clamp(prev.x + dx * 0.12, -50, 50),
        y: clamp(prev.y + dy * 0.12, -50, 50),
      }));
    } else {
      setBannerOffset(prev => ({
        x: clamp(prev.x + dx * 0.12, -50, 50),
        y: clamp(prev.y + dy * 0.12, -50, 50),
      }));
    }
  };

  const handleMediaDragEnd = (type: 'avatar' | 'banner') => {
    dragStartRef.current = null;
    if (type === 'avatar') setIsDraggingAvatar(false);
    if (type === 'banner') setIsDraggingBanner(false);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      let newAvatarUrl = avatarPreview;
      let newBannerUrl = bannerPreview;

      // Upload avatar if changed - uses proven uploadService with compression
      if (avatarFile) {
        setUploadingAvatar(true);
        const croppedAvatar = await cropImageFile(avatarFile, {
          zoom: avatarZoom,
          offsetX: avatarOffset.x,
          offsetY: avatarOffset.y,
          width: 640,
          height: 640,
          prefix: 'avatar',
        });
        const result = await uploadAvatarService(croppedAvatar, token);
        setUploadingAvatar(false);
        if (!result.url) { setError(result.error || 'Failed to upload avatar.'); setSaving(false); return; }
        newAvatarUrl = result.url;
        setAvatarPreview(result.url);
      }

      // Upload banner if changed - uses proven uploadService with compression
      if (bannerFile) {
        setUploadingBanner(true);
        const croppedBanner = await cropImageFile(bannerFile, {
          zoom: bannerZoom,
          offsetX: bannerOffset.x,
          offsetY: bannerOffset.y,
          width: 1800,
          height: 600,
          prefix: 'cover',
        });
        const result = await uploadBannerService(croppedBanner, token);
        setUploadingBanner(false);
        if (!result.url) { setError(result.error || 'Failed to upload banner.'); setSaving(false); return; }
        newBannerUrl = result.url;
        setBannerPreview(result.url);
      }

      // Include uploaded URLs in profile update so backend persists them
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
        avatarUrl: newAvatarUrl,
        bannerUrl: newBannerUrl,
      }, token);
      setSuccess('Profile updated successfully!');
      onProfileUpdated({
        ...(updated?.profile ?? updated?.data ?? updated),
        avatarUrl: newAvatarUrl,
        bannerUrl: newBannerUrl,
      });
      setTimeout(() => { setSuccess(null); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User, desc: 'Name, username & bio' },
    { id: 'media', label: 'Photos', icon: Camera, desc: 'Avatar & cover image' },
    { id: 'details', label: 'Details', icon: Heart, desc: 'Location, category & more' },
    { id: 'links', label: 'Links', icon: Link2, desc: 'Website & social links' },
    { id: 'settings', label: 'Settings', icon: Shield, desc: 'Privacy & preferences' },
  ];

  if (!open) return null;

  const strengthColor = profileStrength >= 80 ? 'text-emerald-400' : profileStrength >= 50 ? 'text-amber-400' : 'text-pink-400';
  const strengthArc = profileStrength >= 80 ? '#10b981' : profileStrength >= 50 ? '#f59e0b' : '#ff007f';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with gradient particles */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (hasChanges) { if (window.confirm('Discard changes?')) onClose(); } else onClose(); }}
          >
            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#ff007f] opacity-[0.04] blur-[150px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#7a00cc] opacity-[0.04] blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>

          {/* Modal */}
          <motion.div
            ref={modalRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, scale: 0.92, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 50 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-3 sm:inset-auto sm:top-[2%] sm:bottom-[2%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-4xl z-[101] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
          >
            <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.08] bg-[#0a0a12]/98 backdrop-blur-2xl shadow-2xl shadow-[#ff007f]/5 overflow-hidden relative">
              {/* Ambient glow effect on mouse move */}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,0,127,0.08), transparent 50%)`,
                }}
              />

              {/* Header */}
              <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
                      <User size={18} className="text-white" />
                    </div>
                    <motion.div
                      className="absolute -inset-1 rounded-xl opacity-40"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: `linear-gradient(135deg, #ff007f, #7a00cc, #00d8ff)`,
                        filter: 'blur(8px)',
                        zIndex: -1,
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Edit Profile
                      <Sparkles size={14} className="text-pink-400" />
                    </h2>
                    <p className="text-[10px] text-gray-500">Customize your public profile</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { if (hasChanges && !window.confirm('Discard changes?')) return; onClose(); }}
                  className="rounded-xl p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Profile Strength Meter */}
              <div className="relative px-6 py-3 border-b border-white/[0.04] bg-gradient-to-r from-transparent via-white/[0.01] to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <motion.circle
                          cx="18" cy="18" r="15" fill="none" stroke={strengthArc}
                          strokeWidth="3" strokeLinecap="round"
                          initial={{ strokeDasharray: '0, 94.25' }}
                          animate={{ strokeDasharray: `${(profileStrength / 100) * 94.25}, 94.25` }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </svg>
                      <span className={cn('absolute inset-0 flex items-center justify-center text-[8px] font-bold', strengthColor)}>
                        {profileStrength}%
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">Profile Strength</p>
                      <p className="text-[9px] text-gray-500">
                        {profileStrength >= 80 ? '🌟 Excellent!' : profileStrength >= 50 ? '⚡ Getting there' : '💪 Keep going'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {['basic', 'media', 'details', 'links', 'settings'].map((s, i) => (
                      <motion.div
                        key={s}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all duration-500',
                          activeSection === s ? 'w-6 bg-gradient-to-r from-[#ff007f] to-[#7a00cc]' : 'bg-white/[0.06]'
                        )}
                        animate={{ scale: activeSection === s ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="hidden sm:flex flex-col w-56 border-r border-white/[0.06] p-3 space-y-1 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
                  {sections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <motion.button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        whileHover={{ x: 3 }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-all text-left relative overflow-hidden group',
                          isActive
                            ? 'text-white'
                            : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sectionGlow"
                            className="absolute inset-0 bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/10"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="sectionActive"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-gradient-to-b from-[#ff007f] to-[#7a00cc]"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className={cn(
                          'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                          isActive
                            ? 'bg-gradient-to-br from-[#ff007f] to-[#7a00cc] shadow-lg shadow-[#ff007f]/20'
                            : 'bg-white/[0.04] group-hover:bg-white/[0.06]'
                        )}>
                          <Icon size={15} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} />
                        </div>
                        <div className="relative">
                          <span className="text-sm font-medium block">{section.label}</span>
                          <span className="text-[9px] text-gray-600">{section.desc}</span>
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Premium badge at bottom */}
                  <div className="mt-auto pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/10">
                      <Crown size={12} className="text-amber-400" />
                      <span className="text-[10px] text-amber-300">SparkLive Premium</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                  {loading ? (
                    <div className="space-y-5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="skeleton h-3 w-24" />
                          <div className="skeleton h-12 w-full rounded-2xl" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6 max-w-2xl"
                    >
                      {/* Notifications */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="flex items-center gap-2.5 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 shadow-lg shadow-red-500/5"
                          >
                            <AlertCircle size={14} className="text-red-400 shrink-0" />
                            {error}
                            <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-300"><X size={12} /></button>
                          </motion.div>
                        )}
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 shadow-lg shadow-emerald-500/5"
                          >
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Check size={12} className="text-emerald-400" />
                            </div>
                            {success}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ===== SECTION: BASIC INFO ===== */}
                      {activeSection === 'basic' && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-pink-400" />
                            <h3 className="text-sm font-bold text-white">Basic Information</h3>
                          </div>

                          <div className="group">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <User size={10} /> Display Name
                            </label>
                            <div className="relative">
                              <input
                                value={form.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Your display name"
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,0,127,0.05)] transition-all duration-300"
                                maxLength={50}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-600 group-focus-within:text-pink-400/50 transition-colors">
                                {form.fullName.length}/50
                              </div>
                            </div>
                          </div>

                          <div className="group">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <At size={10} /> Username
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium">@</span>
                              <input
                                value={form.username}
                                onChange={e => updateField('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                placeholder="username"
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-8 pr-12 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,0,127,0.05)] transition-all duration-300"
                                maxLength={30}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {checkingUsername && <Loader2 size={14} className="text-gray-500 animate-spin" />}
                                {usernameAvailable === true && !checkingUsername && <Check size={14} className="text-emerald-400" />}
                                {usernameAvailable === false && !checkingUsername && <X size={14} className="text-red-400" />}
                              </div>
                            </div>
                          </div>

                          <div className="group">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Pen size={10} /> Bio
                            </label>
                            <div className="relative">
                              <textarea
                                value={form.bio}
                                onChange={e => updateField('bio', e.target.value)}
                                rows={4}
                                placeholder="Tell people about yourself..."
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,0,127,0.05)] transition-all duration-300 resize-none"
                                maxLength={260}
                              />
                              <div className="flex items-center justify-between mt-1.5 px-1">
                                <p className="text-[9px] text-gray-600">Tell your story in 260 characters</p>
                                <p className={cn('text-[9px] font-medium', bioCharCount > 200 ? 'text-amber-400' : 'text-gray-600')}>
                                  {bioCharCount}/260
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Pronouns with cyber dropdown */}
                          <div className="group">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Hash size={10} /> Pronouns <span className="text-gray-700 normal-case">(optional)</span>
                            </label>
                            <div className="relative" ref={pronounsRef}>
                              <motion.button
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setShowPronounsDropdown(!showPronounsDropdown)}
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-left text-white/50 hover:text-white/80 focus:border-[#ff007f]/40 transition-all flex items-center justify-between"
                              >
                                <span>{form.pronouns || 'Select pronouns'}</span>
                                <motion.div animate={{ rotate: showPronounsDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown size={12} className="text-gray-600" />
                                </motion.div>
                              </motion.button>
                              <AnimatePresence>
                                {showPronounsDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    className="absolute z-20 mt-1.5 w-full rounded-2xl border border-white/[0.08] bg-[#0e0e16]/98 backdrop-blur-2xl shadow-2xl overflow-hidden"
                                  >
                                    <div className="p-1.5">
                                      {PRONOUNS.map(p => (
                                        <motion.button
                                          key={p}
                                          whileHover={{ x: 3 }}
                                          onClick={() => { updateField('pronouns', p); setShowPronounsDropdown(false); }}
                                          className={cn(
                                            'w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-2',
                                            form.pronouns === p
                                              ? 'bg-[#ff007f]/10 text-[#ff007f] border border-[#ff007f]/10'
                                              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                          )}
                                        >
                                          <span className={cn(
                                            'w-4 h-4 rounded-full border flex items-center justify-center',
                                            form.pronouns === p ? 'border-[#ff007f] bg-[#ff007f]/10' : 'border-white/10'
                                          )}>
                                            {form.pronouns === p && <div className="w-2 h-2 rounded-full bg-[#ff007f]" />}
                                          </span>
                                          {p}
                                        </motion.button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ===== SECTION: PHOTOS ===== */}
                      {activeSection === 'media' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-1">
                            <Image size={14} className="text-cyan-400" />
                            <h3 className="text-sm font-bold text-white">Profile Media</h3>
                          </div>

                          {/* Banner Upload */}
                          <div className="group">
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Image size={10} /> Cover Photo
                            </label>
                            <motion.div
                              whileHover={{ scale: 1.005 }}
                              className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-r from-[#ff007f]/20 via-[#7a00cc]/20 to-[#00d8ff]/20 border border-white/[0.06] group"
                            >
                              {bannerPreview ? (
                                <div
                                  className={cn(
                                    'w-full h-full cursor-grab active:cursor-grabbing select-none',
                                    isDraggingBanner && 'cursor-grabbing'
                                  )}
                                  onPointerDown={(e) => handleMediaDragStart('banner', e)}
                                  onPointerMove={(e) => handleMediaDragMove('banner', e)}
                                  onPointerUp={() => handleMediaDragEnd('banner')}
                                  onPointerLeave={() => handleMediaDragEnd('banner')}
                                >
                                  <div className="absolute inset-0 z-10 pointer-events-none">
                                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/25" />
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/20" />
                                  </div>
                                  <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
                                    <Move size={10} />
                                    Drag to reposition
                                  </div>
                                  <img
                                    src={bannerPreview}
                                    alt="Banner"
                                    className="w-full h-full object-cover transition-transform duration-300"
                                    style={{
                                      transform: `scale(${bannerZoom}) translate(${bannerOffset.x * -0.08}%, ${bannerOffset.y * -0.08}%)`,
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                  <Camera size={36} className="text-gray-700" />
                                  <p className="text-xs text-gray-600">Click to upload banner</p>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => bannerInputRef.current?.click()}
                                  disabled={uploadingBanner}
                                  className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-md text-xs text-white hover:bg-white/30 transition-all flex items-center gap-2"
                                >
                                  {uploadingBanner ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                                  {uploadingBanner ? 'Uploading...' : 'Change Banner'}
                                </motion.button>
                                {bannerPreview && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={removeBanner}
                                    className="p-2.5 rounded-xl bg-red-500/30 backdrop-blur-md text-white hover:bg-red-500/50 transition"
                                  >
                                    <Trash2 size={14} />
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                            {bannerPreview && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
                                <label className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    <ZoomIn size={10} /> Cover zoom
                                  </span>
                                  <input
                                    type="range"
                                    min="1"
                                    max="2.4"
                                    step="0.05"
                                    value={bannerZoom}
                                    onChange={(e) => setBannerZoom(Number(e.target.value))}
                                    disabled={!bannerFile}
                                    className="w-full accent-[#ff007f] disabled:opacity-40"
                                  />
                                </label>
                                <label className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    <Sliders size={10} /> Horizontal
                                  </span>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    step="1"
                                    value={bannerOffset.x}
                                    onChange={(e) => setBannerOffset(prev => ({ ...prev, x: Number(e.target.value) }))}
                                    disabled={!bannerFile}
                                    className="w-full accent-[#00d8ff] disabled:opacity-40"
                                  />
                                </label>
                                <label className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    <Sliders size={10} /> Vertical
                                  </span>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    step="1"
                                    value={bannerOffset.y}
                                    onChange={(e) => setBannerOffset(prev => ({ ...prev, y: Number(e.target.value) }))}
                                    disabled={!bannerFile}
                                    className="w-full accent-[#7a00cc] disabled:opacity-40"
                                  />
                                </label>
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={resetBannerCrop}
                                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                                  >
                                    Reset crop
                                  </button>
                                </div>
                              </div>
                            )}
                            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerSelect} />
                            <p className="text-[9px] text-gray-600 mt-1.5">Recommended: 1500x500px • Max 10MB • JPEG, PNG or WebP</p>
                          </div>

                          {/* Avatar Upload */}
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Camera size={10} /> Profile Photo
                            </label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                              <motion.div
                                className="relative group cursor-pointer"
                                animate={{ rotate: avatarRotate }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => avatarInputRef.current?.click()}
                              >
                                {/* Glow ring */}
                                <motion.div
                                  className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100"
                                  animate={{
                                    background: [
                                      'radial-gradient(circle, rgba(255,0,127,0.2) 0%, transparent 70%)',
                                      'radial-gradient(circle, rgba(0,216,255,0.2) 0%, transparent 70%)',
                                      'radial-gradient(circle, rgba(255,0,127,0.2) 0%, transparent 70%)',
                                    ],
                                  }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                />
                                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/[0.08] shadow-2xl relative bg-white/[0.03]">
                                  {avatarPreview ? (
                                    <div
                                      className={cn(
                                        'w-full h-full cursor-grab active:cursor-grabbing select-none',
                                        isDraggingAvatar && 'cursor-grabbing'
                                      )}
                                      onPointerDown={(e) => handleMediaDragStart('avatar', e)}
                                      onPointerMove={(e) => handleMediaDragMove('avatar', e)}
                                      onPointerUp={() => handleMediaDragEnd('avatar')}
                                      onPointerLeave={() => handleMediaDragEnd('avatar')}
                                    >
                                      <div className="absolute inset-0 z-10 pointer-events-none rounded-full">
                                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/30" />
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/24" />
                                      </div>
                                      <div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.26em] text-white/80 backdrop-blur-md">
                                        <Move size={9} />
                                        Move
                                      </div>
                                      <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="w-full h-full object-cover transition-transform duration-300"
                                        style={{
                                          transform: `scale(${avatarZoom}) translate(${avatarOffset.x * -0.08}%, ${avatarOffset.y * -0.08}%)`,
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <Avatar src={avatarPreview} alt="Avatar" size="2xl" className="w-full h-full" />
                                  )}
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={22} className="text-white" />
                                  </div>
                                </div>
                              </motion.div>
                              <div className="w-full sm:w-auto space-y-2.5">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => avatarInputRef.current?.click()}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/20 text-xs text-pink-300 hover:text-pink-200 hover:bg-[#ff007f]/20 transition-all flex items-center justify-center gap-2"
                                >
                                  <Camera size={12} />
                                  Upload new photo
                                </motion.button>
                                {avatarPreview && (
                                  <motion.button
                                    whileHover={{ x: 3 }}
                                    onClick={removeAvatar}
                                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1.5"
                                  >
                                    <Trash2 size={11} />
                                    Remove
                                  </motion.button>
                                )}
                                <p className="text-[9px] text-gray-600">JPEG, PNG or WebP • Max 5MB</p>
                              </div>
                            </div>
                            {avatarPreview && (
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
                                <label className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    <ZoomIn size={10} /> Avatar zoom
                                  </span>
                                  <input
                                    type="range"
                                    min="1"
                                    max="2.8"
                                    step="0.05"
                                    value={avatarZoom}
                                    onChange={(e) => setAvatarZoom(Number(e.target.value))}
                                    disabled={!avatarFile}
                                    className="w-full accent-[#ff007f] disabled:opacity-40"
                                  />
                                </label>
                                <label className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    <Sliders size={10} /> Horizontal
                                  </span>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    step="1"
                                    value={avatarOffset.x}
                                    onChange={(e) => setAvatarOffset(prev => ({ ...prev, x: Number(e.target.value) }))}
                                    disabled={!avatarFile}
                                    className="w-full accent-[#00d8ff] disabled:opacity-40"
                                  />
                                </label>
                                <label className="space-y-1.5">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    <Sliders size={10} /> Vertical
                                  </span>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    step="1"
                                    value={avatarOffset.y}
                                    onChange={(e) => setAvatarOffset(prev => ({ ...prev, y: Number(e.target.value) }))}
                                    disabled={!avatarFile}
                                    className="w-full accent-[#7a00cc] disabled:opacity-40"
                                  />
                                </label>
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={resetAvatarCrop}
                                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
                                  >
                                    Reset crop
                                  </button>
                                </div>
                              </div>
                            )}
                            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarSelect} />
                          </div>
                        </div>
                      )}

                      {/* ===== SECTION: DETAILS ===== */}
                      {activeSection === 'details' && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-2 mb-1">
                            <Star size={14} className="text-amber-400" />
                            <h3 className="text-sm font-bold text-white">Profile Details</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Briefcase size={10} /> Occupation
                              </label>
                              <div className="relative">
                                <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                  value={form.occupation}
                                  onChange={e => updateField('occupation', e.target.value)}
                                  placeholder="e.g. Software Engineer"
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 focus:bg-white/[0.06] transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Calendar size={10} /> Birthday <span className="text-gray-700 normal-case">(optional)</span>
                              </label>
                              <div className="relative">
                                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                  type="date"
                                  value={form.birthday}
                                  onChange={e => updateField('birthday', e.target.value)}
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff007f]/40 transition-all [color-scheme:dark]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <MapPin size={10} /> City
                              </label>
                              <div className="relative">
                                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                  value={form.city}
                                  onChange={e => updateField('city', e.target.value)}
                                  placeholder="Your city"
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Globe size={10} /> Country
                              </label>
                              <div className="relative">
                                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                  value={form.country}
                                  onChange={e => updateField('country', e.target.value)}
                                  placeholder="Your country"
                                  className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Creator Category */}
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Target size={10} /> Creator Category
                            </label>
                            <div className="relative" ref={categoryRef}>
                              <motion.button
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-left text-white/50 hover:text-white/80 transition-all flex items-center justify-between"
                              >
                                <span>{form.creatorCategory || 'Select a category'}</span>
                                <motion.div animate={{ rotate: showCategoryDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown size={12} className="text-gray-600" />
                                </motion.div>
                              </motion.button>
                              <AnimatePresence>
                                {showCategoryDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    className="absolute z-20 mt-1.5 w-full rounded-2xl border border-white/[0.08] bg-[#0e0e16]/98 backdrop-blur-2xl shadow-2xl overflow-hidden"
                                  >
                                    <div className="max-h-[200px] overflow-y-auto p-1.5 scrollbar-hide">
                                      {CREATOR_CATEGORIES.map((cat, i) => (
                                        <motion.button
                                          key={cat}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.03 }}
                                          whileHover={{ x: 3 }}
                                          onClick={() => { updateField('creatorCategory', cat); setShowCategoryDropdown(false); }}
                                          className={cn(
                                            'w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-2',
                                            form.creatorCategory === cat
                                              ? 'bg-[#ff007f]/10 text-[#ff007f] border border-[#ff007f]/10'
                                              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                          )}
                                        >
                                          <span className={cn(
                                            'w-1.5 h-1.5 rounded-full',
                                            form.creatorCategory === cat ? 'bg-[#ff007f]' : 'bg-white/10'
                                          )} />
                                          {cat}
                                        </motion.button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Zap size={10} /> Skills
                              </label>
                              <input
                                value={form.skills}
                                onChange={e => updateField('skills', e.target.value)}
                                placeholder="e.g. Singing, Dancing, Coding"
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Heart size={10} /> Interests
                              </label>
                              <input
                                value={form.interests}
                                onChange={e => updateField('interests', e.target.value)}
                                placeholder="Music, Travel, Gaming..."
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ===== SECTION: LINKS ===== */}
                      {activeSection === 'links' && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-2 mb-1">
                            <Link2 size={14} className="text-emerald-400" />
                            <h3 className="text-sm font-bold text-white">Links & Social</h3>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Globe size={10} /> Website
                            </label>
                            <div className="relative">
                              <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                              <input
                                value={form.website}
                                onChange={e => updateField('website', e.target.value)}
                                placeholder="https://example.com"
                                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Link2 size={10} /> Social Links
                              </label>
                              <div className="relative" ref={platformRef}>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                                  className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
                                >
                                  <Plus size={11} />
                                  Add link
                                </motion.button>
                                <AnimatePresence>
                                  {showPlatformPicker && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                      className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border border-white/[0.08] bg-[#0e0e16]/98 backdrop-blur-2xl shadow-2xl overflow-hidden z-20"
                                    >
                                      <div className="p-1.5 space-y-0.5">
                                        {SOCIAL_PLATFORMS.map((platform) => (
                                          <button
                                            key={platform.name}
                                            onClick={() => {
                                              const existing = form.socialLinks.find(l => l.platform === platform.name);
                                              if (!existing) {
                                                updateField('socialLinks', [...form.socialLinks, { platform: platform.name, url: '' }]);
                                              }
                                              setShowPlatformPicker(false);
                                            }}
                                            className={cn(
                                              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left',
                                              form.socialLinks.find(l => l.platform === platform.name)
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                                            )}
                                            disabled={!!form.socialLinks.find(l => l.platform === platform.name)}
                                          >
                                            <span>{platform.icon}</span>
                                            {platform.name}
                                            {form.socialLinks.find(l => l.platform === platform.name) && (
                                              <Check size={10} className="ml-auto text-emerald-500" />
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {form.socialLinks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.01]">
                                  <Link2 size={20} className="text-gray-700 mb-2" />
                                  <p className="text-xs text-gray-600">No social links added yet</p>
                                  <p className="text-[9px] text-gray-700 mt-0.5">Connect your social profiles</p>
                                </div>
                              ) : (
                                form.socialLinks.map((link, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="flex items-center gap-2 group"
                                  >
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] min-w-[90px]">
                                      <span className="text-xs">{SOCIAL_PLATFORMS.find(p => p.name === link.platform)?.icon || '🔗'}</span>
                                      <span className="text-[10px] text-gray-400">{link.platform}</span>
                                    </div>
                                    <input
                                      value={link.url}
                                      onChange={e => {
                                        const updated = [...form.socialLinks];
                                        updated[i] = { ...updated[i], url: e.target.value };
                                        updateField('socialLinks', updated);
                                      }}
                                      placeholder={`${link.platform} URL`}
                                      className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#ff007f]/40 transition-all"
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.1, color: '#ef4444' }}
                                      onClick={() => updateField('socialLinks', form.socialLinks.filter((_, j) => j !== i))}
                                      className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <X size={13} />
                                    </motion.button>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ===== SECTION: SETTINGS ===== */}
                      {activeSection === 'settings' && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield size={14} className="text-purple-400" />
                            <h3 className="text-sm font-bold text-white">Privacy & Preferences</h3>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <Shield size={10} /> Profile Visibility
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                              {PRIVACY_OPTIONS.map(option => {
                                const Icon = option.icon;
                                const isActive = form.privacy === option.id;
                                return (
                                  <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.005 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => updateField('privacy', option.id)}
                                    className={cn(
                                      'flex items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                                      isActive
                                        ? 'border-[#ff007f]/30 bg-gradient-to-r from-[#ff007f]/5 to-[#7a00cc]/5 shadow-[0_0_20px_rgba(255,0,127,0.03)]'
                                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                    )}
                                  >
                                    <div className={cn(
                                      'w-10 h-10 rounded-xl flex items-center justify-center border transition-all',
                                      isActive
                                        ? 'bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20 border-[#ff007f]/20 text-pink-400'
                                        : 'bg-white/[0.04] border-white/[0.06] text-gray-500'
                                    )}>
                                      <Icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-gray-400')}>
                                          {option.label}
                                        </p>
                                        {isActive && <Check size={12} className="text-pink-400" />}
                                      </div>
                                      <p className="text-[10px] text-gray-600">{option.desc}</p>
                                    </div>
                                    <div className={cn(
                                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                                      isActive ? 'border-[#ff007f]' : 'border-white/20'
                                    )}>
                                      {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-[#ff007f]" />}
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Notifications Toggle */}
                          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.03] transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/10 flex items-center justify-center">
                                  <Bell size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-white font-medium">Push Notifications</p>
                                  <p className="text-[10px] text-gray-600">Receive notifications from SparkLive</p>
                                </div>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateField('notifications', !form.notifications)}
                                className={cn(
                                  'w-11 h-6 rounded-full transition-all duration-300 relative',
                                  form.notifications ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc]' : 'bg-white/[0.1]'
                                )}
                              >
                                <motion.div
                                  animate={{ x: form.notifications ? 22 : 2 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  className="w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] shadow-md"
                                />
                              </motion.button>
                            </div>
                          </div>

                          {/* Theme Selection */}
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <Palette size={10} /> Theme
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'dark', label: 'Dark', icon: '🌙', gradient: 'from-indigo-900/50 to-slate-900/50' },
                                { id: 'light', label: 'Light', icon: '☀️', gradient: 'from-amber-100/50 to-yellow-50/50' },
                              ].map(option => (
                                <motion.button
                                  key={option.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => updateField('theme', option.id)}
                                  className={cn(
                                    'flex items-center gap-3 rounded-2xl border p-3.5 transition-all',
                                    form.theme === option.id
                                      ? 'border-[#ff007f]/30 bg-gradient-to-r from-[#ff007f]/5 to-[#7a00cc]/5'
                                      : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                                  )}
                                >
                                  <div className={cn(
                                    'w-8 h-8 rounded-xl flex items-center justify-center',
                                    form.theme === option.id ? 'bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20' : 'bg-white/[0.04]'
                                  )}>
                                    <span>{option.icon}</span>
                                  </div>
                                  <span className={cn(
                                    'text-sm font-medium',
                                    form.theme === option.id ? 'text-white' : 'text-gray-400'
                                  )}>
                                    {option.label}
                                  </span>
                                  {form.theme === option.id && (
                                    <Check size={12} className="ml-auto text-pink-400" />
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Language */}
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <Globe size={10} /> Language
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {LANGUAGES.map(lang => (
                                <motion.button
                                  key={lang.code}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => updateField('language', lang.code)}
                                  className={cn(
                                    'flex items-center gap-2 rounded-2xl border px-3 py-3 transition-all',
                                    form.language === lang.code
                                      ? 'border-[#ff007f]/30 bg-gradient-to-r from-[#ff007f]/5 to-[#7a00cc]/5'
                                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                  )}
                                >
                                  <span className="text-lg">{lang.emoji}</span>
                                  <span className={cn(
                                    'text-[11px] font-medium',
                                    form.language === lang.code ? 'text-white' : 'text-gray-400'
                                  )}>
                                    {lang.label}
                                  </span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-white/[0.06] px-6 py-4 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: hasChanges ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        hasChanges ? 'bg-amber-400' : 'bg-emerald-500'
                      )} />
                    </motion.div>
                    <p className="text-[10px] text-gray-600">
                      {hasChanges ? 'Unsaved changes' : 'All changes saved'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { if (hasChanges && !window.confirm('Discard changes?')) return; onClose(); }}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      whileTap={hasChanges && !saving ? { scale: 0.97 } : {}}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all relative overflow-hidden',
                        hasChanges && !saving
                          ? 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30'
                          : 'bg-white/[0.05] text-gray-600 cursor-not-allowed'
                      )}
                    >
                      {/* Animated shimmer on save button */}
                      {hasChanges && !saving && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                      </span>
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

// ChevronDown component for the dropdowns
function ChevronDown({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// At symbol for username
function At({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

// Pen icon for bio
function Pen({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
