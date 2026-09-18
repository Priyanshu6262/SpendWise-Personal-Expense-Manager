import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, AlertCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.email || !formData.password) return;

    setLoading(true);
    const success = await login(formData.email, formData.password);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-[100px] py-12 bg-white text-[#0F172A]">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold shadow-sm">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          SpendWise
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-card shadow-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to manage your budget and track expenses
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="app-input pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="app-input pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full app-btn-primary py-2.5 mt-2"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? <Spinner size="sm" color="white" text="Signing in..." /> : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-slate-100 mt-6 pt-5 text-center text-xs sm:text-sm text-slate-500">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="text-emerald-700 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
