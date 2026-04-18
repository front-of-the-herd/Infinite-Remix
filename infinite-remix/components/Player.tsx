'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { SongDNA, ConductorState, SourceWeights } from '@/types';
import { SectionConductor } from '@/lib/conductor';
import { PHASE_WEIGHTS } from '@/lib/conductor';
import type { StemPlayer } from '@/lib/stemPlayer';
import type { LyriaSession } from '@/lib/lyriaSession';
import PhaseStrip from './PhaseStrip';
import SourceMeters from './SourceMeters';
import LyricsDisplay from './LyricsDisplay';

interface PlayerProps {
  dna: SongDNA;
}

const INITIAL_WEIGHTS: SourceWeights = PHASE_WEIGHTS['build'];

export default function Player({ dna }: PlayerProps) {
  const conductorRef    = useRef<SectionConductor | null>(null);
  const mixerRef        = useRef<import('@/lib/mixer').HybridMixer | null>(null);
  const stemPlayerRef   = useRef<StemPlayer | null>(null);
  const lyriaSessionRef = useRef<LyriaSession | null>(null);
  const tickRef         = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<ConductorState>({
    phase:       'build',
    cycle:       0,
    weights:     INITIAL_WEIGHTS,
    slice:       null,
    preGenerate: false,
    evolution: {
      cycle:      0,
      bpm:        dna.musical.bpm,
      energy:     dna.musical.energyCurve[0],
      weirdness:  0.2,
      lyricTheme: dna.lyrical.themes[0],
      stemEffects: { pitchShift: 0, reverb: 0.1, timeStretch: 1.0 },
    },
  });
  const [progress, setProgress] = useState(0);
  const [started,  setStarted]  = useState(false);
  const [nextVocalUrl, setNextVocalUrl] = useState<string | null>(null);
  const [driftLyrics, setDriftLyrics] = useState<string | null>(null);
  const [activeLyrics, setActiveLyrics] = useState<string | null>(null);

  // Pre-generate Suno vocal during breakdown phase
  const triggerPreGenerate = useCallback(
    async (currentState: ConductorState) => {
      try {
        const prevLyrics = currentState.evolution.lyricTheme;
        const res = await fetch('/api/generate-vocals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dna,
            cycle:      currentState.cycle,
            prevLyrics: prevLyrics,
          }),
        });
        if (!res.ok) return;
        const { audioUrl, lyrics } = await res.json();
        setNextVocalUrl(audioUrl);
        setDriftLyrics(lyrics);
      } catch (err) {
        console.warn('Player: pre-generate failed', err);
      }
    },
    [dna]
  );

  // Start the conductor clock after user interaction (AudioContext requires gesture)
  const start = useCallback(async () => {
    if (started) return;

    // Lazy-import browser-only modules (requires user gesture for AudioContext)
    const [{ HybridMixer }, { StemPlayer: StemPlayerClass }, { LyriaSession: LyriaSessionClass }, Tone] = await Promise.all([
      import('@/lib/mixer'),
      import('@/lib/stemPlayer'),
      import('@/lib/lyriaSession'),
      import('tone'),
    ]);

    // Tone.start() unblocks the AudioContext after the user gesture
    await Tone.start();

    const mixer = new HybridMixer();
    await mixer.resume();
    mixerRef.current = mixer;

    const stemPlayer = new StemPlayerClass(mixer);
    stemPlayerRef.current = stemPlayer;

    const lyriaSession = new LyriaSessionClass(mixer);
    lyriaSessionRef.current = lyriaSession;

    const conductor = new SectionConductor(dna);
    conductorRef.current = conductor;

    // Apply initial weights
    mixer.transitionToPhase(conductor.weights, 0);

    // Build the initial evolution to pass to Lyria
    const initialEvolution = conductor.evolution;

    // Start Lyria streaming — fire-and-forget; it runs until stop() is called
    lyriaSession.connect(dna, initialEvolution).catch(err =>
      console.warn('LyriaSession: connect error', err)
    );

    setStarted(true);

    // Initial Suno pre-generation for Cycle 0
    const initState = conductor.getState();
    if (initState.preGenerate) {
       triggerPreGenerate(initState);
    }

    // Tick every second
    tickRef.current = setInterval(() => {
      const c  = conductorRef.current;
      const sp = stemPlayerRef.current;
      if (!c) return;

      const phaseChanged = c.tick();
      const snap = c.getState();

      if (phaseChanged) {
        const m = mixerRef.current;
        m?.transitionToPhase(snap.weights);

        // Trigger Suno pre-generation when entering build phase
        if (snap.preGenerate) {
          triggerPreGenerate(snap);
        }

        // Play Suno vocal when entering drift (if pre-generated segment is ready)
        if (snap.phase === 'drift' && m) {
          // Read the latest nextVocalUrl via a ref-style approach
          setNextVocalUrl(prev => {
            if (prev) {
              m.fetchAndDecode(prev)
                .then(buffer => {
                  m.connectSunoSegment(buffer);
                })
                .catch(err => console.warn('Player: suno decode error', err));
            } else {
              console.warn('Player: drift started but no Suno segment ready');
            }
            return prev;
          });
          // Show the lyrics for this drift
          setDriftLyrics(prev => {
            setActiveLyrics(prev);
            return prev;
          });
        }

        // Stop Suno vocal and clear lyrics when leaving drift/rebuild
        if (snap.phase === 'build' && m) {
          m.stopSunoSegment();
          setActiveLyrics(null);
          setNextVocalUrl(null);
          setDriftLyrics(null);
        }

        // Stem playback routing
        if (sp) {
          if (
            (snap.phase === 'build' || snap.phase === 'peak' || snap.phase === 'rebuild') &&
            snap.slice !== null
          ) {
            sp.playSlice(snap.slice, snap.evolution).catch(err =>
              console.warn('StemPlayer: playSlice error', err)
            );
          } else if (snap.phase === 'breakdown' || snap.phase === 'drift') {
            sp.stop();
          }
        }
      }

      setState(snap);
      setProgress(c.phaseProgress);
    }, 1000);
  }, [dna, started, triggerPreGenerate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      lyriaSessionRef.current?.stop();
      stemPlayerRef.current?.dispose();
      mixerRef.current?.dispose();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-orange-500">∞</span> Infinite Remix
          </h1>
          <p className="text-slate-500 text-sm">
            {dna.meta.title} — {dna.meta.artist}
          </p>
        </div>

        {/* Start button (required for AudioContext) */}
        {!started && (
          <div className="flex justify-center">
            <button
              onClick={start}
              className="rounded-full bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-400 transition-colors"
            >
              Start ∞
            </button>
          </div>
        )}

        {/* Phase strip */}
        <div className="rounded-xl border border-slate-800 bg-gray-900 p-4 space-y-4">
          <PhaseStrip currentPhase={state.phase} progress={progress} />
        </div>

        {/* Conductor info */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-slate-800 bg-gray-900 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phase</div>
            <div className="font-bold text-slate-100 capitalize">{state.phase}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gray-900 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cycle</div>
            <div className="font-bold text-slate-100">{state.cycle + 1}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gray-900 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Theme</div>
            <div className="font-bold text-slate-100 text-sm capitalize truncate">
              {state.evolution.lyricTheme}
            </div>
          </div>
        </div>

        {/* Evolution stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-slate-800 bg-gray-900 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">BPM</div>
            <div className="font-mono text-slate-100">{state.evolution.bpm}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gray-900 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Weirdness</div>
            <div className="font-mono text-slate-100">
              {state.evolution.weirdness.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-gray-900 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Energy</div>
            <div className="font-mono text-slate-100">
              {state.evolution.energy.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Source meters */}
        <div className="rounded-xl border border-slate-800 bg-gray-900 p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-4 text-center">
            Source Levels
          </div>
          <SourceMeters weights={state.weights} />
        </div>

        {/* Lyrics display */}
        <LyricsDisplay
          lyrics={activeLyrics ?? driftLyrics}
          phase={state.phase}
          preGenerating={state.preGenerate}
        />
      </div>
    </main>
  );
}
