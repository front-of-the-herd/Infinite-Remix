# Infinite Remix — Claude Code Scaffolding Prompt

Paste this entire prompt into Claude Code to scaffold the project.

---

## Prompt

Scaffold a Next.js 15 project called "infinite-remix" with the following structure and constraints. Read all instructions carefully before writing any files.

### What we're building

A web app that takes a seed song and generates an infinite, evolving remix using three audio sources managed by a Section Conductor state machine:
- **Original vocal stems** (pre-separated by Demucs, sliced into sections)
- **Lyria RealTime** (continuous instrumental via WebSocket)
- **Suno V5** (AI-generated vocals for drift phases)

### Tech stack (exact versions)

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Tone.js (Web Audio scheduling)
- @google/genai (Lyria RealTime)

### Project structure to create

```
infinite-remix/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Seed input screen
│   ├── globals.css
│   └── api/
│       ├── analyze/route.ts        # POST: run Demucs + extract Song DNA
│       └── generate-vocals/route.ts # POST: call Suno V5 generate
├── components/
│   ├── SeedInput.tsx               # URL input + file upload UI
│   ├── Player.tsx                  # Main player with phase indicator
│   ├── PhaseStrip.tsx              # Visual conductor phase display
│   └── SourceMeters.tsx            # Three gain level indicators
├── lib/
│   ├── conductor.ts                # Section Conductor state machine (port from spike)
│   ├── mixer.ts                    # Web Audio three-source mixer
│   ├── stemPlayer.ts               # Loads + plays vocal stem slices
│   ├── lyriaSession.ts             # Lyria RealTime WebSocket session
│   ├── sunoClient.ts               # Suno V5 API client
│   └── dna.ts                      # Song DNA types + helpers
├── types/
│   └── index.ts                    # Shared TypeScript types
├── spikes/                         # Already exists — do not touch
├── test/                           # Already exists — do not touch
├── public/
│   └── fonts/
├── .env.local.example              # Template (never the real .env)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Exact instructions for each file

#### `package.json`
Include these dependencies:
```json
{
  "dependencies": {
    "next": "15.x",
    "react": "^19",
    "react-dom": "^19",
    "@google/genai": "latest",
    "tone": "^15"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^8"
  }
}
```

#### `types/index.ts`
Define these TypeScript types:
```typescript
export type Phase = 'build' | 'peak' | 'breakdown' | 'drift' | 'rebuild';

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
  lyria: number;
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
```

#### `lib/conductor.ts`
Port the Section Conductor from `spikes/conductor/conductor.js` directly into TypeScript. Keep all the logic identical — phase sequence, weights, slice selection, evolution algorithm, tick() method. Export the class and all helper functions. Add proper TypeScript types using the types from `types/index.ts`.

Key phase durations (seconds):
- build: 32, peak: 32, breakdown: 16, drift: 32, rebuild: 16

#### `lib/mixer.ts`
Scaffold the three-source Web Audio mixer. For now, stub the Lyria and Suno sources with silence — only the originalStem source needs to load real audio. Structure:

```typescript
export class HybridMixer {
  private ctx: AudioContext;
  private gains: { lyria: GainNode; originalStem: GainNode; suno: GainNode };
  private compressor: DynamicsCompressorNode;

  constructor() { /* create AudioContext, gain nodes, compressor, connect graph */ }

  transitionToPhase(weights: SourceWeights, fadeDuration = 3): void {
    // Use linearRampToValueAtTime for smooth crossfades
  }

  // Stub — wire to Lyria in Phase 3
  connectLyriaStream(stream: AudioNode): void {}

  // Stub — wire to Suno in Phase 3
  connectSunoSegment(buffer: AudioBuffer): void {}
}
```

#### `lib/stemPlayer.ts`
Loads a vocal slice WAV file via fetch + AudioContext.decodeAudioData, applies pitch shift and time stretch from the evolution params using Tone.js PitchShift, connects to the mixer's originalStem gain node. Include 200ms fade in/out on every slice to prevent clicks (we measured this is necessary in the spike).

#### `lib/lyriaSession.ts`
Stub only — export a `LyriaSession` class with `connect()`, `setPrompt()`, `play()`, `stop()` methods. All methods should log "Lyria: [method] called — not yet implemented" to the console. This gets wired up in Phase 3.

#### `lib/sunoClient.ts`
Implement the Suno vocal generation from `spikes/suno-vocal/run_spike.js` as a typed TypeScript client. Include:
- `generateDriftVocal(dna: SongDNA, cycle: number, prevLyrics: string): Promise<string>` — returns audio URL
- The exact style prompt and lyrics structure from the spike
- Poll logic with 5s intervals, 5 min timeout
- Proper error handling

#### `lib/dna.ts`
Export the Fascinated Song DNA object as a typed constant (from our CLAUDE.md spec). This is the dev/test DNA — in Phase 2 this gets replaced by the real analysis pipeline.

```typescript
export const FASCINATED_DNA: SongDNA = {
  // ... full object from CLAUDE.md
};
```

#### `app/api/analyze/route.ts`
Stub only — POST handler that accepts a `{ url?: string; file?: string }` body and returns the `FASCINATED_DNA` hardcoded for now. Log "analyze: returning hardcoded DNA for Phase 1 dev". This gets replaced with real Demucs + feature extraction in Phase 1.

#### `app/api/generate-vocals/route.ts`
Real implementation — POST handler that accepts `{ dna, cycle, prevLyrics }`, calls `sunoClient.generateDriftVocal()`, returns `{ audioUrl }`. Read `SUNO_API_KEY` from env.

#### `app/page.tsx`
The seed input screen. Should show:
- App name "Infinite Remix" with the ∞ symbol
- A URL input field with placeholder "Paste a YouTube or music URL"
- A "Generate" button
- On submit, call `/api/analyze` and transition to the player

Keep it visually clean and dark — reference the design doc aesthetic (dark background, orange accent `#f97316`).

#### `components/Player.tsx`
The main player screen. Receives a `SongDNA` prop. Should:
- Instantiate `HybridMixer` and `SectionConductor`  
- Run the conductor clock (tick every second using `setInterval`)
- On phase transition, call `mixer.transitionToPhase(weights)`
- When `preGenerate` is true (breakdown phase), trigger a Suno generation in the background
- Render `<PhaseStrip>` and `<SourceMeters>` as children
- Show current phase name, cycle number, and current lyric theme

#### `components/PhaseStrip.tsx`
A horizontal strip showing all 5 phases as pills. The active phase glows in its colour:
- build: amber, peak: rose, breakdown: cyan, drift: violet, rebuild: emerald
- Inactive phases are dim. Transitions animate smoothly.

#### `components/SourceMeters.tsx`
Three vertical level meters labelled "Lyria", "Stem", "Suno". Each shows the current gain weight (0–1) as a filled bar. Update in real time as the conductor advances phases.

#### `next.config.ts`
```typescript
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  // Allow ffmpeg binary execution in API routes
  serverExternalPackages: ['fluent-ffmpeg'],
};
export default nextConfig;
```

#### `.env.local.example`
```
SUNO_API_KEY=your_sunoapi_org_key_here
GEMINI_API_KEY=your_google_ai_studio_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### After scaffolding

Once all files are created, run:
```bash
npm install
npm run dev
```

The app should start on localhost:3000 showing the seed input screen. The "Generate" button should transition to the Player. The Section Conductor should start ticking through phases, the PhaseStrip should animate, and the SourceMeters should update — even though no real audio plays yet (stems, Lyria, and Suno are all stubbed).

That's the Phase 2 milestone: the conductor arc working visually before any audio is wired up.

### What NOT to build yet

- No real Demucs integration (stub the analyze route)
- No Lyria WebSocket connection (stub the session)  
- No real audio playback (the mixer connects nodes but has no audio sources)
- No file upload handling
- No database (Supabase) or queue (Redis)
- No deployment config

Those all come in Phases 2–4.

### Important notes for Claude Code

- The spikes directory already exists with working code — reference it, don't recreate it
- `lib/conductor.ts` should be a direct port of `spikes/conductor/conductor.js` — the logic is proven, don't change it
- `lib/sunoClient.ts` should be based on `spikes/suno-vocal/run_spike.js` — the endpoint and polling logic is proven
- The Fascinated Song DNA in `lib/dna.ts` has specific measured values — use the exact numbers from CLAUDE.md
- All API keys come from environment variables — never hardcode them
- Use TypeScript strictly throughout — no `any` types
