import React from 'react';
import { Briefcase, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    title: 'Senior React Developer',
    description: 'We are seeking a Senior Frontend Engineer specialized in React and modern state management. Requirements: 5+ years of experience, React 18, TypeScript, Tailwind CSS, Vite, performance optimization, unit testing with Jest/RTL, and Git workflows.'
  },
  {
    title: 'Python Backend Engineer',
    description: 'Looking for a Senior Python Developer to construct robust async RESTful APIs. Core stack: Python 3.11+, FastAPI, PostgreSQL, Redis, Docker, Pydantic, celery, and writing automated unit tests. Experience with AWS cloud deployment is highly desired.'
  },
  {
    title: 'DevOps & Cloud Engineer',
    description: 'We need a DevOps Specialist to coordinate infrastructure. Requirements: Kubernetes clusters, Docker image optimization, writing GitHub Actions CI/CD pipelines, terraform IaC, Helm charts, monitoring (Prometheus/Grafana), and shell scripting.'
  }
];

export default function JobDescriptionInput({ jdText, setJdText }) {
  const wordCount = jdText ? jdText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="glass-panel p-6 border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Job Description (JD)</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
          {wordCount} words
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Provide the targeted job description details. Paste your text or click a quick-template preset below to load a sample.
      </p>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => setJdText(preset.description)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {preset.title}
          </button>
        ))}
      </div>

      {/* Main Textarea */}
      <div className="relative flex-grow">
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the target job description or requirements here..."
          className="w-full h-64 md:h-full min-h-60 px-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-indigo-500/70 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none text-sm leading-relaxed"
        />
        {jdText && (
          <button
            onClick={() => setJdText('')}
            className="absolute bottom-3 right-3 text-[10px] text-slate-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider px-2 py-1 bg-slate-900/90 rounded border border-slate-800 hover:border-rose-950/40 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
