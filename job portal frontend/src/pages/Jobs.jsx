import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import SkeletonGrid from '../components/SkeletonGrid';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme, themeTokens } from '../context/ThemeContext';
import DashboardLayout from '../layout/DashboardLayout';
import HomeJobs from '../homejobs/HomeJobs';
import JobDetails from '../pages/JobDetails';


export default function Jobs() {
  const { user } = useAuth();
  const { theme, tokens: contextTokens } = useTheme();
  const tokens = user ? contextTokens : themeTokens.navy;
  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.data && res.data.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  // If user is logged out (guest), render the dedicated guest HomeJobs page!
  if (!user) {
    return <HomeJobs />;
  }

  const filteredJobs = jobs.filter((job) => {
    if (job.status === 'terminated') return false;

    const matchesSearch =
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const jobsContent = (
    <div className="w-full flex flex-col justify-between font-sans min-h-screen" style={{ background: tokens.bg, color: tokens.text }}>
      <main className="flex-1 max-w-7xl w-full mx-auto py-2">

        {/* Banner Section */}
        <div
          className="rounded-3xl p-8 md:p-10 mb-8 border relative overflow-hidden shadow-xl transition-all duration-300"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
              : isDark
                ? 'linear-gradient(135deg, #242427 0%, #1C1C1E 100%)'
                : 'linear-gradient(135deg, #10205F 0%, #06124A 100%)',
            borderColor: tokens.border
          }}
        >
          <div className="max-w-2xl relative z-10">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border"
              style={{
                background: tokens.brandTagBg,
                color: tokens.brandTagText,
                borderColor: tokens.border
              }}
            >
              Job Listings
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight" style={{ color: tokens.text }}>
              Explore Available <span style={{ color: tokens.accent }}>Opportunities</span>
            </h1>
            <p className="text-sm md:text-base mt-2" style={{ color: tokens.textMuted }}>
              Discover your next career step with top verified tech companies & startups.
            </p>
          </div>
          <div
            className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: tokens.accent }}
          />
        </div>

        {/* Search Bar */}
        <div
          className="p-4 rounded-2xl border shadow-xl mb-8 flex flex-col md:flex-row gap-4 transition-all duration-300"
          style={{
            background: tokens.card,
            borderColor: tokens.border
          }}
        >
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-4" size={20} style={{ color: tokens.textMuted }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company, or keyword..."
              className="w-full border rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all"
              style={{
                background: tokens.inputBg,
                borderColor: tokens.border,
                color: tokens.text
              }}
            />
          </div>
          <button
            onClick={fetchJobs}
            className="font-bold px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 shadow-lg"
            style={{
              background: tokens.accent,
              color: tokens.accentDark
            }}
          >
            Search Jobs
          </button>
        </div>

        {/* Notification Toast */}
        {applySuccess && (
          <div className="mb-6 p-4 bg-[#22C55E]/15 border border-[#22C55E]/40 rounded-xl flex items-center gap-3 text-[#22C55E] font-medium text-sm animate-fadeIn">
            <CheckCircle size={20} />
            <span>{applySuccess}</span>
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title="No jobs found matching your search"
            message="Try clearing filters or searching for different keywords."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={{ ...job, onDetails: (id) => navigate(`/jobs/${id}`) }}
                onApply={handleApply}
                applying={applyingJobId === job._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );

  return (
    <DashboardLayout>
      {jobsContent}
    </DashboardLayout>
  );
}
