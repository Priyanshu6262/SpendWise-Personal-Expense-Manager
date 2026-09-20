import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, User as UserIcon, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/transactions' && location.pathname === '/transactions') return true;
    return false;
  };

  return (
    <header className="w-full bg-[#0F172A] text-[#F8FAFC] border-b border-[#263449] sticky top-0 z-50 backdrop-blur-md">
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

        {/* Right: Clickable Profile Name & Icon with Dropdown Menu */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#263449] hover:border-[#10B981]/50 text-[#F8FAFC] transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 select-none cursor-pointer"
                aria-expanded={userDropdownOpen}
                aria-label="User account menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden sm:inline text-xs font-semibold max-w-[130px] truncate">
                  {user.name || 'User'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180 text-[#10B981]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu with Logout */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#111C2E] border border-[#263449] rounded-xl shadow-2xl py-2 z-50">
                  {/* User info preview */}
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

                  {/* Logout Button */}
                  <div className="px-1.5 pt-1.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/15 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
          {user && (
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#263449]">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-[#F8FAFC]">{user.name || 'User'}</div>
                {user.email && <div className="text-[11px] text-[#94A3B8]">{user.email}</div>}
              </div>
            </div>
          )}
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg hover:bg-[#EF4444]/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
