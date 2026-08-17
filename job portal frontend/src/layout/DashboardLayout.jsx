import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, Briefcase, User, PlusCircle,
  Settings, LogOut, Menu, X, ChevronRight, Bell, Search,
  Building2, Shield, Sun, Moon, Palette
} from 'lucide-react';
import { BRAND, LogoMark } from '../brand';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, changeTheme, cycleTheme, tokens } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLight = theme === 'light';
  const isDarkCharcoal = theme === 'dark';
  const isNavyOriginal = theme === 'navy';

  // Build nav items based on role
  const navItems = [
    { key: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
    { key: 'jobs',         label: 'Find Jobs',    icon: Briefcase,       path: '/jobs' },
    { key: 'applications', label: 'Applications', icon: FileText,        path: '/applications' },
    { key: 'profile',      label: 'My Profile',   icon: User,            path: '/profile' },
  ];

  if (user?.role === 'company') {
    navItems.push({ key: 'company-jobs', label: 'My Jobs', icon: Building2, path: '/company/jobs' });
  }

  if (user?.role === 'company' || user?.role === 'admin') {
    navItems.push({ key: 'create-job', label: 'Post a Job', icon: PlusCircle, path: '/create-job' });
  }

  if (user?.role === 'admin') {
    navItems.push({ key: 'admin-panel', label: 'Admin Panel', icon: Shield, path: '/admin' });
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: tokens.bg, color: tokens.text,
      fontFamily: 'Inter, sans-serif', position: 'relative',
      transition: 'background-color 0.25s ease, color 0.25s ease'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .dl-sidebar {
          width: 256px;
          flex-shrink: 0;
          background: ${tokens.sidebarBg};
          border-right: 1px solid ${tokens.border};
          display: flex;
          flex-direction: column;
          padding: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 40;
          transition: transform .25s cubic-bezier(.4,0,.2,1), background-color .25s ease, border-color .25s ease;
        }

        .dl-logo-area {
          padding: 22px 20px 16px;
          border-bottom: 1px solid ${tokens.border};
          flex-shrink: 0;
        }

        .dl-nav-section {
          padding: 14px 12px 0;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .dl-nav-section::-webkit-scrollbar { width: 4px; }
        .dl-nav-section::-webkit-scrollbar-thumb { background: ${tokens.border}; border-radius: 4px; }

        .dl-nav-label {
          font-size: 10px;
          font-weight: 700;
          color: ${tokens.textMuted};
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 8px 10px 6px;
          display: block;
        }

        .dl-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 14px;
          border-radius: 12px;
          color: ${tokens.textMuted};
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all .15s ease;
          margin-bottom: 3px;
          text-decoration: none;
          position: relative;
          font-family: 'Inter', sans-serif;
        }

        .dl-nav-item:hover {
          color: ${tokens.text};
          background: ${tokens.hoverBg};
        }

        .dl-nav-item.active {
          background: ${isLight ? '#FFFFFF' : isDarkCharcoal ? '#F97316' : 'linear-gradient(135deg, #FAF92A, #FDBF2D)'};
          color: ${isLight ? '#111827' : isDarkCharcoal ? '#FFFFFF' : '#06124A'};
          font-weight: 700;
          box-shadow: ${isLight ? '0 2px 8px rgba(0,0,0,0.06)' : isDarkCharcoal ? '0 4px 14px rgba(249,115,22,0.3)' : '0 4px 16px rgba(250,249,42,0.22)'};
          border: ${isLight ? '1px solid #E3E0D8' : 'none'};
        }

        .dl-nav-item.active svg { opacity: 1; color: ${isLight ? '#111827' : isDarkCharcoal ? '#FFFFFF' : '#06124A'}; }
        .dl-nav-item svg { opacity: 0.7; flex-shrink: 0; }

        .dl-nav-item .nav-arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity .15s;
        }
        .dl-nav-item:hover .nav-arrow { opacity: 0.5; }
        .dl-nav-item.active .nav-arrow { opacity: 1; }

        .dl-user-area {
          padding: 14px 14px 18px;
          border-top: 1px solid ${tokens.border};
          flex-shrink: 0;
        }

        .dl-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: ${isLight ? '#FFFFFF' : tokens.hoverBg};
          border: 1px solid ${tokens.border};
          transition: background .15s;
          text-decoration: none;
          color: inherit;
        }
        .dl-user-card:hover { background: ${tokens.hoverBg}; }

        .dl-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: ${isLight ? '#111827' : isDarkCharcoal ? '#F97316' : 'linear-gradient(135deg, #FAF92A, #FDBF2D)'};
          color: ${isLight ? '#FFFFFF' : isDarkCharcoal ? '#FFFFFF' : '#06124A'};
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-family: 'Poppins', sans-serif;
        }

        .dl-logout-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: ${tokens.textMuted};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all .15s;
          width: 100%;
          margin-top: 6px;
          font-family: 'Inter', sans-serif;
        }
        .dl-logout-btn:hover { color: #EF4444; background: rgba(239,68,68,0.08); }

        .dl-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .dl-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          border-bottom: 1px solid ${tokens.border};
          background: ${tokens.topbarBg};
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 30;
          flex-shrink: 0;
          transition: background-color .25s ease, border-color .25s ease;
        }

        .dl-topbar-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: ${tokens.inputBg};
          border: 1px solid ${tokens.border};
          border-radius: 12px;
          padding: 8px 14px;
          transition: border-color .15s;
          box-shadow: ${isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'};
        }
        .dl-topbar-search:focus-within { border-color: ${tokens.accent}; }
        .dl-topbar-search input {
          background: transparent;
          border: none;
          outline: none;
          color: ${tokens.text};
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          width: 180px;
        }
        .dl-topbar-search input::placeholder { color: ${tokens.textMuted}; }

        .dl-topbar-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: ${tokens.inputBg};
          border: 1px solid ${tokens.border};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${tokens.textMuted};
          cursor: pointer;
          transition: all .15s;
          box-shadow: ${isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'};
        }
        .dl-topbar-icon-btn:hover { color: ${tokens.text}; background: ${tokens.hoverBg}; transform: scale(1.05); }

        /* 3-Way Segmented Theme Switcher */
        .dl-theme-segmented {
          display: flex;
          align-items: center;
          background: ${tokens.inputBg};
          border: 1px solid ${tokens.border};
          border-radius: 12px;
          padding: 3px;
          gap: 2px;
        }

        .dl-theme-opt {
          padding: 5px 10px;
          border-radius: 8px;
          border: none;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
          display: flex;
          align-items: center;
          gap: 5px;
          color: ${tokens.textMuted};
          background: transparent;
          font-family: 'Inter', sans-serif;
        }

        .dl-theme-opt:hover { color: ${tokens.text}; }

        .dl-theme-opt.active-navy {
          background: #FAF92A;
          color: #06124A;
          box-shadow: 0 2px 6px rgba(250,249,42,0.25);
        }

        .dl-theme-opt.active-light {
          background: #FFFFFF;
          color: #111827;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          border: 1px solid #E3E0D8;
        }

        .dl-theme-opt.active-dark {
          background: #F97316;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(249,115,22,0.3);
        }

        .dl-content { padding: 28px 32px; flex: 1; overflow-y: auto; }

        .dl-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 39;
        }

        @media (max-width: 960px) {
          .dl-sidebar {
            position: fixed;
            left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .dl-sidebar.open { transform: translateX(0); }
          .dl-mobile-overlay.open { display: block; }
          .dl-topbar { padding: 14px 18px; }
          .dl-content { padding: 20px 18px; }
          .dl-topbar-search { display: none; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className={`dl-mobile-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className={`dl-sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="dl-logo-area">
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark size={36} />
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: tokens.text, lineHeight: 1.1 }}>
                Job<span style={{ color: isNavyOriginal ? '#FAF92A' : isDarkCharcoal ? '#F97316' : '#111827' }}>Portal</span>
              </div>
              <div style={{ fontSize: 10, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 }}>
                {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'company' ? 'Company Hub' : 'Workspace'}
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="dl-nav-section">
          <span className="dl-nav-label">Main Menu</span>

          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`dl-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                <ChevronRight size={13} className="nav-arrow" />
              </Link>
            );
          })}

          {/* Company / Admin extra links */}
          {navItems.length > 4 && (
            <>
              <span className="dl-nav-label" style={{ marginTop: 10 }}>
                {user?.role === 'admin' ? 'Administration' : 'Management'}
              </span>
              {navItems.slice(4).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`dl-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                    <ChevronRight size={13} className="nav-arrow" />
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User area */}
        <div className="dl-user-area">
          <Link to="/profile" className="dl-user-card" onClick={() => setSidebarOpen(false)}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="dl-avatar" style={{ objectCover: 'cover', borderRadius: 10 }} />
            ) : (
              <div className="dl-avatar">{getInitials(user?.name)}</div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: tokens.textMuted, textTransform: 'capitalize', marginTop: 1 }}>
                {user?.role || 'Guest'}
              </div>
            </div>
            <ChevronRight size={14} color={tokens.textMuted} />
          </Link>

          <button className="dl-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="dl-main">

        {/* Topbar */}
        <header className="dl-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', background: 'none', border: 'none', color: tokens.text, cursor: 'pointer', padding: 4 }}
              className="dl-menu-btn"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Breadcrumb / page title */}
            <div>
              <div style={{ fontSize: 11, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                Dashboard › {navItems.find(n => n.path === location.pathname)?.label || 'Overview'}
              </div>
              <h1 style={{
                margin: 0, fontSize: 18, fontWeight: 800, color: tokens.text,
                fontFamily: 'Poppins, sans-serif'
              }}>
                Welcome back, {user?.name || 'User'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div className="dl-topbar-search">
              <Search size={14} color={tokens.textMuted} />
              <input placeholder="Search..." />
            </div>

            {/* 3-WAY THEME SEGMENTED SWITCHER (Logged-in Users) */}
            <div className="dl-theme-segmented">
              <button
                onClick={() => changeTheme('navy')}
                className={`dl-theme-opt ${isNavyOriginal ? 'active-navy' : ''}`}
                title="Original Navy & Yellow Theme"
              >
                <Palette size={13} />
                <span>Navy</span>
              </button>

              <button
                onClick={() => changeTheme('light')}
                className={`dl-theme-opt ${isLight ? 'active-light' : ''}`}
                title="SaaS Light White Theme"
              >
                <Sun size={13} />
                <span>White</span>
              </button>

              <button
                onClick={() => changeTheme('dark')}
                className={`dl-theme-opt ${isDarkCharcoal ? 'active-dark' : ''}`}
                title="SaaS Dark Charcoal Theme"
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>
            </div>

            {/* Notification bell */}
            <div className="dl-topbar-icon-btn" title="Notifications">
              <Bell size={16} />
            </div>

            {/* Avatar */}
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="dl-avatar" style={{ objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <div className="dl-avatar" style={{ borderRadius: 10 }}>{getInitials(user?.name)}</div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="dl-content">
          {children}
        </main>
      </div>

      {/* Inline style fix for mobile menu btn visibility */}
      <style>{`
        @media (max-width: 960px) {
          .dl-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}