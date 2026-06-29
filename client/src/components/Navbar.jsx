import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LayoutDashboard, ReceiptText, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-borderLight shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-textPrimary tracking-tight">
              SpendWise
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-textSecondary hover:bg-bgSecondary hover:text-textPrimary'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/transactions')
                    ? 'bg-primary/10 text-primary'
                    : 'text-textSecondary hover:bg-bgSecondary hover:text-textPrimary'
                }`}
              >
                <ReceiptText className="w-4 h-4" />
                Transactions
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/profile')
                    ? 'bg-primary/10 text-primary'
                    : 'text-textSecondary hover:bg-bgSecondary hover:text-textPrimary'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </Link>
            </nav>
          )}

          {/* User Profile / Logout */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-sm font-medium text-textPrimary bg-bgSecondary px-3.5 py-1.5 rounded-full border border-borderLight">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-xl border border-borderLight text-textSecondary hover:text-expense hover:bg-expense-light transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-textPrimary hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="stitch-btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {user && (
          <div className="md:hidden flex justify-around border-t border-borderLight/50 py-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive('/') ? 'text-primary' : 'text-textSecondary'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/transactions"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive('/transactions') ? 'text-primary' : 'text-textSecondary'
              }`}
            >
              <ReceiptText className="w-5 h-5" />
              <span>Transactions</span>
            </Link>
            <Link
              to="/profile"
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive('/profile') ? 'text-primary' : 'text-textSecondary'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
