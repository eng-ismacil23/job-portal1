import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Calendar, FileText, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';


export default function CreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.name || '');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !company || !description || !deadline) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/jobs', {
        title,
        company,
        description,
        deadline,
        createdBy: user?.id || user?._id,
      });

      setSuccess('Job listing published successfully!');
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create job.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  const createJobContent = (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-8 py-10">
        <div className="bg-[#10205F] border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#FAF92A] text-[#06124A] rounded-2xl">
              <PlusCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Post a New Job</h1>
              <p className="text-xs text-[#AEB8D0]">Fill out the details to publish a new career opportunity.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-center gap-3 text-red-300 text-sm">
              <AlertCircle size={18} className="shrink-0 text-[#EF4444]" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-[#22C55E]/15 border border-[#22C55E]/40 rounded-xl flex items-center gap-3 text-[#22C55E] text-sm">
              <CheckCircle size={18} className="shrink-0 text-[#22C55E]" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#AEB8D0]">Job Title</label>
              <div className="relative flex items-center">
                <Briefcase size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#AEB8D0]">Company Name</label>
              <div className="relative flex items-center">
                <Building size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechSolutions Inc."
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#AEB8D0]">Application Deadline</label>
              <div className="relative flex items-center">
                <Calendar size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#AEB8D0]">Job Description & Requirements</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe role responsibilities, qualifications, and benefits..."
                required
                className="w-full bg-[#08153D] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-base"
            >
              {loading ? 'Publishing...' : 'Publish Job Listing'}
            </button>

          </form>

        </div>
      </main>

    </div>
  );

  if(user){
    return(
    <DashboardLayout>
      {createJobContent}
    </DashboardLayout>
    )
  }
  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {createJobContent}
      </main>
      <Footer />
    </div>
  );
}
