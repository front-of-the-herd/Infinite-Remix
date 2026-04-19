export type Phase = 'build' | 'peak' | 'breakdown' | 'drift' | 'rebuild';
export type InstrumentalEngine = 'tonejs' | 'suno';

export interface VocalSlice {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  index: number;
  file: string;       // local path relative to project root
  startS: number;
  endS: number;
}

export interface SongDNA {
  meta: { title: string; artist: string; version: string; filename: string };
  musical: {
    bpm: number;
    key: string;
    timeSignature: string;
    chordProgression: string[];
    energyCurve: number[];
    genreTags: string[];
  };
  vocal: {
    gender: 'male' | 'female';
    register: string;
    timbreDescription: string;
    slices: VocalSlice[];
  };
  lyrical: {
    themes: string[];
    mood: string;
    rhymeScheme: string;
    syllableDensity: string;
    sampleLyrics: string;
  };
}

export interface SourceWeights {
  instrumental: number;
  originalStem: number;
  suno: number;
}

export interface ConductorState {
  phase: Phase;
  cycle: number;
  weights: SourceWeights;
  slice: VocalSlice | null;
  preGenerate: boolean;
  evolution: Evolution;
}

export interface Evolution {
  cycle: number;
  bpm: number;
  energy: number;
  weirdness: number;
  lyricTheme: string;
  stemEffects: {
    pitchShift: number;
    reverb: number;
    timeStretch: number;
  };
}
