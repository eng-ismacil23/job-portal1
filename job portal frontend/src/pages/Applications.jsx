import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  Users,
  Search,
  Eye,
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Wrench,
  X,
  Phone,
  Globe,
  ExternalLink,
  Edit3,
  Trash2,
  AlertTriangle,
  Send,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../layout/DashboardLayout';

const STATUS_MAP = {
  applied:        { label: 'Pending',      bg: 'rgba(253,191,45,0.15)',   color: '#D97706',  icon: Clock       },
  pending:        { label: 'Pending',      bg: 'rgba(253,191,45,0.15)',   color: '#D97706',  icon: Clock       },
  Pending:        { label: 'Pending',      bg: 'rgba(253,191,45,0.15)',   color: '#D97706',  icon: Clock       },
  'not applied':  { label: 'Pending',      bg: 'rgba(253,191,45,0.15)',   color: '#D97706',  icon: Clock       },
  Accepted:       { label: 'Accepted',     bg: 'rgba(34,197,94,0.15)',    color: '#16A34A',  icon: CheckCircle },
  accepted:       { label: 'Accepted',     bg: 'rgba(34,197,94,0.15)',    color: '#16A34A',  icon: CheckCircle },
  Rejected:       { label: 'Rejected',     bg: 'rgba(239,68,68,0.15)',    color: '#DC2626',  icon: XCircle     },
  rejected:       { label: 'Rejected',     bg: 'rgba(239,68,68,0.15)',    color: '#DC2626',  icon: XCircle     },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['Pending'];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: `${s.color}30` }}
    >
      <Icon size={13} />
      {s.label}
    </span>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const { theme, tokens } = useTheme();
  const isLight = theme === 'light';

  const isCompany = user?.role === 'company';
  const isAdmin = user?.role === 'admin';
  const canManage = isCompany || isAdmin;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidateModal, setCandidateModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });

  // Student Edit Form State
  const [editModal, setEditModal] = useState({
    open: false,
    app: null,
    phone: '',
    coverLetter: '',
    experience: '1-2 Years',
    education: "Bachelor's Degree",
    portfolio: '',
    saving: false,
    error: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      const apps = res.data?.data || res.data || [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Company / Admin changing status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      showToast('success', `Application status changed to ${newStatus}`);
      fetchApplications();
      if (candidateModal && candidateModal.app._id === id) {
        setCandidateModal((prev) => prev ? { ...prev, app: { ...prev.app, status: newStatus } } : null);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Student canceling application
  const handleCancelApplication = (app) => {
    const jobTitle = app.jobId?.title || 'this job';
    setConfirmModal({
      title: 'Cancel Application?',
      message: `Ma hubtaa inaad ka noqoto (cancel gareyso) codsigii aad u dirtay "${jobTitle}"? Codsigan waa laga saari doonaa shirkadda, mar kalena waad codsan kartaa.`,
      confirmLabel: 'Cancel Application',
      confirmColor: 'bg-[#EF4444] text-white',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.delete(`/applications/${app._id || app.id}`);
          showToast('success', 'Codsigaagii si guul leh ayaa loo joojiyay (Application canceled).');
          fetchApplications();
          if (candidateModal && candidateModal.app._id === app._id) {
            setCandidateModal(null);
          }
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to cancel application.');
        }
      }
    });
  };

  // Open Edit Form Modal for Student
  const handleOpenEditModal = (app) => {
    setEditModal({
      open: true,
      app,
      phone: app.phone || '',
      coverLetter: app.coverLetter || '',
      experience: app.experience || '1-2 Years',
      education: app.education || "Bachelor's Degree",
      portfolio: app.portfolio || '',
      saving: false,
      error: ''
    });
  };

  // Save Student Edit Form
  const handleSaveEditForm = async (e) => {
    e.preventDefault();
    if (!editModal.app) return;

    setEditModal(prev => ({ ...prev, saving: true, error: '' }));
    try {
      await api.put(`/applications/${editModal.app._id}`, {
        phone: editModal.phone,
        coverLetter: editModal.coverLetter,
        experience: editModal.experience,
        education: editModal.education,
        portfolio: editModal.portfolio
      });
      showToast('success', 'Xogta codsigaaga waa la cusboonaysiiyay (Application updated successfully)!');
      setEditModal(prev => ({ ...prev, open: false, saving: false }));
      fetchApplications();
    } catch (err) {
      setEditModal(prev => ({
        ...prev,
        saving: false,
        error: err.response?.data?.message || 'Failed to update application.'
      }));
    }
  };

  // Open Candidate / Application Details Modal
  const handleOpenCandidateProfile = async (app) => {
    const student = app.studentId || user || {};
    const userId = student._id || student.id || user?._id || user?.id;
    setCandidateModal({ app, student, profile: null, loading: true });

    if (userId) {
      try {
        const res = await api.get(`/profiles/${userId}`);
        const profileData = res.data?.data || null;
        setCandidateModal({ app, student, profile: profileData, loading: false });
      } catch (err) {
        setCandidateModal({ app, student, profile: null, loading: false });
      }
    } else {
      setCandidateModal({ app, student, profile: null, loading: false });
    }
  };

  const filtered = applications.filter((app) => {
    const statusLower = app.status?.toLowerCase();
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && (statusLower === 'pending' || statusLower === 'applied' || statusLower === 'not applied')) ||
      (filterStatus !== 'pending' && statusLower === filterStatus.toLowerCase());
    const matchSearch = !searchTerm ||
      app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all:      applications.length,
    pending:  applications.filter((a) => ['pending', 'applied', 'not applied'].includes(a.status?.toLowerCase())).length,
    Accepted: applications.filter((a) => a.status?.toLowerCase() === 'accepted').length,
    Rejected: applications.filter((a) => a.status?.toLowerCase() === 'rejected').length,
  };

  const inputStyle = {
    background: tokens.inputBg,
    borderColor: tokens.border,
    color: tokens.text,
  };

  const applicationsContent = (
    <div className="w-full flex flex-col justify-between font-sans" style={{ background: tokens.bg, color: tokens.text }}>
      <main className="flex-1 max-w-6xl w-full mx-auto py-2">

        {/* Header Banner */}
        <div
          className="rounded-3xl p-6 md:p-8 border mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden transition-all duration-300"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
              : 'linear-gradient(135deg, #10205F 0%, #06124A 100%)',
            borderColor: tokens.border,
            boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.03)' : 'none'
          }}
        >
          <div className="p-3 rounded-2xl shrink-0" style={{ background: isLight ? '#4F46E5' : '#FAF92A', color: isLight ? '#FFFFFF' : '#06124A' }}>
            {isCompany ? <Users size={28} /> : <FileText size={28} />}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: isLight ? '#1E1B4B' : '#FFFFFF' }}>
              {isCompany ? 'Manage Applications' : 'My Job Applications'}
            </h1>
            <p className="text-xs mt-1" style={{ color: isLight ? '#4338CA' : '#AEB8D0' }}>
              {isCompany
                ? 'Inspect candidate profiles, view submitted forms, and accept or reject candidates.'
                : 'Track, edit, or cancel your submitted job applications while they are pending.'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-extrabold" style={{ color: isLight ? '#4F46E5' : '#FAF92A' }}>{applications.length}</div>
            <div className="text-xs" style={{ color: isLight ? '#4338CA' : '#AEB8D0' }}>Total {isCompany ? 'Received' : 'Applied'}</div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast.text && (
          <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-xs font-bold border transition-all ${
            toast.type === 'success' ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#16A34A]' : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#DC2626]'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{toast.text}</span>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'all',      label: 'All Applications', color: tokens.textMuted },
            { key: 'pending',  label: 'Pending Review',  color: '#D97706' },
            { key: 'Accepted', label: 'Accepted',        color: '#16A34A' },
            { key: 'Rejected', label: 'Rejected',        color: '#DC2626' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className="p-4 rounded-2xl border transition-all text-left"
              style={{
                background: filterStatus === key ? (isLight ? '#FFFFFF' : tokens.card) : tokens.card,
                borderColor: filterStatus === key ? (isLight ? '#4F46E5' : '#FAF92A') : tokens.border,
                boxShadow: filterStatus === key && isLight ? '0 4px 14px rgba(79,70,229,0.12)' : 'none'
              }}
            >
              <div className="text-2xl font-extrabold" style={{ color }}>{counts[key] ?? 0}</div>
              <div className="text-xs mt-0.5" style={{ color: tokens.textMuted }}>{label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6 flex items-center">
          <Search size={18} className="absolute left-4" style={{ color: tokens.textMuted }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isCompany ? 'Search by candidate name or job title...' : 'Search by job title or company...'}
            className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
            style={{
              background: tokens.card,
              borderColor: tokens.border,
              color: tokens.text
            }}
          />
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center" style={{ color: tokens.textMuted }}>Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border" style={{ background: tokens.card, borderColor: tokens.border }}>
            <FileText size={40} className="mx-auto mb-4 opacity-30" style={{ color: tokens.textMuted }} />
            <p className="text-lg font-semibold" style={{ color: tokens.text }}>No applications found.</p>
            <p className="text-xs mt-1" style={{ color: tokens.textMuted }}>
              {isCompany ? 'No candidates have applied to your jobs yet.' : 'Browse active jobs and submit an application!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((app) => {
              const isPending = ['pending', 'applied', 'not applied'].includes(app.status?.toLowerCase());
              const isAccepted = app.status?.toLowerCase() === 'accepted';
              const isRejected = app.status?.toLowerCase() === 'rejected';

              return (
                <div
                  key={app._id || app.id}
                  className="border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                  style={{
                    background: tokens.card,
                    borderColor: tokens.border,
                    boxShadow: isLight ? '0 2px 10px rgba(0,0,0,0.02)' : 'none'
                  }}
                >
                  {/* Left: Job + Applicant info */}
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        background: isLight ? '#EEF2FF' : '#08153D',
                        color: isLight ? '#4F46E5' : '#FAF92A',
                        borderColor: tokens.border
                      }}
                    >
                      <Building size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base truncate" style={{ color: tokens.text }}>
                        {app.jobId?.title || 'Job Position'}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: tokens.textMuted }}>
                        Company: <span className="font-semibold" style={{ color: tokens.text }}>{app.jobId?.company || 'Company'}</span>
                      </p>

                      {isCompany ? (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: tokens.textMuted }}>
                            {app.studentId?.avatar ? (
                              <img src={app.studentId.avatar} alt={app.studentId.name} className="w-5 h-5 rounded-full object-cover border border-[#FAF92A]/40" />
                            ) : (
                              <Users size={12} />
                            )}
                            <span>Candidate:</span>
                            <span className="font-semibold" style={{ color: tokens.text }}>{app.studentId?.name || 'Applicant'}</span>
                            {app.studentId?.email && <span className="opacity-70">({app.studentId.email})</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: tokens.textMuted }}>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {app.phone}
                            </span>
                          )}
                          {app.experience && (
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} /> {app.experience}
                            </span>
                          )}
                        </div>
                      )}

                      {app.createdAt && (
                        <p className="text-[11px] mt-1 opacity-60" style={{ color: tokens.textMuted }}>
                          Applied on: {new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto shrink-0">
                    <StatusBadge status={app.status} />

                    {/* COMPANY ACTIONS */}
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenCandidateProfile(app)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5"
                          style={{
                            background: isLight ? '#EEF2FF' : 'rgba(250,249,42,0.1)',
                            color: isLight ? '#4F46E5' : '#FAF92A',
                            borderColor: isLight ? '#C7D2FE' : 'rgba(250,249,42,0.2)'
                          }}
                        >
                          <Eye size={13} /> View Form & Profile
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app._id || app.id, 'Accepted')}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-[#22C55E]/15 text-[#16A34A] hover:bg-[#22C55E]/25 border border-[#22C55E]/30 flex items-center gap-1"
                            >
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id || app.id, 'Rejected')}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-[#EF4444]/15 text-[#DC2626] hover:bg-[#EF4444]/25 border border-[#EF4444]/30 flex items-center gap-1"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => handleStatusChange(app._id || app.id, 'Rejected')}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#EF4444]/10 text-[#DC2626] hover:bg-[#EF4444]/20 border border-[#EF4444]/20"
                          >
                            Change to Reject
                          </button>
                        )}

                        {isRejected && (
                          <button
                            onClick={() => handleStatusChange(app._id || app.id, 'Accepted')}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#22C55E]/10 text-[#16A34A] hover:bg-[#22C55E]/20 border border-[#22C55E]/20"
                          >
                            Reconsider
                          </button>
                        )}
                      </>
                    )}

                    {/* STUDENT ACTIONS */}
                    {!canManage && (
                      <>
                        <button
                          onClick={() => handleOpenCandidateProfile(app)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5"
                          style={{
                            background: isLight ? '#EEF2FF' : 'rgba(250,249,42,0.1)',
                            color: isLight ? '#4F46E5' : '#FAF92A',
                            borderColor: isLight ? '#C7D2FE' : 'rgba(250,249,42,0.2)'
                          }}
                        >
                          <Eye size={13} /> View Form
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(app)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 hover:scale-105"
                              style={{
                                background: tokens.inputBg,
                                borderColor: tokens.border,
                                color: tokens.text
                              }}
                              title="Edit your submitted application details"
                            >
                              <Edit3 size={13} className="text-[#3B82F6]" /> Edit Form
                            </button>

                            <button
                              onClick={() => handleCancelApplication(app)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#DC2626] border border-[#EF4444]/30 transition-all flex items-center gap-1.5 hover:scale-105"
                              title="Cancel / Withdraw your application"
                            >
                              <Trash2 size={13} /> Cancel
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── CANDIDATE PROFILE & FORM INSPECTION MODAL ─── */}
      {candidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="border rounded-3xl p-6 md:p-8 max-w-xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh]" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
            <button
              onClick={() => setCandidateModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full border transition-all"
              style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: tokens.border }}>
              {(candidateModal.student?.avatar || candidateModal.profile?.avatar) ? (
                <img
                  src={candidateModal.student?.avatar || candidateModal.profile?.avatar}
                  alt={candidateModal.student?.name}
                  className="w-16 h-16 rounded-2xl object-cover border shadow-lg shrink-0"
                  style={{ borderColor: tokens.border }}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#3B82F6] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0">
                  {candidateModal.student?.name ? candidateModal.student.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: tokens.text }}>{candidateModal.student?.name || 'Applicant'}</h2>
                <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: tokens.textMuted }}>
                  <Mail size={13} /> {candidateModal.student?.email || 'N/A'}
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <StatusBadge status={candidateModal.app?.status} />
                  <span className="text-[11px] px-2.5 py-1 rounded-lg border font-semibold" style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.brandTagText }}>
                    Job: {candidateModal.app?.jobId?.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content Details */}
            {candidateModal.loading ? (
              <div className="py-10 text-center" style={{ color: tokens.textMuted }}>Loading details...</div>
            ) : (
              <div className="flex flex-col gap-5 text-sm">

                {/* Candidate Skills */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
                    <Wrench size={14} className="text-[#4F46E5]" /> Skills & Technologies
                  </h4>
                  {candidateModal.student?.skills && candidateModal.student.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidateModal.student.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 border rounded-xl text-xs font-bold" style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic" style={{ color: tokens.textMuted }}>No specific skills listed.</p>
                  )}
                </div>

                {/* Application Form Details */}
                {candidateModal.app && (
                  <div className="p-4.5 rounded-2xl border space-y-3.5" style={{ background: isLight ? '#EEF2FF' : 'rgba(59,130,246,0.08)', borderColor: isLight ? '#C7D2FE' : 'rgba(59,130,246,0.25)' }}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: isLight ? '#4F46E5' : '#3B82F6' }}>
                      <FileText size={15} /> Submitted Application Form Details
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2" style={{ color: tokens.textMuted }}>
                        <Phone size={13} className="text-[#3B82F6] shrink-0" />
                        <strong style={{ color: tokens.text }}>Phone:</strong>
                        <span>{candidateModal.app.phone || candidateModal.profile?.phone || 'Not specified'}</span>
                      </div>

                      <div className="flex items-center gap-2" style={{ color: tokens.textMuted }}>
                        <GraduationCap size={13} className="text-[#3B82F6] shrink-0" />
                        <strong style={{ color: tokens.text }}>Education:</strong>
                        <span>{candidateModal.app.education || candidateModal.profile?.education || "Bachelor's Degree"}</span>
                      </div>

                      <div className="flex items-center gap-2" style={{ color: tokens.textMuted }}>
                        <Briefcase size={13} className="text-[#3B82F6] shrink-0" />
                        <strong style={{ color: tokens.text }}>Experience:</strong>
                        <span>{candidateModal.app.experience || candidateModal.profile?.experience || '1-2 Years'}</span>
                      </div>

                      {(candidateModal.app.portfolio || candidateModal.profile?.CV) && (
                        <div className="flex items-center gap-2" style={{ color: tokens.textMuted }}>
                          <Globe size={13} className="text-[#3B82F6] shrink-0" />
                          <strong style={{ color: tokens.text }}>Portfolio / CV:</strong>
                          <a
                            href={candidateModal.app.portfolio || candidateModal.profile?.CV}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-bold text-[#3B82F6] hover:text-[#2563EB] truncate flex items-center gap-1"
                          >
                            View Link <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-xs pt-1" style={{ color: tokens.textMuted }}>
                      <strong style={{ color: tokens.text }} className="block mb-1">Cover Letter / Note:</strong>
                      <p className="p-3 rounded-xl border whitespace-pre-wrap leading-relaxed" style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}>
                        {candidateModal.app.coverLetter || candidateModal.profile?.bio || 'Candidate applied for this position with standard profile submission.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Profile Bio */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
                    <User size={14} className="text-[#4F46E5]" /> About Candidate (Bio)
                  </h4>
                  <p className="p-3.5 rounded-xl border text-xs leading-relaxed" style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}>
                    {candidateModal.profile?.bio || 'No bio submitted.'}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="mt-6 pt-5 border-t flex items-center justify-between gap-3" style={{ borderColor: tokens.border }}>
              <button
                onClick={() => setCandidateModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border"
                style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
              >
                Close
              </button>

              {canManage ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStatusChange(candidateModal.app._id || candidateModal.app.id, 'Rejected')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EF4444]/20 text-[#DC2626] hover:bg-[#EF4444]/30 border border-[#EF4444]/40 transition-all flex items-center gap-1.5"
                  >
                    <XCircle size={15} /> Reject Candidate
                  </button>
                  <button
                    onClick={() => handleStatusChange(candidateModal.app._id || candidateModal.app.id, 'Accepted')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle size={15} /> Accept Candidate
                  </button>
                </div>
              ) : (
                ['pending', 'applied', 'not applied'].includes(candidateModal.app?.status?.toLowerCase()) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const app = candidateModal.app;
                        setCandidateModal(null);
                        handleOpenEditModal(app);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5"
                      style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}
                    >
                      <Edit3 size={14} className="text-[#3B82F6]" /> Edit Form
                    </button>
                    <button
                      onClick={() => {
                        const app = candidateModal.app;
                        setCandidateModal(null);
                        handleCancelApplication(app);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EF4444]/15 text-[#DC2626] hover:bg-[#EF4444]/25 border border-[#EF4444]/30 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Cancel Application
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── STUDENT EDIT APPLICATION FORM MODAL ─── */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="border rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-5" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: tokens.border }}>
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: tokens.text }}>
                  <Edit3 size={20} className="text-[#3B82F6]" /> Edit Application Form
                </h2>
                <p className="text-xs mt-0.5" style={{ color: tokens.textMuted }}>
                  Shaqada: <span className="font-bold" style={{ color: tokens.accent }}>{editModal.app?.jobId?.title}</span>
                </p>
              </div>
              <button
                onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                className="p-2 rounded-full border transition-all"
                style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            {editModal.error && (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl text-[#DC2626] text-xs">
                {editModal.error}
              </div>
            )}

            <form onSubmit={handleSaveEditForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Phone Number *</label>
                  <input
                    type="text"
                    value={editModal.phone}
                    onChange={(e) => setEditModal({ ...editModal, phone: e.target.value })}
                    placeholder="+252 61 XXX XXXX"
                    required
                    className="w-full border rounded-xl p-3 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Experience Level</label>
                  <select
                    value={editModal.experience}
                    onChange={(e) => setEditModal({ ...editModal, experience: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs outline-none"
                    style={inputStyle}
                  >
                    <option value="Entry Level / Fresh Graduate">Entry Level / Fresh Graduate</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Education Level</label>
                  <select
                    value={editModal.education}
                    onChange={(e) => setEditModal({ ...editModal, education: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs outline-none"
                    style={inputStyle}
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Diploma">Diploma</option>
                    <option value="High School">High School</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Portfolio / LinkedIn Link (Optional)</label>
                  <input
                    type="url"
                    value={editModal.portfolio}
                    onChange={(e) => setEditModal({ ...editModal, portfolio: e.target.value })}
                    placeholder="https://github.com/myprofile"
                    className="w-full border rounded-xl p-3 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Cover Letter / Note *</label>
                <textarea
                  value={editModal.coverLetter}
                  onChange={(e) => setEditModal({ ...editModal, coverLetter: e.target.value })}
                  rows={4}
                  placeholder="Sharax aqoontaada iyo sababta aad u codsaneyso..."
                  required
                  className="w-full border rounded-xl p-3 text-xs outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: tokens.border }}>
                <button
                  type="button"
                  onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border"
                  style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                  style={{
                    background: tokens.accent,
                    color: tokens.accentDark
                  }}
                >
                  <Send size={14} />
                  {editModal.saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CONFIRMATION MODAL ─── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-extrabold" style={{ color: tokens.text }}>{confirmModal.title}</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: tokens.textMuted }}>{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: tokens.border }}>
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border"
                style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
              >
                Meesha ka bax (Keep)
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all hover:scale-105 ${confirmModal.confirmColor || 'bg-[#EF4444] text-white'}`}
              >
                {confirmModal.confirmLabel || 'Haa, tirtir (Cancel)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (user) {
    return (
      <DashboardLayout>
        {applicationsContent}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans" style={{ background: tokens.bg, color: tokens.text }}>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {applicationsContent}
      </main>
      <Footer />
    </div>
  );
}
