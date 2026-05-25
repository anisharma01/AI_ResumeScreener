import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResumeUploader from './components/ResumeUploader';
import RankedList from './components/RankedList';
import CandidateDetail from './components/CandidateDetail';
import { Sparkles, Loader2, AlertCircle, Play } from 'lucide-react';

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jdText, setJdText] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('offline');
  const [isBackendConfigured, setIsBackendConfigured] = useState(false);

  const API_BASE = 'http://localhost:8000';

  // Check health and connectivity of FastAPI backend on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
          const data = await res.json();
          setApiStatus('connected');
          setIsBackendConfigured(data.groq_configured || false);
        } else {
          setApiStatus('offline');
          setIsBackendConfigured(false);
        }
      } catch (err) {
        setApiStatus('offline');
        setIsBackendConfigured(false);
      }
    };
    checkHealth();
    // Check health every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartAnalysis = async () => {
    setError('');
    
    // 1. Validations
    if (!jdText.trim()) {
      setError('Please provide a Job Description (JD) to match against.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please upload at least one PDF resume file.');
      return;
    }
    if (!isBackendConfigured) {
      setError('The Groq API Key is not configured on the backend server. Please configure the GROQ_API_KEY environment variable on your server.');
      return;
    }

    setLoading(true);
    setSelectedIndex(null);
    setCandidates([]);

    // 2. Animated Status Stepper
    const statuses = [
      'Extracting files into payload...',
      'Uploading PDF resume files to FastAPI server...',
      'Extracting structural texts from PDF documents...',
      'Invoking Groq Llama-3.3 AI Models...',
      'Generating structured profiles (expertise, score & missing gaps)...',
      'Comparing expertise alignments & final ranking scores...'
    ];

    let statusIndex = 0;
    setParsingStatus(statuses[0]);
    const statusInterval = setInterval(() => {
      if (statusIndex < statuses.length - 1) {
        statusIndex++;
        setParsingStatus(statuses[statusIndex]);
      }
    }, 2800);

    // 3. API Submission
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('jd', jdText);

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis request failed with status code ${response.status}`);
      }

      const data = await response.json();
      setCandidates(data.candidates || []);
      
      // Auto-select the #1 top candidate profile
      if (data.candidates && data.candidates.length > 0) {
        setSelectedIndex(0);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze files. Please ensure the backend is running and healthy.');
    } finally {
      clearInterval(statusInterval);
      setLoading(false);
      setParsingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 radial-glow-purple -z-10 animate-glow" />
      <div className="absolute top-10 right-1/4 w-96 h-96 radial-glow-cyan -z-10 animate-glow" style={{ animationDelay: '2s' }} />

      {/* Header component */}
      <Header apiStatus={apiStatus} />

      {/* Main Workspace Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel border-indigo-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5" />
          <div className="relative space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
              AI Recruitment Suite (Groq)
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Upload up to 10 resume PDFs, specify a Job Description (JD), and evaluate candidate skillsets. Powered by Groq Llama-3.3-70b structured outputs.
            </p>
          </div>
          
          <div className="relative shrink-0 flex items-center gap-3">
            <button
              onClick={handleStartAnalysis}
              disabled={loading || selectedFiles.length === 0}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-xs tracking-wide uppercase transition-all duration-300 shadow-md shadow-indigo-600/10 cursor-pointer ${
                loading || selectedFiles.length === 0
                  ? 'bg-slate-900 border border-slate-800 text-slate-600'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:brightness-110 hover:shadow-indigo-500/20 active:scale-98'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white" />
                  Evaluate & Rank
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/25 border border-rose-900/40 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold">Execution Failed</h4>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Main panels row (Inputs panel) */}
        {!candidates.length && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <JobDescriptionInput jdText={jdText} setJdText={setJdText} />
            <ResumeUploader selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
          </div>
        )}

        {/* Loading Spinner Screen */}
        {loading && (
          <div className="glass-panel p-10 border-slate-800 flex flex-col items-center justify-center text-center py-24 space-y-6 relative overflow-hidden min-h-96">
            <div className="absolute inset-0 bg-slate-900/20" />
            
            {/* Spinning AI Orb */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800/80" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              <Loader2 className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>

            <div className="space-y-2 relative max-w-sm">
              <h3 className="text-base font-semibold text-white tracking-wide">Processing Pipeline Active</h3>
              <p className="text-xs text-indigo-400 font-mono tracking-wider font-semibold animate-pulse uppercase">
                {parsingStatus}
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5">
                Parsing contents and prompting Groq's high-speed Llama models to construct structured candidate reviews. Please hold...
              </p>
            </div>
          </div>
        )}

        {/* Output Dashboards (Ranked match list + details) */}
        {candidates.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Ranked List panel (left 1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <RankedList
                  candidates={candidates}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                />
                
                {/* Reset button to screen new ones */}
                <button
                  onClick={() => {
                    setCandidates([]);
                    setSelectedIndex(null);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Screen New Resumes
                </button>
              </div>
            </div>

            {/* Deep Analysis panel (right 2/3) */}
            <div className="lg:col-span-2">
              <CandidateDetail candidate={candidates[selectedIndex]} />
            </div>

          </div>
        )}

      </main>

      {/* Floating Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-5 text-center mt-12">
        <p className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">
          Powered by Groq Llama-3.3-70b • Dockerized • Kubernetes Orchestrated • CI/CD Enabled
        </p>
      </footer>

    </div>
  );
}
