'use client';

import type { Phase } from '@/types';

interface LyricsDisplayProps {
  lyrics: string | null;
  phase: Phase;
  preGenerating: boolean;
}

export default function LyricsDisplay({ lyrics, phase, preGenerating }: LyricsDisplayProps) {
  const isDrift = phase === 'drift' || phase === 'rebuild';

  return (
    <div className="rounded-xl border border-slate-800 bg-gray-900 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 uppercase tracking-wider">
          Drift Lyrics
        </div>
        {preGenerating && (
          <span className="text-xs text-violet-400 animate-pulse">
            generating...
          </span>
        )}
        {isDrift && lyrics && (
          <span className="text-xs text-emerald-400">
            now playing
          </span>
        )}
      </div>

      {lyrics ? (
        <div className={`font-mono text-sm leading-relaxed whitespace-pre-line transition-opacity duration-1000 ${
          isDrift ? 'text-slate-200 opacity-100' : 'text-slate-500 opacity-60'
        }`}>
          {lyrics
            .split('\n')
            .filter(line => !line.startsWith('[') && !line.startsWith('(evolving'))
            .join('\n')
            .trim()}
        </div>
      ) : (
        <p className="text-sm text-slate-600 italic">
          Lyrics will appear when the first drift phase generates new vocals.
        </p>
      )}
    </div>
  );
}
