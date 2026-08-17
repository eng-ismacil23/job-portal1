import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LogoMark } from '../brand';
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

      <main className="flex-1 flex items-center justify-center p-4 py-6">
        <div className="w-full max-w-[420px] bg-[#10205F]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden my-auto">
          
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-36 h-36 bg-[#FAF92A]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Branding */}
          <div className="flex flex-col items-center text-center mb-5">
            <LogoMark size={42} />
            <h1 className="text-xl font-extrabold tracking-tight mt-2 text-white">
              Job<span className="text-[#FAF92A]">Portal</span>
            </h1>
            <p className="text-[11px] text-[#AEB8D0] mt-0.5 tracking-wider uppercase font-medium">
              Connect. Apply. Grow.
            </p>

            {/* Compact Tab Switcher */}
            <div className="w-full bg-[#08153D] p-1 rounded-xl flex items-center mt-4 border border-white/10">
              <button
                type="button"
                className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#FAF92A] text-[#06124A] shadow-md transition-all"
              >
                Login
              </button>
              <Link
                to="/register"
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-[#AEB8D0] hover:text-white transition-all text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-4 p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-center gap-2.5 text-red-300 text-xs">
              <AlertCircle size={16} className="shrink-0 text-[#EF4444]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#AEB8D0] uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-[#08153D] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#AEB8D0] uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[#AEB8D0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[11px] mt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#AEB8D0]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-[#FAF92A] bg-[#08153D] border-white/20"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert("Password reset functionality is under maintenance."); }}
                className="text-[#FAF92A] font-semibold hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold py-3 rounded-xl shadow-lg hover:shadow-[#FAF92A]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-[#AEB8D0]/60 uppercase tracking-widest font-semibold">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => alert("Google Login demo")}
              className="flex items-center justify-center py-2 bg-[#08153D] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-medium text-[#AEB8D0]"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => alert("LinkedIn Login demo")}
              className="flex items-center justify-center py-2 bg-[#08153D] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-medium text-[#AEB8D0]"
            >
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => alert("Apple Login demo")}
              className="flex items-center justify-center py-2 bg-[#08153D] border border-white/10 rounded-xl hover:bg-white/5 transition-all text-xs font-medium text-[#AEB8D0]"
            >
              Apple
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-4 text-xs text-[#AEB8D0]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#FAF92A] font-bold hover:underline">
              Sign Up
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
