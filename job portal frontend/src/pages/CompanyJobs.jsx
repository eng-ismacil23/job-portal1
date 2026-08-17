import React, { useState, useEffect } from 'react';
import { Briefcase, Edit3, Trash2, StopCircle, PlayCircle, PlusCircle, Search, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

// Custom in-page confirm dialog — replaces browser window.confirm
function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel, tokens, isLight }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-in" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDBF2D]/15 flex items-center justify-center text-[#D97706] shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold" style={{ color: tokens.text }}>{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: tokens.textMuted }}>{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: tokens.border }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
            style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
          >
            Meesha ka bax (Cancel)
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all hover:scale-105 ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyJobs() {
  const { theme, tokens } = useTheme();
  const isLight = theme === 'light';
  const isDarkCharcoal = theme === 'dark';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editJobModal, setEditJobModal] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });

  // Custom confirm dialog state
  const [confirm, setConfirm] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Haa, waa hagaag',
    confirmColor: 'bg-[#EF4444] text-white',
    onConfirm: null,
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  const askConfirm = ({ title, message, confirmLabel, confirmColor, onConfirm }) => {
    setConfirm({ open: true, title, message, confirmLabel, confirmColor: confirmColor || 'bg-[#EF4444] text-white', onConfirm });
  };

  const closeConfirm = () => setConfirm(c => ({ ...c, open: false, onConfirm: null }));

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/my-jobs');
      setJobs(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching company jobs:', err);
    } finally {
      setLoading(false);
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
      showToast('success', 'Shaqadii waa la cusbooneysiiyay (Job updated successfully)!');
      setEditJobModal(null);
      fetchMyJobs();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update job.');
    }
  };

  const handleToggleTerminate = (job) => {
    const isTerminated = job.status === 'terminated';
    askConfirm({
      title: isTerminated ? 'Dib u furto shaqadan?' : 'Jooji shaqadan?',
      message: isTerminated
        ? `Shaqada "${job.title}" waxaad dib u furayaa — codsadayaasha ayaa markaa mar kale awoodi doona inay codsan karaan.`
        : `Shaqada "${job.title}" waxaad joojinaysaa — ka dib codsadayaasha lama ogolaanayso inay codsan karaan.`,
      confirmLabel: isTerminated ? 'Haa, dib u fur (Re-activate)' : 'Haa, jooji (Terminate)',
      confirmColor: isTerminated ? 'bg-[#22C55E] text-white' : 'bg-[#D97706] text-white',
      onConfirm: async () => {
        closeConfirm();
        const newStatus = isTerminated ? 'active' : 'terminated';
        try {
          await api.put(`/jobs/${job._id}`, { status: newStatus });
          showToast('success', `Shaqadii waa la ${newStatus === 'terminated' ? 'joojiyay.' : 'dib u furay.'}`);
          fetchMyJobs();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to change job status.');
        }
      }
    });
  };

  const handleDeleteJob = (id, title) => {
    askConfirm({
      title: 'Tirida shaqadan?',
      message: `Shaqada "${title}" waxaad si joogto ah u tiraysa — xogtan ma soo noqon doonto.`,
      confirmLabel: 'Haa, tir (Delete)',
      confirmColor: 'bg-[#EF4444] text-white',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.delete(`/jobs/${id}`);
          showToast('success', 'Shaqadii waa la tiray.');
          fetchMyJobs();
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Failed to delete job.');
        }
      }
    });
  };

  const filteredJobs = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.description?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    background: tokens.inputBg,
    borderColor: tokens.border,
    color: tokens.text,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">

        {/* Custom Confirm Dialog */}
        <ConfirmDialog
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmColor={confirm.confirmColor}
          onConfirm={confirm.onConfirm}
          onCancel={closeConfirm}
          tokens={tokens}
          isLight={isLight}
        />

        {/* Header Banner */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl transition-all duration-300"
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
              <Briefcase size={16} /> Company Management
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: isLight ? '#1E1B4B' : tokens.text }}>Jobs Management Panel</h1>
            <p className="text-xs mt-1" style={{ color: isLight ? '#4338CA' : tokens.textMuted }}>
              Halkan ka manage gareee, ka edit gareee, ka jooji (terminate) ama ka tir shaqooyinka shirkadaada.
            </p>
          </div>

          <Link
            to="/create-job"
            className="px-5 py-3 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 no-underline"
            style={{
              background: tokens.accent,
              color: tokens.accentDark
            }}
          >
            <PlusCircle size={16} /> Post New Job
          </Link>
        </div>

        {/* Toast */}
        {toast.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold ${
            toast.type === 'success' ? 'bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#16A34A]' : 'bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#DC2626]'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.text}</span>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: tokens.card, borderColor: tokens.border }}>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your jobs..."
              className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs outline-none transition-all"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Jobs List / Table */}
        <div className="border rounded-2xl overflow-hidden shadow-xl" style={{ background: tokens.card, borderColor: tokens.border }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" style={{ color: tokens.text }}>
              <thead className="uppercase text-[10px] tracking-wider border-b" style={{ background: tokens.inputBg, color: tokens.textMuted, borderColor: tokens.border }}>
                <tr>
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Vacancies & Capacity</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: tokens.border }}>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>Loading your jobs...</td></tr>
                ) : filteredJobs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center" style={{ color: tokens.textMuted }}>No jobs found. Post a job to get started!</td></tr>
                ) : (
                  filteredJobs.map(j => {
                    const isTerminated = j.status === 'terminated';
                    return (
                      <tr key={j._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="p-4 font-bold text-sm" style={{ color: tokens.text }}>
                          {j.title}
                          <div className="text-[11px] font-normal line-clamp-1 mt-0.5" style={{ color: tokens.textMuted }}>{j.description}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isTerminated ? 'bg-[#EF4444]/20 text-[#DC2626] border border-[#EF4444]/40' : 'bg-[#22C55E]/15 text-[#16A34A]'
                          }`}>
                            {isTerminated ? 'Terminated / Closed' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold" style={{ color: tokens.brandTagText }}>
                          Vacancies: {j.positionsCount || 1} | Max: {j.maxApplicants || 10}
                        </td>
                        <td className="p-4" style={{ color: tokens.textMuted }}>
                          {j.deadline ? new Date(j.deadline).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setEditJobModal(j)}
                            className="px-3 py-1.5 rounded-lg border font-semibold text-[11px] inline-flex items-center gap-1 transition-all"
                            style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.text }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>

                          <button
                            onClick={() => handleToggleTerminate(j)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 ${
                              isTerminated ? 'bg-[#22C55E]/20 text-[#16A34A]' : 'bg-[#D97706]/20 text-[#D97706]'
                            }`}
                            title={isTerminated ? 'Re-activate Job' : 'Terminate / Close Job'}
                          >
                            {isTerminated ? <PlayCircle size={13} /> : <StopCircle size={13} />}
                            {isTerminated ? 'Re-open' : 'Terminate (Jooji)'}
                          </button>

                          <button
                            onClick={() => handleDeleteJob(j._id, j.title)}
                            className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#DC2626] font-semibold text-[11px] inline-flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EDIT JOB MODAL FOR COMPANY */}
        {editJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
              <h3 className="text-lg font-extrabold" style={{ color: tokens.text }}>Edit Job Details</h3>
              <form onSubmit={handleUpdateJob} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Job Title</label>
                  <input
                    type="text"
                    required
                    value={editJobModal.title}
                    onChange={e => setEditJobModal({ ...editJobModal, title: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Company Name</label>
                    <input
                      type="text"
                      required
                      value={editJobModal.company}
                      onChange={e => setEditJobModal({ ...editJobModal, company: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Deadline</label>
                    <input
                      type="date"
                      required
                      value={editJobModal.deadline ? editJobModal.deadline.substring(0, 10) : ''}
                      onChange={e => setEditJobModal({ ...editJobModal, deadline: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Vacancies (Positions)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editJobModal.positionsCount || 1}
                      onChange={e => setEditJobModal({ ...editJobModal, positionsCount: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Max Codsadayaal (Limit)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editJobModal.maxApplicants || 10}
                      onChange={e => setEditJobModal({ ...editJobModal, maxApplicants: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Description</label>
                  <textarea
                    rows={4}
                    required
                    value={editJobModal.description}
                    onChange={e => setEditJobModal({ ...editJobModal, description: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs outline-none resize-none"
                    style={inputStyle}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditJobModal(null)}
                    className="px-4 py-2 rounded-xl text-xs border"
                    style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                  >
                    Jooji (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-extrabold rounded-xl text-xs shadow-md"
                    style={{ background: tokens.accent, color: tokens.accentDark }}
                  >
                    Keydi (Save Changes)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
