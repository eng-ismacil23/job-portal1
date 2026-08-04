// navbar
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Briefcase, PlusCircle, LayoutDashboard, FileText } from 'lucide-react';
import { BRAND, LogoMark } from '../brand';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Listen for scroll to add shadow effect
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
            className={`text-sm font-medium transition-colors ${
              isActive('/home') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className={`text-sm font-medium transition-colors ${
              isActive('/jobs') ? 'text-[#FAF92A] font-semibold' : 'text-[#AEB8D0] hover:text-white'
            }`}
          >
            Find Jobs
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
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-[#10205F] border border-[#10205F] hover:border-[#FAF92A]/40 px-3 py-1.5 rounded-full text-white text-sm font-medium transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#FAF92A] text-[#06124A] flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-[#AEB8D0] hover:text-[#EF4444] hover:bg-[#10205F] transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
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