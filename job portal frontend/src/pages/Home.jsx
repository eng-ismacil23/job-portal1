import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Palette,
  Megaphone,
  Percent,
  Globe2,
  GraduationCap,
  Bell,
  CheckCircle2,
  Star,
  ChevronRight,
} from 'lucide-react';
import { BRAND, GlobalStyles } from '../theme';
import GlassCard from '../components/GlassCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import heroIllustration from '../assets/hero-illustration.jpeg';
import { API_BASE_URL } from '../services/api';

const POPULAR_SEARCHES = ['Developer', 'Designer', 'Marketing', 'Remote', 'Frontend'];

const CATEGORIES = [
  { label: 'Development', count: '12,540 Jobs', icon: Briefcase, tint: '#3B82F6' },
  { label: 'Design', count: '4,870 Jobs', icon: Palette, tint: '#EC4899' },
  { label: 'Marketing', count: '3,210 Jobs', icon: Megaphone, tint: '#F97316' },
  { label: 'Sales', count: '2,840 Jobs', icon: Percent, tint: BRAND.success },
  { label: 'Remote', count: '10,230 Jobs', icon: Globe2, tint: '#06B6D4' },
  { label: 'Internship', count: '1,320 Jobs', icon: GraduationCap, tint: BRAND.secondary },
];

const WHY_JOBPORTAL = [
  'Find Your Dream Career',
  'Work Without Limits',
  'Hire Smarter',
  'Connecting Talent With Opportunity',
  'Your Career Starts Today',
  'Discover Better Jobs',
];

export default function HomePage() {
  const navigate = useNavigate();

  // Dynamic States
  const [topCompanies, setTopCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');

  // 1. Fetch Top Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/companies`);
        const data = await res.json();
        
        if (data.data) {
          setTopCompanies(data.data);
        } else if (Array.isArray(data)) {
          setTopCompanies(data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // 2. Fetch Dynamic Featured Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`);
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
          const activeJobs = data.data.filter(j => j.status !== 'terminated');
          setFeaturedJobs(activeJobs.slice(0, 5));
        } else {
          setFeaturedJobs([
            { _id: '1', role: 'Senior Frontend Developer', company: 'TechSolutions Inc.', tags: ['Remote', 'Full Time'], salary: '$120k - $160k', initial: 'T', tint: '#3B82F6' },
            { _id: '2', role: 'UI/UX Designer', company: 'Creative Studio', tags: ['Full Time', 'On-site'], salary: '$80k - $110k', initial: 'C', tint: '#EC4899' },
            { _id: '3', role: 'Backend Engineer', company: 'Global Corp', tags: ['Hybrid', 'Full Time'], salary: '$100k - $140k', initial: 'G', tint: BRAND.success },
          ]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle Dynamic Search Action
  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm) query.append('search', searchTerm);
    if (locationTerm) query.append('location', locationTerm);
    
    navigate(`/jobs?${query.toString()}`);
  };

  // Handle Tag Click Action
  const handleTagClick = (tag) => {
    navigate(`/jobs?search=${encodeURIComponent(tag)}`);
  };

  // Handle Apply Now Click
  const handleApplyNow = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="jp-home">
      <GlobalStyles />
      <style>{`
        .jp-home {
          min-height: 100vh;
          background: linear-gradient(160deg, #06124A 0%, #08153D 45%, #000B29 100%);
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .jp-glow { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }

        /* Hero */
        .jp-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; padding: 24px 48px 56px; position: relative; z-index: 1; }
        .jp-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(250,249,42,0.1); border: 1px solid rgba(250,249,42,0.25);
          color: #FAF92A; font-size: 12.5px; font-weight: 700; padding: 6px 14px; border-radius: 20px; margin-bottom: 18px;
        }
        .jp-hero h1 { font-size: 44px; font-weight: 800; line-height: 1.15; margin: 0 0 16px; }
        .jp-hero p { font-size: 15.5px; color: #AEB8D0; max-width: 460px; margin: 0 0 28px; line-height: 1.6; }

        .jp-search-bar { display: flex; align-items: center; gap: 10px; padding: 8px; }
        .jp-search-field { display: flex; align-items: center; gap: 10px; flex: 1; padding: 6px 10px; color: #AEB8D0; font-size: 13.5px; }
        .jp-search-field input {
          background: transparent;
          border: none;
          outline: none;
          color: #FFFFFF;
          width: 100%;
          font-size: 13.5px;
        }
        .jp-search-field input::placeholder { color: #8A96B0; }
        .jp-search-divider { width: 1px; height: 26px; background: rgba(174,184,208,0.2); }

        .jp-popular { display: flex; align-items: center; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .jp-tag {
          font-size: 12.5px; color: #AEB8D0; padding: 6px 14px; border-radius: 20px;
          border: 1px solid rgba(174,184,208,0.2); cursor: pointer; transition: all .15s ease;
        }
        .jp-tag:hover { border-color: #FAF92A; color: #FAF92A; }

        .jp-hero-visual { position: relative; height: 380px; }

        /* Sections */
        .jp-section { padding: 8px 48px 56px; position: relative; z-index: 1; }
        .jp-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .jp-section-head h2 { font-size: 22px; font-weight: 800; margin: 0; }
        .jp-view-all { font-size: 13px; color: #FAF92A; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <section className="jp-hero">
        <div>
          <div className="jp-hero-eyebrow">
            <Star size={14} fill="#FAF92A" /> Over 10,000+ Active Jobs Available
          </div>
          <h1>
            Find Your <span style={{ color: BRAND.primary }}>Dream Job</span> With Confidence
          </h1>
          <p>
            Connect with top verified employers, showcase your skills, and apply to thousands of career-defining roles in seconds.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch}>
            <GlassCard className="jp-search-bar" style={{ borderRadius: 20 }}>
              <div className="jp-search-field">
                <Search size={18} style={{ color: BRAND.primary }} />
                <input
                  type="text"
                  placeholder="Job title, keyword, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="jp-search-divider" />
              <div className="jp-search-field">
                <MapPin size={18} style={{ color: BRAND.primary }} />
                <input
                  type="text"
                  placeholder="City, country, or remote..."
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                  color: BRAND.dark,
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 20px rgba(250, 249, 42, 0.3)',
                }}
              >
                Find Jobs
              </button>
            </GlassCard>
          </form>

          {/* Popular searches */}
          <div className="jp-popular">
            <span style={{ fontSize: 12.5, color: '#8A96B0', fontWeight: 600 }}>Popular:</span>
            {POPULAR_SEARCHES.map((tag) => (
              <span key={tag} className="jp-tag" onClick={() => handleTagClick(tag)}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Visual Illustration */}
        <div className="jp-hero-visual flex items-center justify-center">
          <img
            src={heroIllustration}
            alt="Hero Illustration"
            className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="jp-section">
        <div className="jp-section-head">
          <h2>Browse By Category</h2>
          <span className="jp-view-all" onClick={() => navigate('/jobs')}>
            View All Categories <ChevronRight size={16} />
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
          {CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <GlassCard
                key={idx}
                style={{
                  padding: '20px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderRadius: 18,
                  transition: 'transform 0.2s',
                }}
                onClick={() => handleTagClick(cat.label)}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${cat.tint}22`,
                    color: cat.tint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <IconComponent size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: '#AEB8D0' }}>{cat.count}</div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="jp-section">
        <div className="jp-section-head">
          <h2>Featured Job Openings</h2>
          <span className="jp-view-all" onClick={() => navigate('/jobs')}>
            Explore All Jobs <ChevronRight size={16} />
          </span>
        </div>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', color: '#AEB8D0', padding: '40px 0' }}>Loading jobs...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {featuredJobs.map((job) => (
              <GlassCard
                key={job._id}
                style={{
                  padding: 22,
                  borderRadius: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          objectFit: 'cover',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#06124A'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          background: `${job.tint || '#3B82F6'}22`,
                          color: job.tint || '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 16,
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        {job.initial || (job.company ? job.company.charAt(0).toUpperCase() : 'J')}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#FFFFFF' }}>{job.title || job.role}</div>
                      <div style={{ fontSize: 13, color: '#FAF92A', fontWeight: 600, marginTop: 2 }}>{job.company}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#AEB8D0', margin: '0 0 12px', lineHeight: 1.5 }} className="line-clamp-2">
                    {job.description || 'Join our growing team and build next-generation applications.'}
                  </p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#AEB8D0', border: '1px solid rgba(255,255,255,0.08)' }}>
                      👥 {job.positionsCount || 1} Vacancy
                    </span>
                    {job.deadline && (
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: 'rgba(250,249,42,0.1)', color: '#FAF92A', border: '1px solid rgba(250,249,42,0.2)' }}>
                        📅 {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    marginTop: 8
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                    {job.salary || 'Full Time'}
                  </span>
                  <button
                    onClick={() => handleApplyNow(job._id)}
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                      color: BRAND.dark,
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(250, 249, 42, 0.2)'
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}