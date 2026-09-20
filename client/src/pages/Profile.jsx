import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, LogOut, Shield, CheckCircle2 } from 'lucide-react';
import Spinner from '../components/Spinner';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync profile form with authenticated user details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    setSuccessMsg('');
    const pass = formData.password ? formData.password : undefined;

    // Email is not editable — pass the existing user email unchanged
    const res = await updateProfile(formData.name, user?.email, pass);
    setLoading(false);

    if (res !== false) {
      setSuccessMsg('Profile updated successfully!');
    }

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
      <div className="pb-3 border-b border-[#263449]">
        <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Profile Settings</h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Manage your personal account details and security credentials
        </p>
      </div>

      {/* User Summary Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111C2E] border border-[#263449] flex items-center gap-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xl font-bold uppercase shadow-md shadow-[#10B981]/20">
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#F8FAFC] truncate">
            {user?.name || 'User'}
          </h2>
          <p className="text-xs text-[#94A3B8] truncate">{user?.email}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <Shield className="w-3 h-3" /> Verified Account
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#111C2E] border border-[#263449] shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] pb-2 border-b border-[#263449]">
              Personal Information
            </h3>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Full Name <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 pl-9 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field — Read Only */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#64748B] font-normal normal-case">(cannot be changed)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-3.5 py-2.5 pl-9 bg-[#0B1220] border border-[#263449]/60 rounded-lg text-sm text-[#64748B] cursor-not-allowed select-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#64748B]">Email is fixed and cannot be updated for security reasons.</p>
            </div>
          </div>

          {/* Security & Password */}
          <div className="space-y-4 pt-4 border-t border-[#263449]">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Security &amp; Password</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Leave password fields blank if you do not wish to update your password.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pl-9 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pl-9 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-5 flex items-center justify-between border-t border-[#263449]">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 text-xs font-semibold flex items-center transition"
              disabled={loading}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-md shadow-[#10B981]/20 transition disabled:opacity-50 disabled:pointer-events-none"
              disabled={
                loading ||
                !formData.name ||
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
