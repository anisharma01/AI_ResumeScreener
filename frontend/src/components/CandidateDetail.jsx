import React from 'react';
import { User, Mail, Phone, CheckCircle2, AlertCircle, FileText, Send, HelpCircle } from 'lucide-react';

export default function CandidateDetail({ candidate }) {
  if (!candidate) {
    return (
      <div className="glass-panel p-6 border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-96">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
          <FileText className="w-8 h-8 opacity-40" />
        </div>
        <h3 className="text-base font-semibold text-slate-300">Select a Candidate</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
          Select a candidate profile from the ranked matches on the left to inspect detailed AI insights, matching strengths, and identified skill gaps.
        </p>
      </div>
    );
  }

  const getProgressColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-400';
  };

  const getRecommendationReasoning = (role, score) => {
    const roleLower = role.toLowerCase();
    if (roleLower === 'interview') {
      return `Outstanding match score of ${score}%. The candidate demonstrates a highly congruent profile with minimal gaps. We recommend advancing immediately to a technical interview.`;
    } else if (roleLower === 'shortlist') {
      return `Solid fit with a match score of ${score}%. Strong core strengths, although some technical or domain gaps are present. Recommend keeping on the active shortlist for secondary reviews.`;
    } else {
      return `Match score is below optimal thresholds (${score}%). Key prerequisites from the job description are missing or weak. We recommend placing this application on hold.`;
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-6 h-full flex flex-col justify-between">
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400 shadow-sm shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{candidate.name}</h2>
              <span className="text-xs font-semibold text-indigo-400 tracking-wide uppercase">
                {candidate.recommended_role} Fit Profile
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {candidate.email}
              </a>
            )}
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {candidate.phone}
              </a>
            )}
          </div>
        </div>

        {/* Score Progress Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Job Description Match Rating</span>
            <span className="text-white font-mono">{candidate.score}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(candidate.score)} shadow-[0_0_8px_rgba(99,102,241,0.2)] transition-all duration-1000`}
              style={{ width: `${candidate.score}%` }}
            />
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Candidate Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 border border-slate-800/40 p-4 rounded-2xl">
            {candidate.summary}
          </p>
        </div>

        {/* Gaps and Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          
          {/* Core Strengths */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
              Matching Expertise
            </h3>
            
            {candidate.strong_areas && candidate.strong_areas.length > 0 ? (
              <ul className="space-y-2">
                {candidate.strong_areas.map((strength, sidx) => (
                  <li
                    key={strength + sidx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 bg-emerald-950/10 border border-emerald-900/20 p-2.5 rounded-xl leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-900/30 p-3 rounded-xl">
                No matching skills explicitly detected.
              </p>
            )}
          </div>

          {/* Missing Skills / Gaps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
              Identified Skill Gaps
            </h3>
            
            {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
              <ul className="space-y-2">
                {candidate.missing_skills.map((gap, gidx) => (
                  <li
                    key={gap + gidx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 bg-amber-950/10 border border-amber-900/20 p-2.5 rounded-xl leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-900/30 p-3 rounded-xl">
                No major skill gaps identified compared to the JD.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Decision Section */}
      <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Screening Recommendation</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            {getRecommendationReasoning(candidate.recommended_role, candidate.score)}
          </p>
        </div>

        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all duration-200 cursor-pointer ${
            candidate.recommended_role.toLowerCase() === 'interview'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-600/10 hover:brightness-110'
              : candidate.recommended_role.toLowerCase() === 'shortlist'
              ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-amber-600/10 hover:brightness-110'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          {candidate.recommended_role.toLowerCase() === 'interview'
            ? 'Schedule Interview'
            : candidate.recommended_role.toLowerCase() === 'shortlist'
            ? 'Shortlist Candidate'
            : 'Keep on File'}
        </button>
      </div>
    </div>
  );
}
