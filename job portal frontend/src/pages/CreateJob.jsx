import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Calendar, FileText, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../layout/DashboardLayout';

export default function CreateJob() {
  const { user } = useAuth();
  const { theme, tokens } = useTheme();
  const isLight = theme === 'light';
  const isDarkCharcoal = theme === 'dark';
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.name || '');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [positionsCount, setPositionsCount] = useState(1);
  const [maxApplicants, setMaxApplicants] = useState(10);
  const [companyLogo, setCompanyLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Sawirku waa inuu ka yaraadaa 5MB.');
      return;
    }

    setUploadingLogo(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const res = await api.post('/api/upload', {
            image: reader.result,
            folder: 'company_logos'
          });
          if (res.data?.url) {
            setCompanyLogo(res.data.url);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to upload image.');
        } finally {
          setUploadingLogo(false);
        }
      };
    } catch (err) {
      setUploadingLogo(false);
      setError('Failed to read image file.');
    }
  };

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
        positionsCount: Number(positionsCount) || 1,
        maxApplicants: Number(maxApplicants) || 10,
        companyLogo,
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

  const inputStyle = {
    background: tokens.inputBg,
    borderColor: tokens.border,
    color: tokens.text,
  };

  const createJobContent = (
    <div className="w-full flex flex-col justify-between font-sans" style={{ background: tokens.bg, color: tokens.text }}>
      <main className="flex-1 max-w-2xl w-full mx-auto py-2">
        <div className="border rounded-3xl p-8 shadow-xl transition-all" style={{ background: tokens.card, borderColor: tokens.border }}>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl shrink-0" style={{ background: tokens.brandTagBg, color: tokens.brandTagText }}>
              <PlusCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: tokens.text }}>Post a New Job</h1>
              <p className="text-xs" style={{ color: tokens.textMuted }}>Fill out the details to publish a new career opportunity.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-center gap-3 text-[#EF4444] text-sm">
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
              <label className="text-xs font-semibold" style={{ color: tokens.textMuted }}>Job Title</label>
              <div className="relative flex items-center">
                <Briefcase size={18} className="absolute left-4" style={{ color: tokens.textMuted }} />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                  className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: tokens.textMuted }}>Company Name</label>
              <div className="relative flex items-center">
                <Building size={18} className="absolute left-4" style={{ color: tokens.textMuted }} />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechSolutions Inc."
                  required
                  className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Company Logo / Job Image Upload */}
            <div className="border border-dashed p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4" style={{ borderColor: tokens.border }}>
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center font-bold" style={{ background: tokens.inputBg, borderColor: tokens.border }}>
                {companyLogo ? (
                  <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building size={20} style={{ color: tokens.textMuted }} />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: tokens.text }}>Company Logo / Job Banner (Cloudinary)</h4>
                <p className="text-xs" style={{ color: tokens.textMuted }}>Upload company logo or job preview image</p>
              </div>
              <label className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all hover:scale-105" style={{ background: tokens.brandTagBg, color: tokens.brandTagText, borderColor: tokens.border }}>
                {uploadingLogo ? 'Uploading...' : 'Choose Image'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: tokens.textMuted }}>
                  Inta qof ee loo baahanyahay (Vacancies)
                </label>
                <input
                  type="number"
                  min="1"
                  value={positionsCount}
                  onChange={(e) => setPositionsCount(e.target.value)}
                  placeholder="e.g. 2"
                  required
                  className="w-full border rounded-xl py-3 px-4 text-sm outline-none transition-all"
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: tokens.textMuted }}>
                  Max Codsadayaal (Applicant Limit)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxApplicants}
                  onChange={(e) => setMaxApplicants(e.target.value)}
                  placeholder="e.g. 15"
                  required
                  className="w-full border rounded-xl py-3 px-4 text-sm outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: tokens.textMuted }}>Application Deadline</label>
              <div className="relative flex items-center">
                <Calendar size={18} className="absolute left-4" style={{ color: tokens.textMuted }} />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: tokens.textMuted }}>Job Description & Requirements</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe role responsibilities, qualifications, and benefits..."
                required
                className="w-full border rounded-xl p-4 text-sm outline-none transition-all resize-none"
                style={inputStyle}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-base"
              style={{
                background: tokens.accent,
                color: tokens.accentDark
              }}
            >
              {loading ? 'Publishing...' : 'Publish Job Listing'}
            </button>

          </form>

        </div>
      </main>

    </div>
  );

  if (user) {
    return (
      <DashboardLayout>
        {createJobContent}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans" style={{ background: tokens.bg, color: tokens.text }}>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {createJobContent}
      </main>
      <Footer />
    </div>
  );
}
