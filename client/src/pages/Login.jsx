import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';
import Spinner from '../components/Spinner';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    const success = await login(formData.email, formData.password);
    setLoading(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-bgSecondary">
      {/* Brand logo header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="p-2.5 bg-primary/10 rounded-2xl">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <span className="text-2xl font-bold text-textPrimary tracking-tight">
          SpendWise
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-borderLight rounded-2xl shadow-stitch-lg p-8 animate-slide-in">
        <h2 className="text-xl font-bold text-textPrimary text-center mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-textSecondary text-center mb-8">
          Sign in to manage your budget and track expenses
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="stitch-input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="stitch-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full stitch-btn-primary py-3 flex items-center justify-center gap-2"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-borderLight mt-6 pt-5 text-center text-sm">
          <span className="text-textSecondary">New to SpendWise? </span>
          <Link
            to="/register"
            className="text-secondary font-medium hover:underline transition-all"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
