# Infinite Remix

A web app that takes seed song(s) and generates an infinite, continuously evolving remix with vocals and lyrics. Never loops — always progressing.

## Core Architecture: Hybrid Vocal System

The key innovation is a **Section Conductor** state machine that routes audio to three different sources based on the emotional phase of the remix:

```
build → peak → breakdown → drift → rebuild → build...
(cycle repeats with evolved parameters each time)
```

### Three Audio Sources

| Phase | Source | What plays |
|-------|--------|-----------|
| **Build** | Original stem (fading in) + Lyria instrumental | Real vocals gradually layered over instrumental bed |
| **Peak** | Original vocal stem (full) + Lyria instrumental | Actual recorded voice at full volume — highest quality moment |
| **Breakdown** | Lyria RealTime only | Instrumental solo — creates contrast, tension. Suno pre-generates next segment here |
| **Drift** | Suno V5 AI vocals + Lyria instrumental | New AI-generated vocals with Claude-written lyrics — this is where "infinite" lives |
| **Rebuild** | Suno (fading out) + Original stem (fading in) + Lyria | Crossfade from AI vocals back toward original stems |

### Why This Works
- Real vocals at peaks = highest audio quality at the moments that matter most
- Instrumental breakdowns = breathing room + free (Lyria is free) + time to pre-generate Suno segments
- AI vocals only during drifts = ~30-40% of playback, dramatically reduces API costs
- Anchoring with real voice at peaks solves the uncanny valley problem with AI vocals

## Tech Stack

- **Framework**: Next.js 15 (App Router, server actions)
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API + Tone.js (three-source mixer with independent gain envelopes)
- **Instrumental**: Lyria RealTime API (Gemini) — WebSocket, 48kHz stereo, 10-min sessions
- **Vocals**: Suno V5 API — upload-and-extend, ~$0.10/song, 44.1kHz
- **Lyrics**: Claude API (Sonnet) — Conductor-aware prompts that evolve thematically
- **Extraction**: yt-dlp (YouTube audio) + ffmpeg (stem slicing, conversion)
- **Storage**: Cloudflare R2 (stems + generated segments)
- **Database**: Supabase (user data, seed song library)
- **Queue**: Upstash Redis (generation queue, session state)
- **Deploy**: Vercel

## Song DNA

When a user provides a seed song, the system extracts a "Song DNA" object containing:
- Musical features: key, BPM, time signature, chord progression, energy curve, genre tags
- Vocal profile: gender, register, timbre description, stem URL, section-aligned slices
- Lyrical profile: themes, mood, rhyme scheme, syllable density
- Structure: section form (intro/verse/chorus/etc.), section lengths in bars

The vocal stem is both analyzed AND preserved as playback-ready slices (verse_0, chorus_0, etc.) so the Section Conductor can play the right vocal at the right moment during peaks.

## Section Conductor (State Machine)

```javascript
const PHASES = ['build', 'peak', 'breakdown', 'drift', 'rebuild'];

// Each phase controls gain levels for three sources:
// - lyria: always-on instrumental (WebSocket stream)
// - originalStem: real vocal recording from seed
// - suno: AI-generated vocal segment

// The Conductor advances through phases, and when it completes
// a full cycle, the evolution algorithm shifts parameters:
// BPM drifts, genre tags blend, lyric themes evolve,
// stem effects (pitch-shift, reverb, time-stretch) change
```

## Three-Source Mixer

```javascript
// Web Audio API architecture:
// lyria gain node ──┐
// originalStem gain ──┤──> compressor ──> destination
// suno gain ─────────┘
//
// Phase transitions use linearRampToValueAtTime for smooth crossfades
// Typical fade duration: 3 seconds between phases
```

## Evolution Algorithm

Each full Conductor cycle, parameters drift:
- BPM: ±20 from seed (sinusoidal oscillation)
- Energy: follows seed energy curve + random chaos
- Genre: gradually blends toward adjacent genres
- Lyric themes: rotates through seed themes, drifting further over time
- Weirdness: starts at 0.2, increases by 0.02 per cycle
- Stem effects: pitch-shift (±2 semitones), reverb (increasing), time-stretch

## API Cost: ~$0.35-0.45/hr

- Suno V5: ~3-4 segments/hr × $0.10 = $0.30-0.40
- Lyria RealTime: Free (experimental)
- Claude lyrics: ~3-4 calls × $0.01 = $0.04
- Original stems + Lyria breakdowns: Free (pre-extracted / free API)

## Build Phases

### Phase 1: Seed → Song DNA + Stems (1-2 days)
Next.js setup, URL input, yt-dlp extraction, Suno stem separation, vocal slicing with ffmpeg, Song DNA pipeline, Claude lyric/theme analysis

### Phase 2: Section Conductor + Stem Playback (2-3 days)
State machine (build/peak/breakdown/drift/rebuild), three-source Web Audio mixer, original stem playback with Tone.js pitch-shift/time-stretch, crossfade transitions, phase indicator UI. **Test with just stems + silence first — get the arc feeling musical before adding AI.**

### Phase 3: Lyria + Suno Integration (2-3 days)
Lyria RealTime WebSocket, Song DNA → Lyria prompts, 10-min session reconnect, Suno V5 for drift vocals, Claude lyrics with Conductor context, pre-generate during breakdowns, wire all three into mixer

### Phase 4: Polish & Ship (2-3 days)
Visualizer (color-coded per phase), live lyrics display, user controls (weirdness/energy/vocal balance), source indicators, journey timeline, error handling, deploy

## Key Files

- `docs/design.jsx` — Full interactive design document with diagrams and code examples
