import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building, Calendar, CheckCircle, ArrowLeft, Send, AlertCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme, themeTokens } from '../context/ThemeContext';
import DashboardLayout from '../layout/DashboardLayout';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { theme, tokens: contextTokens } = useTheme();
  const tokens = user ? contextTokens : themeTokens.navy;
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Already applied state
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState('');

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [experience, setExperience] = useState('1-2 Years');
  const [education, setEducation] = useState("Bachelor's Degree");
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data && res.data.data) {
        setJob(res.data.data);
      }

      // Check if student has already applied for this job
      if (user && user.role === 'student') {
        try {
          const appRes = await api.get('/applications');
          const apps = appRes.data?.data || [];
          const existingApp = apps.find(a => {
            const jId = typeof a.jobId === 'object' ? a.jobId?._id : a.jobId;
            return jId === id;
          });

          if (existingApp) {
            setAlreadyApplied(true);
            setAppliedStatus(existingApp.status || 'Pending');
          } else {
            setAlreadyApplied(false);
            setAppliedStatus('');
          }
        } catch (e) {
          console.error('Error checking application status:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyModal = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'company') {
      alert('Company accounts cannot apply for jobs. Please log in as a student.');
      return;
    }
    if (alreadyApplied) {
      alert(`Waa laguugu daray! Horay aad uga codsatay shaqadan (Status: ${appliedStatus}).`);
      return;
    }
    setErrorMsg('');
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!phone || !coverLetter) {
      setErrorMsg('Fadhlan bixi taleefankaaga iyo cover letter-ka.');
      return;
    }

    setApplying(true);
    setErrorMsg('');
    try {
      await api.post('/applications', {
        jobId: id,
        studentId: user.id || user._id,
        phone,
        coverLetter,
        experience,
        education,
        portfolio,
      });
      setSuccessMsg('Your job application form was submitted successfully!');
      setAlreadyApplied(true);
      setAppliedStatus('Pending');
      setShowApplyModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      setErrorMsg(msg);
    } finally {
      setApplying(false);
    }
  };

  const inputStyle = {
    background: tokens.inputBg,
    borderColor: tokens.border,
    color: tokens.text,
  };

  const jobDetailsContent = (
    <div className="w-full max-w-4xl mx-auto py-2">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold mb-6 transition-colors"
          style={{ color: tokens.textMuted }}
        >
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        {loading ? (
          <div className="py-20 text-center" style={{ color: tokens.textMuted }}>Loading job details...</div>
        ) : !job ? (
          <div className="border rounded-2xl p-8 text-center font-bold" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>Job not found.</div>
        ) : (
          <div className="border rounded-3xl p-8 shadow-xl relative transition-all" style={{ background: tokens.card, borderColor: tokens.border }}>
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6" style={{ borderColor: tokens.border }}>
              <div className="flex items-start gap-4">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-16 h-16 rounded-2xl object-cover border shrink-0 shadow-md"
                    style={{ borderColor: tokens.border }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-md"
                    style={{ background: tokens.brandTagBg, color: tokens.brandTagText, border: `1px solid ${tokens.border}` }}
                  >
                    {(job.company || '?').charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
                      style={{ background: tokens.brandTagBg, color: tokens.brandTagText, borderColor: tokens.border }}
                    >
                      Full Time Position
                    </span>
                    <span className="bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                      <Users size={13} /> Positions: {job.positionsCount || 1} Person(s)
                    </span>
                    <span className="bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                      <Users size={13} /> Max Limit: {job.maxApplicants || 10} Applicants
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold mt-1" style={{ color: tokens.text }}>
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm mt-2" style={{ color: tokens.textMuted }}>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: tokens.text }}>
                      <Building size={16} style={{ color: tokens.accent }} /> {job.company}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} /> Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {user?.role !== 'company' && (
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {alreadyApplied ? (
                    <div className="px-5 py-3 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-bold flex items-center gap-2 shadow-sm">
                      <CheckCircle size={18} />
                      <span>Already Applied ({appliedStatus})</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleOpenApplyModal}
                      disabled={applying || !!successMsg}
                      className="font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{
                        background: tokens.accent,
                        color: tokens.accentDark
                      }}
                    >
                      <Send size={16} />
                      {successMsg ? 'Applied ✓' : 'Apply Now (Form)'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mt-6 p-4 bg-[#22C55E]/15 border border-[#22C55E]/40 rounded-xl flex items-center gap-3 text-[#16A34A] text-sm font-medium">
                <CheckCircle size={20} />
                <span>{successMsg}</span>
              </div>
            )}
            {alreadyApplied && !successMsg && (
              <div className="mt-6 p-4 bg-[#3B82F6]/15 border border-[#3B82F6]/40 rounded-xl flex items-center gap-3 text-[#3B82F6] text-sm font-medium">
                <CheckCircle size={20} />
                <span>Ugu hambalyeeyo! Horey aad u dalbatay shaqadan. Codsigaaga wuxuu ku jiraa <strong className="uppercase">{appliedStatus}</strong> status.</span>
              </div>
            )}
            {errorMsg && (
              <div className="mt-6 p-4 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl text-[#DC2626] text-sm">
                {errorMsg}
              </div>
            )}

            {/* Description */}
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: tokens.text }}>Job Description</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: tokens.textMuted }}>
                  {job.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: tokens.text }}>Requirements & Details</h3>
                <ul className="list-disc list-inside text-sm space-y-1" style={{ color: tokens.textMuted }}>
                  <li>Minimum qualifications as described by hiring manager</li>
                  <li>Inta qof ee loo baahanyahay: <strong style={{ color: tokens.text }}>{job.positionsCount || 1}</strong></li>
                  <li>Limiting maximum total applicants to <strong style={{ color: tokens.text }}>{job.maxApplicants || 10}</strong> candidates</li>
                </ul>
              </div>
            </div>

          </div>
        )}

      {/* STUDENT APPLICATION FORM MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="border rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-5" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.text }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: tokens.border }}>
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: tokens.text }}>Application Form</h2>
                <p className="text-xs" style={{ color: tokens.textMuted }}>Shaqada: <span className="font-bold" style={{ color: tokens.accent }}>{job?.title}</span></p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-lg font-bold"
                style={{ color: tokens.textMuted }}
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl text-[#DC2626] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full border rounded-xl p-3 text-xs opacity-75"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full border rounded-xl p-3 text-xs opacity-75"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+252 61 XXX XXXX"
                    required
                    className="w-full border rounded-xl p-3 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Experience Level</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
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
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
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
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://github.com/myprofile"
                    className="w-full border rounded-xl p-3 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: tokens.textMuted }}>Cover Letter / Note *</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Sharax sababta aad u codsaneyso shaqadan iyo aqoontaada..."
                  required
                  className="w-full border rounded-xl p-3 text-xs outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border"
                  style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  style={{
                    background: tokens.accent,
                    color: tokens.accentDark
                  }}
                >
                  {applying ? 'Submitting Form...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  if (user) {
    return (
      <DashboardLayout>
        {jobDetailsContent}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {jobDetailsContent}
      </main>
      <Footer />
    </div>
  );
}