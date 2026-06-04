"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authRegister, authPhoneSendOTP } from '@/lib/authApi';
import { ApiError } from '@/lib/api';
import { Globe, Apple, Smartphone } from 'lucide-react';

export default function Register() {
  const { login, setError: setAuthError } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.username || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await authRegister({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName || undefined,
      });

      if (!response.user || !response.token) {
        throw new Error('Invalid response from server');
      }

      // Login with received token
      await login(response.user, response.token, response.refreshToken);
      
      // Redirect to discover page
      router.push('/discover');
    } catch (err: any) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOTP = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setPhoneLoading(true);
    setError('');

    try {
      const response = await authPhoneSendOTP({ phoneNumber });
      if (response.message) {
        alert(`OTP sent to ${phoneNumber}`);
        setPhoneStep(true);
      }
    } catch (err: any) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Google OAuth will be implemented with NextAuth
    alert('Google Sign Up coming soon. Use email/password for now.');
  };

  const handleAppleSignup = () => {
    // Apple OAuth will be implemented
    alert('Apple Sign Up coming soon. Use email/password for now.');
  };

  const handlePhoneOTPSignup = () => {
    setPhoneStep(false);
    setPhoneNumber('');
    setError('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-[var(--background)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,0,127,0.16),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(122,0,204,0.14),_transparent_24%)]" />
      
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow backdrop-blur-xl">
          <div className="text-center mb-6">
            <Link href="/" className="text-4xl font-black tracking-tight inline-block">
              Spark<span className="text-gradient">Live</span>
            </Link>
            <p className="mt-3 text-gray-400">Create your premium profile and start streaming.</p>
          </div>

          {!phoneStep && (
            <>
              <div className="grid gap-3 mb-6">
                <button 
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading || phoneLoading}
                  className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Globe size={18} />
                  Sign up with Google
                </button>
                
                <button 
                  type="button"
                  onClick={handleAppleSignup}
                  disabled={loading || phoneLoading}
                  className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Apple size={18} />
                  Sign up with Apple
                </button>
                
                <button 
                  type="button"
                  onClick={handlePhoneOTPSignup}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone size={18} />
                  Phone OTP sign up
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-2xl mb-4 text-center">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name (Optional)</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition disabled:opacity-50"
                    placeholder="John Spark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition disabled:opacity-50"
                    placeholder="spark_user"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition disabled:opacity-50"
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
                    disabled={loading}
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition disabled:opacity-50"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div className="flex items-start gap-2 text-sm mt-4">
                  <input 
                    type="checkbox" 
                    id="terms"
                    disabled={loading}
                    className="mt-1 rounded border-gray-600 bg-gray-800 focus:ring-[var(--color-spark-pink)] disabled:opacity-50" 
                    required 
                  />
                  <label htmlFor="terms" className="text-gray-400 leading-snug cursor-pointer">
                    I agree to the <a href="#" className="text-white hover:underline">Terms</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-spark px-6 py-3 text-lg font-bold text-white shadow-[0_20px_60px_rgba(255,0,127,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          {phoneStep && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Phone OTP Verification</h3>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-2xl text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={phoneLoading}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition disabled:opacity-50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="button"
                onClick={handlePhoneSendOTP}
                disabled={phoneLoading || !phoneNumber}
                className="w-full rounded-full bg-gradient-spark px-6 py-3 text-lg font-bold text-white shadow-[0_20px_60px_rgba(255,0,127,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phoneLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <button
                type="button"
                onClick={handlePhoneOTPSignup}
                disabled={phoneLoading}
                className="w-full rounded-full border border-white/20 px-6 py-3 text-lg font-bold text-white transition hover:bg-white/5 disabled:opacity-50"
              >
                Back
              </button>
            </div>
          )}
        </div>

        <div className="glass rounded-[36px] border border-white/10 p-5 text-center shadow-glow backdrop-blur-xl">
          <p className="text-sm text-gray-400">Already have an account?</p>
          <Link href="/login" className="mt-4 inline-flex items-center justify-center rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-[var(--background)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,0,127,0.16),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(122,0,204,0.14),_transparent_24%)]" />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="glass rounded-[36px] border border-white/10 p-6 shadow-glow backdrop-blur-xl">
          <div className="text-center mb-6">
            <Link href="/" className="text-4xl font-black tracking-tight">
              Spark<span className="text-gradient">Live</span>
            </Link>
            <p className="mt-3 text-gray-400">Create your premium profile and start streaming.</p>
          </div>

          <div className="grid gap-3 mb-6">
            {[
              { icon: <Globe size={18} />, label: 'Sign up with Google' },
              { icon: <Apple size={18} />, label: 'Sign up with Apple' },
              { icon: <Smartphone size={18} />, label: 'Phone OTP sign up' }
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)] transition"
                placeholder="spark_user"
                required
              />
            </div>
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
            <div className="flex items-start gap-2 text-sm mt-2">
              <input type="checkbox" className="mt-1 rounded border-gray-600 bg-gray-800 focus:ring-[var(--color-spark-pink)]" required />
              <span className="text-gray-400 leading-snug">
                I agree to the <a href="#" className="text-white hover:underline">Terms</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-spark px-6 py-3 text-lg font-bold text-white shadow-[0_20px_60px_rgba(255,0,127,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="glass rounded-[36px] border border-white/10 p-5 text-center shadow-glow backdrop-blur-xl">
          <p className="text-sm text-gray-400">Already have an account?</p>
          <Link href="/login" className="mt-4 inline-flex items-center justify-center rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
