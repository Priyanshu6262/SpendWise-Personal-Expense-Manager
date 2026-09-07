import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, LogOut, Shield } from 'lucide-react';
import Spinner from '../components/Spinner';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  // Sync profile form with authenticated user details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    const pass = formData.password ? formData.password : undefined;

    await updateProfile(formData.name, formData.email, pass);
    setLoading(false);

    // Clear passwords
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal account details and security preferences
        </p>
      </div>

      {/* User Header Summary Card */}
      <div className="app-card p-5 sm:p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-sm">
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 truncate">
            {user?.name || 'User'}
          </h2>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Shield className="w-3 h-3" /> Active Account
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="app-card p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Account Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Personal Information
            </h3>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="app-input pl-9"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="app-input pl-9"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Section: Change Password */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leave password fields blank if you do not wish to update your password.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
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
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="app-input pl-9"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-5 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="app-btn-secondary text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs"
              disabled={loading}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>
            <button
              type="submit"
              className="app-btn-primary text-xs"
              disabled={
                loading ||
                !formData.name ||
                !formData.email ||
                (formData.password && formData.password !== formData.confirmPassword)
              }
            >
              {loading ? <Spinner size="sm" color="white" text="Saving..." /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
