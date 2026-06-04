"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import { Globe, Apple, Smartphone } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-[var(--background)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,0,127,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(122,0,204,0.14),_transparent_24%)]" />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow backdrop-blur-xl">
          <div className="text-center mb-6">
            <Link href="/" className="text-4xl font-black tracking-tight">
              Spark<span className="text-gradient">Live</span>
            </Link>
            <p className="mt-3 text-gray-400">Premium social discovery and live streaming.</p>
          </div>

          <div className="grid gap-3 mb-6">
            {[
              { icon: <Globe size={18} />, label: 'Continue with Google' },
              { icon: <Apple size={18} />, label: 'Continue with Apple' },
              { icon: <Smartphone size={18} />, label: 'Phone / OTP Login' }
            ].map((item) => (
              <button key={item.label} className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-2xl mb-4 text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-gray-800 focus:ring-[var(--color-spark-pink)]" />
                Remember me
              </label>
              <a href="#" className="text-[var(--color-spark-pink)] hover:underline">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-spark px-6 py-3 text-lg font-bold text-white shadow-[0_20px_60px_rgba(255,0,127,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="glass rounded-[36px] border border-white/10 p-5 text-center shadow-glow backdrop-blur-xl">
          <p className="text-sm text-gray-400">Need a premium profile?</p>
          <Link href="/register" className="mt-4 inline-flex items-center justify-center rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
