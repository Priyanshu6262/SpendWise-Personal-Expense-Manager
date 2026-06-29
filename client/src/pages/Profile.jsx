import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, LogOut } from 'lucide-react';
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
    // Send details. If password was typed, update it, otherwise send only name/email
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Profile Settings</h1>
        <p className="text-sm text-textSecondary">Manage your account information and preferences</p>
      </div>

      <div className="stitch-card p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="stitch-input pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="stitch-input pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Optional Password Field */}
          <div className="border-t border-borderLight pt-6">
            <h3 className="text-sm font-semibold text-textPrimary mb-1">Change Password</h3>
            <p className="text-xs text-textSecondary mb-4">Leave these fields blank if you do not want to change your password</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="stitch-input pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="stitch-input pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 flex items-center justify-between border-t border-borderLight">
            <button
              type="button"
              onClick={logout}
              className="stitch-btn-secondary text-expense hover:bg-expense-light hover:text-expense-hover flex items-center gap-2"
              disabled={loading}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              type="submit"
              className="stitch-btn-primary flex items-center gap-1.5"
              disabled={
                loading ||
                !formData.name ||
                !formData.email ||
                (formData.password && formData.password !== formData.confirmPassword)
              }
            >
              {loading ? <Spinner size="sm" color="white" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
