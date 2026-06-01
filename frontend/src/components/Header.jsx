import React from 'react';
import { Cpu, LogOut, User } from 'lucide-react';

export default function Header({ apiStatus, username, onLogout }) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand/Logo - ReScore */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
            <Cpu className="w-4.5 h-4.5 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 blur-sm -z-10 opacity-70 animate-glow" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Re<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-extrabold font-heading">Score</span>
            </h1>
            <p className="text-[9px] text-slate-500 tracking-wider uppercase font-semibold">Resume Screener & Ranker</p>
          </div>
        </div>

        {/* Connection Status & User Authentication Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* API Backend status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'}`} />
            <span className="text-slate-500 font-semibold text-[10px]">
              API: {apiStatus === 'connected' ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* User Badge & Logout */}
          {username && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-350">
                <User className="w-3 h-3 shrink-0 text-indigo-400" />
                <span className="font-semibold max-w-24 truncate">{username}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log out of ReScore"
                className="flex items-center justify-center p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-800 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
