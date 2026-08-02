import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LogoMark, BRAND } from '../brand';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[#10205F]/90 backdrop-blur-xl border border-[#10205F] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Glow Background Element */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FAF92A]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header & Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <LogoMark size={54} />
            <h1 className="text-2xl font-extrabold tracking-tight mt-3 text-white">
              Job<span className="text-[#FAF92A]">Portal</span>
            </h1>
            <p className="text-xs text-[#AEB8D0] mt-1 tracking-wider uppercase">
              Connect. Apply. Grow.
            </p>

            {/* Tab Toggle */}
            <div className="w-full bg-[#08153D] p-1 rounded-2xl flex items-center mt-6 border border-white/5">
              <button
                type="button"
                className="flex-1 py-2 text-sm font-semibold rounded-xl bg-[#FAF92A] text-[#06124A] shadow-md transition-all"
              >
                Login
              </button>
              <Link
                to="/register"
                className="flex-1 py-2 text-sm font-semibold rounded-xl text-[#AEB8D0] hover:text-white transition-all text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-6 p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-center gap-3 text-red-300 text-sm">
              <AlertCircle size={18} className="shrink-0 text-[#EF4444]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#AEB8D0]">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-[#08153D] border border-[#AEB8D0]/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#AEB8D0]">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-[#AEB8D0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#08153D] border border-[#AEB8D0]/20 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-[#AEB8D0]/50 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#AEB8D0] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#AEB8D0]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#FAF92A] bg-[#08153D] border-[#AEB8D0]/30"
                />
                <span>Remember me</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Password reset functionality is under maintenance."); }} className="text-[#FAF92A] hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#FAF92A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-base"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-[#AEB8D0]/20 flex-1"></div>
            <span className="text-xs text-[#AEB8D0]/70 uppercase tracking-wider">or continue with</span>
            <div className="h-px bg-[#AEB8D0]/20 flex-1"></div>
          </div>

          {/* Social Icons Placeholder */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => alert("Google Login demo")}
              className="flex items-center justify-center py-2.5 bg-[#08153D] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-medium"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => alert("LinkedIn Login demo")}
              className="flex items-center justify-center py-2.5 bg-[#08153D] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-medium"
            >
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => alert("Apple Login demo")}
              className="flex items-center justify-center py-2.5 bg-[#08153D] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-medium"
            >
              Apple
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6 text-xs text-[#AEB8D0]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#FAF92A] font-semibold hover:underline">
              Sign Up
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
