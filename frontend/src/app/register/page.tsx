"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authRegister } from "@/lib/authApi";
import { ApiError } from "@/lib/api";
import { Sparkles, Globe, Mail, Lock, ChevronRight, Eye, EyeOff, ArrowRight, User, UserPlus, AlertCircle, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { length: boolean; uppercase: boolean; lowercase: boolean; number: boolean; special: boolean };
}

interface FieldError {
  field: string;
  message: string;
}

export default function Register() {
  const { login } = useAuth();
  const router = useRouter();
  const usernameTimer = useRef<NodeJS.Timeout>();

  const [formData, setFormData] = useState({
    fullName: "", username: "", email: "", password: "", confirmPassword: "", agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0, label: "Weak", color: "bg-red-500",
    checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
  });
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  const getFieldError = (field: string) => fieldErrors.find((fe) => fe.field === field)?.message;

  const calculatePasswordStrength = useCallback((password: string) => {
    const checks = {
      length: password.length >= 8, uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password), number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    let score = 0, label = "Weak", color = "bg-red-500";
    if (passed <= 2) { score = 1; label = "Weak"; color = "bg-red-500"; }
    else if (passed === 3) { score = 2; label = "Fair"; color = "bg-orange-500"; }
    else if (passed === 4) { score = 3; label = "Good"; color = "bg-yellow-500"; }
    else { score = 4; label = "Strong"; color = "bg-green-500"; }
    if (password.length >= 12 && passed >= 4) { score = 5; label = "Very Strong"; color = "bg-emerald-500"; }
    setPasswordStrength({ score, label, color, checks });
  }, []);

  const [usernameCheckError, setUsernameCheckError] = useState(false);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (username.length < 3) { setUsernameAvailable(null); setUsernameCheckError(false); return; }
    setCheckingUsername(true);
    setUsernameCheckError(false);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/auth/check-username?username=${encodeURIComponent(username)}`);
      if (response.ok) {
        const data = await response.json();
        setUsernameAvailable(data.available);
        setUsernameCheckError(false);
      } else if (response.status === 500) {
        setUsernameAvailable(null);
        setUsernameCheckError(true);
      } else {
        setUsernameAvailable(false);
        setUsernameCheckError(false);
      }
    } catch {
      setUsernameAvailable(null);
      setUsernameCheckError(true);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setError("");
    setFieldErrors((prev) => prev.filter((fe) => fe.field !== name));
    if (name === "password") calculatePasswordStrength(newValue as string);
    if (name === "password" || name === "confirmPassword") {
      const pw = name === "password" ? newValue as string : formData.password;
      const confirm = name === "confirmPassword" ? newValue as string : formData.confirmPassword;
      if (confirm.length > 0) setPasswordsMatch(pw === confirm);
      else setPasswordsMatch(null);
    }
    if (name === "username") {
      if (usernameTimer.current) clearTimeout(usernameTimer.current);
      usernameTimer.current = setTimeout(() => checkUsernameAvailability(newValue as string), 500);
    }
  };

  const validateForm = (): FieldError[] => {
    const errors: FieldError[] = [];
    if (!formData.username || formData.username.length < 3) errors.push({ field: "username", message: "Username must be at least 3 characters" });
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) errors.push({ field: "username", message: "Only letters, numbers, and underscores" });
    if (!formData.email) errors.push({ field: "email", message: "Email is required" });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push({ field: "email", message: "Please enter a valid email" });
    if (!formData.password) errors.push({ field: "password", message: "Password is required" });
    else if (formData.password.length < 8) errors.push({ field: "password", message: "Password must be at least 8 characters" });
    if (!formData.confirmPassword) errors.push({ field: "confirmPassword", message: "Please confirm your password" });
    else if (formData.password !== formData.confirmPassword) errors.push({ field: "confirmPassword", message: "Passwords do not match" });
    if (!formData.agreeToTerms) errors.push({ field: "agreeToTerms", message: "You must agree to the Terms and Privacy Policy" });
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors = validateForm();
    setFieldErrors(errors);
    if (errors.length > 0) return;
    setLoading(true);
    try {
      const response = await authRegister({
        email: formData.email, username: formData.username,
        password: formData.password, fullName: formData.fullName || undefined,
      });
      if (!response.user || !response.token) throw new Error("Invalid response from server");
      await login(response.user, response.token, response.refreshToken);
      router.push("/discover");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#090912] overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,rgba(255,0,127,0.08)_0%,transparent_100%),radial-gradient(ellipse_50%_50%_at_100%_50%,rgba(124,58,237,0.06)_0%,transparent_100%),radial-gradient(circle_at_50%_0%,rgba(6,247,255,0.03)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      {/* ===== DESKTOP SPLIT ===== */}
      <div className="hidden lg:flex w-full min-h-screen">
        {/* LEFT: Brand */}
        <div className="flex-1 flex flex-col justify-center px-12 xl:px-20 2xl:px-28 relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent blur-[100px] animate-float" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/8 via-cyan-500/5 to-transparent blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-xl"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                <Sparkles size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Live</span>
              </span>
            </Link>

            <h1 className="text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.05] mb-4">
              Join{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">SparkLive</span>
            </h1>
            <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-md">
              Create your account and start connecting with millions of people worldwide. It's free, always.
            </p>

            <div className="space-y-4">
              {[
                "Build your premium profile in minutes",
                "Discover people who share your interests",
                "Go live, earn rewards, and grow your community",
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={mounted ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/10 flex items-center justify-center">
                    <Sparkles size={12} className="text-pink-400" />
                  </div>
                  <span className="text-sm text-white/50">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 relative overflow-y-auto py-10">
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
              <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
                <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-transparent via-white/[0.03] to-transparent opacity-40" />
              </div>

              <div className="relative p-8 sm:p-10">
                {/* Mobile header */}
                <div className="lg:hidden text-center mb-6">
                  <Link href="/" className="inline-flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-black text-white">Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Live</span></span>
                  </Link>
                  <h1 className="text-2xl font-bold text-white">Create Account</h1>
                  <p className="text-sm text-white/40 mt-1">Join the community</p>
                </div>

                {/* Social */}
                <div className="space-y-2.5 mb-6">
                  <button className="group relative w-full h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2.5 overflow-hidden">
                    <Globe size={16} className="text-blue-400" />
                    <span>Sign up with Google</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <div className="flex gap-2.5">
                    <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Apple
                    </button>
                    <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      Telegram
                    </button>
                    <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      X
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.04]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#090912] px-4 text-[11px] text-white/20 tracking-wider uppercase">or register with email</span>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-2xl mb-5 text-center">
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/50 tracking-wide">Full Name (Optional)</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><UserPlus size={15} /></div>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Spark" disabled={loading} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/50 tracking-wide">Username</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><User size={15} /></div>
                      <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="spark_user" disabled={loading} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                    </div>
                    {formData.username.length >= 3 && (
                      <div className="flex items-center gap-1.5">
                        {checkingUsername ? (
                          <span className="flex items-center gap-1 text-[11px] text-white/40"><span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Checking...</span>
                        ) : usernameCheckError ? (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400"><AlertCircle size={10} /> Unable to verify. Please try again.</span>
                        ) : usernameAvailable === true ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400"><Check size={10} /> Available</span>
                        ) : usernameAvailable === false ? (
                          <span className="flex items-center gap-1 text-[11px] text-red-400"><X size={10} /> Taken</span>
                        ) : null}
                      </div>
                    )}
                    {touched.username && getFieldError("username") && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {getFieldError("username")}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/50 tracking-wide">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Mail size={15} /></div>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={loading} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                    </div>
                    {touched.email && getFieldError("email") && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {getFieldError("email")}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/50 tracking-wide">Password</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Lock size={15} /></div>
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" disabled={loading} className="w-full h-12 pl-10 pr-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {formData.password.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(passwordStrength.score / 5) * 100}%` }} className={`h-full rounded-full ${passwordStrength.color} transition-all duration-300`} />
                          </div>
                          <span className="text-[10px] font-medium text-white/30 min-w-[55px] text-right">{passwordStrength.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {[
                            { key: "length", label: "8+ characters", passed: passwordStrength.checks.length },
                            { key: "uppercase", label: "Uppercase", passed: passwordStrength.checks.uppercase },
                            { key: "lowercase", label: "Lowercase", passed: passwordStrength.checks.lowercase },
                            { key: "number", label: "Number", passed: passwordStrength.checks.number },
                            { key: "special", label: "Special char", passed: passwordStrength.checks.special },
                          ].map((check) => (
                            <span key={check.key} className={`flex items-center gap-1 text-[10px] ${check.passed ? "text-emerald-400" : "text-white/20"}`}>
                              {check.passed ? <Check size={8} /> : <div className="w-1.5 h-1.5 rounded-full border border-white/20" />}
                              {check.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/50 tracking-wide">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Lock size={15} /></div>
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" disabled={loading} className="w-full h-12 pl-10 pr-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {formData.confirmPassword.length > 0 && passwordsMatch === false && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> Passwords do not match</p>
                    )}
                    {formData.confirmPassword.length > 0 && passwordsMatch === true && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1"><Check size={10} /> Passwords match</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} disabled={loading} className="mt-0.5 w-4 h-4 rounded-[6px] border border-white/15 bg-white/[0.03] accent-pink-500" />
                    <label htmlFor="agreeToTerms" className="text-xs text-white/30 leading-snug cursor-pointer select-none">
                      I agree to the <a href="/terms" className="text-white/50 hover:text-white/80 transition-colors font-medium">Terms of Service</a> and <a href="/privacy" className="text-white/50 hover:text-white/80 transition-colors font-medium">Privacy Policy</a>
                    </label>
                  </div>
                  {touched.agreeToTerms && getFieldError("agreeToTerms") && (
                    <p className="text-[11px] text-red-400 -mt-1">{getFieldError("agreeToTerms")}</p>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="group relative w-full h-12 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                  <p className="text-sm text-white/25">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white/60 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1 group">
                      Sign in <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
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
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="text-xl font-black text-white">Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Live</span></span>
                </Link>
                <h1 className="text-2xl font-bold text-white">Create Account</h1>
                <p className="text-sm text-white/40 mt-1">Join the community</p>
              </div>

              <div className="space-y-2.5 mb-6">
                <button className="group relative w-full h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2.5 overflow-hidden">
                  <Globe size={16} className="text-blue-400" />
                  <span>Sign up with Google</span>
                </button>
                <div className="flex gap-2.5">
                  <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    Apple
                  </button>
                  <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </button>
                  <button className="group relative flex-1 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white flex items-center justify-center gap-2 overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.04]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#090912] px-4 text-[11px] text-white/20 tracking-wider uppercase">or register with email</span>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-2xl mb-5 text-center">{error}</motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 tracking-wide">Full Name (Optional)</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><UserPlus size={15} /></div>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Spark" disabled={loading} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 tracking-wide">Username</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><User size={15} /></div>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="spark_user" disabled={loading} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                  </div>
                  {formData.username.length >= 3 && (
                    <div className="flex items-center gap-1.5">
                      {checkingUsername ? <span className="flex items-center gap-1 text-[11px] text-white/40"><span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Checking...</span>
                        : usernameCheckError ? <span className="flex items-center gap-1 text-[11px] text-amber-400"><AlertCircle size={10} /> Unable to verify. Please try again.</span>
                        : usernameAvailable === true ? <span className="flex items-center gap-1 text-[11px] text-emerald-400"><Check size={10} /> Available</span>
                        : usernameAvailable === false ? <span className="flex items-center gap-1 text-[11px] text-red-400"><X size={10} /> Taken</span>
                        : null}
                    </div>
                  )}
                  {touched.username && getFieldError("username") && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {getFieldError("username")}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 tracking-wide">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Mail size={15} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={loading} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                  </div>
                  {touched.email && getFieldError("email") && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {getFieldError("email")}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 tracking-wide">Password</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Lock size={15} /></div>
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" disabled={loading} className="w-full h-12 pl-10 pr-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(passwordStrength.score / 5) * 100}%` }} className={`h-full rounded-full ${passwordStrength.color} transition-all`} />
                        </div>
                        <span className="text-[10px] font-medium text-white/30 min-w-[55px] text-right">{passwordStrength.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {[
                          { key: "length", label: "8+ chars", passed: passwordStrength.checks.length },
                          { key: "uppercase", label: "Uppercase", passed: passwordStrength.checks.uppercase },
                          { key: "lowercase", label: "Lowercase", passed: passwordStrength.checks.lowercase },
                          { key: "number", label: "Number", passed: passwordStrength.checks.number },
                          { key: "special", label: "Special", passed: passwordStrength.checks.special },
                        ].map((check) => (
                          <span key={check.key} className={`flex items-center gap-1 text-[10px] ${check.passed ? "text-emerald-400" : "text-white/20"}`}>
                            {check.passed ? <Check size={8} /> : <div className="w-1.5 h-1.5 rounded-full border border-white/20" />}
                            {check.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 tracking-wide">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-400/60 transition-colors"><Lock size={15} /></div>
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" disabled={loading} className="w-full h-12 pl-10 pr-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/15 outline-none transition-all duration-200 focus:border-pink-500/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_1px_rgba(255,0,127,0.1)]" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                  {formData.confirmPassword.length > 0 && passwordsMatch === false && <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> Passwords do not match</p>}
                  {formData.confirmPassword.length > 0 && passwordsMatch === true && <p className="text-[11px] text-emerald-400 flex items-center gap-1"><Check size={10} /> Passwords match</p>}
                </div>
                <div className="flex items-start gap-2.5 pt-1">
                  <input type="checkbox" id="agreeToTerms-mob" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} disabled={loading} className="mt-0.5 w-4 h-4 rounded-[6px] border border-white/15 bg-white/[0.03] accent-pink-500" />
                  <label htmlFor="agreeToTerms-mob" className="text-xs text-white/30 leading-snug cursor-pointer select-none">
                    I agree to the <a href="/terms" className="text-white/50 hover:text-white/80 transition-colors font-medium">Terms</a> and <a href="/privacy" className="text-white/50 hover:text-white/80 transition-colors font-medium">Privacy Policy</a>
                  </label>
                </div>
                {touched.agreeToTerms && getFieldError("agreeToTerms") && <p className="text-[11px] text-red-400 -mt-1">{getFieldError("agreeToTerms")}</p>}
                <button type="submit" disabled={loading} className="group relative w-full h-12 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-white/25">Already have an account? <Link href="/login" className="text-white/60 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1 group">Sign in <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" /></Link></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}