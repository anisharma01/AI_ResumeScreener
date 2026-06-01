import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, AlertCircle } from 'lucide-react';

export default function ResumeUploader({ selectedFiles, setSelectedFiles }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (files) => {
    setError('');
    const newFiles = [...selectedFiles];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Strict PDF verification
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed for resume screening.');
        continue;
      }

      // Check for duplicates
      if (newFiles.some(f => f.name === file.name && f.size === file.size)) {
        continue;
      }

      newFiles.push(file);
    }

    // Limit to exactly 10 files
    if (newFiles.length > 10) {
      setError('You can upload a maximum of 10 resume files.');
      setSelectedFiles(newFiles.slice(0, 10));
    } else {
      setSelectedFiles(newFiles);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    setError('');
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  return (
    <div className="glass-panel p-6 border-slate-800 flex flex-col h-full bg-slate-900/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Upload Resumes</h2>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${selectedFiles.length > 0 ? 'bg-indigo-950 text-indigo-300 border-indigo-900/40' : 'bg-slate-950 text-slate-500 border-slate-900'}`}>
          {selectedFiles.length}/10 Resumes
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Select or drag-and-drop up to 10 resume files in PDF format.
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-xl p-7 text-center transition-all duration-250 flex flex-col items-center justify-center cursor-pointer min-h-48 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-950/10 shadow-sm'
            : 'border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
        />

        <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-indigo-500/30 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-all duration-250 shadow-sm mb-3">
          <UploadCloud className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 animate-pulse" />
        </div>

        <span className="text-xs font-semibold text-slate-350 group-hover:text-indigo-300 transition-colors">
          Drag & drop files or <span className="text-indigo-400 group-hover:underline">browse</span>
        </span>
        <span className="text-[9px] text-slate-650 tracking-wide uppercase mt-1.5 font-bold">
          Strictly PDFs only • Max 5MB per file
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3.5 flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-450" />
          <span>{error}</span>
        </div>
      )}

      {/* File List Grid */}
      {selectedFiles.length > 0 && (
        <div className="mt-5 flex-grow overflow-y-auto max-h-56 pr-1 space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-slate-750 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8.5 h-8.5 rounded bg-rose-950/30 border border-rose-900/40 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate pr-2">
                    {file.name}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded border border-slate-800 hover:border-rose-900 hover:bg-rose-950/20 text-slate-550 hover:text-rose-400 transition-all duration-200 cursor-pointer"
                title="Remove File"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
