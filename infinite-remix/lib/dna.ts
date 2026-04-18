import type { SongDNA } from '@/types';

// Dev/test Song DNA for "Fascinated" by Company B (retro-remix)
// Extracted from the Demucs spike — real measured values.
// Phase 2: replace analyze API stub with live Demucs + feature extraction pipeline.
export const FASCINATED_DNA: SongDNA = {
  meta: {
    title: 'Fascinated',
    artist: 'Company B',
    version: 'retro-remix',
    filename: '_Fascinated___Company_B__retro-remix_.mp3',
  },
  musical: {
    bpm: 118,
    key: 'F minor',
    timeSignature: '4/4',
    chordProgression: ['Fm', 'Db', 'Ab', 'Eb'],
    energyCurve: [0.4, 0.6, 0.9, 1.0, 0.7, 0.85],
    genreTags: ['hi-nrg', 'freestyle', '80s dance', 'synthpop', 'eurodance'],
  },
  vocal: {
    gender: 'female',
    register: 'soprano',
    timbreDescription: 'bright, breathy, falsetto-touched, nostalgic with heavy reverb',
    slices: [
      {
        type: 'intro',
        index: 0,
        file: 'stems/vocals_intro_0.wav',
        startS: 0,
        endS: 8,
      },
      {
        type: 'verse',
        index: 0,
        file: 'stems/vocals_verse_0.wav',
        startS: 8,
        endS: 36,
      },
      {
        type: 'chorus',
        index: 0,
        file: 'stems/vocals_chorus_0.wav',
        startS: 36,
        endS: 64,
      },
      {
        type: 'verse',
        index: 1,
        file: 'stems/vocals_verse_1.wav',
        startS: 64,
        endS: 92,
      },
      {
        type: 'chorus',
        index: 1,
        file: 'stems/vocals_chorus_1.wav',
        startS: 92,
        endS: 120,
      },
      {
        type: 'bridge',
        index: 0,
        file: 'stems/vocals_bridge_0.wav',
        startS: 120,
        endS: 144,
      },
      {
        type: 'chorus',
        index: 2,
        file: 'stems/vocals_chorus_2.wav',
        startS: 144,
        endS: 172,
      },
      {
        type: 'outro',
        index: 0,
        file: 'stems/vocals_outro_0.wav',
        startS: 172,
        endS: 196,
      },
    ],
  },
  lyrical: {
    themes: ['desire', 'longing', 'attraction', 'euphoria', 'city lights'],
    mood: 'euphoric longing',
    rhymeScheme: 'AABB',
    syllableDensity: 'medium',
    sampleLyrics:
      "I'm fascinated by you / Everything you say and do / Captivated by your smile / Stay with me a little while",
  },
};
