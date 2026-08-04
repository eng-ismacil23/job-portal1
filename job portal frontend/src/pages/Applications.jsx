// application 
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Building, Users, Search, Eye, User, Mail, GraduationCap, Briefcase, Wrench, X, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';

// ─── Status badge map ────────────────────────────────────────
const STATUS_MAP = {
  applied:        { label: 'Applied',      bg: 'rgba(59,130,246,0.15)',   color: '#60A5FA',  icon: FileText    },
  pending:        { label: 'Pending',      bg: 'rgba(253,191,45,0.15)',   color: '#FDBF2D',  icon: Clock       },
  Pending:        { label: 'Pending',      bg: 'rgba(253,191,45,0.15)',   color: '#FDBF2D',  icon: Clock       },
  Accepted:       { label: 'Accepted',     bg: 'rgba(34,197,94,0.15)',    color: '#22C55E',  icon: CheckCircle },
  accepted:       { label: 'Accepted',     bg: 'rgba(34,197,94,0.15)',    color: '#22C55E',  icon: CheckCircle },
  Rejected:       { label: 'Rejected',     bg: 'rgba(239,68,68,0.15)',    color: '#EF4444',  icon: XCircle     },
  rejected:       { label: 'Rejected',     bg: 'rgba(239,68,68,0.15)',    color: '#EF4444',  icon: XCircle     },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['Pending'];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={13} />
      {s.label}
    </span>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const isCompany = user?.role === 'company';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Candidate Profile Modal state
  const [candidateModal, setCandidateModal] = useState(null); // { app, student, profile, loading }

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/aplication');
      const apps = res.data?.data || res.data || [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/aplication/${id}`, { status: newStatus });
      fetchApplications();
      if (candidateModal && candidateModal.app._id === id) {
        setCandidateModal((prev) => prev ? { ...prev, app: { ...prev.app, status: newStatus } } : null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleOpenCandidateProfile = async (app) => {
    const student = app.studentId || {};
    const userId = student._id || student.id;
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
    const matchStatus = filterStatus === 'all' || app.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = !searchTerm ||
      app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all:      applications.length,
    pending:  applications.filter((a) => a.status?.toLowerCase() === 'pending' || a.status?.toLowerCase() === 'applied').length,
    Accepted: applications.filter((a) => a.status?.toLowerCase() === 'accepted').length,
    Rejected: applications.filter((a) => a.status?.toLowerCase() === 'rejected').length,
  };

  const applicationsContent = (
    <div className="w-full text-white flex flex-col justify-between font-sans">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-6">

        {/* Header */}
        <div className="bg-[#10205F] rounded-3xl p-6 md:p-8 border border-white/10 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-[#FAF92A] text-[#06124A] rounded-2xl shrink-0">
            {isCompany ? <Users size={28} /> : <FileText size={28} />}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {isCompany ? 'Manage Applications' : 'My Job Applications'}
            </h1>
            <p className="text-xs text-[#AEB8D0] mt-1">
              {isCompany
                ? 'Inspect candidate profiles before accepting or rejecting their applications.'
                : 'Track the status of all your submitted job applications.'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-extrabold text-[#FAF92A]">{applications.length}</div>
            <div className="text-xs text-[#AEB8D0]">Total {isCompany ? 'Received' : 'Applied'}</div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FAF92A]/5 rounded-full blur-2xl"></div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'all',      label: 'All',      color: '#AEB8D0' },
            { key: 'pending',  label: 'Pending',  color: '#FDBF2D' },
            { key: 'Accepted', label: 'Accepted', color: '#22C55E' },
            { key: 'Rejected', label: 'Rejected', color: '#EF4444' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                filterStatus === key
                  ? 'border-[#FAF92A] bg-[#10205F]'
                  : 'border-white/10 bg-[#10205F]/50 hover:border-white/20'
              }`}
            >
              <div className="text-2xl font-extrabold" style={{ color }}>{counts[key] ?? 0}</div>
              <div className="text-xs text-[#AEB8D0] mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6 flex items-center">
          <Search size={18} className="absolute left-4 text-[#AEB8D0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isCompany ? 'Search by candidate name or job title...' : 'Search by job title or company...'}
            className="w-full bg-[#10205F]/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 text-center text-[#AEB8D0]">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#10205F]/50 rounded-2xl p-12 text-center border border-white/5">
            <FileText size={40} className="mx-auto text-[#AEB8D0]/30 mb-4" />
            <p className="text-lg font-semibold text-white">No applications found.</p>
            <p className="text-xs text-[#AEB8D0] mt-1">
              {isCompany ? 'No one has applied to your jobs yet.' : 'Browse jobs and start applying!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((app) => (
              <div
                key={app._id || app.id}
                className="bg-[#10205F] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#FAF92A]/30"
              >
                {/* Left: Job + Applicant info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#08153D] flex items-center justify-center text-[#FAF92A] shrink-0 border border-white/5">
                    <Building size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-white truncate">
                      {app.jobId?.title || 'Job Position'}
                    </h3>
                    <p className="text-xs text-[#AEB8D0] mt-0.5">
                      <span className="font-semibold text-white">{app.jobId?.company || 'Company'}</span>
                    </p>
                    {isCompany && (
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-[#AEB8D0] flex items-center gap-1">
                          <Users size={12} />
                          Candidate: <span className="text-white font-semibold ml-1">{app.studentId?.name || 'Applicant'}</span>
                          {app.studentId?.email && <span className="ml-1 text-[#AEB8D0]/70">({app.studentId.email})</span>}
                        </p>
                        <button
                          onClick={() => handleOpenCandidateProfile(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF92A]/15 text-[#FAF92A] border border-[#FAF92A]/30 text-xs font-bold hover:bg-[#FAF92A]/25 transition-all"
                        >
                          <Eye size={13} /> View Candidate Profile
                        </button>
                      </div>
                    )}
                    {app.createdAt && (
                      <p className="text-[11px] text-[#AEB8D0]/50 mt-1">
                        Applied on: {new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Status + Company actions */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <StatusBadge status={app.status} />

                  {isCompany && (
                    <button
                      onClick={() => handleOpenCandidateProfile(app)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all bg-[#FAF92A]/10 text-[#FAF92A] hover:bg-[#FAF92A]/20 border border-[#FAF92A]/20 flex items-center gap-1"
                    >
                      <Eye size={13} /> Profile
                    </button>
                  )}

                  {isCompany && (app.status?.toLowerCase() === 'pending' || app.status?.toLowerCase() === 'applied') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(app._id || app.id, 'Accepted')}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/25 border border-[#22C55E]/30"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(app._id || app.id, 'Rejected')}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 border border-[#EF4444]/30"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}

                  {isCompany && app.status?.toLowerCase() === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(app._id || app.id, 'Rejected')}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#EF4444]/10 text-[#EF4444]/70 hover:bg-[#EF4444]/20 border border-[#EF4444]/20"
                    >
                      Change to Reject
                    </button>
                  )}

                  {isCompany && app.status?.toLowerCase() === 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(app._id || app.id, 'Accepted')}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#22C55E]/10 text-[#22C55E]/70 hover:bg-[#22C55E]/20 border border-[#22C55E]/20"
                    >
                      Reconsider
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── CANDIDATE PROFILE INSPECTION MODAL ─── */}
      {candidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#10205F] border border-white/20 rounded-3xl p-6 md:p-8 max-w-xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setCandidateModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#AEB8D0] hover:text-white transition-all"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-extrabold text-2xl flex items-center justify-center shadow-lg">
                {candidateModal.student?.name ? candidateModal.student.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">{candidateModal.student?.name || 'Candidate Profile'}</h2>
                <p className="text-xs text-[#AEB8D0] flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} /> {candidateModal.student?.email || 'N/A'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={candidateModal.app?.status} />
                  <span className="text-[11px] text-[#AEB8D0] bg-[#08153D] px-2.5 py-1 rounded-lg border border-white/5">
                    Job: {candidateModal.app?.jobId?.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content Details */}
            {candidateModal.loading ? (
              <div className="py-10 text-center text-[#AEB8D0]">Loading candidate details...</div>
            ) : (
              <div className="flex flex-col gap-5 text-sm">

                {/* Candidate Skills */}
                <div>
                  <h4 className="text-xs font-bold text-[#AEB8D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wrench size={14} className="text-[#FAF92A]" /> Skills & Technologies
                  </h4>
                  {candidateModal.student?.skills && candidateModal.student.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidateModal.student.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-[#08153D] text-[#FAF92A] border border-[#FAF92A]/30 rounded-xl text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#AEB8D0]/60 italic">No specific skills listed.</p>
                  )}
                </div>

                {/* Profile Bio */}
                <div>
                  <h4 className="text-xs font-bold text-[#AEB8D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-[#FAF92A]" /> About Candidate (Bio)
                  </h4>
                  <p className="bg-[#08153D]/80 p-3.5 rounded-xl border border-white/5 text-xs text-[#AEB8D0] leading-relaxed">
                    {candidateModal.profile?.bio || 'No bio submitted.'}
                  </p>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-xs font-bold text-[#AEB8D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-[#FAF92A]" /> Education
                  </h4>
                  <p className="bg-[#08153D]/80 p-3.5 rounded-xl border border-white/5 text-xs text-[#AEB8D0]">
                    {candidateModal.profile?.education || 'Not specified.'}
                  </p>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="text-xs font-bold text-[#AEB8D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-[#FAF92A]" /> Work Experience
                  </h4>
                  <p className="bg-[#08153D]/80 p-3.5 rounded-xl border border-white/5 text-xs text-[#AEB8D0]">
                    {candidateModal.profile?.experience || 'Not specified.'}
                  </p>
                </div>

                {/* CV Attachment */}
                {candidateModal.profile?.CV && (
                  <div>
                    <h4 className="text-xs font-bold text-[#AEB8D0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award size={14} className="text-[#FAF92A]" /> CV / Resume
                    </h4>
                    <a
                      href={candidateModal.profile.CV}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF92A]/10 text-[#FAF92A] border border-[#FAF92A]/30 rounded-xl text-xs font-bold hover:bg-[#FAF92A]/20 transition-all"
                    >
                      📄 Download Candidate CV
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setCandidateModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#08153D] text-[#AEB8D0] hover:text-white border border-white/10"
              >
                Close
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatusChange(candidateModal.app._id || candidateModal.app.id, 'Rejected')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 border border-[#EF4444]/40 transition-all"
                >
                  ✗ Reject Candidate
                </button>
                <button
                  onClick={() => handleStatusChange(candidateModal.app._id || candidateModal.app.id, 'Accepted')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-lg hover:scale-105 transition-all"
                >
                  ✓ Accept Candidate
                </button>
              </div>
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
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {applicationsContent}
      </main>
      <Footer />
    </div>
  );
}