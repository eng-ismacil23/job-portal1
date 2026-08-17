import React, { useState, useEffect } from 'react';
import {
  Users, Trash2, RotateCcw, Edit3, PlusCircle, Search, Calendar,
  Briefcase, FileText, CheckCircle, XCircle, Shield, AlertCircle, RefreshCw, Eye,
  Laptop, Globe, Activity, Lock, UserX, Ban, TrendingUp, Sparkles, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import api from '../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';

// Custom Tooltip for Admin Graph
const SparkChartTooltip = ({ active, payload, label, tokens }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: tokens.card,
      border: `1px solid ${tokens.border}`,
      borderRadius: 12, padding: '12px 16px', fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      color: tokens.text,
      minWidth: 150
    }}>
      <div style={{ color: tokens.textMuted, marginBottom: 8, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
            <span style={{ color: tokens.textMuted, fontSize: 12 }}>{p.name}:</span>
          </div>
          <span style={{ color: p.color, fontWeight: 800, fontSize: 13 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { theme, tokens } = useTheme();
  const isLight = theme === 'light';
  const isDarkCharcoal = theme === 'dark';

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'recycle' | 'jobs' | 'applications' | 'sessions'
  const [adminTrendRange, setAdminTrendRange] = useState('1y');
  const [adminStatsData, setAdminStatsData] = useState([]);
  const [adminStatsTotals, setAdminStatsTotals] = useState({ users: 0, jobs: 0, applications: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  // ── States for Users Management ──
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Modals for User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'student', skills: '' });
  const [editUserModal, setEditUserModal] = useState(null);

  // ── States for Recycle Bin ──
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recycleSearch, setRecycleSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ── States for Jobs Management ──
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [editJobModal, setEditJobModal] = useState(null);

  // ── States for Applications Management ──
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [viewAppModal, setViewAppModal] = useState(null);

  // ── States for Security & Live Sessions ──
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('all');

  // General Notification
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Custom Confirm Dialog State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Haa, waa hagaag',
    confirmColor: 'bg-[#EF4444] text-white',
    onConfirm: null,
  });

  useEffect(() => {
    fetchUsers();
    fetchDeletedUsers();
    fetchJobs();
    fetchApplications();
    fetchSessions();
    fetchAdminStats('1y');
  }, []);

  const showToast = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const askConfirm = ({ title, message, confirmLabel, confirmColor, onConfirm }) => {
    setConfirmModal({
      open: true,
      title,
      message,
      confirmLabel: confirmLabel || 'Haa, waa hagaag',
      confirmColor: confirmColor || 'bg-[#EF4444] text-white',
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, open: false, onConfirm: null }));
  };

  // ══════════════════════════════════════════════════════════════
  // API CALLS
  // ══════════════════════════════════════════════════════════════
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/users?limit=200');
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const skillsArr = newUserForm.skills ? newUserForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      await api.post('/users/admin-create', {
        ...newUserForm,
        skills: skillsArr
      });
      showToast('success', 'User created successfully!');
      setShowAddUserModal(false);
      setNewUserForm({ name: '', email: '', password: '', role: 'student', skills: '' });
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      const skillsArr = typeof editUserModal.skills === 'string'
        ? editUserModal.skills.split(',').map(s => s.trim()).filter(Boolean)
        : editUserModal.skills;

      const payload = {
        name: editUserModal.name,
        email: editUserModal.email,
        role: editUserModal.role,
        skills: skillsArr
      };
      if (editUserModal.password) {
        payload.password = editUserModal.password;
      }

      await api.put(`/users/${editUserModal._id}`, payload);
      showToast('success', 'User updated successfully!');
      setEditUserModal(null);
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleSoftDeleteUser = (id, name) => {
    askConfirm({
      title: 'Tirida ku meel gaarka ah (Soft Delete)?',
      message: `User-ka "${name}" waxaa loo wareejin doonaa Recycle Bin. Dib waa loo soo celin karaa.`,
      confirmLabel: '🗑 Haa, Soft Delete',
      confirmColor: 'bg-[#EF4444] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.delete(`/users/${id}`);
          showToast('success', `User ${name} moved to Recycle Bin.`);
          fetchUsers();
          fetchDeletedUsers();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to delete user.');
        }
      }
    });
  };

  const fetchDeletedUsers = async () => {
    setRecycleLoading(true);
    try {
      let url = '/users/deleted';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setDeletedUsers(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching recycle bin:', err);
    } finally {
      setRecycleLoading(false);
    }
  };

  const handleRestoreUser = (id, name) => {
    askConfirm({
      title: 'Soo celinta User-ka?',
      message: `User-ka "${name}" dib ayaa loogu soo celinayaa akoonada shaqaynaya (Active Users).`,
      confirmLabel: '🔄 Haa, Soo celi (Restore)',
      confirmColor: 'bg-[#22C55E] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.put(`/users/${id}/restore`);
          showToast('success', `User ${name} restored successfully!`);
          fetchDeletedUsers();
          fetchUsers();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to restore user.');
        }
      }
    });
  };

  const handlePermanentDelete = (id, name) => {
    askConfirm({
      title: '⚠️ Tirida Joogtada Ah (Permanent Delete)?',
      message: `User-ka "${name}" waxaa si joogto ah looga tirayaa database-ka. Tani Ma Soo Noqon Kartaa!`,
      confirmLabel: '🔥 Haa, SI JOOGTO AH U TIR',
      confirmColor: 'bg-[#DC2626] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.delete(`/users/${id}/permanent`);
          showToast('success', `User ${name} permanently deleted.`);
          fetchDeletedUsers();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to permanently delete user.');
        }
      }
    });
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editJobModal) return;
    try {
      await api.put(`/jobs/${editJobModal._id}`, {
        title: editJobModal.title,
        company: editJobModal.company,
        description: editJobModal.description,
        deadline: editJobModal.deadline,
        positionsCount: Number(editJobModal.positionsCount) || 1,
        maxApplicants: Number(editJobModal.maxApplicants) || 10,
        status: editJobModal.status || 'active'
      });
      showToast('success', 'Job updated successfully!');
      setEditJobModal(null);
      fetchJobs();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update job.');
    }
  };

  const handleDeleteJob = (id, title) => {
    askConfirm({
      title: 'Tirida Shaqadan (Delete Job)?',
      message: `Shaqada "${title}" waxaa si joogto ah looga tirayaa system-ka.`,
      confirmLabel: '🗑 Haa, Tir (Delete)',
      confirmColor: 'bg-[#EF4444] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.delete(`/jobs/${id}`);
          showToast('success', 'Job deleted successfully.');
          fetchJobs();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to delete job.');
        }
      }
    });
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await api.get('/applications');
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUpdateAppStatus = async (id, status) => {
    try {
      await api.put(`/applications/${id}`, { status });
      showToast('success', `Application status changed to ${status}.`);
      if (viewAppModal && viewAppModal._id === id) {
        setViewAppModal(prev => prev ? { ...prev, status } : null);
      }
      fetchApplications();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update application.');
    }
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get('/users/sessions/all');
      setSessions(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchAdminStats = async (range) => {
    setStatsLoading(true);
    try {
      const res = await api.get(`/users/admin-stats?range=${range}`);
      setAdminStatsData(res.data?.data || []);
      setAdminStatsTotals(res.data?.totals || { users: 0, jobs: 0, applications: 0 });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRevokeSession = (id, userName) => {
    askConfirm({
      title: 'Session-ka Ka Jooji (Force Log Out)?',
      message: `User-ka "${userName}" waxaa si khasab ah looga saarayaa system-ka (Logout).`,
      confirmLabel: '🚫 Haa, Ka saar (Revoke Session)',
      confirmColor: 'bg-[#EF4444] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.put(`/users/sessions/${id}/revoke`);
          showToast('success', `Session for ${userName} has been revoked.`);
          fetchSessions();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to revoke session.');
        }
      }
    });
  };

  const handleClearRevoked = () => {
    askConfirm({
      title: 'Nadiifi Reeban Sessions-ka (Clear Revoked)?',
      message: 'Dhamaan sessions-ka la joojiyey (revoked) waxaa laga tirayaa system-ka si joogto ah.',
      confirmLabel: '🗑 Haa, Nadiifi (Clear All Revoked)',
      confirmColor: 'bg-[#EF4444] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.delete('/users/sessions/clear-revoked');
          showToast('success', 'All revoked sessions cleared successfully.');
          fetchSessions();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to clear revoked sessions.');
        }
      }
    });
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredSessions = sessions.filter(s => {
    const matchSearch = !sessionSearch ||
      s.userName?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.userEmail?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.ipAddress?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.device?.toLowerCase().includes(sessionSearch.toLowerCase());
    const matchStatus = sessionStatusFilter === 'all' || s.status === sessionStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredJobs = jobs.filter(j => {
    return !jobSearch || j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.company?.toLowerCase().includes(jobSearch.toLowerCase());
  });

  const filteredApps = applications.filter(a => {
    const matchSearch = !appSearch ||
      a.jobId?.title?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.studentId?.name?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.studentId?.email?.toLowerCase().includes(appSearch.toLowerCase());
    const matchStatus = appStatusFilter === 'all' || a.status?.toLowerCase() === appStatusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const handleRangeChange = (v) => {
    setAdminTrendRange(v);
    fetchAdminStats(v);
  };

  const inputStyle = {
    background: tokens.inputBg,
    borderColor: tokens.border,
    color: tokens.text,
  };

  const barColor1 = isDarkCharcoal ? '#F97316' : isLight ? '#111827' : '#FAF92A';
  const barColor2 = isDarkCharcoal ? '#3B82F6' : isLight ? '#3B82F6' : '#3B82F6';
  const barColor3 = isDarkCharcoal ? '#22C55E' : isLight ? '#16A34A' : '#22C55E';

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl transition-all duration-300"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
              : isDarkCharcoal
              ? 'linear-gradient(135deg, #242427 0%, #1C1C1E 100%)'
              : 'linear-gradient(135deg, #10205F 0%, #06124A 100%)',
            borderColor: tokens.border
          }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tokens.brandTagText }}>
              <Shield size={16} /> Super Admin Dashboard
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: isLight ? '#1E1B4B' : tokens.text }}>System Control Panel</h1>
            <p className="text-xs mt-1" style={{ color: isLight ? '#4338CA' : tokens.textMuted }}>
              Manage Users, Soft Delete Recycle Bin, Job Listings, and Candidate Applications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              style={{ background: tokens.accent, color: tokens.accentDark }}
            >
              <PlusCircle size={16} /> Add New User
            </button>
          </div>
        </div>

        {/* Admin KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded-2xl p-5 shadow-sm" style={{ background: tokens.card, borderColor: tokens.border }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
                <Users size={20} />
              </div>
              <span className="text-xs font-bold text-[#3B82F6]">Active Platform</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: tokens.text }}>{users.length}</div>
            <div className="text-xs mt-1" style={{ color: tokens.textMuted }}>Total System Users</div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm" style={{ background: tokens.card, borderColor: tokens.border }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <span className="text-xs font-bold text-[#16A34A]">Live Posts</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: tokens.text }}>{jobs.length}</div>
            <div className="text-xs mt-1" style={{ color: tokens.textMuted }}>Active Job Openings</div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm" style={{ background: tokens.card, borderColor: tokens.border }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
                <FileText size={20} />
              </div>
              <span className="text-xs font-bold text-[#8B5CF6]">Submissions</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: tokens.text }}>{applications.length}</div>
            <div className="text-xs mt-1" style={{ color: tokens.textMuted }}>Candidate Applications</div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm" style={{ background: tokens.card, borderColor: tokens.border }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 text-[#DC2626] flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <span className="text-xs font-bold text-[#DC2626]">Recycle Bin</span>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: tokens.text }}>{deletedUsers.length}</div>
            <div className="text-xs mt-1" style={{ color: tokens.textMuted }}>Soft Deleted Users</div>
          </div>
        </div>

        {/* SPARK PIXEL REFERENCE TREND GRAPH FOR ADMIN PANEL */}
        <div className="border rounded-3xl p-6 shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
                <Sparkles size={14} style={{ color: tokens.accent }} /> SYSTEM OVERVIEW & ANALYTICS TREND
              </div>
              <h3 className="text-xl font-extrabold mt-1" style={{ color: tokens.text }}>
                Real-Time Growth & Submissions Activity
              </h3>
              {/* Period totals row */}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${barColor1}20`, color: barColor1 }}>
                  +{adminStatsTotals.users} Users
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${barColor2}20`, color: barColor2 }}>
                  +{adminStatsTotals.jobs} Jobs
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${barColor3}20`, color: barColor3 }}>
                  +{adminStatsTotals.applications} Applications
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: tokens.textMuted }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: barColor1 }} /> Users</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: barColor2 }} /> Jobs</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: barColor3 }} /> Applications</span>
              </div>

              <div className="flex border rounded-xl p-1 gap-1" style={{ background: tokens.inputBg, borderColor: tokens.border }}>
                {[['7d','7 Days'], ['30d','30 Days'], ['1y','12 Months']].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => handleRangeChange(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      adminTrendRange === v ? 'shadow-sm' : ''
                    }`}
                    style={{
                      background: adminTrendRange === v ? tokens.accent : 'transparent',
                      color: adminTrendRange === v ? tokens.accentDark : tokens.textMuted
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {statsLoading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 12, background: `${tokens.card}cc`
              }}>
                <div style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 700 }}>Loading data...</div>
              </div>
            )}
            {!statsLoading && adminStatsData.length === 0 ? (
              <div style={{
                height: 240, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <Activity size={32} style={{ color: tokens.textMuted, opacity: 0.4 }} />
                <div style={{ color: tokens.textMuted, fontSize: 13 }}>Xog la helin — koobiyaha wali la'yihiin</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={adminStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={tokens.chartGrid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: tokens.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tokens.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<SparkChartTooltip tokens={tokens} />} cursor={{ fill: tokens.hoverBg }} />
                  <Bar dataKey="users" name="Users" fill={barColor1} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="jobs" name="Jobs" fill={barColor2} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="applications" name="Applications" fill={barColor3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Toast Feedback */}
        {feedback.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold ${
            feedback.type === 'success' ? 'bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#16A34A]' : 'bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#DC2626]'
          }`}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto" style={{ borderColor: tokens.border }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
              activeTab === 'users' ? 'shadow-lg' : ''
            }`}
            style={{
              background: activeTab === 'users' ? tokens.accent : tokens.card,
              color: activeTab === 'users' ? tokens.accentDark : tokens.textMuted,
              borderColor: activeTab === 'users' ? 'transparent' : tokens.border
            }}
          >
            <Users size={16} /> Users Management ({users.length})
          </button>

          <button
            onClick={() => { setActiveTab('recycle'); fetchDeletedUsers(); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
              activeTab === 'recycle' ? 'bg-[#EF4444] text-white shadow-lg border-transparent' : ''
            }`}
            style={activeTab !== 'recycle' ? { background: tokens.card, color: tokens.textMuted, borderColor: tokens.border } : {}}
          >
            <Trash2 size={16} /> Recycle Bin ({deletedUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
              activeTab === 'jobs' ? 'shadow-lg' : ''
            }`}
            style={{
              background: activeTab === 'jobs' ? tokens.accent : tokens.card,
              color: activeTab === 'jobs' ? tokens.accentDark : tokens.textMuted,
              borderColor: activeTab === 'jobs' ? 'transparent' : tokens.border
            }}
          >
            <Briefcase size={16} /> Jobs Management ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
              activeTab === 'applications' ? 'shadow-lg' : ''
            }`}
            style={{
              background: activeTab === 'applications' ? tokens.accent : tokens.card,
              color: activeTab === 'applications' ? tokens.accentDark : tokens.textMuted,
              borderColor: activeTab === 'applications' ? 'transparent' : tokens.border
            }}
          >
            <FileText size={16} /> Applications Management ({applications.length})
          </button>

          <button
            onClick={() => { setActiveTab('sessions'); fetchSessions(); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
              activeTab === 'sessions' ? 'bg-[#3B82F6] text-white shadow-lg border-transparent' : ''
            }`}
            style={activeTab !== 'sessions' ? { background: tokens.card, color: tokens.textMuted, borderColor: tokens.border } : {}}
          >
            <Shield size={16} /> Security & Live Sessions ({sessions.length})
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: USERS MANAGEMENT */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs" style={{ color: tokens.textMuted }}>Filter Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="border text-xs rounded-xl p-2 outline-none"
                  style={inputStyle}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ color: tokens.text }}>
                  <thead className="uppercase text-[10px] tracking-wider border-b" style={{ background: tokens.inputBg, color: tokens.textMuted, borderColor: tokens.border }}>
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Skills</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: tokens.border }}>
                    {usersLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>Loading users...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>No users found.</td></tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-sm" style={{ color: tokens.text }}>{u.name}</div>
                            <div className="text-xs" style={{ color: tokens.textMuted }}>{u.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              u.role === 'admin' ? 'bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30' :
                              u.role === 'company' ? 'bg-[#3B82F6]/15 text-[#3B82F6]' : 'bg-[#22C55E]/15 text-[#16A34A]'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#16A34A]">
                              Active
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate" style={{ color: tokens.textMuted }}>
                            {u.skills && u.skills.length > 0 ? u.skills.join(', ') : '-'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setEditUserModal(u)}
                              className="px-3 py-1.5 rounded-lg border font-semibold text-[11px]"
                              style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleSoftDeleteUser(u._id, u.name)}
                              className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#DC2626] font-semibold text-[11px]"
                            >
                              Soft Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: RECYCLE BIN (SOFT DELETED USERS) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'recycle' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input
                    type="text"
                    value={recycleSearch}
                    onChange={e => setRecycleSearch(e.target.value)}
                    placeholder="Search deleted user..."
                    className="w-full border rounded-xl py-2 pl-9 pr-3 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: tokens.textMuted }}>From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="border rounded-xl p-1.5 text-xs outline-none"
                    style={inputStyle}
                  />
                  <span className="text-[11px]" style={{ color: tokens.textMuted }}>To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="border rounded-xl p-1.5 text-xs outline-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={fetchDeletedUsers}
                    className="p-2 border rounded-xl text-xs font-bold transition-all"
                    style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ color: tokens.text }}>
                  <thead className="uppercase text-[10px] tracking-wider border-b" style={{ background: tokens.inputBg, color: tokens.textMuted, borderColor: tokens.border }}>
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Deleted At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: tokens.border }}>
                    {recycleLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center" style={{ color: tokens.textMuted }}>Loading deleted users...</td></tr>
                    ) : deletedUsers.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center" style={{ color: tokens.textMuted }}>Recycle Bin is empty.</td></tr>
                    ) : (
                      deletedUsers.filter(u => !recycleSearch || u.name?.toLowerCase().includes(recycleSearch.toLowerCase()) || u.email?.toLowerCase().includes(recycleSearch.toLowerCase())).map(u => (
                        <tr key={u._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-sm line-through text-[#EF4444]">{u.name}</div>
                            <div className="text-xs" style={{ color: tokens.textMuted }}>{u.email}</div>
                          </td>
                          <td className="p-4 capitalize" style={{ color: tokens.textMuted }}>{u.role}</td>
                          <td className="p-4" style={{ color: tokens.textMuted }}>
                            {u.deletedAt ? new Date(u.deletedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleRestoreUser(u._id, u.name)}
                              className="px-3 py-1.5 rounded-lg bg-[#22C55E]/20 text-[#16A34A] font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <RotateCcw size={12} /> Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(u._id, u.name)}
                              className="px-3 py-1.5 rounded-lg bg-[#DC2626]/20 text-[#DC2626] font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Permanent Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: JOBS MANAGEMENT */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  placeholder="Search job title or company..."
                  className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ color: tokens.text }}>
                  <thead className="uppercase text-[10px] tracking-wider border-b" style={{ background: tokens.inputBg, color: tokens.textMuted, borderColor: tokens.border }}>
                    <tr>
                      <th className="p-4">Title & Company</th>
                      <th className="p-4">Deadline</th>
                      <th className="p-4">Vacancies / Limit</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: tokens.border }}>
                    {jobsLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center" style={{ color: tokens.textMuted }}>Loading jobs...</td></tr>
                    ) : filteredJobs.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center" style={{ color: tokens.textMuted }}>No jobs found.</td></tr>
                    ) : (
                      filteredJobs.map(j => (
                        <tr key={j._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-sm" style={{ color: tokens.text }}>{j.title}</div>
                            <div className="text-xs" style={{ color: tokens.brandTagText }}>{j.company}</div>
                          </td>
                          <td className="p-4" style={{ color: tokens.textMuted }}>
                            {j.deadline ? new Date(j.deadline).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4" style={{ color: tokens.textMuted }}>
                            Vacancies: {j.positionsCount || 1} | Max: {j.maxApplicants || 10}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setEditJobModal(j)}
                              className="px-3 py-1.5 rounded-lg border font-semibold text-[11px]"
                              style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteJob(j._id, j.title)}
                              className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 text-[#DC2626] font-semibold text-[11px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 4: APPLICATIONS MANAGEMENT */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                <input
                  type="text"
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                  placeholder="Search job title or student..."
                  className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs" style={{ color: tokens.textMuted }}>Filter Status:</span>
                <select
                  value={appStatusFilter}
                  onChange={e => setAppStatusFilter(e.target.value)}
                  className="border text-xs rounded-xl p-2 outline-none"
                  style={inputStyle}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ color: tokens.text }}>
                  <thead className="uppercase text-[10px] tracking-wider border-b" style={{ background: tokens.inputBg, color: tokens.textMuted, borderColor: tokens.border }}>
                    <tr>
                      <th className="p-4">Candidate Student</th>
                      <th className="p-4">Applied Job</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: tokens.border }}>
                    {appsLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>Loading applications...</td></tr>
                    ) : filteredApps.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>No applications found.</td></tr>
                    ) : (
                      filteredApps.map(a => (
                        <tr key={a._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-sm" style={{ color: tokens.text }}>{a.studentId?.name || 'Applicant'}</div>
                            <div className="text-xs" style={{ color: tokens.textMuted }}>{a.studentId?.email || 'N/A'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold" style={{ color: tokens.brandTagText }}>{a.jobId?.title || 'Job'}</div>
                            <div className="text-[11px]" style={{ color: tokens.textMuted }}>{a.jobId?.company}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              a.status?.toLowerCase() === 'accepted' ? 'bg-[#22C55E]/15 text-[#16A34A]' :
                              a.status?.toLowerCase() === 'rejected' ? 'bg-[#EF4444]/15 text-[#DC2626]' : 'bg-[#D97706]/15 text-[#D97706]'
                            }`}>
                              {a.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4" style={{ color: tokens.textMuted }}>
                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setViewAppModal(a)}
                              className="px-3 py-1.5 rounded-lg border font-semibold text-[11px] inline-flex items-center gap-1"
                              style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}
                            >
                              <Eye size={12} /> View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 5: SECURITY & LIVE SESSIONS */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={e => setSessionSearch(e.target.value)}
                  placeholder="Search user, IP, or device..."
                  className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs" style={{ color: tokens.textMuted }}>Session Status:</span>
                <select
                  value={sessionStatusFilter}
                  onChange={e => setSessionStatusFilter(e.target.value)}
                  className="border text-xs rounded-xl p-2 outline-none"
                  style={inputStyle}
                >
                  <option value="all">All Sessions</option>
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
                <button
                  onClick={handleClearRevoked}
                  className="px-3 py-2 bg-[#EF4444]/20 text-[#DC2626] font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
                >
                  <Trash2 size={13} /> Clear Revoked
                </button>
              </div>
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ color: tokens.text }}>
                  <thead className="uppercase text-[10px] tracking-wider border-b" style={{ background: tokens.inputBg, color: tokens.textMuted, borderColor: tokens.border }}>
                    <tr>
                      <th className="p-4">Logged User</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Device & OS</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: tokens.border }}>
                    {sessionsLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>Loading live sessions...</td></tr>
                    ) : filteredSessions.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>No session logs recorded.</td></tr>
                    ) : (
                      filteredSessions.map(s => (
                        <tr key={s._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-sm" style={{ color: tokens.text }}>{s.userName || 'Unknown'}</div>
                            <div className="text-xs" style={{ color: tokens.textMuted }}>{s.userEmail}</div>
                          </td>
                          <td className="p-4 font-mono text-xs" style={{ color: tokens.textMuted }}>
                            <span className="inline-flex items-center gap-1">
                              <Globe size={13} /> {s.ipAddress}
                            </span>
                          </td>
                          <td className="p-4" style={{ color: tokens.textMuted }}>
                            <span className="inline-flex items-center gap-1">
                              <Laptop size={13} /> {s.device || 'Desktop PC'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              s.status === 'revoked' ? 'bg-[#EF4444]/20 text-[#DC2626]' : 'bg-[#22C55E]/15 text-[#16A34A]'
                            }`}>
                              {s.status === 'revoked' ? 'Revoked' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {s.status !== 'revoked' && (
                              <button
                                onClick={() => handleRevokeSession(s._id, s.userName)}
                                className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 text-[#DC2626] font-bold text-[11px] inline-flex items-center gap-1"
                              >
                                <Ban size={12} /> Force Logout
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD NEW USER */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
              <h3 className="text-lg font-extrabold" style={{ color: tokens.text }}>Add New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Email</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Password</label>
                  <input
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    >
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Skills (comma separated)</label>
                    <input
                      type="text"
                      value={newUserForm.skills}
                      onChange={e => setNewUserForm({ ...newUserForm, skills: e.target.value })}
                      placeholder="React, Node"
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded-xl text-xs border"
                    style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-extrabold rounded-xl text-xs shadow-md"
                    style={{ background: tokens.accent, color: tokens.accentDark }}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT USER */}
        {editUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
              <h3 className="text-lg font-extrabold" style={{ color: tokens.text }}>Edit User Details</h3>
              <form onSubmit={handleUpdateUser} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editUserModal.name}
                    onChange={e => setEditUserModal({ ...editUserModal, name: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Email</label>
                  <input
                    type="email"
                    required
                    value={editUserModal.email}
                    onChange={e => setEditUserModal({ ...editUserModal, email: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={editUserModal.password || ''}
                    onChange={e => setEditUserModal({ ...editUserModal, password: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Role</label>
                    <select
                      value={editUserModal.role}
                      onChange={e => setEditUserModal({ ...editUserModal, role: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    >
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Skills</label>
                    <input
                      type="text"
                      value={Array.isArray(editUserModal.skills) ? editUserModal.skills.join(', ') : editUserModal.skills || ''}
                      onChange={e => setEditUserModal({ ...editUserModal, skills: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditUserModal(null)}
                    className="px-4 py-2 rounded-xl text-xs border"
                    style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-extrabold rounded-xl text-xs shadow-md"
                    style={{ background: tokens.accent, color: tokens.accentDark }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: VIEW APPLICATION */}
        {viewAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: tokens.border }}>
                <h3 className="text-lg font-extrabold" style={{ color: tokens.text }}>Application Details</h3>
                <button onClick={() => setViewAppModal(null)} className="text-lg font-bold" style={{ color: tokens.textMuted }}>✕</button>
              </div>

              <div className="space-y-2 text-xs" style={{ color: tokens.textMuted }}>
                <div><strong style={{ color: tokens.text }}>Job Title:</strong> {viewAppModal.jobId?.title}</div>
                <div><strong style={{ color: tokens.text }}>Company:</strong> {viewAppModal.jobId?.company}</div>
                <div><strong style={{ color: tokens.text }}>Candidate Name:</strong> {viewAppModal.studentId?.name}</div>
                <div><strong style={{ color: tokens.text }}>Candidate Email:</strong> {viewAppModal.studentId?.email}</div>
                {viewAppModal.phone && <div><strong style={{ color: tokens.text }}>Phone:</strong> {viewAppModal.phone}</div>}
                {viewAppModal.coverLetter && (
                  <div>
                    <strong style={{ color: tokens.text }}>Cover Letter:</strong>
                    <p className="mt-1 p-3 rounded-xl border whitespace-pre-wrap" style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}>
                      {viewAppModal.coverLetter}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: tokens.border }}>
                <button
                  onClick={() => setViewAppModal(null)}
                  className="px-4 py-2 rounded-xl text-xs border"
                  style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateAppStatus(viewAppModal._id, 'Accepted')}
                    className="px-3 py-1.5 bg-[#22C55E] text-white font-bold rounded-xl text-xs"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleUpdateAppStatus(viewAppModal._id, 'Rejected')}
                    className="px-3 py-1.5 bg-[#EF4444] text-white font-bold rounded-xl text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: CONFIRM DIALOG */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
              <h3 className="text-base font-extrabold" style={{ color: tokens.text }}>{confirmModal.title}</h3>
              <p className="text-xs" style={{ color: tokens.textMuted }}>{confirmModal.message}</p>
              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: tokens.border }}>
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border"
                  style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                >
                  Meesha ka bax (Cancel)
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all hover:scale-105 ${confirmModal.confirmColor}`}
                >
                  {confirmModal.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
