import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, AlertCircle, Wrench, Building2, CheckCircle } from 'lucide-react';
import { LogoMark } from '../brand';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ROLE_INFO = {
  student: {
    label: 'Job Seeker',
    icon: User,
  },
  company: {
    label: 'Employer / Company',
    icon: Building2,
  },
};

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [skillsInput, setSkillsInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const skillsArray = role === 'student'
      ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const userData = { name, email, password, role, skills: skillsArray };

    const res = await register(userData);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Tab Toggle */}
          <div className="bg-[#10205F]/90 border border-white/10 rounded-2xl p-1 flex items-center mb-6 backdrop-blur-md">
            <Link
              to="/login"
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-[#AEB8D0] hover:text-white transition-all text-center"
            >
              Login
            </Link>
            <button
              type="button"
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#FAF92A] text-[#06124A] shadow-md transition-all"
            >
              Sign Up
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-[#10205F]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FAF92A]/8 rounded-full blur-3xl pointer-events-none"></div>

            {/* Branding Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <LogoMark size={48} />
              <h1 className="text-2xl font-extrabold tracking-tight mt-3 text-white">
                Create Your <span className="text-[#FAF92A]">Account</span>
              </h1>
              <p className="text-xs text-[#AEB8D0] mt-1">Choose your account type to get started</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-center gap-3 text-red-300 text-sm">
                <AlertCircle size={18} className="shrink-0 text-[#EF4444]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* ─── ROLE SELECTOR ─── */}
              <div>
                <label className="text-xs font-semibold text-[#AEB8D0] mb-2 block uppercase tracking-wider">
                  I want to join as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ROLE_INFO).map(([key, info]) => {
                    const Icon = info.icon;
                    const isSelected = role === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRole(key)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-[#FAF92A] bg-[#FAF92A]/10 shadow-lg shadow-[#FAF92A]/10'
                            : 'border-white/10 bg-[#08153D]/60 hover:border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle size={16} className="text-[#FAF92A]" />
                          </div>
                        )}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-[#FAF92A] text-[#06124A]' : 'bg-[#10205F] text-[#AEB8D0]'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#AEB8D0]'}`}>
                          {info.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Name Field ─── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#AEB8D0]">
                  {role === 'company' ? 'Company Name *' : 'Full Name *'}
                </label>
                <div className="relative flex items-center">
                  {role === 'company' ? (
                    <Building2 size={17} className="absolute left-4 text-[#AEB8D0]" />
                  ) : (
                    <User size={17} className="absolute left-4 text-[#AEB8D0]" />
                  )}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'company' ? 'e.g. TechSolutions Inc.' : 'e.g. John Doe'}
                    required
                    className="w-full bg-[#08153D] border border-[#AEB8D0]/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                  />
                </div>
              </div>

              {/* ─── Email Field ─── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#AEB8D0]">Email Address *</label>
                <div className="relative flex items-center">
                  <Mail size={17} className="absolute left-4 text-[#AEB8D0]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-[#08153D] border border-[#AEB8D0]/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                  />
                </div>
              </div>

              {/* ─── Skills (Job Seeker only) ─── */}
              {role === 'student' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#AEB8D0]">
                    Your Skills <span className="text-[#AEB8D0]/50">(comma separated)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Wrench size={17} className="absolute left-4 text-[#AEB8D0]" />
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="React, JavaScript, Node.js, UI/UX Design..."
                      className="w-full bg-[#08153D] border border-[#AEB8D0]/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#AEB8D0]/50 pl-1">
                    Skills help match you to the best job opportunities.
                  </p>
                </div>
              )}

              {/* ─── Password Field ─── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#AEB8D0]">Password * (min. 6 characters)</label>
                <div className="relative flex items-center">
                  <Lock size={17} className="absolute left-4 text-[#AEB8D0]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full bg-[#08153D] border border-[#AEB8D0]/20 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#AEB8D0] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* ─── Submit ─── */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#FAF92A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-base"
              >
                {loading
                  ? 'Creating Account...'
                  : role === 'company'
                  ? '🏢 Create Employer Account'
                  : '🚀 Create Job Seeker Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-5 text-xs text-[#AEB8D0]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FAF92A] font-semibold hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
