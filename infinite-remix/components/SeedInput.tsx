'use client';

import { useState, useEffect } from 'react';
import type { InstrumentalEngine } from '@/types';

interface SeedInputProps {
  onGenerate: (url: string, engine: InstrumentalEngine) => void;
  loading: boolean;
  value?: string;
}

export default function SeedInput({ onGenerate, loading, value }: SeedInputProps) {
  const [url, setUrl] = useState('');
  const [engine, setEngine] = useState<InstrumentalEngine>('tonejs');

  // Auto-fill from parent when value prop arrives
  useEffect(() => {
    if (value) setUrl(value);
  }, [value]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onGenerate(trimmed, engine);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a YouTube or music URL"
          disabled={loading}
          className="
            w-full rounded-lg border border-slate-700 bg-gray-900
            px-4 py-3 text-slate-100 placeholder-slate-500
            focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500
            disabled:opacity-50 transition-colors
          "
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 bg-gray-900 border border-slate-700 p-1.5 rounded-full w-max mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setEngine('tonejs')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            engine === 'tonejs' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tone.js Synth (free)
        </button>
        <button
          type="button"
          onClick={() => setEngine('suno')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            engine === 'suno' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Suno AI Instrumental (uses credits)
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="
          w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white
          hover:bg-orange-400 active:bg-orange-600
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Analyzing…
          </span>
        ) : (
          'Generate ∞'
        )}
      </button>

      <p className="text-center text-xs text-slate-600">
        Supports YouTube, SoundCloud, and direct audio file URLs
      </p>
    </form>
  );
}
