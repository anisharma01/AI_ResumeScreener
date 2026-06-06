import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Loader2, Sparkles, Cpu } from 'lucide-react';

export default function AuthPanel({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const payload = {
      username: username.trim(),
      password: password
    };

    const API_BASE = import.meta.env.VITE_API_BASE || '';
    try {
      const endpoint = `${API_BASE}${isLogin ? '/api/auth/login' : '/api/auth/register'}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed. Please try again.');
      }

      if (isLogin) {
        localStorage.setItem('rescore_access_token', data.access_token);
        localStorage.setItem('rescore_username', data.username);
        onLoginSuccess(data.username, data.access_token);
      } else {
        setMessage(data.message || 'Registration successful! You can now log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Authentication connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 border-indigo-500/20 glass-panel-glow relative overflow-hidden animate-slide-up bg-slate-900/40">
        
        {/* Glow corner styling */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-600/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-cyan-900/10 blur-2xl" />

        {/* Center Logo Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Re<span className="text-indigo-400 font-extrabold font-heading bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-extrabold font-heading">Score</span>
            </h1>
            <p className="text-[9px] text-slate-500 tracking-wider uppercase font-semibold mt-0.5">Secure AI Recruitment Gateway</p>
          </div>
        </div>

        {/* Action Selector Tabs */}
        <div className="grid grid-cols-2 bg-slate-950/80 border border-slate-800/80 p-1 rounded-xl mb-6 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
              setMessage('');
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              isLogin 
                ? 'bg-gradient-to-r from-indigo-950/60 to-indigo-900/40 border border-indigo-900/30 text-white shadow' 
                : 'text-slate-400 hover:text-slate-350'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
              setMessage('');
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              !isLogin 
                ? 'bg-gradient-to-r from-indigo-950/60 to-indigo-900/40 border border-indigo-900/30 text-white shadow' 
                : 'text-slate-400 hover:text-slate-350'
            }`}
          >
            Register
          </button>
        </div>

        {/* Dynamic Success Message */}
        {message && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs mb-5 animate-slide-up font-medium">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <p>{message}</p>
          </div>
        )}

        {/* Dynamic Error Message */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs mb-5 animate-slide-up font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <p>{error}</p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 placeholder-slate-650 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 placeholder-slate-650 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button with Indigo Gradient Wave */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all active:scale-98 cursor-pointer ${
              loading 
                ? 'bg-slate-900 border border-slate-800 text-slate-600 shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-550 hover:brightness-110 shadow-indigo-600/10'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                {isLogin ? 'Authenticating...' : 'Registering...'}
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" />
                {isLogin ? 'Enter ReScore Workspace' : 'Create Access Account'}
              </>
            )}
          </button>
        </form>

        <p className="text-[9px] text-slate-650 text-center mt-6 leading-relaxed">
          ReScore AI ensures that all candidate evaluation credentials and Groq API pipelines are encrypted, tokenized, and protected.
        </p>
      </div>
    </div>
  );
}
