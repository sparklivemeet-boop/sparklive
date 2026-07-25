"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authRegister } from "@/lib/authApi";
import { ApiError } from "@/lib/api";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SparkLiveLogo from "@/components/ui/SparkLiveLogo";

export default function Register() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms of service");
      return;
    }

    setLoading(true);

    try {
      const response = await authRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (!response.user || !response.token) throw new Error("Invalid response from server");
      await login(response.user, response.token, response.refreshToken);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err.message || "Registration failed");
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(255,0,127,0.08)_0%,transparent_100%),radial-gradient(ellipse_50%_50%_at_0%_50%,rgba(124,58,237,0.06)_0%,transparent_100%),radial-gradient(circle_at_50%_100%,rgba(6,247,255,0.03)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="hidden lg:flex w-full min-h-screen">
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
                <div className="text-center mb-6">
                  <Link href="/" className="inline-flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                      <SparkLiveLogo size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-black text-white">Spark<span className="text-gradient-pink">Live</span></span>
                  </Link>
                  <h1 className="text-2xl font-bold text-white">Create Account</h1>
                  <p className="text-sm text-white/40 mt-1">Join the community</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="form-error mb-5">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="form-label">Username</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        className="form-input pl-10"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors">
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
                    <label className="form-label">Password</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="form-input pl-10 pr-12"
                        autoComplete="new-password"
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

                  <div className="space-y-1.5">
                    <label className="form-label">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="form-input pl-10"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 rounded-[6px] mt-0.5 border border-white/15 bg-white/[0.03] accent-pink-500"
                    />
                    <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                      I agree to the{" "}
                      <Link href="/terms" className="text-pink-400/60 hover:text-pink-400">Terms of Service</Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-pink-400/60 hover:text-pink-400">Privacy Policy</Link>
                    </span>
                  </label>

                  <button type="submit" disabled={loading} className="btn-primary w-full h-12">
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                  <p className="text-sm text-white/25">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white/60 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1 group">
                      Sign in <ChevronRight size={12} />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-12 xl:px-20 2xl:px-28 relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent blur-[100px] animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/8 via-cyan-500/5 to-transparent blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-xl ml-auto"
          >
            <h1 className="text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.05] mb-4">
              Start Your{" "}
              <span className="text-gradient">Journey</span>
            </h1>
            <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-md">
              Join millions of creators and viewers. Go live, connect, and build your community today.
            </p>

            <div className="space-y-4">
              {[
                "Create your free account in seconds",
                "Go live and connect with your audience",
                "Earn rewards and build your community",
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: 20 }}
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
                <h1 className="text-2xl font-bold text-white">Create Account</h1>
                <p className="text-sm text-white/40 mt-1">Join the community</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="form-error mb-5">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Username</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"><User size={15} /></div>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" className="form-input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"><Mail size={15} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="form-input pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"><Lock size={15} /></div>
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" className="form-input pl-10 pr-12" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20" tabIndex={-1}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"><Lock size={15} /></div>
                    <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" className="form-input pl-10" required />
                  </div>
                </div>
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="w-4 h-4 rounded-[6px] mt-0.5 accent-pink-500" />
                  <span className="text-xs text-white/30">I agree to the <Link href="/terms" className="text-pink-400/60">Terms</Link> & <Link href="/privacy" className="text-pink-400/60">Privacy Policy</Link></span>
                </label>
                <button type="submit" disabled={loading} className="btn-primary w-full h-12">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={14} /></>}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-white/25">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white/60 hover:text-pink-400 font-medium">Sign in <ChevronRight size={12} className="inline" /></Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}