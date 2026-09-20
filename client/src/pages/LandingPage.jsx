import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import FloatingChatbot from '../components/chat/FloatingChatbot';
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
  MessageSquare,
  LineChart,
  PieChart,
  ShieldCheck,
  Target,
  HelpCircle,
  Users,
  Briefcase,
  GraduationCap,
  Home,
  DollarSign,
  Clock,
  Smartphone,
  ChevronRight,
  FileText,
  Check,
  ArrowUpRight,
  Compass
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

  const [activeGuideTab, setActiveGuideTab] = useState('how');

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
        <div className="w-full px-4 sm:px-8 lg:px-[100px]">
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

              {/* Quick Jump Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#features"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/50 text-xs font-semibold text-[#10B981] transition"
                >
                  <span>Explore Features</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#how-why-where"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#263449] hover:border-[#6366F1]/50 text-xs font-semibold text-[#818CF8] transition"
                >
                  <span>How &amp; Why to Use</span>
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

      {/* ─── SECTION 1: WHAT FEATURES WE PROVIDE ─── */}
      <section id="features" className="w-full bg-[#0F172A] py-16 md:py-24 border-b border-[#263449]">
        <div className="w-full px-4 sm:px-8 lg:px-[100px]">

          {/* Section Header */}
          <div className="max-w-3xl mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
              Features We Provide in <span className="text-[#10B981]">SpendWise</span>
            </h2>
            <p className="mt-4 text-base text-[#94A3B8] leading-relaxed">
              A comprehensive financial operating system engineered with real-time transaction tracking,
              autonomous Python analytics, and Google Gemini AI to put you in total control of your money.
            </p>
          </div>

          {/* 8 Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Transaction Ledger */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/50 hover:shadow-xl hover:shadow-[#10B981]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    Core Ledger
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#10B981] transition-colors">
                  Income &amp; Expense Tracking
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Seamlessly log daily transactions with instant balance calculations, custom categories, notes, and timestamps.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Real-time running balance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>10+ smart spending categories</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Search, filter &amp; pagination (10/pg)</span>
                </li>
              </ul>
            </div>

            {/* 2. Automated AI Financial Reports */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#6366F1]/50 hover:shadow-xl hover:shadow-[#6366F1]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                    Python + Gemini
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#818CF8] transition-colors">
                  Automated AI Reports
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Instant weekly and monthly reports comparing periods, detailing category shifts, and providing natural-language executive summaries.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span>Week &amp; Month deterministic deltas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span>Category percentage &amp; ₹ shifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span>Month-end spending run-rate</span>
                </li>
              </ul>
            </div>

            {/* 3. Visual Charts & Analytics */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#F59E0B]/50 hover:shadow-xl hover:shadow-[#F59E0B]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                    Live Visuals
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#F59E0B] transition-colors">
                  Interactive Visual Charts
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Dynamic visual distribution of your income, expenses, and category allocations with instant net cashflow ratios.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                  <span>Dynamic SVG donut chart</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                  <span>Net savings rate (%) indicator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                  <span>Historical cashflow velocity</span>
                </li>
              </ul>
            </div>

            {/* 4. Smart AI Budgeting */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/50 hover:shadow-xl hover:shadow-[#10B981]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    50/30/20 Rule
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#10B981] transition-colors">
                  AI Budget Recommendations
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Autonomous budgeting engine that structures your income into Needs, Wants, and Savings, proposing strict category spending caps.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Automatic 50/30/20 allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Overspending category warnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Personalized reduction targets</span>
                </li>
              </ul>
            </div>

            {/* 5. Conversational AI Assistant */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#6366F1]/50 hover:shadow-xl hover:shadow-[#6366F1]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                    24/7 Copilot
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#818CF8] transition-colors">
                  AI Financial Assistant
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Conversational assistant available directly inside your dashboard to analyze spending habits, answer tax questions, and give advice.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span>Real-time conversational queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span>Context-aware habit diagnostics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span>Tailored Indian finance context (₹)</span>
                </li>
              </ul>
            </div>

            {/* 6. Purchase Evaluator */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#EF4444]/50 hover:shadow-xl hover:shadow-[#EF4444]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                    Affordability
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#EF4444] transition-colors">
                  Smart Purchase Evaluator
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Enter an item and price before buying. The AI evaluates your disposable income and gives an honest verdict to stop impulse debt.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                  <span>"Can I Afford This?" instant score</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                  <span>Disposable income impact check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                  <span>Curbs impulse gadget &amp; retail buys</span>
                </li>
              </ul>
            </div>

            {/* 7. Discord Webhook Push Alerts */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#38BDF8]/50 hover:shadow-xl hover:shadow-[#38BDF8]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                    Instant Push
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#38BDF8] transition-colors">
                  Discord Webhook Alerts
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Automated push alerts dispatched to your Discord channels when large transactions occur or when category budgets hit critical limits.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] flex-shrink-0" />
                  <span>80% &amp; 100% budget threshold alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] flex-shrink-0" />
                  <span>High-value expense notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] flex-shrink-0" />
                  <span>Stay informed without opening the app</span>
                </li>
              </ul>
            </div>

            {/* 8. Bank-Grade Security & Stack */}
            <div className="group p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/50 hover:shadow-xl hover:shadow-[#10B981]/5 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    Protected Vault
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#10B981] transition-colors">
                  Bank-Grade Security
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Engineered with salted bcrypt encryption, stateless JWT auth tokens, and strict database isolation so your data remains 100% private.
                </p>
              </div>
              <ul className="space-y-2 pt-3 border-t border-[#263449]/70 text-xs text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Salted Bcrypt password hashing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>Secure JWT route protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                  <span>PostgreSQL &amp; SQLite data isolation</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 2: HOW, WHY & WHERE USERS USE SPENDWISE ─── */}
      <section id="how-why-where" className="w-full bg-[#0B1220] py-16 md:py-24 border-b border-[#263449]">
        <div className="w-full px-4 sm:px-8 lg:px-[100px]">

          {/* Section Header */}
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
              How, Why &amp; Where to Use <span className="text-[#10B981]">SpendWise</span>
            </h2>
            <p className="mt-4 text-base text-[#94A3B8] leading-relaxed">
              Explore how our platform simplifies financial tracking step-by-step, why users prefer it over chaotic spreadsheets, and how it adapts to every lifestyle.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex flex-wrap gap-2.5 p-1.5 rounded-xl bg-[#111C2E] border border-[#263449] max-w-2xl mb-10">
            <button
              onClick={() => setActiveGuideTab('how')}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                activeGuideTab === 'how'
                  ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. How Users Use It</span>
            </button>

            <button
              onClick={() => setActiveGuideTab('why')}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                activeGuideTab === 'why'
                  ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/20'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Why Use It</span>
            </button>

            <button
              onClick={() => setActiveGuideTab('where')}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                activeGuideTab === 'where'
                  ? 'bg-[#F59E0B] text-white shadow-md shadow-[#F59E0B]/20'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. Where &amp; Who Uses It</span>
            </button>
          </div>

          {/* TAB 1: HOW USERS USE THIS WEBSITE */}
          {activeGuideTab === 'how' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Step 1 */}
                <div className="relative p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] font-black text-sm flex items-center justify-center border border-[#10B981]/30">
                        01
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        Step 1
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Sign Up in 30 Seconds
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Create your free account with your name, email, and password. Your personal encrypted data vault is created instantly with zero setup delays.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#263449]/70 text-[11px] text-[#10B981] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Free &amp; private account</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] font-black text-sm flex items-center justify-center border border-[#10B981]/30">
                        02
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        Step 2
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Log Incomes &amp; Expenses
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Record daily transactions as they happen—salary, lunch, groceries, rent, utilities. Choose a category and watch your balance adjust in real-time.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#263449]/70 text-[11px] text-[#10B981] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fast 1-click transaction logging</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] font-black text-sm flex items-center justify-center border border-[#10B981]/30">
                        03
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        Step 3
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Monitor Visual Analytics
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Open your dashboard to inspect visual cash flow charts, category breakdown donut distributions, savings rate percentages, and monthly burn velocity.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#263449]/70 text-[11px] text-[#10B981] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zero manual spreadsheet math</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] font-black text-sm flex items-center justify-center border border-[#10B981]/30">
                        04
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                        Step 4
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Generate AI Reports &amp; Advice
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Run automated weekly/monthly financial reports, consult the AI chatbot for personalized savings tips, and evaluate big purchases before spending.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#263449]/70 text-[11px] text-[#10B981] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Proactive AI financial health</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: WHY USERS USE THIS WEBSITE */}
          {activeGuideTab === 'why' && (
            <div className="space-y-8">
              
              {/* Comparison Matrix: Old Way vs SpendWise Way */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* The Old Way */}
                <div className="p-6 rounded-2xl bg-[#111C2E]/60 border border-[#EF4444]/25">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center text-sm font-bold">
                      ✕
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC]">
                      The Old Way: Spreadsheets &amp; Guesswork
                    </h3>
                  </div>
                  <ul className="space-y-3 text-xs text-[#94A3B8]">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                      <span><strong>End-of-Month Shocks:</strong> Wondering where your salary vanished without a clear record.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                      <span><strong>Clunky Spreadsheets:</strong> Broken Excel formulas, manual tallying, and poor mobile accessibility.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                      <span><strong>Impulsive Buying:</strong> Swiping credit cards without knowing your true disposable cash balance.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                      <span><strong>Zero Proactive Warnings:</strong> No alerts when you cross your budget until your bank balance hits zero.</span>
                    </li>
                  </ul>
                </div>

                {/* The SpendWise Way */}
                <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#10B981]/30 shadow-lg shadow-[#10B981]/5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-sm font-bold">
                      ✓
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC]">
                      The SpendWise Way: Intelligent &amp; Autonomous
                    </h3>
                  </div>
                  <ul className="space-y-3 text-xs text-[#94A3B8]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span><strong>100% Clarity:</strong> Every rupee is timestamped, categorized, and mathematically accounted for.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span><strong>Autonomous Python Engine:</strong> Instant weekly &amp; monthly shifts calculated deterministically with zero manual math.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span><strong>AI Purchase Evaluator:</strong> Test affordability before swiping to safeguard your savings targets.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span><strong>Instant Discord Alerts:</strong> Immediate push notifications whenever critical budget caps are approached.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* 4 Value Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] text-center">
                  <div className="text-2xl font-black text-[#10B981]">100%</div>
                  <div className="text-xs font-semibold text-[#F8FAFC] mt-1">Automated Math</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">Zero manual formula errors</div>
                </div>
                <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] text-center">
                  <div className="text-2xl font-black text-[#6366F1]">50/30/20</div>
                  <div className="text-xs font-semibold text-[#F8FAFC] mt-1">Structured Rules</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">Needs, Wants &amp; Savings</div>
                </div>
                <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] text-center">
                  <div className="text-2xl font-black text-[#F59E0B]">&lt; 3s</div>
                  <div className="text-xs font-semibold text-[#F8FAFC] mt-1">AI Report Speed</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">Fast Python calculation</div>
                </div>
                <div className="p-4 rounded-xl bg-[#111C2E] border border-[#263449] text-center">
                  <div className="text-2xl font-black text-[#10B981]">24 / 7</div>
                  <div className="text-xs font-semibold text-[#F8FAFC] mt-1">AI Availability</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">Advisor always on duty</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WHERE & WHO USES THIS WEBSITE */}
          {activeGuideTab === 'where' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Persona 1: College Students */}
                <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-4">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] mb-2 inline-block">
                      Education &amp; Early Career
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      College Students &amp; Gen-Z
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                      Managing monthly pocket money or internship stipends. Keeps daily canteen, study materials, and hostel expenses in check so money lasts all month.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#263449]/70 text-[11px] text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Common Use:</strong> Pocket money pacing &amp; food bill tracking.
                  </div>
                </div>

                {/* Persona 2: Working Professionals */}
                <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#6366F1]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center mb-4">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6366F1]/10 text-[#6366F1] mb-2 inline-block">
                      Corporate &amp; Salaried
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Working Professionals
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                      Structuring salary distribution across EMIs, rent, credit card dues, lifestyle dining, and disciplined mutual fund / SIP investments.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#263449]/70 text-[11px] text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Common Use:</strong> 50/30/20 budget allocations &amp; savings targets.
                  </div>
                </div>

                {/* Persona 3: Freelancers & Creators */}
                <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#F59E0B]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mb-4">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] mb-2 inline-block">
                      Independent &amp; Gig
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Freelancers &amp; Creators
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                      Managing fluctuating monthly income from multiple clients, software subscriptions, equipment expenses, and tax-deductible travel receipts.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#263449]/70 text-[11px] text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Common Use:</strong> Cash flow volatility &amp; multi-client tracking.
                  </div>
                </div>

                {/* Persona 4: Families & Household */}
                <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/40 transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-4">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] mb-2 inline-block">
                      Domestic &amp; Family
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC] mb-2">
                      Families &amp; Households
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                      Keeping track of shared grocery bills, electricity, water, children's schooling, medical prescriptions, and family vacation savings goals.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#263449]/70 text-[11px] text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Common Use:</strong> Utility budgeting &amp; emergency fund growth.
                  </div>
                </div>

              </div>

              {/* Where You Can Use It (Device & Ubiquity Card) */}
              <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#263449] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#F8FAFC]">
                      Where Can You Use SpendWise? Anywhere, On Any Device.
                    </h4>
                    <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
                      Fully web-responsive and ultra-fast. Open it on your laptop at work, your desktop workstation at home,
                      or on your mobile phone browser while paying at the grocery counter.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#263449] text-xs font-semibold text-[#94A3B8]">
                    <span>📱 Mobile</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#263449] text-xs font-semibold text-[#94A3B8]">
                    <span>💻 Laptop</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#263449] text-xs font-semibold text-[#94A3B8]">
                    <span>🖥️ Desktop</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ─── FLOATING AI CHATBOT (shown when logged in) ─── */}
      {isAuthenticated && <FloatingChatbot />}

      {/* ─── FOOTER ─── */}
      <footer className="w-full bg-[#0B1220] text-[#64748B] py-8 border-t border-[#263449] text-xs">
        <div className="w-full px-4 sm:px-8 lg:px-[100px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
            <div className="w-6 h-6 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-sm">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span>SpendWise</span>
          </div>

          <p className="text-[#64748B] text-center sm:text-left">
            AI Finance Manager • Built with React, Node.js, Express, Sequelize &amp; Python AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[#94A3B8]">
            <a href="#hero" className="hover:text-[#F8FAFC] transition">Back to Top</a>
            <a href="#features" className="hover:text-[#F8FAFC] transition">Features</a>
            <a href="#how-why-where" className="hover:text-[#F8FAFC] transition">How &amp; Why</a>
            <Link to="/dashboard" className="hover:text-[#F8FAFC] transition">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
