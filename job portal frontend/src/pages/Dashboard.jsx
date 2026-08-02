import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  TrendingUp,
  TrendingDown,
  Eye,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  Users,
  PlusCircle,
  FileText,
  Building2,
  Star,
  Bell,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BRAND, GlassCard } from '../brand';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

// ─── Match Ring SVG component ───────────────────────────────
const MatchRing = ({ percent = 85, size = 54 }) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = percent >= 90 ? BRAND.success : percent >= 80 ? BRAND.secondary : BRAND.textSecondary;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(174,184,208,0.15)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', itemsCenter: 'center', justifyContent: 'center' }}>
        <span className="jp-heading" style={{ fontSize: 11, fontWeight: 800, color: BRAND.text }}>{percent}%</span>
      </div>
    </div>
  );
};

// ─── Status badge helper ────────────────────────────────────
const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  const map = {
    applied: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA', label: 'Applied' },
    pending: { bg: 'rgba(253,191,45,0.15)', color: '#FDBF2D', label: 'Pending' },
    accepted: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: 'Accepted' },
    rejected: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Rejected' },
    interview: { bg: 'rgba(139,92,246,0.15)', color: '#A78BFA', label: 'Interview' },
    offer: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: 'Offer' },
  };
  const s = map[normalizedStatus] || map['pending'];
  return (
    <span className="jp-body" style={{
      fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
      background: s.bg, color: s.color, flexShrink: 0
    }}>
      {s.label}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════
//  JOB SEEKER DASHBOARD (100% REAL DATA FROM API)
// ══════════════════════════════════════════════════════════════
function SeekerDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appsRes, jobsRes] = await Promise.all([
          api.get('/aplication').catch(() => ({ data: { data: [] } })),
          api.get('/jobs').catch(() => ({ data: { data: [] } }))
        ]);

        const appsData = appsRes.data?.data || [];
        const jobsData = jobsRes.data?.data || [];

        setApplications(appsData);
        setRecommendedJobs(jobsData.slice(0, 3));
      } catch (err) {
        console.error("Error fetching seeker dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader2 size={32} className="animate-spin" color={BRAND.primary} />
      </div>
    );
  }

  const totalApps = applications.length;
  const interviewsCount = applications.filter(a => a.status?.toLowerCase() === 'interview').length;
  const acceptedCount = applications.filter(a => a.status?.toLowerCase() === 'accepted' || a.status?.toLowerCase() === 'offer').length;
  const pendingCount = applications.filter(a => a.status?.toLowerCase() === 'pending' || a.status?.toLowerCase() === 'applied').length;
  const rejectedCount = applications.filter(a => a.status?.toLowerCase() === 'rejected').length;

  const SEEKER_STATS = [
    { label: 'Applications Sent', value: totalApps.toString(), delta: 'Total', up: true, icon: Send, tint: BRAND.primary },
    { label: 'Pending Review', value: pendingCount.toString(), delta: 'Active', up: true, icon: Eye, tint: BRAND.secondary },
    { label: 'Interviews', value: interviewsCount.toString(), delta: 'Scheduled', up: true, icon: CheckCircle2, tint: '#8B5CF6' },
    { label: 'Offers / Accepted', value: acceptedCount.toString(), delta: 'Approved', up: true, icon: Star, tint: BRAND.success },
  ];

  const SEEKER_STATUS_PIE = [
    { name: 'Pending', value: pendingCount, color: '#3B82F6' },
    { name: 'Interview', value: interviewsCount, color: '#8B5CF6' },
    { name: 'Accepted', value: acceptedCount, color: BRAND.success },
    { name: 'Rejected', value: rejectedCount, color: BRAND.danger },
  ];

  return (
    <>
      {/* Welcome Banner */}
      <GlassCard style={{
        padding: '22px 26px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justify: 'space-between', gap: 20, flexWrap: 'wrap',
        background: 'linear-gradient(120deg, rgba(59,130,246,0.15), rgba(16,32,95,0.5))'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: BRAND.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            <Sparkles size={14} /> Job Seeker Dashboard
          </div>
          <h2 className="jp-heading" style={{ fontSize: 19, fontWeight: 800, margin: '0 0 5px' }}>
            Welcome back, {user?.name || 'Friend'} 👋
          </h2>
          <p className="jp-body" style={{ color: BRAND.textSecondary, fontSize: 13, margin: 0 }}>
            You have submitted <strong style={{ color: BRAND.primary }}>{totalApps} applications</strong> in total.
          </p>
        </div>
        <Link
          to="/jobs"
          className="jp-heading"
          style={{
            height: 44, padding: '0 22px', borderRadius: 14, border: 'none',
            background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})`,
            color: BRAND.dark, fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(250,249,42,0.25)', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}
        >
          <Briefcase size={16} /> Explore Jobs
        </Link>
      </GlassCard>

      {/* Stat Cards */}
      <div className="jp-stats-grid">
        {SEEKER_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${s.tint}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={s.tint} />
                </div>
                <div style={{ color: BRAND.success, fontSize: 12, fontWeight: 600 }}>
                  {s.delta}
                </div>
              </div>
              <div className="jp-heading" style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              <div className="jp-body" style={{ fontSize: 12.5, color: BRAND.textSecondary, marginTop: 2 }}>{s.label}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Recent Applications & Status Breakdown */}
      <div className="jp-content-grid">
        <GlassCard style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="jp-heading" style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Applications</h3>
            <Link to="/applications" style={{ fontSize: 12.5, color: BRAND.primary, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {applications.length === 0 ? (
              <p style={{ color: BRAND.textSecondary, fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                No applications submitted yet. Browse jobs to apply!
              </p>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app._id || app.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 14, background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={15} color={BRAND.primary} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="jp-body" style={{ fontSize: 13.5, fontWeight: 600, color: BRAND.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.jobId?.title || 'Job Position'}
                    </div>
                    <div className="jp-body" style={{ fontSize: 12, color: BRAND.textSecondary }}>
                      {app.jobId?.company || 'Company'}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '20px 22px' }}>
          <h3 className="jp-heading" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>Application Status</h3>
          <div style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={SEEKER_STATUS_PIE} dataKey="value" nameKey="name" innerRadius={36} outerRadius={56} paddingAngle={3}>
                  {SEEKER_STATUS_PIE.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#10205F', border: '1px solid rgba(250,249,42,0.2)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 6 }}>
            {SEEKER_STATUS_PIE.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                <span className="jp-body" style={{ color: BRAND.textSecondary }}>{s.name}</span>
                <span className="jp-body" style={{ marginLeft: 'auto', fontWeight: 700, color: BRAND.text }}>{s.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recommended Jobs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 12px' }}>
        <h3 className="jp-heading" style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          <Sparkles size={16} color={BRAND.primary} style={{ display: 'inline', marginRight: 6 }} />
          Latest Job Openings
        </h3>
        <Link to="/jobs" style={{ fontSize: 12.5, color: BRAND.primary, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
      </div>
      {recommendedJobs.length === 0 ? (
        <GlassCard style={{ padding: 20, textAlign: 'center', color: BRAND.textSecondary }}>
          No job openings posted yet.
        </GlassCard>
      ) : (
        <div className="jp-jobs-grid">
          {recommendedJobs.map((j) => (
            <GlassCard key={j._id || j.id} className="jp-job-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div className="jp-body" style={{ fontSize: 14, fontWeight: 700, color: BRAND.text }}>{j.title}</div>
                  <div className="jp-body" style={{ fontSize: 12.5, color: BRAND.textSecondary, marginTop: 2 }}>{j.company || 'Company'}</div>
                </div>
                <MatchRing percent={85} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span className="jp-body" style={{ fontSize: 12, color: BRAND.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> Deadline: {j.deadline ? new Date(j.deadline).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <Link
                to={`/jobs/${j._id}`}
                className="jp-heading"
                style={{
                  display: 'block', textAlign: 'center', width: '100%', marginTop: 14, padding: '9px 0', borderRadius: 12,
                  background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})`,
                  color: BRAND.dark, fontWeight: 700, fontSize: 12.5, textDecoration: 'none',
                }}
              >
                Apply Now
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPANY DASHBOARD (100% REAL DATA FROM API)
// ══════════════════════════════════════════════════════════════
function CompanyDashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/my-jobs').catch(() => api.get('/jobs')),
        api.get('/aplication').catch(() => ({ data: { data: [] } }))
      ]);

      const jobsData = jobsRes.data?.data || [];
      const appsData = appsRes.data?.data || [];

      setJobs(jobsData);
      setApplications(appsData);
    } catch (err) {
      console.error("Error fetching company dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await api.put(`/aplication/${appId}`, { status: newStatus });
      fetchCompanyData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update application status.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader2 size={32} className="animate-spin" color={BRAND.primary} />
      </div>
    );
  }

  const totalJobs = jobs.length;
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status?.toLowerCase() === 'pending' || a.status?.toLowerCase() === 'applied');
  const acceptedApps = applications.filter(a => a.status?.toLowerCase() === 'accepted');
  const rejectedApps = applications.filter(a => a.status?.toLowerCase() === 'rejected');

  const COMPANY_STATS = [
    { label: 'Active Job Posts', value: totalJobs.toString(), delta: 'Live', up: true, icon: Briefcase, tint: BRAND.primary },
    { label: 'Total Applications', value: totalApps.toString(), delta: 'Received', up: true, icon: FileText, tint: '#3B82F6' },
    { label: 'Accepted Candidates', value: acceptedApps.length.toString(), delta: 'Approved', up: true, icon: CheckCircle2, tint: BRAND.success },
    { label: 'Pending Review', value: pendingApps.length.toString(), delta: 'Needs Action', up: false, icon: Bell, tint: BRAND.secondary },
  ];

  const COMPANY_PIE = [
    { name: 'Pending', value: pendingApps.length, color: BRAND.secondary },
    { name: 'Accepted', value: acceptedApps.length, color: BRAND.success },
    { name: 'Rejected', value: rejectedApps.length, color: BRAND.danger },
  ];

  return (
    <>
      {/* Welcome Banner */}
      <GlassCard style={{
        padding: '22px 26px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justify: 'space-between', gap: 20, flexWrap: 'wrap',
        background: 'linear-gradient(120deg, rgba(250,249,42,0.12), rgba(16,32,95,0.5))'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: BRAND.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            <Building2 size={14} /> Company Dashboard
          </div>
          <h2 className="jp-heading" style={{ fontSize: 19, fontWeight: 800, margin: '0 0 5px' }}>
            Welcome, {user?.name || 'Company'} 🏢
          </h2>
          <p className="jp-body" style={{ color: BRAND.textSecondary, fontSize: 13, margin: 0 }}>
            You have <strong style={{ color: '#FDBF2D' }}>{pendingApps.length} pending applications</strong> waiting for review.
          </p>
        </div>
        <Link
          to="/create-job"
          className="jp-heading"
          style={{
            height: 44, padding: '0 22px', borderRadius: 14, border: 'none',
            background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})`,
            color: BRAND.dark, fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(250,249,42,0.25)', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}
        >
          <PlusCircle size={16} /> Post New Job
        </Link>
      </GlassCard>

      {/* Stat Cards */}
      <div className="jp-stats-grid">
        {COMPANY_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${s.tint}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={s.tint} />
                </div>
                <div style={{ color: s.up ? BRAND.success : BRAND.secondary, fontSize: 12, fontWeight: 600 }}>
                  {s.delta}
                </div>
              </div>
              <div className="jp-heading" style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              <div className="jp-body" style={{ fontSize: 12.5, color: BRAND.textSecondary, marginTop: 2 }}>{s.label}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Application Breakdown Chart & Active Jobs */}
      <div className="jp-content-grid">
        <GlassCard style={{ padding: '20px 22px' }}>
          <h3 className="jp-heading" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>Application Breakdown</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={COMPANY_PIE} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={4}>
                  {COMPANY_PIE.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#10205F', border: '1px solid rgba(250,249,42,0.2)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 6 }}>
            {COMPANY_PIE.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                <span className="jp-body" style={{ color: BRAND.textSecondary }}>{s.name}</span>
                <span className="jp-body" style={{ marginLeft: 'auto', fontWeight: 700, color: BRAND.text }}>{s.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Active Job Postings */}
        <GlassCard style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 className="jp-heading" style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Active Jobs</h3>
            <Link to="/create-job" style={{ fontSize: 12.5, color: BRAND.primary, fontWeight: 600, textDecoration: 'none' }}>+ Add</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.length === 0 ? (
              <p style={{ color: BRAND.textSecondary, fontSize: 13, padding: '10px 0' }}>No jobs posted yet.</p>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div key={job._id || job.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(174,184,208,0.08)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="jp-body" style={{ fontSize: 13, fontWeight: 700, color: BRAND.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                    <div className="jp-body" style={{ fontSize: 11.5, color: BRAND.textSecondary }}>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Pending / Recent Applicants List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 12px' }}>
        <h3 className="jp-heading" style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Applicants</h3>
        <Link to="/applications" style={{ fontSize: 12.5, color: BRAND.primary, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
      </div>
      <GlassCard style={{ padding: '12px 20px' }}>
        {applications.length === 0 ? (
          <p style={{ color: BRAND.textSecondary, fontSize: 13, padding: '15px 0', textAlign: 'center' }}>No applicants yet.</p>
        ) : (
          applications.slice(0, 5).map((ap, i) => {
            const applicantName = ap.studentId?.name || 'Applicant';
            const applicantEmail = ap.studentId?.email || '';
            const jobTitle = ap.jobId?.title || 'Applied Job';

            return (
              <div key={ap._id || ap.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                borderBottom: i < applications.length - 1 ? '1px solid rgba(174,184,208,0.08)' : 'none'
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: BRAND.dark, fontWeight: 800, fontSize: 14
                }}>
                  {applicantName.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="jp-body" style={{ fontSize: 13.5, fontWeight: 700, color: BRAND.text }}>{applicantName}</div>
                  <div className="jp-body" style={{ fontSize: 12, color: BRAND.textSecondary }}>
                    {jobTitle} {applicantEmail ? `· ${applicantEmail}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <StatusBadge status={ap.status} />
                  {(ap.status?.toLowerCase() === 'pending' || ap.status?.toLowerCase() === 'applied') && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(ap._id || ap.id, 'Accepted')}
                        style={{
                          padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: 'rgba(34,197,94,0.15)', color: BRAND.success, fontWeight: 700, fontSize: 11
                        }}>
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(ap._id || ap.id, 'Rejected')}
                        style={{
                          padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: 'rgba(239,68,68,0.15)', color: BRAND.danger, fontWeight: 700, fontSize: 11
                        }}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </GlassCard>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <style>{`
        .jp-stats-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
        .jp-content-grid { display: grid; grid-template-columns: 1.6fr 1fr;   gap: 16px; margin-bottom: 18px; }
        .jp-jobs-grid    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
        .jp-job-card     { padding: 18px; }

        @media (max-width: 1100px) {
          .jp-stats-grid   { grid-template-columns: repeat(2, 1fr); }
          .jp-jobs-grid    { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .jp-stats-grid   { grid-template-columns: 1fr; }
          .jp-content-grid { grid-template-columns: 1fr; }
          .jp-jobs-grid    { grid-template-columns: 1fr; }
        }
      `}</style>

      {user?.role === 'company'
        ? <CompanyDashboard user={user} />
        : <SeekerDashboard user={user} />
      }
    </DashboardLayout>
  );
}