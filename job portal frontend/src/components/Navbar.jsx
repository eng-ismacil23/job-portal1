import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { LogoMark } from '../brand';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Dynamic favicon & page title based on current route
  useEffect(() => {
    const routeTitles = {
      '/home': 'JobPortal — Connect. Apply. Grow.',
      '/jobs': 'Find Jobs — JobPortal',
      '/login': 'Log In — JobPortal',
      '/register': 'Sign Up — JobPortal',
    };
    const title = routeTitles[location.pathname] || 'JobPortal — Connect. Apply. Grow.';
    document.title = title;

    // Ensure favicon is always set to our SVG
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = '/favicon.svg';
  }, [location.pathname]);

  // Listen for scroll to add shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Spacer to prevent content from hiding under fixed header */}
      <div style={{ height: '65px' }} />
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[#08153D]/95 backdrop-blur-lg border-b border-[#10205F] px-4 md:px-8 py-3 transition-all duration-300 ${
          scrolled ? 'shadow-2xl shadow-black/30 border-[#FAF92A]/10' : ''
        }`}
      >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/home" className="flex items-center gap-3 group">
          <LogoMark size={40} />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-wide group-hover:text-[#FAF92A] transition-colors">
              Job<span className="text-[#FAF92A]">Portal</span>
            </span>
            <span className="text-[10px] font-medium text-[#AEB8D0] -mt-1 tracking-wider uppercase">
              Connect. Apply. Grow.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/home"
            className={`relative text-sm font-medium transition-colors pb-1 ${
              isActive('/home') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
            }`}
          >
            Home
            {isActive('/home') && (
              <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-[#FAF92A] rounded-full" />
            )}
          </Link>
          <Link
            to="/jobs"
            className={`relative text-sm font-medium transition-colors pb-1 ${
              isActive('/jobs') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
            }`}
          >
            Find Jobs
            {isActive('/jobs') && (
              <span className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-[#FAF92A] rounded-full" />
            )}
          </Link>
          {user && (
            <>
              <Link
                to="/applications"
                className={`text-sm font-medium transition-colors ${
                  isActive('/applications') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
                }`}
              >
                Applications
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              {user.role === 'company' && (
                <Link
                  to="/create-job"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/create-job') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
                  }`}
                >
                  <PlusCircle size={15} />
                  Post Job
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 bg-[#10205F] border border-[#10205F] hover:border-[#FAF92A]/40 px-3 py-1.5 rounded-full text-white text-sm font-medium transition-all"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-[#FAF92A]/40" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#FAF92A] text-[#06124A] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span>{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#10205F] border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden animate-fadeIn">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#AEB8D0] hover:text-white hover:bg-[#08153D] transition-colors"
                  >
                    <User size={15} /> Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#AEB8D0] hover:text-white hover:bg-[#08153D] transition-colors"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#08153D] transition-colors"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-white hover:text-[#FAF92A] text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold text-sm px-5 py-2 rounded-xl shadow-lg hover:shadow-[#FAF92A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="md:hidden text-[#FAF92A] p-2 focus:outline-none"
        >
          {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileNavOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#10205F] flex flex-col gap-3 pb-2 animate-fadeIn">
          <Link
            to="/home"
            onClick={() => setMobileNavOpen(false)}
            className="text-sm text-white px-3 py-2 rounded-lg hover:bg-[#10205F]"
          >
            Home
          </Link>
          <Link
            to="/jobs"
            onClick={() => setMobileNavOpen(false)}
            className="text-sm text-white px-3 py-2 rounded-lg hover:bg-[#10205F]"
          >
            Find Jobs
          </Link>
          {user ? (
            <>
              <Link
                to="/applications"
                onClick={() => setMobileNavOpen(false)}
                className="text-sm text-white px-3 py-2 rounded-lg hover:bg-[#10205F]"
              >
                Applications
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="text-sm text-white px-3 py-2 rounded-lg hover:bg-[#10205F]"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileNavOpen(false)}
                className="text-sm text-white px-3 py-2 rounded-lg hover:bg-[#10205F]"
              >
                Profile ({user.name})
              </Link>
              {user.role === 'company' && (
                <Link
                  to="/create-job"
                  onClick={() => setMobileNavOpen(false)}
                  className="text-sm text-[#FAF92A] px-3 py-2 rounded-lg hover:bg-[#10205F] font-semibold"
                >
                  + Post a Job
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  handleLogout();
                }}
                className="text-left text-sm text-[#EF4444] px-3 py-2 rounded-lg hover:bg-[#10205F]"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#10205F]">
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="text-center text-sm font-medium text-white bg-[#10205F] py-2 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileNavOpen(false)}
                className="text-center text-sm font-bold text-[#06124A] bg-[#FAF92A] py-2 rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
    </>
  );
}