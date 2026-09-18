import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
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
    <header className="w-full bg-[#0F172A] text-[#F8FAFC] border-b border-[#263449] sticky top-0 z-50">
      <div className="w-full px-[100px] h-16 flex items-center justify-between">
        
        {/* Left: Brand Name */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#10B981] text-white font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-[#F8FAFC] tracking-tight">
              SpendWise
            </span>
          </Link>
        </div>

        {/* Middle: About, Dashboard, Transaction */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#about"
            className="text-[#94A3B8] hover:text-[#F8FAFC] transition duration-150"
          >
            About
          </a>

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
            Transaction
          </Link>
        </nav>

        {/* Right: Only Profile Icon */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className={`p-2 rounded-lg border border-[#263449] hover:bg-[#111C2E] text-[#94A3B8] hover:text-[#F8FAFC] transition ${
              isActive('/profile') ? 'border-[#10B981] text-[#F8FAFC]' : ''
            }`}
            title="Profile"
          >
            {user && user.name ? (
              <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111C2E]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-[100px] py-3 bg-[#0F172A] border-t border-[#263449] space-y-2 text-sm text-center">
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            About
          </a>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            Dashboard
          </Link>
          <Link
            to="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            Transaction
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            Profile
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
