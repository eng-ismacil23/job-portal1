import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Wrench, Building2, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-6">
        <div className="w-full max-w-[460px] bg-[#10205F]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden my-auto">
          
          {/* Background Glow */}
          <div className="absolute -top-20 -left-20 w-36 h-36 bg-[#FAF92A]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Branding */}
          <div className="flex flex-col items-center text-center mb-4">
            <LogoMark size={40} />
            <h1 className="text-xl font-extrabold tracking-tight mt-2 text-white">
              Create Your <span className="text-[#FAF92A]">Account</span>
            </h1>
            <p className="text-[11px] text-[#AEB8D0] mt-0.5">Select role to get started</p>

            {/* Compact Tab Switcher */}
            <div className="w-full bg-[#08153D] p-1 rounded-xl flex items-center mt-3 border border-white/10">
              <Link
                to="/login"
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-[#AEB8D0] hover:text-white transition-all text-center"
              >
                Login
              </Link>
              <button
                type="button"
                className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#FAF92A] text-[#06124A] shadow-md transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-center gap-2.5 text-red-300 text-xs">
              <AlertCircle size={16} className="shrink-0 text-[#EF4444]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* ─── ROLE SELECTOR ─── */}
            <div>
              <label className="text-[11px] font-semibold text-[#AEB8D0] mb-1.5 block uppercase tracking-wider">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(ROLE_INFO).map(([key, info]) => {
                  const Icon = info.icon;
                  const isSelected = role === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key)}
                      className={`relative p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                        isSelected
                          ? 'border-[#FAF92A] bg-[#FAF92A]/10 text-white font-bold'
                          : 'border-white/10 bg-[#08153D]/70 text-[#AEB8D0] hover:border-white/20'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#FAF92A] text-[#06124A]' : 'bg-[#10205F] text-[#AEB8D0]'
                      }`}>
                        <Icon size={15} />
                      </div>
                      <span className="text-xs font-semibold truncate">{info.label}</span>
                      {isSelected && (
                        <CheckCircle size={14} className="text-[#FAF92A] ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Name Field ─── */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#AEB8D0] uppercase tracking-wider">
                {role === 'company' ? 'Company Name *' : 'Full Name *'}
              </label>
              <div className="relative flex items-center">
                {role === 'company' ? (
                  <Building2 size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                ) : (
                  <User size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                )}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'company' ? 'e.g. TechSolutions Inc.' : 'e.g. John Doe'}
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            {/* ─── Email Field ─── */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#AEB8D0] uppercase tracking-wider">Email Address *</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            {/* ─── Skills (Job Seeker only) ─── */}
            {role === 'student' && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#AEB8D0] uppercase tracking-wider">
                  Skills <span className="text-[#AEB8D0]/50 lowercase">(comma separated)</span>
                </label>
                <div className="relative flex items-center">
                  <Wrench size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, JavaScript, Node.js, UI/UX..."
                    className="w-full bg-[#08153D] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                  />
                </div>
              </div>
            )}

            {/* ─── Password Field ─── */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#AEB8D0] uppercase tracking-wider">Password *</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#AEB8D0] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* ─── Submit ─── */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold py-3 rounded-xl shadow-lg hover:shadow-[#FAF92A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-sm"
            >
              {loading
                ? 'Creating Account...'
                : role === 'company'
                ? '🏢 Create Employer Account'
                : '🚀 Create Job Seeker Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4 text-xs text-[#AEB8D0]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FAF92A] font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
