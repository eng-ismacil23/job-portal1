import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building, MapPin, Calendar, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';


export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data && res.data.data) {
        setJob(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      // Fallback detail
      setJob({
        _id: id,
        title: 'Senior Frontend Developer',
        company: 'TechSolutions Inc.',
        description: 'We are seeking a talented Senior Frontend Developer to lead front-end architecture, build high-performance user interfaces, and collaborate with product teams to ship slick customer experiences.',
        deadline: '2026-08-30',
        createdBy: { name: 'TechSolutions Admin' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    setErrorMsg('');
    try {
      await api.post('/aplication', {
        jobId: id,
        studentId: user.id || user._id,
        status: 'applied',
      });
      setSuccessMsg('Your application has been successfully submitted!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      setErrorMsg(msg);
    } finally {
      setApplying(false);
    }
  };

  const jobDetailsContent = (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#AEB8D0] hover:text-[#FAF92A] mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        {loading ? (
          <div className="py-20 text-center text-[#AEB8D0]">Loading job details...</div>
        ) : !job ? (
          <div className="bg-[#10205F] p-8 rounded-2xl text-center">Job not found.</div>
        ) : (
          <div className="bg-[#10205F] border border-white/10 rounded-3xl p-8 shadow-2xl relative">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="bg-[#FAF92A]/10 text-[#FAF92A] border border-[#FAF92A]/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Full Time Position
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold mt-3 text-white">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-[#AEB8D0] mt-2">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Building size={16} className="text-[#FAF92A]" /> {job.company}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> Deadline: {job.deadline ? job.deadline.substring(0, 10) : 'N/A'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={applying || !!successMsg}
                className="bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                {applying ? 'Submitting...' : successMsg ? 'Applied' : 'Apply Now'}
              </button>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mt-6 p-4 bg-[#22C55E]/15 border border-[#22C55E]/40 rounded-xl flex items-center gap-3 text-[#22C55E] text-sm font-medium">
                <CheckCircle size={20} />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mt-6 p-4 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl text-[#EF4444] text-sm">
                {errorMsg}
              </div>
            )}

            {/* Description */}
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Job Description</h3>
                <p className="text-sm text-[#AEB8D0] leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Requirements & Skills</h3>
                <ul className="list-disc list-inside text-sm text-[#AEB8D0] space-y-1">
                  <li>Minimum 2+ years experience in relevant tech domain</li>
                  <li>Strong problem solving and team collaboration skills</li>
                  <li>Proficiency with modern tools and frameworks</li>
                  <li>Good written and verbal communication</li>
                </ul>
              </div>
            </div>

          </div>
        )}
      </main>

    </div>
  );

  if(user){
    return(
    <DashboardLayout>
      {jobDetailsContent}
    </DashboardLayout>
    )
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