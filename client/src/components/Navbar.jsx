import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  User as UserIcon,
  Menu,
  X,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Spinner from './Spinner';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Navbar = () => {
  const { user, login, register, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState(null); // 'login' | 'register' | null

  const dropdownRef = useRef(null);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login Form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  // Register Form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAuthModalMode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openAuthModal = (mode) => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    setAuthError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAuthModalMode(mode);
  };

  const closeAuthModal = () => {
    setAuthModalMode(null);
    setAuthError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!loginData.email || !loginData.password) {
      setAuthError('Email and password are required.');
      return;
    }
    if (!isValidEmail(loginData.email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthLoading(true);
    const success = await login(loginData.email, loginData.password);
    setAuthLoading(false);
    if (success) {
      closeAuthModal();
      navigate('/dashboard');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!registerData.name || !registerData.email || !registerData.password) {
      setAuthError('All fields are required.');
      return;
    }
    if (registerData.name.trim().length < 2) {
      setAuthError('Name must be at least 2 characters.');
      return;
    }
    if (!isValidEmail(registerData.email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (registerData.password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    const success = await register(registerData.name, registerData.email, registerData.password);
    setAuthLoading(false);
    if (success) {
      closeAuthModal();
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/transactions' && location.pathname === '/transactions') return true;
    if (path === '/profile' && location.pathname === '/profile') return true;
    return false;
  };

  return (
    <>
      <header className="w-full bg-[#0F172A] text-[#F8FAFC] border-b border-[#263449] sticky top-0 z-40">
        <div className="w-full px-4 sm:px-8 lg:px-[100px] h-16 flex items-center justify-between">

          {/* Left: Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#10B981] text-white font-bold shadow-md shadow-[#10B981]/20">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                SpendWise
              </span>
            </Link>
          </div>

          {/* Middle: Dashboard, Transactions */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="/dashboard"
              className={`transition duration-150 ${
                isActive('/dashboard')
                  ? 'text-[#10B981] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/transactions"
              className={`transition duration-150 ${
                isActive('/transactions')
                  ? 'text-[#10B981] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Transactions
            </Link>
          </nav>

          {/* Right: Only Profile Icon with Click Menu */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`p-2 rounded-lg border border-[#263449] hover:bg-[#111C2E] text-[#94A3B8] hover:text-[#F8FAFC] transition cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 ${
                  profileDropdownOpen || isActive('/profile') ? 'border-[#10B981] text-[#F8FAFC]' : ''
                }`}
                title="Account"
                aria-label="Account Options"
                aria-expanded={profileDropdownOpen}
              >
                {user && user.name ? (
                  <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </button>

              {/* Profile Icon Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#111C2E] border border-[#263449] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* If user is logged in, show user info & profile settings */}
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-[#263449]/70">
                        <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                          {user.name || 'User'}
                        </p>
                        {user.email && (
                          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                            {user.email}
                          </p>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A] transition"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Profile Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-[#263449]/70 px-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/15 rounded-lg transition text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* If not logged in, show Sign In and Register options */
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:bg-[#0F172A] hover:text-[#10B981] transition text-left cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-[#10B981]" />
                        <span>Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openAuthModal('register')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:bg-[#0F172A] hover:text-[#10B981] transition text-left cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-[#10B981]" />
                        <span>Register</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111C2E]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 bg-[#0F172A] border-t border-[#263449] space-y-3 text-sm">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-1.5 transition ${
                isActive('/dashboard') ? 'text-[#10B981] font-semibold' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-1.5 transition ${
                isActive('/transactions') ? 'text-[#10B981] font-semibold' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Transactions
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 transition ${
                    isActive('/profile') ? 'text-[#10B981] font-semibold' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg hover:bg-[#EF4444]/20 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-[#263449] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex-1 py-2 text-xs font-semibold text-center rounded-lg bg-[#111C2E] border border-[#263449] text-[#F8FAFC] hover:border-[#10B981]/50 cursor-pointer transition"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="flex-1 py-2 text-xs font-semibold text-center rounded-lg bg-[#10B981] text-white hover:bg-[#059669] cursor-pointer transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ─── MODAL CARD: SIGN IN / REGISTER WITH CLOSE BUTTON ICON ─── */}
      {authModalMode && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div className="relative w-full max-w-md bg-[#111C2E] border border-[#263449] rounded-2xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-[#F8FAFC]">
            
            {/* Close Button Icon */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A] border border-transparent hover:border-[#263449] transition cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6 pr-8">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                  {authModalMode === 'login' ? 'Sign In' : 'Create Account'}
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8]">
                {authModalMode === 'login'
                  ? 'Enter your credentials to access your SpendWise account.'
                  : 'Register now to track expenses and generate AI financial reports.'}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* ─── SIGN IN CARD FORM ─── */}
            {authModalMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                      required
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm transition shadow-md shadow-[#10B981]/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
                >
                  {authLoading ? <Spinner size="sm" color="white" text="Signing in..." /> : 'Sign In'}
                </button>

                <div className="pt-3 border-t border-[#263449] text-center">
                  <p className="text-xs text-[#94A3B8]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthModalMode('register');
                      }}
                      className="text-[#10B981] hover:text-[#059669] font-semibold transition cursor-pointer"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ─── REGISTER CARD FORM ─── */}
            {authModalMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                      required
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                      required
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm transition shadow-md shadow-[#10B981]/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
                >
                  {authLoading ? <Spinner size="sm" color="white" text="Creating account..." /> : 'Create Account'}
                </button>

                <div className="pt-3 border-t border-[#263449] text-center">
                  <p className="text-xs text-[#94A3B8]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError('');
                        setAuthModalMode('login');
                      }}
                      className="text-[#10B981] hover:text-[#059669] font-semibold transition cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

