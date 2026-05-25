import React from 'react';
import { Cpu } from 'lucide-react';

export default function Header({ apiStatus }) {
  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 blur-sm -z-10 opacity-70 animate-glow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              TalentLens <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-extrabold font-heading">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Resume Screener & Ranker</p>
          </div>
        </div>

        {/* Connection Status Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            <span className="text-slate-400 font-medium">
              Backend: {apiStatus === 'connected' ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
