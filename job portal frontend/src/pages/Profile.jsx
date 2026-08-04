// profiles
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Wrench, FileText, Save, CheckCircle,
  Briefcase, BookOpen, AlertCircle, Edit3, X, Eye, Award, GraduationCap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';

export default function Profile() {
  const { user } = useAuth();

  // ── Persisted profile data (view mode) ──
  const [profile, setProfile] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || 'student', skills: user?.skills || [] });

  // ── Edit form state ──
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    skills: '',
    bio: '',
    education: '',
    experience: '',
    cvUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // ── Fetch profile on mount ──
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch saved profile
      const res = await api.get('/profiles/me');
      if (res.data?.data) {
        const p = res.data.data;
        setProfile(p);
        const u = p.userId || {};
        setUserInfo({
          name: u.name || user?.name || '',
          email: u.email || user?.email || '',
          role: u.role || user?.role || 'student',
          skills: u.skills || user?.skills || [],
        });
      }
    } catch {
      // No profile yet — use auth context data
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setForm({
      name: userInfo.name,
      email: userInfo.email,
      skills: Array.isArray(userInfo.skills) ? userInfo.skills.join(', ') : userInfo.skills || '',
      bio: profile?.bio || '',
      education: profile?.education || '',
      experience: profile?.experience || '',
      cvUrl: profile?.CV || '',
    });
    setMsg({ type: '', text: '' });
    setEditMode(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const userId = user?.id || user?._id;
      const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean);

      // 1. Update user account (name, email, skills)
      await api.put(`/users/${userId}`, {
        name: form.name,
        email: form.email,
        skills: skillsArray,
      });

      // 2. Upsert profile (POST auto-updates if exists)
      await api.patch('/profiles', {
        bio: form.bio,
        education: form.education,
        experience: form.experience,
        CV: form.cvUrl,
      });

      setMsg({ type: 'success', text: 'Profile saved successfully!' });
      await fetchData();      // Reload fresh data
      setEditMode(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const initials = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U';

  // ── FIELD ROW for view mode ──
  const FieldRow = ({ icon: Icon, label, value, isTag }) => (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[#AEB8D0] uppercase tracking-wider flex items-center gap-1.5">
        <Icon size={13} className="text-[#FAF92A]" /> {label}
      </span>
      {isTag && Array.isArray(value) && value.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-0.5">
          {value.map((v, i) => (
            <span key={i} className="px-3 py-1 bg-[#FAF92A]/10 text-[#FAF92A] border border-[#FAF92A]/30 rounded-xl text-xs font-bold">
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p className={`text-sm rounded-xl px-4 py-3 bg-[#08153D]/80 border border-white/5 ${value ? 'text-white' : 'text-[#AEB8D0]/40 italic'}`}>
          {value || 'Not provided yet'}
        </p>
      )}
    </div>
  );

  // ── INPUT helper for edit mode ──
  const Field = ({ label, icon: Icon, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#AEB8D0] flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-[#FAF92A]" />} {label}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-[#08153D] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all";
  const textareaCls = "w-full bg-[#08153D] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-[#AEB8D0]/40 focus:outline-none focus:border-[#FAF92A] transition-all resize-none";

  const profileContent = (
    <div className="min-h-screen bg-[#08153D] text-white font-sans">
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-8 py-10">

        {/* ── Header card ── */}
        <div className="bg-[#10205F] rounded-3xl p-8 border border-white/10 shadow-2xl mb-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FAF92A] to-[#FDBF2D] text-[#06124A] flex items-center justify-center font-extrabold text-3xl shadow-lg shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{userInfo.name || 'Your Name'}</h1>
              <span className="bg-[#FAF92A]/10 text-[#FAF92A] border border-[#FAF92A]/30 text-xs font-bold px-3 py-0.5 rounded-full capitalize">
                {userInfo.role}
              </span>
            </div>
            <p className="text-sm text-[#AEB8D0] mt-1">{userInfo.email}</p>
            {profile ? (
              <p className="text-xs text-[#22C55E] mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> Profile Complete
              </p>
            ) : (
              <p className="text-xs text-[#FDBF2D] mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Fill in your profile details below
              </p>
            )}
          </div>
          <button
            onClick={editMode ? () => setEditMode(false) : openEdit}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              editMode
                ? 'bg-white/10 text-[#AEB8D0] hover:text-white border border-white/10'
                : 'bg-[#FAF92A] text-[#06124A] hover:scale-105 shadow-lg'
            }`}
          >
            {editMode ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
          </button>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FAF92A]/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* ── Alert message ── */}
        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]'
              : 'bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444]'
          }`}>
            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{msg.text}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-[#10205F] border border-white/10 rounded-3xl p-12 text-center text-[#AEB8D0]">
            Loading profile…
          </div>
        ) : editMode ? (
          /* ── EDIT MODE ── */
          <div className="bg-[#10205F] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Edit3 size={20} className="text-[#FAF92A]" /> Edit Your Profile
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <Field label="Full Name" icon={User}>
                <div className="relative">
                  <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEB8D0]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </div>
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={Mail}>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEB8D0]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className={inputCls}
                  />
                </div>
              </Field>

              {/* Skills */}
              <Field label="Skills (comma separated)" icon={Wrench}>
                <div className="relative md:col-span-2">
                  <Wrench size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEB8D0]" />
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className={inputCls + ' md:col-span-2'}
                  />
                </div>
              </Field>

              {/* Bio */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#AEB8D0] flex items-center gap-1.5">
                  <User size={13} className="text-[#FAF92A]" /> Professional Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Write a short summary about yourself and your goals..."
                  className={textareaCls}
                />
              </div>

              {/* Education */}
              <Field label="Education" icon={GraduationCap}>
                <div className="relative">
                  <GraduationCap size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEB8D0]" />
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="BSc Computer Science, University of..."
                    className={inputCls}
                  />
                </div>
              </Field>

              {/* Experience */}
              <Field label="Experience" icon={Briefcase}>
                <div className="relative">
                  <Briefcase size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEB8D0]" />
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="2 years Frontend Dev at Tech Corp"
                    className={inputCls}
                  />
                </div>
              </Field>

              {/* CV URL */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#AEB8D0] flex items-center gap-1.5">
                  <FileText size={13} className="text-[#FAF92A]" /> CV / Portfolio Link
                </label>
                <div className="relative">
                  <FileText size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEB8D0]" />
                  <input
                    type="url"
                    value={form.cvUrl}
                    onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
                    placeholder="https://drive.google.com/your-resume"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#FAF92A] to-[#FDBF2D] text-[#06124A] font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-base flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <div className="flex flex-col gap-5">

            {/* Personal Info card */}
            <div className="bg-[#10205F] border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-sm font-bold text-[#AEB8D0] uppercase tracking-wider mb-5 flex items-center gap-2">
                <User size={16} className="text-[#FAF92A]" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRow icon={User} label="Full Name" value={userInfo.name} />
                <FieldRow icon={Mail} label="Email Address" value={userInfo.email} />
                <div className="md:col-span-2">
                  <FieldRow icon={Wrench} label="Skills" value={userInfo.skills} isTag />
                </div>
              </div>
            </div>

            {/* Bio card */}
            <div className="bg-[#10205F] border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-sm font-bold text-[#AEB8D0] uppercase tracking-wider mb-5 flex items-center gap-2">
                <Eye size={16} className="text-[#FAF92A]" /> Profile Details
              </h2>
              <div className="grid grid-cols-1 gap-5">
                <FieldRow icon={User} label="Professional Bio" value={profile?.bio} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRow icon={GraduationCap} label="Education" value={profile?.education} />
                  <FieldRow icon={Briefcase} label="Work Experience" value={profile?.experience} />
                </div>

                {/* CV Link */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-[#AEB8D0] uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={13} className="text-[#FAF92A]" /> CV / Portfolio
                  </span>
                  {profile?.CV ? (
                    <a
                      href={profile.CV}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF92A]/10 text-[#FAF92A] border border-[#FAF92A]/30 rounded-xl text-sm font-bold hover:bg-[#FAF92A]/20 transition-all w-fit"
                    >
                      <FileText size={16} /> View / Download CV
                    </a>
                  ) : (
                    <p className="text-sm rounded-xl px-4 py-3 bg-[#08153D]/80 border border-white/5 text-[#AEB8D0]/40 italic">
                      No CV link provided yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Call-to-action if profile is empty */}
            {!profile && (
              <div className="bg-[#FAF92A]/5 border border-[#FAF92A]/20 rounded-2xl p-6 text-center">
                <p className="text-sm text-[#AEB8D0]">You haven't filled in your profile yet.</p>
                <button
                  onClick={openEdit}
                  className="mt-3 px-6 py-2.5 bg-[#FAF92A] text-[#06124A] font-bold rounded-xl hover:scale-105 transition-all text-sm"
                >
                  Complete Your Profile
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

  if (user) {
    return <DashboardLayout>{profileContent}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-[#08153D] text-white flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {profileContent}
      </main>
      <Footer />
    </div>
  );
}