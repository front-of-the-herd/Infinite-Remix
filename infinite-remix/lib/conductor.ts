// Section Conductor — ported from design doc spec.
// spikes/conductor/conductor.js does not exist yet; this is the canonical implementation.
// Logic: phase sequence, weights, slice selection, evolution algorithm, tick().

import type {
  Phase,
  SongDNA,
  SourceWeights,
  VocalSlice,
  ConductorState,
  Evolution,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PHASES: Phase[] = ['build', 'peak', 'breakdown', 'drift', 'rebuild'];

export const PHASE_DURATIONS_S: Record<Phase, number> = {
  build:     32,
  peak:      32,
  breakdown: 16,
  drift:     32,
  rebuild:   16,
};

// Gain weights per phase for each of the three audio sources (0–1)
export const PHASE_WEIGHTS: Record<Phase, SourceWeights> = {
  build: {
    instrumental: 0.8,
    originalStem: 0.3,
    suno:         0.0,
  },
  peak: {
    instrumental: 0.6,
    originalStem: 1.0,
    suno:         0.0,
  },
  breakdown: {
    instrumental: 1.0,
    originalStem: 0.0,
    suno:         0.0,
  },
  drift: {
    instrumental: 0.7,
    originalStem: 0.0,
    suno:         0.9,
  },
  rebuild: {
    instrumental: 0.8,
    originalStem: 0.4,
    suno:         0.5,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function shiftGenres(tags: string[], cycle: number): string[] {
  // After every 3 cycles, rotate one tag toward an adjacent genre
  const adjacentGenres = ['eurodance', 'house', 'trance', 'italo disco', 'new wave', 'synth pop'];
  if (cycle % 3 !== 0 || cycle === 0) return tags;
  const rotateIdx = cycle % tags.length;
  const newTag = adjacentGenres[cycle % adjacentGenres.length];
  return tags.map((t, i) => (i === rotateIdx ? newTag : t));
}

function selectTheme(themes: string[], cycle: number): string {
  // Rotate through themes, drifting further as cycles increase
  const idx = cycle % themes.length;
  return themes[idx];
}

// ---------------------------------------------------------------------------
// Evolution — runs once per completed Conductor cycle
// ---------------------------------------------------------------------------

export function evolve(dna: SongDNA, cycle: number): Evolution {
  const drift = Math.sin(cycle * 0.1) * 0.3;
  const chaos = Math.random() * 0.15;

  return {
    cycle,
    bpm:        dna.musical.bpm + Math.round(drift * 20),
    energy:     clamp(dna.musical.energyCurve[cycle % dna.musical.energyCurve.length] + chaos),
    weirdness:  clamp(0.2 + cycle * 0.02, 0, 1.0),
    lyricTheme: selectTheme(dna.lyrical.themes, cycle),
    stemEffects: {
      pitchShift:  Math.sin(cycle * 0.15) * 2,           // ±2 semitones
      reverb:      clamp(0.1 + cycle * 0.03, 0, 0.9),
      timeStretch: clamp(1.0 + drift * 0.1, 0.8, 1.2),
    },
  };
}

// ---------------------------------------------------------------------------
// Section Conductor
// ---------------------------------------------------------------------------

export class SectionConductor {
  private dna: SongDNA;
  private phaseIndex: number;
  private _cycle: number;
  private _evolution: Evolution;
  private elapsed: number;         // seconds into current phase
  private _sliceQueue: VocalSlice[];

  constructor(dna: SongDNA) {
    this.dna = dna;
    this.phaseIndex = 0;
    this._cycle = 0;
    this._evolution = evolve(dna, 0);
    this.elapsed = 0;
    this._sliceQueue = this._buildSliceQueue();
  }

  // Build an ordered queue of vocal slices for peak/build phases
  private _buildSliceQueue(): VocalSlice[] {
    return this.dna.vocal.slices
      .filter(s => s.type === 'chorus' || s.type === 'verse')
      .sort((a, b) => a.startS - b.startS);
  }

  // Current phase name
  get phase(): Phase {
    return PHASES[this.phaseIndex];
  }

  get cycle(): number {
    return this._cycle;
  }

  get evolution(): Evolution {
    return this._evolution;
  }

  // Which source weights are active right now
  get weights(): SourceWeights {
    return PHASE_WEIGHTS[this.phase];
  }

  // The vocal slice to play during build/peak phases (null during others)
  get currentSlice(): VocalSlice | null {
    const p = this.phase;
    if (p !== 'build' && p !== 'peak') return null;
    // Pick a slice based on cycle + phaseIndex to vary across cycles
    const eligible = this._sliceQueue;
    if (eligible.length === 0) return null;
    const idx = (this._cycle + this.phaseIndex) % eligible.length;
    return eligible[idx];
  }

  // True during build phase — gives Suno ~80s to pre-generate next segment before drift phase
  get preGenerate(): boolean {
    return this.phase === 'build';
  }

  // Full snapshot of conductor state
  getState(): ConductorState {
    return {
      phase:       this.phase,
      cycle:       this._cycle,
      weights:     this.weights,
      slice:       this.currentSlice,
      preGenerate: this.preGenerate,
      evolution:   this._evolution,
    };
  }

  // Advance the phase manually (used in tests / forced transitions)
  advance(): void {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;
    this.elapsed = 0;
    if (this.phaseIndex === 0) {
      this._cycle++;
      this._evolution = evolve(this.dna, this._cycle);
    }
  }

  // Call every second from a setInterval; returns true when the phase just changed
  tick(): boolean {
    this.elapsed++;
    const duration = PHASE_DURATIONS_S[this.phase];
    if (this.elapsed >= duration) {
      this.advance();
      return true;
    }
    return false;
  }

  // Seconds remaining in the current phase
  get timeRemainingS(): number {
    return PHASE_DURATIONS_S[this.phase] - this.elapsed;
  }

  // Progress through current phase as 0–1
  get phaseProgress(): number {
    return this.elapsed / PHASE_DURATIONS_S[this.phase];
  }
}
