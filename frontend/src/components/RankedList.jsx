import React from 'react';
import { Award, User, Mail, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

export default function RankedList({ candidates, selectedIndex, setSelectedIndex }) {
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20';
    if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/20 bg-rose-950/20';
  };

  const getDecisionBadge = (decision) => {
    switch (decision.toLowerCase()) {
      case 'interview':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30 bg-emerald-950/40 text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Interview
          </span>
        );
      case 'shortlist':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-amber-500/30 bg-amber-950/40 text-amber-400">
            <Award className="w-3 h-3" /> Shortlist
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700 bg-slate-800 text-slate-400">
            <ShieldAlert className="w-3 h-3" /> Hold
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-indigo-400" />
        <h2 className="text-base font-semibold text-white">Ranked Matches ({candidates.length})</h2>
      </div>

      <div className="space-y-3">
        {candidates.map((cand, idx) => {
          const isSelected = selectedIndex === idx;
          const scoreClass = getScoreColor(cand.score);

          return (
            <div
              key={cand.name + idx}
              onClick={() => setSelectedIndex(idx)}
              style={{ animationDelay: `${idx * 75}ms` }}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer animate-slide-up ${
                isSelected
                  ? 'border-indigo-500/80 bg-slate-900/90 shadow-lg shadow-indigo-500/5'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Sidebar glow accent on active */}
              {isSelected && (
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-md bg-gradient-to-b from-indigo-500 to-cyan-400" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Rank Circle badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 font-heading ${
                    idx === 0 
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20' 
                      : idx === 1 
                      ? 'bg-slate-300 text-slate-950' 
                      : idx === 2 
                      ? 'bg-amber-700 text-white' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    #{idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                        {cand.name}
                      </h3>
                      {getDecisionBadge(cand.recommended_role)}
                    </div>

                    {/* Email if available */}
                    {cand.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{cand.email}</span>
                      </div>
                    )}

                    {/* Brief snippet */}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {cand.summary}
                    </p>
                  </div>
                </div>

                {/* Match Score Display */}
                <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-inner ${scoreClass}`}>
                  <span className="text-lg font-bold font-heading tracking-tighter leading-none">{cand.score}</span>
                  <span className="text-[8px] uppercase tracking-wider font-semibold opacity-70 mt-1">Score</span>
                </div>
              </div>

              {/* Expand Details Trigger Arrow */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-indigo-400 transition-colors">
                <span>View deep-dive resume analysis</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
