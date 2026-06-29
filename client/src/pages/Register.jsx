import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const success = await register(name, email, password);
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

      {/* Register Card */}
      <div className="w-full max-w-md bg-white border border-borderLight rounded-2xl shadow-stitch-lg p-8 animate-slide-in">
        <h2 className="text-xl font-bold text-textPrimary text-center mb-1">
          Create an account
        </h2>
        <p className="text-sm text-textSecondary text-center mb-8">
          Get started with managing your expenses today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="stitch-input"
              required
              disabled={loading}
            />
          </div>

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
              placeholder="john@example.com"
              className="stitch-input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
              Password
            </label>
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

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="stitch-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full stitch-btn-primary py-3 flex items-center justify-center gap-2 mt-2"
            disabled={
              loading ||
              !formData.name ||
              !formData.email ||
              !formData.password ||
              !formData.confirmPassword
            }
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Register'}
          </button>
        </form>

        <div className="border-t border-borderLight mt-6 pt-5 text-center text-sm">
          <span className="text-textSecondary">Already have an account? </span>
          <Link
            to="/login"
            className="text-secondary font-medium hover:underline transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
