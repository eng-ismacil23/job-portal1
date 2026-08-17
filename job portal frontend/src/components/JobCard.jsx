import React from 'react';
import { Building, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AVATAR_TINTS = ['#3B82F6', '#EC4899', '#F97316', '#22C55E', '#06B6D4', '#A855F7'];

function tintForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isRecent(createdAt) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 3;
}

export default function JobCard({ job, onApply, showApply = true }) {
  const { tokens } = useTheme();

  const tint = tintForName(job.company);
  const initial = (job.company || '?').charAt(0).toUpperCase();
  const days = daysUntil(job.deadline);
  const expired = days !== null && days < 0;
  const closingSoon = days !== null && days >= 0 && days <= 5;
  const fresh = isRecent(job.createdAt);

  const handleCardClick = (e) => {
    if (job.onDetails) {
      job.onDetails(job._id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none"
    >
      <div
        className="border rounded-2xl p-6 h-full flex flex-col justify-between gap-4 transition-all duration-300 shadow-xl group-hover:border-[#FAF92A]/40"
        style={{
          background: tokens.card,
          borderColor: tokens.border,
          color: tokens.text
        }}
      >
        <div>
          {/* Header row: Logo / Company / Status badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border"
                  style={{ borderColor: tokens.border }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-lg shadow-sm"
                  style={{ background: `${tint}22`, color: tint }}
                >
                  {initial}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="font-bold text-base transition-colors truncate" style={{ color: tokens.text }}>
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: tokens.textMuted }}>
                  <Building size={13} className="flex-shrink-0" style={{ color: tokens.accent }} />
                  <span className="truncate font-medium">{job.company}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {fresh && (
                <span className="bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#22C55E]/30 whitespace-nowrap">
                  New
                </span>
              )}
              {closingSoon && (
                <span className="bg-[#EF4444]/15 text-[#EF4444] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#EF4444]/30 whitespace-nowrap">
                  Closing Soon
                </span>
              )}
            </div>
          </div>

          {/* Quick info tags: vacancies & max applicants */}
          <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-semibold">
            <span
              className="px-2.5 py-1 rounded-lg border flex items-center gap-1"
              style={{
                background: tokens.brandTagBg,
                color: tokens.brandTagText,
                borderColor: tokens.border
              }}
            >
              <Users size={11} /> {job.positionsCount || 1} Vacancy
            </span>
            {job.maxApplicants && (
              <span
                className="px-2.5 py-1 rounded-lg border"
                style={{
                  background: tokens.inputBg,
                  color: tokens.textMuted,
                  borderColor: tokens.border
                }}
              >
                Max: {job.maxApplicants} Applicants
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs mt-3 line-clamp-3 leading-relaxed" style={{ color: tokens.textMuted }}>
            {job.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: tokens.border }}>
          <div className="flex items-center gap-1.5 text-xs min-w-0" style={{ color: tokens.textMuted }}>
            {expired ? (
              <>
                <Clock size={13} className="flex-shrink-0 text-red-400" />
                <span className="truncate text-red-400 font-semibold">Deadline passed</span>
              </>
            ) : (
              <>
                <Calendar size={13} className="flex-shrink-0" style={{ color: tokens.accent }} />
                <span className="truncate">
                  Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              className="font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 hover:scale-105"
              style={{
                background: tokens.accent,
                color: tokens.accentDark
              }}
            >
              <span>{expired ? 'Details' : 'Apply Now'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
