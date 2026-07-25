"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authLogin } from "@/lib/authApi";
import { ApiError } from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import SparkLiveLogo from "@/components/ui/SparkLiveLogo";

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authLogin({ email: formData.email, password: formData.password });
      if (!response.user || !response.token) throw new Error("Invalid response from server");
      await login(response.user, response.token, response.refreshToken);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex bg-[#07070d] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,rgba(255,0,127,0.08)_0%,transparent_100%),radial-gradient(ellipse_50%_50%_at_100%_50%,rgba(124,58,237,0.06)_0%,transparent_100%),radial-gradient(circle_at_50%_0%,rgba(6,247,255,0.03)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      {/* Desktop Split Layout */}
      <div className="hidden lg:flex w-full min-h-screen">
        {/* Left: Brand Side */}
        <div className="flex-1 flex flex-col justify-center px-12 xl:px-20 2xl:px-28 relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent blur-[100px] animate-float" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/8 via-cyan-500/5 to-transparent blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-xl"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                <SparkLiveLogo size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Spark<span className="text-gradient-pink">Live</span>
              </span>
            </Link>

            <h1 className="text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.05] mb-4">
              Welcome{" "}
              <span className="text-gradient">Back</span>
            </h1>
            <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-md">
              Sign in to continue your journey. Connect with friends, join live streams, and be part of something amazing.
            </p>

            <div className="space-y-4">
              {[
                "Discover millions of people worldwide",
                "Join live streams and voice rooms",
                "Build communities around your passions",
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={mounted ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/10 flex items-center justify-center">
                    <SparkLiveLogo size={12} className="text-pink-400" />
                  </div>
                  <span className="text-sm text-white/50">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Form Side */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-500/8 via-purple-500/5 to-transparent blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[440px]"
          >
            <div className="relative rounded-[28px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] overflow-hidden shadow-2xl shadow-purple-500/5">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              <div className="relative p-8 sm:p-10">
                {/* Mobile header */}
                <div className="lg:hidden text-center mb-6">
                  <Link href="/" className="inline-flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                      <SparkLiveLogo size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-black text-white">Spark<span className="text-gradient-pink">Live</span></span>
                  </Link>
                  <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                  <p className="text-sm text-white/40 mt-1">Sign in to continue</p>
                </div>

                {/* Social login */}
                <div className="space-y-2.5 mb-6">
                  <button className="group relative w-full h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2.5 overflow-hidden">
                    <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <span>Continue with Google</span>
                  </button>
                  <div className="flex gap-2.5">
                    <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Apple
                    </button>
                    <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      X
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="divider-label mb-6">
                  <span>or</span>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-error mb-5"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="form-label">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors duration-200">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="form-input pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="form-label">Password</label>
                      <Link href="/forgot-password" className="text-[11px] text-white/20 hover:text-pink-400/60 transition-colors">
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors duration-200">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="form-input pl-10 pr-12"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 rounded-[6px] border border-white/15 bg-white/[0.03] accent-pink-500"
                      />
                      <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Remember me</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-12"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                  <p className="text-sm text-white/25">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-white/60 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1 group">
                      Create one <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden w-full min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="relative rounded-[28px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] overflow-hidden shadow-2xl shadow-purple-500/5">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="relative p-8 sm:p-10">
              <div className="text-center mb-6">
                <Link href="/" className="inline-flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <SparkLiveLogo size={18} className="text-white" />
                  </div>
                  <span className="text-xl font-black text-white">Spark<span className="text-gradient-pink">Live</span></span>
                </Link>
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-sm text-white/40 mt-1">Sign in to continue</p>
              </div>

              <div className="space-y-2.5 mb-6">
                <button className="group relative w-full h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2.5 overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="divider-label mb-6">
                <span>or</span>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="form-error mb-5">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="form-label">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Mail size={15} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="form-input pl-10" autoComplete="email" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="form-label">Password</label>
                    <Link href="/forgot-password" className="text-[11px] text-white/20 hover:text-pink-400/60 transition-colors">Forgot?</Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Lock size={15} /></div>
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="form-input pl-10 pr-12" autoComplete="current-password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 rounded-[6px] border border-white/15 bg-white/[0.03] accent-pink-500" />
                    <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">Remember me</span>
                  </label>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full h-12">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-white/25">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-white/60 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1 group">
                    Create one <ChevronRight size={12} />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}