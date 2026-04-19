'use client';

import type { SourceWeights } from '@/types';

interface SourceMetersProps {
  weights: SourceWeights;
}

interface MeterConfig {
  key: keyof SourceWeights;
  label: string;
  barColor: string;
  trackColor: string;
}

const METERS: MeterConfig[] = [
  {
    key:        'instrumental',
    label:      'Inst.',
    barColor:   'bg-cyan-400',
    trackColor: 'bg-cyan-950',
  },
  {
    key:        'originalStem',
    label:      'Stem',
    barColor:   'bg-rose-400',
    trackColor: 'bg-rose-950',
  },
  {
    key:        'suno',
    label:      'Suno',
    barColor:   'bg-violet-400',
    trackColor: 'bg-violet-950',
  },
];

export default function SourceMeters({ weights }: SourceMetersProps) {
  return (
    <div className="flex gap-4 justify-center">
      {METERS.map(({ key, label, barColor, trackColor }) => {
        const value = weights[key];
        const pct   = Math.round(value * 100);

        return (
          <div key={key} className="flex flex-col items-center gap-2">
            {/* Vertical bar */}
            <div className={`relative h-24 w-8 rounded-full ${trackColor} overflow-hidden`}>
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-full ${barColor} transition-all duration-700`}
                style={{ height: `${pct}%` }}
              />
            </div>

            {/* Percentage label */}
            <span className="text-xs font-mono text-slate-400">
              {pct}%
            </span>

            {/* Source name */}
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
