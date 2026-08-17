import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  Building,
  Users,
  ArrowRight,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Clock,
  CheckCircle,
  Globe
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

// Skill tag mappings based on job titles
const getSkillTagsForTitle = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('react')) {
    return ['React', 'TypeScript', 'Tailwind', 'JavaScript', 'HTML/CSS'];
  }
  if (t.includes('backend') || t.includes('node') || t.includes('express')) {
    return ['Node.js', 'Express.js', 'PostgreSQL', 'Docker', 'API'];
  }
  if (t.includes('full stack') || t.includes('web')) {
    return ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'];
  }
  if (t.includes('mobile') || t.includes('flutter') || t.includes('android') || t.includes('ios')) {
    return ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git'];
  }
  if (t.includes('ai') || t.includes('agent') || t.includes('automation') || t.includes('n8n')) {
    return ['AI Agents', 'n8n', 'Automation', 'APIs', 'JavaScript'];
  }
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) {
    return ['Figma', 'UI Design', 'UX Research', 'Prototyping'];
  }
  if (t.includes('devops') || t.includes('cloud') || t.includes('aws')) {
    return ['AWS', 'Docker', 'CI/CD', 'GitHub Actions', 'Linux'];
  }
  return ['JavaScript', 'Problem Solving', 'Git', 'Agile'];
};

// Badge type helper based on index or title
const getJobBadge = (job, index) => {
  if (job.status === 'terminated' || job.status === 'closed') {
    return { label: 'Closed', type: 'closed' };
  }
  const badges = [
    { label: 'Featured', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { label: 'New', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { label: 'Urgent', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    { label: 'Contract', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    { label: 'Part-time', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { label: 'Internship', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  ];
  return badges[index % badges.length];
};

export default function HomeJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedJobs, setSavedJobs] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs');
      if (res.data && res.data.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching guest jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (jobId) => {
    // Navigate directly to details page
    navigate(`/jobs/${jobId}`);
  };

  const toggleBookmark = (e, jobId) => {
    e.stopPropagation();
    setSavedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  // Filter jobs - exclude terminated jobs
  const filteredJobs = jobs.filter(job => {
    if (job.status === 'terminated') return false;

    const matchesSearch =
      !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !locationQuery ||
      (job.company && job.company.toLowerCase().includes(locationQuery.toLowerCase())) ||
      'mogadishu, somalia'.includes(locationQuery.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col font-sans selection:bg-[#FAF92A] selection:text-[#06124A]">
      {/* Guest Public Header Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">

        {/* Hero Banner Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0C1B54] via-[#10205F] to-[#08153D] border border-[#1E295E] p-8 md:p-12 mb-10 overflow-hidden shadow-2xl">
          {/* Subtle Glow backdrop circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FAF92A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF92A]/10 border border-[#FAF92A]/30 text-[#FAF92A] text-xs font-extrabold uppercase tracking-widest mb-4">
              <Sparkles size={14} /> Explore Verified Opportunities
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Find Your Next <span className="text-[#FAF92A]">Dream Job</span> Today
            </h1>

            <p className="text-[#AEB8D0] text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
              Browse top tech positions from leading companies. Apply seamlessly with standard profiles and kickstart your tech career in Somalia and remote worldwide.
            </p>

            {/* Search Controls Card */}
            <div className="bg-[#06124A]/90 border border-[#1E295E] p-3 rounded-2xl shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative flex items-center">
                <Search size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Job title, skills, or company..."
                  className="w-full bg-[#10205F]/60 border border-[#1E295E] text-white placeholder-[#8A97BD] text-xs md:text-sm rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>

              <div className="sm:col-span-4 relative flex items-center">
                <MapPin size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => { setLocationQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="City or Remote..."
                  className="w-full bg-[#10205F]/60 border border-[#1E295E] text-white placeholder-[#8A97BD] text-xs md:text-sm rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={() => fetchJobs()}
                  className="w-full h-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-black text-xs md:text-sm rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#FAF92A]/20"
                >
                  <Search size={16} /> Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              Available Positions <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF92A]/10 border border-[#FAF92A]/30 text-[#FAF92A]">{filteredJobs.length} Jobs</span>
            </h2>
            <p className="text-xs text-[#AEB8D0] mt-1">Discover latest openings and click card to view complete specifications.</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#0C183D] border border-[#1E295E] rounded-2xl p-6 h-72 animate-pulse flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1A2964] rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#1A2964] rounded w-3/4" />
                      <div className="h-3 bg-[#1A2964] rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-[#1A2964] rounded w-full" />
                  <div className="h-3 bg-[#1A2964] rounded w-5/6" />
                </div>
                <div className="h-10 bg-[#1A2964] rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div className="bg-[#0C183D] border border-[#1E295E] rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF92A]/10 text-[#FAF92A] flex items-center justify-center mx-auto mb-4 border border-[#FAF92A]/30">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Jobs Found</h3>
            <p className="text-xs text-[#AEB8D0] mb-6">We couldn't find any job matching your search criteria. Try clearing search filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setLocationQuery(''); }}
              className="bg-[#10205F] hover:bg-[#1E295E] text-[#FAF92A] text-xs font-bold px-6 py-2.5 rounded-xl border border-[#FAF92A]/40 transition-all"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          /* Jobs Card Grid - Styled EXACTLY like screenshot */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job, idx) => {
              const badge = getJobBadge(job, idx);
              const skills = getSkillTagsForTitle(job.title);
              const isSaved = !!savedJobs[job._id];
              const isRemote = job.description?.toLowerCase().includes('remote') || idx % 2 === 1;

              return (
                <div
                  key={job._id}
                  onClick={() => handleApplyClick(job._id)}
                  className="group relative bg-[#0B1739] hover:bg-[#0E1E4A] border border-[#1B2B65] hover:border-[#F97316]/60 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Logo + Badge + Bookmark */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="w-12 h-12 rounded-xl object-cover border border-[#1B2B65] bg-[#06124A]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10205F] to-[#0A1647] border border-[#1B2B65] text-[#F97316] font-black text-lg flex items-center justify-center shadow-md">
                            {(job.company || 'IT').substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        {/* Badge Pill */}
                        {badge && (
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => toggleBookmark(e, job._id)}
                        className={`p-2 rounded-xl transition-all ${isSaved ? 'text-[#F97316] bg-[#F97316]/10' : 'text-[#8A97BD] hover:text-white hover:bg-[#10205F]'
                          }`}
                      >
                        <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-black text-white group-hover:text-[#F97316] transition-colors line-clamp-1 mb-1">
                      {job.title}
                    </h3>

                    {/* Company & Location */}
                    <div className="flex items-center gap-2 text-xs text-[#AEB8D0] mb-3">
                      <span className="text-[#F97316] font-bold">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {isRemote ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Remote
                          </>
                        ) : (
                          <>
                            <MapPin size={13} className="text-[#AEB8D0]" /> Mogadishu, Somalia
                          </>
                        )}
                      </span>
                    </div>

                    {/* Vacancy & Max Applicants Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[#451A03]/60 text-[#F97316] border border-[#9A3412]/40 text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                        <Users size={13} /> {job.positionsCount || 1} Vacancy
                      </span>
                      <span className="bg-[#1E293B]/70 text-[#94A3B8] border border-[#334155]/60 text-xs px-3 py-1 rounded-lg font-medium">
                        Max: {job.maxApplicants || 10} Applicants
                      </span>
                    </div>

                    {/* Description snippet */}
                    <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed mb-4">
                      {job.description || 'Join our team to build and scale modern web applications.'}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#1E293B]/60 text-[#94A3B8] border border-[#334155]/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="pt-4 border-t border-[#1B2B65]/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#F97316] font-semibold">
                      <Calendar size={14} />
                      <span>
                        Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : '8/23/2026'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleApplyClick(job._id); }}
                      className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#F97316]/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-[#1B2B65] bg-[#0B1739] text-[#AEB8D0] hover:text-white hover:border-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${currentPage === page
                    ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-[#F97316]/30'
                    : 'bg-[#0B1739] text-[#AEB8D0] border-[#1B2B65] hover:border-[#F97316] hover:text-white'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-[#1B2B65] bg-[#0B1739] text-[#AEB8D0] hover:text-white hover:border-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </main>

      {/* Guest Public Footer */}
      <Footer />
    </div>
  );
}
