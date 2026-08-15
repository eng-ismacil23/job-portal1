// home
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
        const res = await fetch('http://localhost:3001/users/companies');
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

  // 2. Fetch Dynamic Featured Jobs (Haddii backend-ku diyaar yahay)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:3001/jobs'); // Ku beddel API-gaaga shaqooyinka
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
          setFeaturedJobs(data.data.slice(0, 5)); // 5-ta ugu dambaysa
        } else {
          // Fallback static data haddii DB-ka shaqooyinku ka madhan yahay
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

        .jp-categories-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .jp-category-card { padding: 18px 14px; text-align: center; cursor: pointer; transition: transform .15s ease; }
        .jp-category-card:hover { transform: translateY(-3px); }

        .jp-content-split { display: grid; grid-template-columns: 1.7fr 1fr; gap: 24px; }
        .jp-job-row { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.02); margin-bottom: 10px; }
        .jp-company-row { display: flex; align-items: center; gap: 12px; padding: 12px 6px; }

        .jp-why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; }
        .jp-why-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #E5E9F5; }

        @media (max-width: 1080px) {
          .jp-hero { grid-template-columns: 1fr; }
          .jp-hero-visual { display: none; }
          .jp-categories-grid { grid-template-columns: repeat(3, 1fr); }
          .jp-content-split { grid-template-columns: 1fr; }
        }

        @media (max-width: 760px) {
          .jp-hero, .jp-section { padding-left: 20px; padding-right: 20px; }
          .jp-hero h1 { font-size: 32px; }
          .jp-search-bar { flex-direction: column; align-items: stretch; }
          .jp-search-divider { display: none; }
          .jp-categories-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="jp-glow" style={{ width: 340, height: 340, background: BRAND.primary, filter: 'blur(150px)', opacity: 0.12, top: -100, right: -60 }} />
      <div className="jp-glow" style={{ width: 300, height: 300, background: BRAND.secondary, filter: 'blur(150px)', opacity: 0.08, top: 500, left: -80 }} />

      <Navbar />

      {/* Hero Section */}
      <section className="jp-hero">
        <div>
          <div className="jp-hero-eyebrow jp-body">
            <Bell size={13} /> New Job Match Every Day
          </div>
          <h1 className="jp-heading">
            Find Your <span style={{ color: BRAND.primary }}>Dream Career</span>
          </h1>
          <p className="jp-body">
            Thousands of jobs. Top companies. Your future starts here — powered by AI matching that connects you to roles built for your skills.
          </p>

          {/* Dynamic Search Form */}
          <form onSubmit={handleSearch}>
            <GlassCard className="jp-search-bar">
              <div className="jp-search-field jp-body">
                <Search size={16} color={BRAND.primary} />
                <input
                  type="text"
                  placeholder="Job title, keyword, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="jp-search-divider" />
              <div className="jp-search-field jp-body">
                <MapPin size={16} color={BRAND.primary} />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="jp-heading"
                style={{
                  height: 44, padding: '0 22px', borderRadius: 14, border: 'none',
                  background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})`,
                  color: BRAND.dark, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', flexShrink: 0,
                }}
              >
                Search Jobs
              </button>
            </GlassCard>
          </form>

          {/* Dynamic Popular Searches Tags */}
          <div className="jp-popular">
            <span className="jp-body" style={{ fontSize: 12.5, color: BRAND.textSecondary }}>Popular:</span>
            {POPULAR_SEARCHES.map((t) => (
              <span key={t} className="jp-tag jp-body" onClick={() => handleTagClick(t)}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="jp-hero-visual">
          <GlassCard style={{ position: 'absolute', top: 20, right: 10, padding: '14px 18px', width: 220, zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: BRAND.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={15} color="#fff" />
              </div>
              <span className="jp-heading" style={{ fontSize: 13, fontWeight: 700 }}>New Job Match!</span>
            </div>
            <div className="jp-body" style={{ fontSize: 12, color: BRAND.textSecondary }}>Frontend Developer</div>
            <div className="jp-body" style={{ fontSize: 12, color: BRAND.textSecondary }}>@ TechSolutions</div>
          </GlassCard>

          <GlassCard style={{ position: 'absolute', bottom: 40, left: 0, padding: '16px 20px', width: 240, zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${BRAND.primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={16} color={BRAND.primary} />
              </div>
              <div>
                <div className="jp-heading" style={{ fontSize: 13, fontWeight: 700 }}>Company Rating</div>
                <div className="jp-body" style={{ fontSize: 11.5, color: BRAND.textSecondary }}>4.8 out of 5</div>
              </div>
            </div>
          </GlassCard>

          <img
            src={heroIllustration}
            alt="Professional working on a laptop"
            style={{
              position: 'absolute',
              inset: '0px 20px 0px 20px',
              width: 'calc(100% - 40px)',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 24,
              border: '1px solid rgba(250,249,42,0.2)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
              zIndex: 1,
            }}
          />
        </div>
      </section>

      {/* Popular Categories */}
      <section className="jp-section">
        <div className="jp-section-head">
          <h2 className="jp-heading">Popular Categories</h2>
          <span className="jp-view-all jp-body" onClick={() => navigate('/jobs')}>
            View all <ChevronRight size={14} />
          </span>
        </div>
        <div className="jp-categories-grid">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <GlassCard key={c.label} className="jp-category-card" onClick={() => handleTagClick(c.label)}>
                <div style={{ width: 42, height: 42, margin: '0 auto 10px', borderRadius: 12, background: `${c.tint}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} color={c.tint} />
                </div>
                <div className="jp-heading" style={{ fontSize: 13.5, fontWeight: 700 }}>{c.label}</div>
                <div className="jp-body" style={{ fontSize: 11.5, color: BRAND.textSecondary, marginTop: 2 }}>{c.count}</div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Featured Jobs + Top Companies */}
      <section className="jp-section">
        <div className="jp-content-split">
          {/* Featured Jobs */}
          <div>
            <div className="jp-section-head">
              <h2 className="jp-heading">Featured Jobs</h2>
              <span className="jp-view-all jp-body" onClick={() => navigate('/jobs')}>
                View all <ChevronRight size={14} />
              </span>
            </div>
            <GlassCard style={{ padding: 18 }}>
              {loadingJobs ? (
                <div className="jp-body" style={{ textAlign: 'center', padding: '16px', color: BRAND.textSecondary }}>Loading jobs...</div>
              ) : (
                featuredJobs.map((j) => {
                  const role = j.title || j.role || 'Software Engineer';
                  const companyName = j.company?.name || j.company || 'Tech Company';
                  const salary = j.salary || '$100k - $130k';
                  const tags = j.tags || [j.jobType || 'Full Time', j.location || 'Remote'];
                  const tint = j.tint || BRAND.primary;
                  const initial = j.initial || companyName.charAt(0).toUpperCase();

                  return (
                    <div key={j._id} className="jp-job-row">
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${tint}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="jp-heading" style={{ color: tint, fontWeight: 800, fontSize: 16 }}>{initial}</span>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="jp-body" style={{ fontSize: 14.5, fontWeight: 700, color: BRAND.text }}>{role}</div>
                        <div className="jp-body" style={{ fontSize: 12.5, color: BRAND.textSecondary, marginTop: 2 }}>{companyName}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          {tags.map((t, idx) => (
                            <span key={idx} className="jp-body" style={{ fontSize: 11, color: BRAND.textSecondary, border: '1px solid rgba(174,184,208,0.2)', borderRadius: 20, padding: '2px 9px' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="jp-body" style={{ fontSize: 13, fontWeight: 700, color: BRAND.primary, marginBottom: 8 }}>{salary}</div>
                        <button
                          onClick={() => handleApplyNow(j._id)}
                          className="jp-heading"
                          style={{
                            padding: '8px 18px', borderRadius: 12, border: 'none',
                            background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary})`,
                            color: BRAND.dark, fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                          }}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </GlassCard>
          </div>

          {/* Dynamic Top Companies */}
          <div>
            <div className="jp-section-head">
              <h2 className="jp-heading" style={{ fontSize: 18 }}>Top Companies</h2>
              <span className="jp-view-all jp-body" onClick={() => navigate('/companies')}>
                View all <ChevronRight size={14} />
              </span>
            </div>
            <GlassCard style={{ padding: '8px 18px' }}>
              {loadingCompanies ? (
                <div className="jp-body" style={{ padding: '16px', textAlign: 'center', color: BRAND.textSecondary, fontSize: 13 }}>
                  Loading companies...
                </div>
              ) : topCompanies.length === 0 ? (
                <div className="jp-body" style={{ padding: '16px', textAlign: 'center', color: BRAND.textSecondary, fontSize: 13 }}>
                  No companies found.
                </div>
              ) : (
                topCompanies.map((c, i) => {
                  const name = c.name || 'Company';
                  const initial = c.initial || name.charAt(0).toUpperCase();
                  const tint = c.tint || BRAND.primary;
                  const jobsText = c.jobs || 'Active';

                  return (
                    <div key={c._id || name + i} className="jp-company-row" style={{ borderBottom: i < topCompanies.length - 1 ? '1px solid rgba(174,184,208,0.1)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tint}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="jp-heading" style={{ color: tint, fontWeight: 800, fontSize: 14 }}>{initial}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <div className="jp-body" style={{ fontSize: 13.5, fontWeight: 600, color: BRAND.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      </div>
                      <span className="jp-body" style={{ fontSize: 12, color: BRAND.textSecondary, flexShrink: 0 }}>{jobsText}</span>
                    </div>
                  );
                })
              )}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Why JobPortal */}
      <section className="jp-section">
        <GlassCard style={{ padding: '26px 30px' }}>
          <h2 className="jp-heading" style={{ fontSize: 18, fontWeight: 800, margin: '0 0 18px' }}>Why JobPortal?</h2>
          <div className="jp-why-grid">
            {WHY_JOBPORTAL.map((w) => (
              <div key={w} className="jp-why-item jp-body">
                <CheckCircle2 size={16} color={BRAND.success} style={{ flexShrink: 0 }} />
                {w}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <Footer />
    </div>
  );
}