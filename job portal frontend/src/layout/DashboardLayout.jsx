import React, { useState } from 'react';
import {
  DashboardOutlined,
  FileTextOutlined,
  BankOutlined,
  BellOutlined,
  MenuOutlined,
  SearchOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Briefcase } from 'lucide-react';
import { BRAND, LogoMark } from '../brand';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined, path: '/dashboard' },
    { key: 'jobs', label: 'Find Jobs', icon: Briefcase, path: '/jobs' },
    { key: 'applications', label: 'Applications', icon: FileTextOutlined, path: '/applications' },
    { key: 'profile', label: 'My Profile', icon: UserOutlined, path: '/profile' },
  ];

  if (user?.role === 'company') {
    navItems.push({ key: 'create-job', label: 'Post a Job', icon: PlusCircleOutlined, path: '/create-job' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="jp-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

        .jp-heading { font-family: 'Poppins', sans-serif; }
        .jp-body { font-family: 'Inter', sans-serif; }
        * { box-sizing: border-box; }

        .jp-dashboard {
          min-height: 100vh;
          background: linear-gradient(160deg, #06124A 0%, #08153D 45%, #000B29 100%);
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          display: flex;
          position: relative;
        }

        .jp-glow {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
        }

        .jp-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: rgba(6, 18, 74, 0.85);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(250, 249, 42, 0.12);
          display: flex;
          flex-direction: column;
          padding: 22px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 20;
          transition: transform .25s ease;
        }

        .jp-[#06124A] { color: ${BRAND.dark}; }

        .jp-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          color: #AEB8D0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all .15s ease;
          margin-bottom: 6px;
          text-decoration: none;
        }

        .jp-nav-item:hover {
          color: #FFFFFF;
          background: rgba(250, 249, 42, 0.06);
        }

        .jp-nav-item.active {
          background: linear-gradient(90deg, #FAF92A, #FDBF2D);
          color: #06124A;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(250, 249, 42, 0.25);
        }

        .jp-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        .jp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 36px;
          border-bottom: 1px solid rgba(250, 249, 42, 0.1);
        }

        .jp-body-wrap {
          padding: 28px 36px;
          flex: 1;
        }

        @media (max-width: 900px) {
          .jp-sidebar {
            position: fixed;
            left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
          }
          .jp-sidebar.open {
            transform: translateX(0);
          }
          .jp-topbar, .jp-body-wrap {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>

      {/* Ambient Glows */}
      <div className="jp-glow" style={{ width: 400, height: 400, background: BRAND.primary, filter: 'blur(160px)', opacity: 0.1, top: -120, left: -100 }} />
      <div className="jp-glow" style={{ width: 350, height: 350, background: BRAND.secondary, filter: 'blur(160px)', opacity: 0.08, bottom: -80, right: -80 }} />

      {/* Sidebar */}
      <aside className={`jp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/home" className="flex items-center gap-3 mb-8 px-2 text-decoration-none">
          <LogoMark size={38} />
          <div className="flex flex-col">
            <span className="jp-heading font-extrabold text-white text-lg leading-tight">
              Job<span style={{ color: BRAND.primary }}>Portal</span>
            </span>
            <span className="text-[10px] text-[#AEB8D0] uppercase tracking-wider">
              Workspace
            </span>
          </div>
        </Link>

        <nav className="flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`jp-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon style={{ fontSize: 18 }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-2 text-decoration-none text-white overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#FAF92A] text-[#06124A] font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[#AEB8D0] capitalize truncate">{user?.role || 'Guest'}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="text-[#AEB8D0] hover:text-[#EF4444] p-1.5 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogoutOutlined style={{ fontSize: 16 }} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="jp-main-content">
        {/* Topbar */}
        <header className="jp-topbar">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white p-2"
            >
              <MenuOutlined style={{ fontSize: 20 }} />
            </button>
            <div>
              <h1 className="jp-heading font-extrabold text-xl md:text-2xl text-white">
                Welcome back, {user?.name || 'Friend'} 👋
              </h1>
              <p className="jp-body text-xs text-[#AEB8D0] mt-0.5">
                Here's what's happening with your job portal workspace today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-[#FAF92A] text-[#06124A] font-bold flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Link>
          </div>
        </header>

        {/* Dashboard Page Children */}
        <main className="jp-body-wrap">
          {children}
        </main>
      </div>
    </div>
  );
}