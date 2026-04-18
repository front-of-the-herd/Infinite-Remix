'use client';

import type { Phase } from '@/types';

interface PhaseStripProps {
  currentPhase: Phase;
  progress: number; // 0–1 through the current phase
}

const PHASE_CONFIG: Record<
  Phase,
  { label: string; color: string; glow: string; dim: string }
> = {
  build: {
    label: 'BUILD',
    color: 'text-amber-400',
    glow: 'bg-amber-500 shadow-[0_0_12px_2px_rgba(245,158,11,0.6)]',
    dim:  'bg-amber-950 text-amber-700',
  },
  peak: {
    label: 'PEAK',
    color: 'text-rose-400',
    glow: 'bg-rose-500 shadow-[0_0_12px_2px_rgba(244,63,94,0.6)]',
    dim:  'bg-rose-950 text-rose-700',
  },
  breakdown: {
    label: 'BREAKDOWN',
    color: 'text-cyan-400',
    glow: 'bg-cyan-500 shadow-[0_0_12px_2px_rgba(6,182,212,0.6)]',
    dim:  'bg-cyan-950 text-cyan-700',
  },
  drift: {
    label: 'DRIFT',
    color: 'text-violet-400',
    glow: 'bg-violet-500 shadow-[0_0_12px_2px_rgba(139,92,246,0.6)]',
    dim:  'bg-violet-950 text-violet-700',
  },
  rebuild: {
    label: 'REBUILD',
    color: 'text-emerald-400',
    glow: 'bg-emerald-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.6)]',
    dim:  'bg-emerald-950 text-emerald-700',
  },
};

const PHASE_ORDER: Phase[] = ['build', 'peak', 'breakdown', 'drift', 'rebuild'];

export default function PhaseStrip({ currentPhase, progress }: PhaseStripProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {PHASE_ORDER.map(phase => {
          const cfg = PHASE_CONFIG[phase];
          const isActive = phase === currentPhase;

          return (
            <div
              key={phase}
              className={`
                flex-1 rounded-full px-2 py-1.5 text-center text-[10px] font-bold
                tracking-widest transition-all duration-700
                ${isActive
                  ? `${cfg.glow} text-white phase-active`
                  : `${cfg.dim} border border-transparent`
                }
              `}
            >
              {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Progress bar for current phase */}
      <div className="h-0.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            PHASE_CONFIG[currentPhase].glow
          }`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
