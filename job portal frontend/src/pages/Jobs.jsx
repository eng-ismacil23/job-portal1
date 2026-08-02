import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Calendar, Building, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';


export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.data && res.data.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Fallback sample data if backend is offline/empty
      setJobs([
        {
          _id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechSolutions Inc.',
          description: 'Looking for an experienced React & Tailwind developer to build modern web applications.',
          deadline: '2026-08-15',
          createdBy: { name: 'TechSolutions' },
        },
        {
          _id: '2',
          title: 'UI/UX Designer',
          company: 'Creative Studio',
          description: 'Design intuitive interfaces and create engaging user experiences for mobile and web apps.',
          deadline: '2026-08-20',
          createdBy: { name: 'Creative Studio' },
        },
        {
          _id: '3',
          title: 'Full Stack Engineer',
          company: 'Global Corp',
          description: 'Architect scalable backend microservices and modern single page frontends using Node.js & React.',
          deadline: '2026-08-30',
          createdBy: { name: 'Global Corp' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplyingJobId(jobId);
    try {
      await api.post('/aplication', {
        jobId: jobId,
        studentId: user.id || user._id,
        status: 'applied',
      });
      setApplySuccess('Application submitted successfully!');
      setTimeout(() => setApplySuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      alert(msg);
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const jobsContent = (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        
        {/* Banner Section */}
        <div className="bg-[#10205F] rounded-3xl p-8 md:p-12 mb-10 border border-white/5 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="text-[#FAF92A] text-xs font-bold uppercase tracking-widest bg-[#08153D]/60 px-3 py-1 rounded-full border border-[#FAF92A]/30">
              Job Listings
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight">
              Explore Available <span className="text-[#FAF92A]">Opportunities</span>
            </h1>
            <p className="text-[#AEB8D0] text-sm md:text-base mt-2">
              Discover your next career step with top verified tech companies & startups.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#FAF92A]/10 rounded-full blur-3xl"></div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#10205F] p-4 rounded-2xl border border-white/10 shadow-xl mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-4 text-[#AEB8D0]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company, or keyword..."
              className="w-full bg-[#08153D] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
            />
          </div>
          <button
            onClick={fetchJobs}
            className="bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
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
          <div className="py-20 text-center text-[#AEB8D0]">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-[#10205F]/50 rounded-2xl p-12 text-center text-[#AEB8D0] border border-white/5">
            <p className="text-lg font-semibold text-white">No jobs found matching your search.</p>
            <p className="text-xs mt-1">Try clearing filters or searching for different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-[#10205F] border border-white/10 hover:border-[#FAF92A]/40 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-white hover:text-[#FAF92A] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#AEB8D0] mt-1">
                        <Building size={14} className="text-[#FAF92A]" />
                        <span>{job.company}</span>
                      </div>
                    </div>
                    <span className="bg-[#08153D] text-[#FAF92A] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#FAF92A]/20">
                      Full Time
                    </span>
                  </div>

                  <p className="text-xs text-[#AEB8D0] mt-4 line-clamp-3 leading-relaxed">
                    {job.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#AEB8D0]">
                    <Calendar size={14} />
                    <span>Deadline: {job.deadline ? job.deadline.substring(0, 10) : 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-xs font-semibold text-[#AEB8D0] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={applyingJobId === job._id}
                      className="bg-[#FAF92A] text-[#06124A] font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#FDBF2D] transition-colors shadow-md disabled:opacity-50"
                    >
                      {applyingJobId === job._id ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      
    </div>
  )

  if(user){
    return(
    <DashboardLayout>
      {jobsContent}
    </DashboardLayout>
    )
  }
  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {jobsContent}
      </main>
      <Footer />
    </div>
  );
}