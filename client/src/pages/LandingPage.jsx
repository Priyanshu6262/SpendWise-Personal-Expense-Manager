import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import {
  Wallet,
  Sparkles,
  Zap,
  Bot,
  TrendingUp,
  BarChart3,
  Server,
  Layers,
  Cpu,
  Bell,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Code2,
  Database,
  ExternalLink,
  MessageSquare,
  LineChart
} from 'lucide-react';

// ─── Password strength helper ───────────────────────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score, label: 'Good', color: '#10B981' };
  return { score, label: 'Strong', color: '#10B981' };
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// ─────────────────────────────────────────────────────────────────────────────

const LandingPage = ({ initialAuthMode = 'login' }) => {
  const { user, login, register, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login Form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });

  // Register Form
  const [registerData, setRegisterData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [registerTouched, setRegisterTouched] = useState({
    name: false, email: false, password: false, confirmPassword: false,
  });

  // Server health state
  const [serverStatus, setServerStatus] = useState({
    checking: true, online: false, latency: null, details: 'Connecting to API server...',
  });

  const [activeArchTab, setActiveArchTab] = useState('webdev');

  // ── Derived validation ─────────────────────────────────────────────────────
  const loginErrors = {
    email: !loginData.email
      ? 'Email is required'
      : !isValidEmail(loginData.email)
      ? 'Enter a valid email address'
      : '',
    password: !loginData.password
      ? 'Password is required'
      : loginData.password.length < 6
      ? 'Password must be at least 6 characters'
      : '',
  };

  const registerErrors = {
    name: !registerData.name
      ? 'Full name is required'
      : registerData.name.trim().length < 2
      ? 'Name must be at least 2 characters'
      : '',
    email: !registerData.email
      ? 'Email is required'
      : !isValidEmail(registerData.email)
      ? 'Enter a valid email address'
      : '',
    password: !registerData.password
      ? 'Password is required'
      : registerData.password.length < 6
      ? 'Password must be at least 6 characters'
      : '',
    confirmPassword: !registerData.confirmPassword
      ? 'Please confirm your password'
      : registerData.confirmPassword !== registerData.password
      ? 'Passwords do not match'
      : '',
  };

  const pwStrength = getPasswordStrength(registerData.password);
  // ──────────────────────────────────────────────────────────────────────────

  // Ping backend server
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const startTime = performance.now();
      try {
        const response = await api.get('/auth/me').catch((err) => err.response);
        const latency = Math.round(performance.now() - startTime);
        if (isMounted) {
          if (response) {
            setServerStatus({ checking: false, online: true, latency, details: 'API server is running normally' });
          } else {
            setServerStatus({ checking: false, online: false, latency: null, details: 'Server unreachable' });
          }
        }
      } catch {
        if (isMounted) {
          setServerStatus({ checking: false, online: false, latency: null, details: 'Could not connect' });
        }
      }
    };
    checkServer();
    return () => { isMounted = false; };
  }, []);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoginTouched({ email: true, password: true });
    if (loginErrors.email || loginErrors.password) {
      setAuthError('Please fix the errors above before signing in.');
      return;
    }
    setAuthLoading(true);
    const success = await login(loginData.email, loginData.password);
    setAuthLoading(false);
    if (success) navigate('/dashboard');
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setRegisterTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (registerErrors.name || registerErrors.email || registerErrors.password || registerErrors.confirmPassword) {
      setAuthError('Please fix the errors above before registering.');
      return;
    }
    setAuthLoading(true);
    const success = await register(registerData.name, registerData.email, registerData.password);
    setAuthLoading(false);
    if (success) navigate('/dashboard');
  };

  // Switch tabs and reset
  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
    setLoginTouched({ email: false, password: false });
    setRegisterTouched({ name: false, email: false, password: false, confirmPassword: false });
  };



  return (
    <div className="w-full min-h-screen bg-[#0B1220] text-[#F8FAFC] flex flex-col">
      {/* ─── NAVBAR ─── */}
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section id="hero" className="w-full bg-[#0B1220] py-14 md:py-20 border-b border-[#263449]">
        <div className="w-full px-[100px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* ─── LEFT SIDE: About Website & How It Works ─── */}
            <div className="lg:col-span-7 space-y-8">



              {/* Headings */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
                  AI Finance{' '}
                  <span className="text-[#10B981]">Manager</span>
                </h1>
                <p className="mt-4 text-lg font-medium text-[#94A3B8]">
                  Take full control of your wealth with{' '}
                  <span className="text-[#F8FAFC] font-semibold">SpendWise</span>
                </p>
                <p className="mt-3 text-sm text-[#64748B] leading-relaxed max-w-xl">
                  A modern intelligent platform designed to track your daily income and expenses,
                  uncover spending patterns, and provide AI-driven budget analytics in real-time.
                </p>
              </div>

              {/* Work & Features List */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                  How It Works
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1 */}
                  <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-[#F8FAFC]">Income & Expense Tracking</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Log and classify every transaction to monitor cashflow, net balance, and spending velocity.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] hover:border-[#6366F1]/40 transition">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-[#F8FAFC]">Intelligent AI Insights</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Automated analysis of spending behaviors, anomaly detection, and actionable savings recommendations.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-[#F8FAFC]">Real-Time Analytics</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Instant breakdown of category ratios, monthly budget pacing, and historical financial summaries.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] hover:border-[#F59E0B]/40 transition">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-[#F8FAFC]">Automated Alerts</span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Integration with webhooks for instant notifications whenever expenses exceed predefined budget caps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Jump Link */}
              <div>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#10B981] hover:text-[#059669] transition"
                >
                  <span>Learn more about the full-stack server architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* ─── RIGHT SIDE: Simple Text-Style Login & Register ─── */}
            <div className="lg:col-span-5">
              <div className="bg-[#111C2E] rounded-2xl border border-[#263449] p-7 shadow-xl">

                {/* Already Authenticated State */}
                {isAuthenticated ? (
                  <div className="text-center py-4 space-y-5">
                    <div className="w-14 h-14 rounded-full bg-[#10B981]/10 text-[#10B981] mx-auto flex items-center justify-center font-bold text-lg border border-[#10B981]/30">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#F8FAFC]">Welcome back, {user?.name || 'User'}</h3>
                      <p className="text-xs text-[#64748B] mt-1">You're signed in to SpendWise.</p>
                    </div>
                    <div className="space-y-2.5 pt-1">
                      <Link
                        to="/dashboard"
                        className="block w-full py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-medium text-sm text-center transition"
                      >
                        Go to Dashboard
                      </Link>
                      <Link
                        to="/transactions"
                        className="block w-full py-2 px-4 rounded-lg bg-[#0F172A] hover:bg-[#0B1220] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] font-medium text-sm text-center transition"
                      >
                        View Transactions
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Clean, Simple Text-Style Form */
                  <div>
                    {/* Animated tab switcher */}
                    <div className="flex items-center justify-between border-b border-[#263449] pb-3 mb-6">
                      <div className="flex items-center gap-5 text-sm font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setAuthError('');
                          }}
                          className={`pb-1 transition-all duration-300 ${
                            authMode === 'login'
                              ? 'text-[#10B981] border-b-2 border-[#10B981] scale-105'
                              : 'text-[#64748B] hover:text-[#94A3B8]'
                          }`}
                        >
                          Sign In
                        </button>
                        <span className="text-[#263449]">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('register');
                            setAuthError('');
                          }}
                          className={`pb-1 transition-all duration-300 ${
                            authMode === 'register'
                              ? 'text-[#10B981] border-b-2 border-[#10B981] scale-105'
                              : 'text-[#64748B] hover:text-[#94A3B8]'
                          }`}
                        >
                          Register
                        </button>
                      </div>

                      <span className="text-[11px] text-[#64748B]">
                        {authMode === 'login' ? 'Access account' : 'New account'}
                      </span>
                    </div>

                    {/* Error message */}
                    {authError && (
                      <div className="mb-4 p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* ── Animated form container ── */}
                    <div
                      key={authMode}
                      style={{ animation: 'authSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}
                      className="min-h-[330px] flex flex-col"
                    >

                    {/* ══════════════ SIGN IN FORM ══════════════ */}
                    {authMode === 'login' && (
                      <form onSubmit={handleLoginSubmit} className="space-y-3">

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
                          <input
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            onBlur={() => setLoginTouched((p) => ({ ...p, email: true }))}
                            placeholder="you@example.com"
                            className={`w-full px-3.5 py-2.5 bg-[#0F172A] border rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-1 transition ${
                              loginTouched.email && loginErrors.email
                                ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                : loginTouched.email && !loginErrors.email
                                ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20'
                                : 'border-[#263449] focus:border-[#10B981] focus:ring-[#10B981]/20'
                            }`}
                            disabled={authLoading}
                          />
                          {loginTouched.email && loginErrors.email && (
                            <p className="mt-1 text-[11px] text-[#EF4444] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{loginErrors.email}
                            </p>
                          )}
                          {loginTouched.email && !loginErrors.email && (
                            <p className="mt-1 text-[11px] text-[#10B981] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />Looks good!
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              onBlur={() => setLoginTouched((p) => ({ ...p, password: true }))}
                              placeholder="••••••••"
                              className={`w-full px-3.5 py-2.5 pr-10 bg-[#0F172A] border rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-1 transition ${
                                loginTouched.password && loginErrors.password
                                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                  : loginTouched.password && !loginErrors.password
                                  ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20'
                                  : 'border-[#263449] focus:border-[#10B981] focus:ring-[#10B981]/20'
                              }`}
                              disabled={authLoading}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {loginTouched.password && loginErrors.password && (
                            <p className="mt-1 text-[11px] text-[#EF4444] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{loginErrors.password}
                            </p>
                          )}
                        </div>

                        <button type="submit" disabled={authLoading}
                          className="w-full py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm transition disabled:opacity-50 disabled:pointer-events-none">
                          {authLoading ? <Spinner size="sm" color="white" text="Signing in..." /> : 'Sign In'}
                        </button>
                      </form>
                    )}

                    {/* ══════════════ REGISTER FORM ══════════════ */}
                    {authMode === 'register' && (
                      <form onSubmit={handleRegisterSubmit} className="space-y-3">

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            onBlur={() => setRegisterTouched((p) => ({ ...p, name: true }))}
                            placeholder="John Doe"
                            className={`w-full px-3.5 py-2.5 bg-[#0F172A] border rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-1 transition ${
                              registerTouched.name && registerErrors.name
                                ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                : registerTouched.name && !registerErrors.name
                                ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20'
                                : 'border-[#263449] focus:border-[#10B981] focus:ring-[#10B981]/20'
                            }`}
                            disabled={authLoading}
                          />
                          {registerTouched.name && registerErrors.name && (
                            <p className="mt-1 text-[11px] text-[#EF4444] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{registerErrors.name}
                            </p>
                          )}
                          {registerTouched.name && !registerErrors.name && (
                            <p className="mt-1 text-[11px] text-[#10B981] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />Looks good!
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
                          <input
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            onBlur={() => setRegisterTouched((p) => ({ ...p, email: true }))}
                            placeholder="john@example.com"
                            className={`w-full px-3.5 py-2.5 bg-[#0F172A] border rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-1 transition ${
                              registerTouched.email && registerErrors.email
                                ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                : registerTouched.email && !registerErrors.email
                                ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20'
                                : 'border-[#263449] focus:border-[#10B981] focus:ring-[#10B981]/20'
                            }`}
                            disabled={authLoading}
                          />
                          {registerTouched.email && registerErrors.email && (
                            <p className="mt-1 text-[11px] text-[#EF4444] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{registerErrors.email}
                            </p>
                          )}
                          {registerTouched.email && !registerErrors.email && (
                            <p className="mt-1 text-[11px] text-[#10B981] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />Valid email!
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              onBlur={() => setRegisterTouched((p) => ({ ...p, password: true }))}
                              placeholder="At least 6 characters"
                              className={`w-full px-3.5 py-2.5 pr-10 bg-[#0F172A] border rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-1 transition ${
                                registerTouched.password && registerErrors.password
                                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                  : registerTouched.password && !registerErrors.password
                                  ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20'
                                  : 'border-[#263449] focus:border-[#10B981] focus:ring-[#10B981]/20'
                              }`}
                              disabled={authLoading}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {/* Password strength bar */}
                          {registerData.password && (
                            <div className="mt-2 space-y-1">
                              <div className="flex gap-1">
                                {[1,2,3,4].map((seg) => (
                                  <div key={seg} className="h-1 flex-1 rounded-full transition-all duration-300"
                                    style={{ backgroundColor: pwStrength.score >= seg ? pwStrength.color : '#263449' }} />
                                ))}
                              </div>
                              <p className="text-[11px] font-medium" style={{ color: pwStrength.color }}>
                                {pwStrength.label} password
                                {pwStrength.score < 3 && <span className="text-[#64748B] font-normal"> — add uppercase, numbers or symbols</span>}
                              </p>
                            </div>
                          )}
                          {registerTouched.password && registerErrors.password && (
                            <p className="mt-1 text-[11px] text-[#EF4444] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{registerErrors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Confirm Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={registerData.confirmPassword}
                              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                              onBlur={() => setRegisterTouched((p) => ({ ...p, confirmPassword: true }))}
                              placeholder="Re-enter password"
                              className={`w-full px-3.5 py-2.5 pr-10 bg-[#0F172A] border rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-1 transition ${
                                registerTouched.confirmPassword && registerErrors.confirmPassword
                                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                                  : registerTouched.confirmPassword && !registerErrors.confirmPassword
                                  ? 'border-[#10B981] focus:border-[#10B981] focus:ring-[#10B981]/20'
                                  : 'border-[#263449] focus:border-[#10B981] focus:ring-[#10B981]/20'
                              }`}
                              disabled={authLoading}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition">
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {registerTouched.confirmPassword && registerErrors.confirmPassword && (
                            <p className="mt-1 text-[11px] text-[#EF4444] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{registerErrors.confirmPassword}
                            </p>
                          )}
                          {registerTouched.confirmPassword && !registerErrors.confirmPassword && registerData.confirmPassword && (
                            <p className="mt-1 text-[11px] text-[#10B981] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />Passwords match!
                            </p>
                          )}
                        </div>

                        <button type="submit" disabled={authLoading}
                          className="w-full py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm transition disabled:opacity-50 disabled:pointer-events-none">
                          {authLoading ? <Spinner size="sm" color="white" text="Creating account..." /> : 'Create Account'}
                        </button>
                      </form>
                    )}

                    </div>{/* end animated container */}

                    <div className="mt-4 pt-4 border-t border-[#263449] text-center">
                      {authMode === 'register' ? (
                        <p className="text-xs text-[#64748B]">
                          Already have an account?{' '}
                          <button type="button" onClick={() => switchMode('login')}
                            className="text-[#10B981] hover:text-[#059669] font-semibold transition">
                            Sign in
                          </button>
                        </p>
                      ) : (
                        <p className="text-xs text-[#64748B]">
                          Don't have an account?{' '}
                          <button type="button" onClick={() => switchMode('register')}
                            className="text-[#10B981] hover:text-[#059669] font-semibold transition">
                            Register for free
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ABOUT SECTION ─── */}
      <section id="about" className="w-full bg-[#0F172A] py-16 md:py-24 border-b border-[#263449]">
        <div className="w-full px-[100px]">

          {/* Section Header */}
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
              About The Project &amp; Server
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight mt-2">
              Engineered as a Strong Full-Stack Platform
            </h2>
            <div className="mt-4 p-4 rounded-xl bg-[#111C2E] border border-[#263449]">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                This is a strong full-stack project because it combines{' '}
                <strong className="text-[#10B981]">web development</strong>,{' '}
                <strong className="text-[#6366F1]">artificial intelligence</strong>,{' '}
                <strong className="text-[#F59E0B]">data analytics</strong>, and{' '}
                <strong className="text-[#10B981]">AI tool integration</strong>.
              </p>
            </div>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">

            {/* 1. Web Development */}
            <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                  Pillar 1
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC]">Web Development</h3>
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                Structured frontend and backend architecture delivering speed, reliability, and security.
              </p>
              <ul className="space-y-2.5 text-xs text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Frontend:</strong> React 18 with Vite, Tailwind CSS, and Axios JWT request interceptors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Backend API:</strong> Node.js and Express REST API with modular controllers and route protection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Database:</strong> Sequelize ORM supporting relational SQL (PostgreSQL, SQLite, MySQL).</span>
                </li>
              </ul>
            </div>

            {/* 2. Artificial Intelligence */}
            <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#6366F1]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                  Pillar 2
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC]">Artificial Intelligence</h3>
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                Automated analytical models integrated inside server services for cognitive financial support.
              </p>
              <ul className="space-y-2.5 text-xs text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">AI Spending Diagnosis:</strong> Reviews transaction records to pinpoint spending anomalies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Interactive AI Chatbot:</strong> Natural language assistant for conversational financial queries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Personalized Advice:</strong> Tailored tips to reduce unnecessary expenses and build savings.</span>
                </li>
              </ul>
            </div>

            {/* 3. Data Analytics */}
            <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#F59E0B]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                  Pillar 3
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC]">Data Analytics</h3>
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                Real-time mathematical aggregation of expenses, income, and category ratios.
              </p>
              <ul className="space-y-2.5 text-xs text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Cashflow Ratios:</strong> Net savings percentage, monthly burn rate, and velocity metrics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Category Allocation:</strong> Visual breakdown of expenses across food, utilities, tech, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Multi-Filter Queries:</strong> Dynamic search, category filtering, and date sorting.</span>
                </li>
              </ul>
            </div>

            {/* 4. AI Tool Integration */}
            <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                  Pillar 4
                </span>
                <h3 className="text-base font-bold text-[#F8FAFC]">AI Tool Integration</h3>
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                Automated webhook triggers and operational telemetry connecting external tools.
              </p>
              <ul className="space-y-2.5 text-xs text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Discord Webhook Alerts:</strong> Automated push notifications on critical spend alerts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Incident Telemetry:</strong> Log aggregation pipelines shipping server events for monitoring.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[#F8FAFC]">Automated Webhook Receivers:</strong> Ingests external system alerts with automated analysis.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Live Server Status Bar */}
          <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${serverStatus.online ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`} />
              <span className="font-semibold text-[#F8FAFC]">
                Server Status: {serverStatus.online ? 'Connected & Online' : 'Checking connection...'}
              </span>
              {serverStatus.latency && (
                <span className="text-[#64748B]">({serverStatus.latency}ms ping)</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
              <span className="font-mono">API: /api/auth, /api/transactions, /api/ai</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="w-full bg-[#0B1220] text-[#64748B] py-8 border-t border-[#263449] text-xs">
        <div className="w-full px-[100px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
            <div className="w-6 h-6 rounded bg-[#10B981] text-white flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span>SpendWise</span>
          </div>

          <p className="text-[#64748B] text-center sm:text-left">
            AI Finance Manager • Built with React, Node.js, Express, Sequelize &amp; AI integration.
          </p>

          <div className="flex items-center gap-4 text-[#94A3B8]">
            <a href="#hero" className="hover:text-[#F8FAFC] transition">Back to Top</a>
            <a href="#about" className="hover:text-[#F8FAFC] transition">About</a>
            <Link to="/dashboard" className="hover:text-[#F8FAFC] transition">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
