import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LayoutDashboard, ReceiptText, Sparkles, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Spending Insights', path: '/insights', icon: Sparkles },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              SpendWise
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-500'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Profile / Logout Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  title="View Profile"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </span>
                  <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="app-btn-primary text-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {user && (
          <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-md text-xs font-medium focus:outline-none ${
                    active
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
