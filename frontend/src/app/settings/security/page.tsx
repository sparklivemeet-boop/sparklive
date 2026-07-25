"use client";

import { useState } from 'react';
import { ArrowLeft, Shield, Key, Smartphone, Fingerprint, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

export default function SecuritySettings() {
  const [twoFA, setTwoFA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6 pb-6 max-w-2xl">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <h1 className="text-2xl font-bold text-white">Security</h1>

      <div className="glass rounded-[var(--radius-2xl)] p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>
          <form className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="form-input pr-12" placeholder="Enter current password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Enter new password" />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Confirm new password" />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>

        <div className="divider" />

        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Two-Factor Authentication</h2>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Fingerprint size={18} className="text-purple-400" />
              <div>
                <p className="text-sm font-medium text-white">Two-Factor Auth</p>
                <p className="text-xs text-white/40">Add an extra layer of security</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFA(!twoFA)}
              className={`relative w-11 h-6 rounded-full transition-colors ${twoFA ? 'bg-pink-500' : 'bg-white/[0.1]'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${twoFA ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="divider" />

        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Active Sessions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-white">Current Session</p>
                  <p className="text-xs text-white/40">Windows • Chrome • Now</p>
                </div>
              </div>
              <span className="badge-green text-[10px]">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}