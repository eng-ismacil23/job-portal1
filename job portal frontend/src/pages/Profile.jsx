import React, { useState, useEffect } from 'react';
import {
  User, Mail, Wrench, FileText, Save, CheckCircle,
  Briefcase, AlertCircle, Edit3, X, Eye, Award, GraduationCap, Camera, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../layout/DashboardLayout';

// ── TOP-LEVEL HELPER COMPONENTS (outside main render to prevent focus loss) ──
function FieldRow({ icon: Icon, label, value, isTag, tokens }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
        {Icon && <Icon size={13} style={{ color: tokens.accent }} />} {label}
      </span>
      {isTag && Array.isArray(value) && value.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-0.5">
          {value.map((v, i) => (
            <span
              key={i}
              className="px-3 py-1 border rounded-xl text-xs font-bold"
              style={{
                background: tokens.brandTagBg,
                color: tokens.brandTagText,
                borderColor: tokens.border
              }}
            >
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p
          className={`text-sm rounded-xl px-4 py-3 border ${value ? '' : 'italic'}`}
          style={{
            background: tokens.inputBg,
            borderColor: tokens.border,
            color: value ? tokens.text : tokens.textMuted
          }}
        >
          {value || 'Not provided yet'}
        </p>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, children, tokens }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
        {Icon && <Icon size={13} style={{ color: tokens.accent }} />} {label}
      </label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, tokens } = useTheme();
  const isLight = theme === 'light';
  const isDarkCharcoal = theme === 'dark';

  // ── Persisted profile data ──
  const [profile, setProfile] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    skills: user?.skills || [],
    avatar: user?.avatar || ''
  });

  // ── Edit form state ──
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: '',
    bio: '',
    education: '',
    experience: '',
    cvUrl: '',
    avatar: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // ── Fetch profile on mount & sync with user ──
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profiles/me');
      if (res.data?.data) {
        const p = res.data.data;
        setProfile(p);
        const u = p.userId || {};
        setUserInfo({
          name: u.name || user?.name || '',
          email: u.email || user?.email || '',
          role: u.role || user?.role || 'student',
          skills: Array.isArray(u.skills) ? u.skills : Array.isArray(user?.skills) ? user.skills : [],
          avatar: u.avatar || user?.avatar || ''
        });
      } else {
        setUserInfo({
          name: user?.name || '',
          email: user?.email || '',
          role: user?.role || 'student',
          skills: Array.isArray(user?.skills) ? user.skills : [],
          avatar: user?.avatar || ''
        });
      }
    } catch (err) {
      setProfile(null);
      setUserInfo({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'student',
        skills: Array.isArray(user?.skills) ? user.skills : [],
        avatar: user?.avatar || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setForm({
      name: userInfo.name || user?.name || '',
      email: userInfo.email || user?.email || '',
      password: '',
      confirmPassword: '',
      skills: Array.isArray(userInfo.skills) ? userInfo.skills.join(', ') : '',
      bio: profile?.bio || '',
      education: profile?.education || '',
      experience: profile?.experience || '',
      cvUrl: profile?.CV || '',
      avatar: userInfo.avatar || user?.avatar || ''
    });
    setMsg({ type: '', text: '' });
    setEditMode(true);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Sawirku waa inuu ka yaraadaa 5MB.' });
      return;
    }

    setUploadingAvatar(true);
    setMsg({ type: '', text: '' });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const res = await api.post('/api/upload', {
            image: reader.result,
            folder: 'profile_avatars'
          });

          if (res.data?.url) {
            const newUrl = res.data.url;
            setForm((prev) => ({ ...prev, avatar: newUrl }));
            setUserInfo((prev) => ({ ...prev, avatar: newUrl }));
            setMsg({ type: 'success', text: 'Sawirka waa la soo upload gareeyay Cloudinary!' });
          }
        } catch (err) {
          setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload image.' });
        } finally {
          setUploadingAvatar(false);
        }
      };
    } catch (err) {
      setUploadingAvatar(false);
      setMsg({ type: 'error', text: 'Failed to read image file.' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    if (form.password && form.password.length < 6) {
      setMsg({ type: 'error', text: 'Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf/lambar.' });
      setSaving(false);
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'Password-yadu isku mid ma ahan (Password mismatch).' });
      setSaving(false);
      return;
    }

    try {
      const userId = user?.id || user?._id;
      const skillsArray = form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const userUpdatePayload = {
        name: form.name,
        email: form.email,
        skills: skillsArray,
        avatar: form.avatar
      };

      if (form.password) {
        userUpdatePayload.password = form.password;
      }

      // 1. Update User Account Details
      const userRes = await api.put(`/users/${userId}`, userUpdatePayload);

      if (userRes.data?.data) {
        const updatedU = userRes.data.data;
        updateUser(updatedU);
      } else {
        updateUser({ name: form.name, email: form.email, skills: skillsArray, avatar: form.avatar });
      }

      // 2. Upsert Profile Details (bio, education, experience, CV)
      await api.patch('/profiles', {
        bio: form.bio,
        education: form.education,
        experience: form.experience,
        CV: form.cvUrl,
      });

      setMsg({ type: 'success', text: 'Profile & Security details updated successfully!' });
      await fetchData();
      setEditMode(false);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const initials = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U';

  const inputStyle = {
    background: tokens.inputBg,
    borderColor: tokens.border,
    color: tokens.text,
  };

  const profileContent = (
    <div className="w-full flex flex-col justify-between font-sans" style={{ background: tokens.bg, color: tokens.text }}>
      <main className="flex-1 max-w-3xl w-full mx-auto py-2">

        {/* ── Header card ── */}
        <div
          className="rounded-3xl p-8 border shadow-lg mb-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden transition-all duration-300"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'
              : isDarkCharcoal
              ? 'linear-gradient(135deg, #242427 0%, #1C1C1E 100%)'
              : 'linear-gradient(135deg, #10205F 0%, #06124A 100%)',
            borderColor: tokens.border
          }}
        >
          {/* Avatar Container with Upload button */}
          <div className="relative group shrink-0">
            {userInfo.avatar || form.avatar ? (
              <img
                src={editMode ? form.avatar || userInfo.avatar : userInfo.avatar}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover shadow-lg border-2"
                style={{ borderColor: tokens.accent }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-extrabold text-3xl shadow-lg shrink-0"
                style={{
                  background: tokens.accent,
                  color: tokens.accentDark
                }}
              >
                {initials}
              </div>
            )}

            {editMode && (
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-90 transition-all hover:bg-black/70">
                {uploadingAvatar ? (
                  <Loader2 size={24} className="text-white animate-spin" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: isLight ? '#1E1B4B' : tokens.text }}>
                {userInfo.name || 'Your Name'}
              </h1>
              <span
                className="text-xs font-bold px-3 py-0.5 rounded-full border capitalize"
                style={{
                  background: tokens.brandTagBg,
                  color: tokens.brandTagText,
                  borderColor: tokens.border
                }}
              >
                {userInfo.role}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: isLight ? '#4338CA' : tokens.textMuted }}>{userInfo.email}</p>
            {profile ? (
              <p className="text-xs mt-1 flex items-center gap-1 text-[#22C55E]">
                <CheckCircle size={12} /> Profile Complete
              </p>
            ) : (
              <p className="text-xs mt-1 flex items-center gap-1 text-[#D97706]">
                <AlertCircle size={12} /> Fill in your profile details below
              </p>
            )}
          </div>
          <button
            onClick={editMode ? () => setEditMode(false) : openEdit}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md"
            style={{
              background: editMode ? tokens.inputBg : tokens.accent,
              color: editMode ? tokens.textMuted : tokens.accentDark,
              border: `1px solid ${tokens.border}`
            }}
          >
            {editMode ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
          </button>
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
          <div className="rounded-3xl p-12 text-center border" style={{ background: tokens.card, borderColor: tokens.border, color: tokens.textMuted }}>
            Loading profile…
          </div>
        ) : editMode ? (
          /* ── EDIT MODE ── */
          <div className="rounded-3xl p-8 border shadow-xl transition-all" style={{ background: tokens.card, borderColor: tokens.border }}>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: tokens.text }}>
              <Edit3 size={20} style={{ color: tokens.accent }} /> Edit Your Profile
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Profile Image Uploader */}
              <div className="md:col-span-2 border border-dashed p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4" style={{ borderColor: tokens.border }}>
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border" style={{ borderColor: tokens.border }}>
                  {form.avatar ? (
                    <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg" style={{ background: tokens.inputBg, color: tokens.textMuted }}>
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tokens.text }}>Profile Picture (Cloudinary)</h4>
                  <p className="text-xs" style={{ color: tokens.textMuted }}>Upload your profile photo or company avatar image</p>
                </div>
                <label className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all hover:scale-105" style={{ background: tokens.brandTagBg, color: tokens.brandTagText, borderColor: tokens.border }}>
                  {uploadingAvatar ? 'Uploading...' : 'Choose Image'}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
                </label>
              </div>

              {/* Full Name */}
              <Field label="Full Name" icon={User} tokens={tokens}>
                <div className="relative">
                  <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={Mail} tokens={tokens}>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </Field>

              {/* New Password (Optional) */}
              <Field label="New Password (optional)" icon={User} tokens={tokens}>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full border rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm New Password" icon={User} tokens={tokens}>
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full border rounded-xl py-3 px-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </Field>

              {/* Skills */}
              <div className="md:col-span-2">
                <Field label="Skills (comma separated)" icon={Wrench} tokens={tokens}>
                  <div className="relative">
                    <Wrench size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="e.g. React, Node.js, MongoDB"
                      className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                      style={inputStyle}
                    />
                  </div>
                </Field>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
                  <User size={13} style={{ color: tokens.accent }} /> Professional Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Write a short summary about yourself and your goals..."
                  className="w-full border rounded-xl p-4 text-sm outline-none transition-all resize-none"
                  style={inputStyle}
                />
              </div>

              {/* Education */}
              <Field label="Education" icon={GraduationCap} tokens={tokens}>
                <div className="relative">
                  <GraduationCap size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="BSc Computer Science, University of..."
                    className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </Field>

              {/* Experience */}
              <Field label="Experience" icon={Briefcase} tokens={tokens}>
                <div className="relative">
                  <Briefcase size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="2 years Frontend Dev at Tech Corp"
                    className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </Field>

              {/* CV URL */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
                  <FileText size={13} style={{ color: tokens.accent }} /> CV / Portfolio Link
                </label>
                <div className="relative">
                  <FileText size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input
                    type="url"
                    value={form.cvUrl}
                    onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
                    placeholder="https://drive.google.com/your-resume"
                    className="w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className="w-full font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-base flex items-center justify-center gap-2"
                  style={{
                    background: tokens.accent,
                    color: tokens.accentDark
                  }}
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
            <div className="border rounded-3xl p-8 shadow-lg transition-all" style={{ background: tokens.card, borderColor: tokens.border }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: tokens.textMuted }}>
                <User size={16} style={{ color: tokens.accent }} /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRow icon={User} label="Full Name" value={userInfo.name} tokens={tokens} />
                <FieldRow icon={Mail} label="Email Address" value={userInfo.email} tokens={tokens} />
                <div className="md:col-span-2">
                  <FieldRow icon={Wrench} label="Skills" value={userInfo.skills} isTag tokens={tokens} />
                </div>
              </div>
            </div>

            {/* Bio card */}
            <div className="border rounded-3xl p-8 shadow-lg transition-all" style={{ background: tokens.card, borderColor: tokens.border }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: tokens.textMuted }}>
                <Eye size={16} style={{ color: tokens.accent }} /> Profile Details
              </h2>
              <div className="grid grid-cols-1 gap-5">
                <FieldRow icon={User} label="Professional Bio" value={profile?.bio} tokens={tokens} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRow icon={GraduationCap} label="Education" value={profile?.education} tokens={tokens} />
                  <FieldRow icon={Briefcase} label="Work Experience" value={profile?.experience} tokens={tokens} />
                </div>

                {/* CV Link */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
                    <Award size={13} style={{ color: tokens.accent }} /> CV / Portfolio
                  </span>
                  {profile?.CV ? (
                    <a
                      href={profile.CV}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all w-fit"
                      style={{
                        background: tokens.brandTagBg,
                        color: tokens.brandTagText,
                        borderColor: tokens.border
                      }}
                    >
                      <FileText size={16} /> View / Download CV
                    </a>
                  ) : (
                    <p className="text-sm rounded-xl px-4 py-3 border italic" style={{ background: tokens.inputBg, borderColor: tokens.border, color: tokens.textMuted }}>
                      No CV link provided yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Call-to-action if profile is empty */}
            {!profile && (
              <div className="border rounded-2xl p-6 text-center" style={{ background: tokens.brandTagBg, borderColor: tokens.border }}>
                <p className="text-sm" style={{ color: tokens.textMuted }}>You haven't filled in your profile details yet.</p>
                <button
                  onClick={openEdit}
                  className="mt-3 px-6 py-2.5 font-bold rounded-xl hover:scale-105 transition-all text-sm shadow-md"
                  style={{ background: tokens.accent, color: tokens.accentDark }}
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
    <div className="min-h-screen flex flex-col justify-between font-sans" style={{ background: tokens.bg, color: tokens.text }}>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        {profileContent}
      </main>
      <Footer />
    </div>
  );
}
