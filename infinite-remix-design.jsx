import { useState } from "react";

const sections = [
  "Overview",
  "Architecture",
  "Tech Stack",
  "Song Analysis",
  "Generation Engine",
  "Voice & Lyrics",
  "UI Design",
  "Data Flow",
  "API Costs",
  "Build Plan",
];

const ArchDiagram = () => (
  <svg viewBox="0 0 800 600" className="w-full" style={{ maxWidth: 760 }}>
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <linearGradient id="g4" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="g5" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="g6" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
      </filter>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill="#94a3b8" /></marker>
      <marker id="arrowOrange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill="#f97316" /></marker>
    </defs>

    {/* Layer 1: Input */}
    <rect x="20" y="20" width="220" height="80" rx="12" fill="url(#g1)" filter="url(#shadow)" />
    <text x="130" y="52" textAnchor="middle" fill="white" fontWeight="700" fontSize="14">SEED INPUT</text>
    <text x="130" y="72" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="11">YouTube URL / Upload / Multiple versions</text>

    <path d="M 130 100 L 130 140" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

    {/* Layer 2: Analysis */}
    <rect x="20" y="145" width="220" height="100" rx="12" fill="url(#g2)" filter="url(#shadow)" />
    <text x="130" y="175" textAnchor="middle" fill="white" fontWeight="700" fontSize="14">ANALYSIS ENGINE</text>
    <text x="130" y="195" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Stem separation (vocals/drums/bass)</text>
    <text x="130" y="210" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Key, BPM, chord progression, melody</text>
    <text x="130" y="225" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Lyric transcription & vocal profile</text>

    {/* DNA Store */}
    <rect x="290" y="120" width="200" height="80" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1.5" filter="url(#shadow)" />
    <text x="390" y="150" textAnchor="middle" fill="#f8fafc" fontWeight="700" fontSize="14">SONG DNA</text>
    <text x="390" y="168" textAnchor="middle" fill="#94a3b8" fontSize="10">Musical fingerprint + vocal stems</text>
    <text x="390" y="183" textAnchor="middle" fill="#94a3b8" fontSize="10">Chords, scale, tempo, style, themes</text>

    <path d="M 240 185 L 290 165" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

    {/* Vocal Stem Store */}
    <rect x="290" y="215" width="200" height="55" rx="12" fill="#1e293b" stroke="#f43f5e" strokeWidth="1.5" filter="url(#shadow)" />
    <text x="390" y="238" textAnchor="middle" fill="#f43f5e" fontWeight="700" fontSize="12">ORIGINAL VOCAL STEMS</text>
    <text x="390" y="255" textAnchor="middle" fill="#94a3b8" fontSize="10">Separated & time-sliced for playback</text>

    <path d="M 240 220 L 290 240" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

    {/* Three vocal sources */}
    <rect x="540" y="20" width="240" height="80" rx="12" fill="url(#g3)" filter="url(#shadow)" />
    <text x="660" y="47" textAnchor="middle" fill="white" fontWeight="700" fontSize="13">LYRIA REALTIME</text>
    <text x="660" y="65" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Continuous instrumental stream</text>
    <text x="660" y="80" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">WebSocket · 48kHz stereo · breakdowns</text>

    <rect x="540" y="115" width="240" height="80" rx="12" fill="url(#g5)" filter="url(#shadow)" />
    <text x="660" y="142" textAnchor="middle" fill="white" fontWeight="700" fontSize="13">SUNO V5 VOCALS</text>
    <text x="660" y="160" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">AI-generated new vocals + lyrics</text>
    <text x="660" y="175" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Used during drifts & rebuilds</text>

    <rect x="540" y="210" width="240" height="80" rx="12" fill="url(#g6)" filter="url(#shadow)" />
    <text x="660" y="237" textAnchor="middle" fill="white" fontWeight="700" fontSize="13">ORIGINAL VOCAL STEM</text>
    <text x="660" y="255" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Real vocals from the seed song</text>
    <text x="660" y="270" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Layered in during builds & peaks</text>

    <path d="M 490 155 L 540 60" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M 490 160 L 540 155" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <path d="M 490 250 L 540 250" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />

    {/* Section Conductor */}
    <rect x="540" y="315" width="240" height="75" rx="12" fill="#0f172a" stroke="#eab308" strokeWidth="2" filter="url(#shadow)" />
    <text x="660" y="342" textAnchor="middle" fill="#eab308" fontWeight="700" fontSize="13">SECTION CONDUCTOR</text>
    <text x="660" y="360" textAnchor="middle" fill="#94a3b8" fontSize="10">State machine: build → peak → breakdown</text>
    <text x="660" y="375" textAnchor="middle" fill="#94a3b8" fontSize="10">→ drift → rebuild → build...</text>

    <path d="M 660 100 L 660 105 L 700 105 L 700 315" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead)" strokeDasharray="4 3" />
    <path d="M 660 195 L 660 200 L 720 200 L 720 315" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead)" strokeDasharray="4 3" />
    <path d="M 660 290 L 660 295 L 740 295 L 740 315" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead)" strokeDasharray="4 3" />

    {/* Mixer */}
    <rect x="290" y="380" width="200" height="80" rx="12" fill="url(#g4)" filter="url(#shadow)" />
    <text x="390" y="410" textAnchor="middle" fill="white" fontWeight="700" fontSize="14">MIXER / CROSSFADER</text>
    <text x="390" y="430" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Web Audio API · Tone.js</text>
    <text x="390" y="445" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Seamless three-source blending</text>

    <path d="M 540 352 L 490 400" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="6 3" />

    {/* Output */}
    <rect x="290" y="500" width="200" height="70" rx="12" fill="#0f172a" stroke="#f97316" strokeWidth="2" filter="url(#shadow)" />
    <text x="390" y="530" textAnchor="middle" fill="#f97316" fontWeight="700" fontSize="15">∞ AUDIO OUTPUT</text>
    <text x="390" y="550" textAnchor="middle" fill="#94a3b8" fontSize="10">Infinite, evolving playback</text>

    <path d="M 390 460 L 390 500" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrowOrange)" />

    {/* Evolution loop */}
    <path d="M 200 535 C 80 535, 30 400, 130 290 L 130 245" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowOrange)" opacity="0.6" />
    <text x="55" y="420" fill="#f97316" fontSize="9" opacity="0.8" transform="rotate(-90, 55, 420)">feedback loop</text>
  </svg>
);

const ConductorDiagram = () => (
  <svg viewBox="0 0 800 200" className="w-full" style={{ maxWidth: 760 }}>
    <defs>
      <marker id="arr3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill="#64748b" /></marker>
    </defs>
    {[
      { x: 20, label: "BUILD", sub: "Original stem fades in", color: "#eab308" },
      { x: 170, label: "PEAK", sub: "Full original vocals", color: "#f43f5e" },
      { x: 320, label: "BREAKDOWN", sub: "Instrumental only", color: "#06b6d4" },
      { x: 470, label: "DRIFT", sub: "AI vocals (Suno)", color: "#8b5cf6" },
      { x: 620, label: "REBUILD", sub: "Suno → stem crossfade", color: "#10b981" },
    ].map((s, i) => (
      <g key={i}>
        <rect x={s.x} y="60" width="130" height="70" rx="10" fill={s.color} opacity="0.9" />
        <text x={s.x + 65} y="90" textAnchor="middle" fill="white" fontWeight="700" fontSize="12">{s.label}</text>
        <text x={s.x + 65} y="112" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">{s.sub}</text>
        {i < 4 && <path d={`M ${s.x + 130} 95 L ${s.x + 170} 95`} stroke="#64748b" strokeWidth="2" markerEnd="url(#arr3)" />}
      </g>
    ))}
    <path d="M 685 130 C 685 180, 400 190, 85 180 L 85 130" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr3)" />
    <text x="390" y="178" textAnchor="middle" fill="#f97316" fontSize="10" fontStyle="italic">cycle repeats — each time with evolved parameters</text>
  </svg>
);

const FlowDiagram = () => (
  <svg viewBox="0 0 800 280" className="w-full" style={{ maxWidth: 760 }}>
    <defs>
      <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill="#64748b" /></marker>
    </defs>
    {[
      { x: 20, label: "User pastes URL", sub: "or uploads file", color: "#f97316" },
      { x: 170, label: "Extract + split", sub: "stems & DNA", color: "#8b5cf6" },
      { x: 320, label: "Conductor decides", sub: "section phase", color: "#eab308" },
      { x: 470, label: "Route to source", sub: "stem / Suno / Lyria", color: "#06b6d4" },
      { x: 620, label: "Mix + play", sub: "crossfade output", color: "#10b981" },
    ].map((s, i) => (
      <g key={i}>
        <rect x={s.x} y="100" width="130" height="70" rx="10" fill={s.color} opacity="0.9" />
        <text x={s.x + 65} y="128" textAnchor="middle" fill="white" fontWeight="700" fontSize="11">{s.label}</text>
        <text x={s.x + 65} y="148" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">{s.sub}</text>
        {i < 4 && <path d={`M ${s.x + 130} 135 L ${s.x + 170} 135`} stroke="#64748b" strokeWidth="2" markerEnd="url(#arr2)" />}
      </g>
    ))}
    <path d="M 685 170 C 685 230, 400 240, 400 200 L 400 170" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr2)" />
    <text x="540" y="228" fill="#f97316" fontSize="10" fontStyle="italic">evolution loop — parameters drift each cycle</text>
  </svg>
);

export default function InfiniteRemixDesign() {
  const [active, setActive] = useState(0);

  const content = [
    // 0: Overview
    <div key="overview">
      <h2 style={h2Style}>Project Vision</h2>
      <p style={pStyle}>
        <strong>Infinite Remix</strong> is a web app that takes one or more versions of a song (original, remixes, covers) as a "seed" and generates an <em>infinite, continuously evolving</em> remix — never looping, always progressing — complete with vocals and lyrics.
      </p>
      <div style={cardStyle}>
        <div style={{ fontSize: 13, color: "#f97316", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>THE CORE IDEA</div>
        <p style={{ ...pStyle, margin: 0 }}>
          Think of it like a river flowing from a mountain spring. The spring is the seed song — the river is your infinite remix. It carries the essence of the source but the water is always new, always moving. The terrain it flows through (the evolution algorithm) ensures it never circles back.
        </p>
      </div>
      <h3 style={h3Style}>Key Requirements</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { icon: "🎵", title: "Audio Quality First", desc: "Real vocals at peaks, AI vocals during drifts — best of both" },
          { icon: "♾️", title: "Truly Infinite", desc: "Never loops — continuously generates new material" },
          { icon: "🎤", title: "Hybrid Vocal System", desc: "Original stems + AI vocals + instrumental sections" },
          { icon: "🧬", title: "Seed-Faithful", desc: "Always sounds 'related to' the original — like DNA" },
        ].map((item, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: 14 }}>{item.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // 1: Architecture
    <div key="arch">
      <h2 style={h2Style}>System Architecture</h2>
      <p style={pStyle}>The system has five major layers. The key innovation is the <strong>Section Conductor</strong> — a state machine that decides which of three vocal sources to use based on the emotional arc of the remix.</p>
      <ArchDiagram />
      <h3 style={h3Style}>Three Vocal Sources, One Conductor</h3>
      <p style={pStyle}>
        Instead of relying solely on AI-generated vocals, the system uses a <strong>three-tier vocal approach</strong> driven by a Section Conductor state machine:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={{ ...cardStyle, borderTop: "3px solid #eab308" }}>
          <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Builds & Peaks</div>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>Layer in the <strong style={{color:"#f8fafc"}}>original vocal stem</strong> from the seed. This grounds the listener — the real voice at emotional high points says "this is still that song."</div>
        </div>
        <div style={{ ...cardStyle, borderTop: "3px solid #06b6d4" }}>
          <div style={{ color: "#06b6d4", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Breakdowns</div>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>Drop to <strong style={{color:"#f8fafc"}}>instrumental only</strong> via Lyria RealTime. Creates breathing room, contrast, and tension. Also saves API credits — Lyria is free.</div>
        </div>
        <div style={{ ...cardStyle, borderTop: "3px solid #8b5cf6" }}>
          <div style={{ color: "#8b5cf6", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Drifts & Rebuilds</div>
          <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>Let Suno V5 generate <strong style={{color:"#f8fafc"}}>new vocal phrases</strong> in the style of the seed. This is where the "infinite" magic lives — new lyrics, same DNA.</div>
        </div>
      </div>
      <div style={warnStyle}>
        <strong>Why this is better than all-AI vocals:</strong> By anchoring the experience with the real voice at peaks, you reset the listener's expectations. By the time AI vocals come in during drift sections, the ear is already primed to accept them. This solves the uncanny valley problem — the listener isn't constantly evaluating whether the voice sounds "right."
      </div>
    </div>,

    // 2: Tech Stack
    <div key="stack">
      <h2 style={h2Style}>Recommended Tech Stack</h2>
      <p style={pStyle}>Optimized for vibe-coding with Claude Code — everything is JavaScript/TypeScript, minimal config, maximum productivity.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { cat: "Frontend", items: [
            { name: "Next.js 15", why: "App router, server actions, great DX" },
            { name: "Web Audio API", why: "Three-source mixing, crossfading, effects" },
            { name: "Tailwind CSS", why: "Fast styling, vibe-code friendly" },
            { name: "Framer Motion", why: "Audio visualizer animations" },
          ]},
          { cat: "Backend / API", items: [
            { name: "Next.js API Routes", why: "Keep it simple — one codebase" },
            { name: "Suno V5 API", why: "Best vocal quality, upload+extend" },
            { name: "Gemini API (Lyria RT)", why: "Real-time instrumental WebSocket" },
            { name: "Claude API", why: "Lyric generation & style analysis" },
          ]},
          { cat: "Audio Processing", items: [
            { name: "yt-dlp (server)", why: "Extract audio from YouTube URLs" },
            { name: "ffmpeg (server)", why: "Stem slicing, segment splitting" },
            { name: "Tone.js (client)", why: "Advanced Web Audio scheduling" },
            { name: "Meyda.js (client)", why: "Real-time audio feature extraction" },
          ]},
          { cat: "Infrastructure", items: [
            { name: "Vercel", why: "Deploy Next.js, serverless functions" },
            { name: "Cloudflare R2", why: "Store stems + generated segments" },
            { name: "Upstash Redis", why: "Queue management, session state" },
            { name: "Supabase", why: "User data, seed song library" },
          ]},
        ].map((group, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: 12, color: "#f97316", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>{group.cat.toUpperCase()}</div>
            {group.items.map((item, j) => (
              <div key={j} style={{ marginBottom: 8 }}>
                <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: 13 }}>{item.name}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}> — {item.why}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>,

    // 3: Song Analysis
    <div key="analysis">
      <h2 style={h2Style}>Song Analysis Pipeline</h2>
      <p style={pStyle}>When a user provides a seed song, the system extracts a "Song DNA" — a structured representation of everything that makes that song what it is. Critically, it also preserves the <strong>original vocal stems</strong> for playback during peak sections.</p>
      
      <h3 style={h3Style}>Step 1: Audio Extraction</h3>
      <div style={codeStyle}>{`// Server-side: extract audio from YouTube
const audio = await ytdlp(url, { format: 'bestaudio', output: 'seed.wav' });

// Or handle direct file upload
const audio = await processUpload(file); // normalize to WAV`}</div>

      <h3 style={h3Style}>Step 2: Stem Separation & Vocal Preservation</h3>
      <p style={pStyle}>
        Use Suno's stem separation API (or Demucs as a fallback) to isolate up to 12 stems. The vocal stem is both analyzed for DNA <em>and</em> preserved as sliced audio segments for direct playback during peak sections.
      </p>
      <div style={codeStyle}>{`// Separate stems AND prepare vocal slices for playback
const stems = await suno.generateStems(seedAudio);

// Save the full vocal stem for the Section Conductor
await storage.put('stems/vocals_full.wav', stems.vocals);

// Also slice vocals into section-aligned chunks using ffmpeg
// so the Conductor can layer them in at musically appropriate points
const sections = analyzeSections(seedAudio); // intro, verse, chorus...
for (const section of sections) {
  await ffmpeg.slice(stems.vocals, section.start, section.end,
    \`stems/vocals_\${section.type}_\${section.index}.wav\`);
}`}</div>

      <h3 style={h3Style}>Step 3: Feature Extraction → Song DNA</h3>
      <div style={codeStyle}>{`// The Song DNA object — your song's genetic code
{
  "meta": {
    "title": "Blinding Lights",
    "versions": ["original", "remix_1", "cover_1"]
  },
  "musical": {
    "key": "F minor",
    "bpm": 171,
    "time_signature": "4/4",
    "chord_progression": ["Fm", "Ab", "Eb", "Bb"],
    "scale": "minor",
    "energy_curve": [0.3, 0.5, 0.8, 1.0, 0.6, 0.9],
    "genre_tags": ["synthwave", "80s pop", "dance"]
  },
  "vocal": {
    "gender": "male",
    "register": "tenor",
    "timbre_description": "breathy, falsetto-heavy, nostalgic",
    "stem_url": "r2://stems/vocals_full.wav",
    "slices": [
      { "type": "verse", "index": 0, "url": "r2://stems/vocals_verse_0.wav" },
      { "type": "chorus", "index": 0, "url": "r2://stems/vocals_chorus_0.wav" },
      { "type": "chorus", "index": 1, "url": "r2://stems/vocals_chorus_1.wav" }
    ]
  },
  "lyrical": {
    "themes": ["loneliness", "nightlife", "longing", "city lights"],
    "mood": "melancholic euphoria",
    "rhyme_scheme": "ABAB",
    "syllable_density": "medium",
    "sample_lyrics": "I look around and Sin City's cold and empty..."
  },
  "structural": {
    "form": ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus"],
    "section_lengths_bars": [4, 8, 8, 8, 8, 4, 8]
  }
}`}</div>
      <div style={warnStyle}>
        <strong>Multiple versions:</strong> When the user provides covers/remixes, the DNA merges features across all versions. Chord progressions are averaged, genre tags are unioned, and vocal profiles are stored as an array. You also get multiple sets of vocal slices — the Section Conductor can alternate between them at different peaks for variety.
      </div>
    </div>,

    // 4: Generation Engine
    <div key="generation">
      <h2 style={h2Style}>The Generation Engine</h2>
      <p style={pStyle}>The heart of the app. Rather than generating all audio the same way, a <strong>Section Conductor</strong> state machine routes each moment of the remix to the right audio source.</p>

      <h3 style={h3Style}>The Section Conductor</h3>
      <p style={pStyle}>The Conductor cycles through five phases, each using different audio sources. The cycle repeats infinitely, but each iteration the evolution algorithm shifts the parameters — so the builds get more intense, the drifts get weirder, and the overall sound evolves.</p>
      <ConductorDiagram />

      <div style={codeStyle}>{`// Section Conductor — the brain of the infinite remix
const PHASES = ['build', 'peak', 'breakdown', 'drift', 'rebuild'];

class SectionConductor {
  constructor(dna) {
    this.dna = dna;
    this.phase = 0;
    this.cycle = 0;
    this.evolution = evolve(dna, 0);
  }

  getCurrentPhase() { return PHASES[this.phase]; }

  // What audio sources should be active right now?
  getActiveSources() {
    switch (this.getCurrentPhase()) {
      case 'build':
        return {
          lyria: { active: true, weight: 0.8 },        // instrumental bed
          originalStem: { active: true, weight: 0.3 },  // fading in
          suno: { active: false }
        };
      case 'peak':
        return {
          lyria: { active: true, weight: 0.6 },         // supporting
          originalStem: { active: true, weight: 1.0 },   // FULL original voice
          suno: { active: false }
        };
      case 'breakdown':
        return {
          lyria: { active: true, weight: 1.0 },          // solo instrumental
          originalStem: { active: false },
          suno: { active: false }
        };
      case 'drift':
        return {
          lyria: { active: true, weight: 0.7 },          // instrumental bed
          originalStem: { active: false },
          suno: { active: true, weight: 0.9 }            // NEW AI vocals
        };
      case 'rebuild':
        return {
          lyria: { active: true, weight: 0.8 },
          originalStem: { active: true, weight: 0.4 },   // fading back in
          suno: { active: true, weight: 0.5 }            // fading out
        };
    }
  }

  advance() {
    this.phase = (this.phase + 1) % PHASES.length;
    if (this.phase === 0) {
      this.cycle++;
      this.evolution = evolve(this.dna, this.cycle); // parameters shift
    }
  }
}`}</div>

      <h3 style={h3Style}>The Three Audio Sources</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <div style={{ ...cardStyle, borderLeft: "3px solid #eab308" }}>
          <div style={{ color: "#eab308", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Source 1: Original Vocal Stems</div>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            Pre-separated during analysis. The Conductor picks which vocal slice to play (verse, chorus) and layers it over the Lyria instrumental at the right moment. As cycles progress, the Conductor can pitch-shift, time-stretch, or add reverb to the original stems to make them feel fresh while remaining recognizable. This is the <strong style={{color:"#f8fafc"}}>highest quality audio</strong> in the system — real recorded sound.
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #06b6d4" }}>
          <div style={{ color: "#06b6d4", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Source 2: Lyria RealTime Instrumental</div>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            The continuous backbone. Always running, always evolving. During breakdowns it's the sole audio source. During peaks and drifts it provides the harmonic/rhythmic bed under the vocals. Steered by Song DNA prompts that drift over time.
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: "3px solid #8b5cf6" }}>
          <div style={{ color: "#8b5cf6", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Source 3: Suno V5 AI Vocals</div>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            Generated asynchronously during breakdown phases (when they're not needed) so they're ready for drift sections. Claude writes evolving lyrics, Suno sings them. Only used during drifts and rebuilds — roughly <strong style={{color:"#f8fafc"}}>30-40% of total playback time</strong>, dramatically reducing API costs.
          </p>
        </div>
      </div>

      <h3 style={h3Style}>The Evolution Algorithm</h3>
      <p style={pStyle}>Each full cycle of the Conductor, the generation parameters drift. Early cycles stay close to the seed. Later cycles get more adventurous.</p>
      <div style={codeStyle}>{`// Evolution controller — runs each time the Conductor completes a cycle
function evolve(dna, cycle) {
  const drift = Math.sin(cycle * 0.1) * 0.3;
  const chaos = Math.random() * 0.15;
  
  return {
    bpm: dna.musical.bpm + Math.round(drift * 20),
    energy: clamp(dna.musical.energy_curve[cycle % 6] + chaos),
    genre_blend: shiftGenres(dna.musical.genre_tags, cycle),
    lyric_theme_drift: selectTheme(dna.lyrical.themes, cycle),
    weirdness: 0.2 + (cycle * 0.02),  // gradually more experimental
    stem_effects: {                     // original stems evolve too
      pitchShift: Math.sin(cycle * 0.15) * 2,  // ±2 semitones
      reverb: 0.1 + (cycle * 0.03),
      timeStretch: 1.0 + (drift * 0.1),
    }
  };
}`}</div>
    </div>,

    // 5: Voice & Lyrics
    <div key="voice">
      <h2 style={h2Style}>Hybrid Voice & Lyrics System</h2>
      <p style={pStyle}>The vocal system has three tiers, each serving a different emotional function in the remix. The Section Conductor decides which tier is active at any given moment.</p>

      <h3 style={h3Style}>Tier 1: Original Vocal Stems (Peaks)</h3>
      <p style={pStyle}>
        During builds and peaks, the system layers the <strong>actual vocal recording</strong> from the seed song over the Lyria instrumental bed. This is the anchor — the moment where the listener connects most deeply with the original. The stems were separated and sliced during the analysis phase, so the Conductor can select the right section (chorus vocal over a chorus moment, for instance).
      </p>
      <div style={codeStyle}>{`// Playing original vocal stems during peak phase
class StemPlayer {
  constructor(ctx) {
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.pitchShifter = new Tone.PitchShift();
  }

  async playSlice(sliceUrl, evolution) {
    const buffer = await fetchAudioBuffer(sliceUrl);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    // Apply evolution effects — keeps stems fresh across cycles
    this.pitchShifter.pitch = evolution.stem_effects.pitchShift;
    source.playbackRate.value = evolution.stem_effects.timeStretch;
    
    source.connect(this.pitchShifter);
    this.pitchShifter.connect(this.gain);
    this.gain.connect(this.ctx.destination);
    source.start();
  }
}`}</div>
      <div style={warnStyle}>
        <strong>Why this matters for quality:</strong> Your top priority is audio quality. Nothing sounds better than the actual recorded voice. By placing it at the emotional peaks — the moments the listener cares about most — you guarantee the highest-impact moments have the highest fidelity.
      </div>

      <h3 style={h3Style}>Tier 2: Instrumental Breakdowns (Lyria)</h3>
      <p style={pStyle}>
        During breakdown phases, all vocals drop out. Lyria RealTime handles these sections solo — its continuous streaming nature means there are zero gaps or loading delays. These sections create contrast and tension, making the return of vocals (whether real or AI) more impactful. They also serve a practical purpose: while the breakdown plays, the system pre-generates the next Suno vocal segment in the background.
      </p>

      <h3 style={h3Style}>Tier 3: AI-Generated Vocals (Drifts)</h3>
      <p style={pStyle}>
        This is where the "infinite" part truly lives. During drift and rebuild phases, Suno V5 generates new vocal phrases with lyrics written by Claude. The lyrics evolve thematically from the seed song.
      </p>
      <div style={codeStyle}>{`// Claude lyric generation — aware of the Conductor's phase context
const lyrics = await claude.messages.create({
  model: "claude-sonnet-4-20250514",
  messages: [{
    role: "user",
    content: \`You are writing lyrics for the DRIFT phase of an infinite remix.

Original song themes: \${dna.lyrical.themes.join(", ")}
Original mood: \${dna.lyrical.mood}
Rhyme scheme: \${dna.lyrical.rhyme_scheme}

We are on evolution cycle \${cycle}. The remix has been playing for
\${cycle * 5} minutes. The mood has been drifting toward:
\${evolution.lyric_theme_drift}

The listener just heard the original chorus vocal during the peak.
Now the song is entering a drift phase — the vocals should feel
like a natural continuation but exploring new territory.

Previous AI-generated lyrics ended with: "\${prevLyrics.lastLine}"

Write one verse. Stay in the same emotional universe as the 
original but let the imagery evolve. Keep it to 4-6 lines.\`
  }]
});`}</div>

      <h3 style={h3Style}>The Crossfade Pipeline</h3>
      <p style={pStyle}>The mixer manages three simultaneous audio sources with independent gain envelopes. Transitions between phases use smooth crossfades so the listener never hears a hard cut.</p>
      <div style={codeStyle}>{`// Three-source mixer with smooth phase transitions
class HybridMixer {
  constructor() {
    this.ctx = new AudioContext();
    this.gains = {
      lyria: this.ctx.createGain(),       // always-on instrumental
      originalStem: this.ctx.createGain(), // real vocals
      suno: this.ctx.createGain(),         // AI vocals
    };
    // All connect to a master compressor → destination
    this.compressor = this.ctx.createDynamicsCompressor();
    Object.values(this.gains).forEach(g => g.connect(this.compressor));
    this.compressor.connect(this.ctx.destination);
  }

  transitionToPhase(sources, fadeDuration = 3) {
    const now = this.ctx.currentTime;
    for (const [key, gain] of Object.entries(this.gains)) {
      const target = sources[key]?.active ? sources[key].weight : 0;
      gain.gain.linearRampToValueAtTime(target, now + fadeDuration);
    }
  }
}`}</div>
    </div>,

    // 6: UI Design
    <div key="ui">
      <h2 style={h2Style}>UI Design Spec</h2>
      <p style={pStyle}>The interface should feel like a living, breathing organism — not a static music player. The Section Conductor's phases should be visible so the listener can see the journey.</p>

      <h3 style={h3Style}>Screen 1: Seed Input</h3>
      <div style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#0f172a", borderRadius: 12, padding: 24, border: "1px solid #1e293b" }}>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>PASTE A SONG URL OR UPLOAD AUDIO</div>
            <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", color: "#475569", fontSize: 14 }}>
              https://music.youtube.com/watch?v=...
            </div>
            <div style={{ color: "#475569", fontSize: 11, marginTop: 8 }}>or drag & drop audio files here</div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <div style={{ background: "#f97316", color: "white", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Generate Infinite Remix</div>
            </div>
          </div>
          <div style={{ color: "#64748b", fontSize: 11, fontStyle: "italic" }}>Add multiple versions (remixes, covers) for richer DNA</div>
        </div>
      </div>

      <h3 style={h3Style}>Screen 2: The Player</h3>
      <p style={pStyle}>Once generating, the UI transforms into an immersive player. The Section Conductor's current phase is always visible.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { title: "Audio Visualizer", desc: "Central reactive visual — changes color per Conductor phase: warm gold during peaks (original vocals), cool cyan during breakdowns, violet during drifts (AI vocals)." },
          { title: "Conductor Phase Strip", desc: "Horizontal bar showing the current phase (build/peak/breakdown/drift/rebuild) with a glowing indicator. Shows what's coming next so the listener can anticipate transitions." },
          { title: "Live Lyrics Display", desc: "Shows original lyrics during peaks and AI-generated lyrics during drifts. Typewriter animation. Subtle visual difference (e.g. font weight) distinguishes original vs generated." },
          { title: "Evolution Controls", desc: "Sliders for 'Weirdness', 'Energy', and 'Vocal Balance' (how much original vs AI vocal). Let the user steer the evolution in real time." },
          { title: "Source Indicators", desc: "Three small meters showing the current mix levels: Lyria (instrumental), Original Stem, and Suno (AI vocals). Lets the user see exactly what's playing." },
          { title: "Journey Timeline", desc: "A scrolling track showing completed cycles, each with its mood/genre label. Shows how far the remix has evolved from the seed." },
        ].map((item, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ color: "#f97316", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>,

    // 7: Data Flow
    <div key="flow">
      <h2 style={h2Style}>End-to-End Data Flow</h2>
      <p style={pStyle}>The complete journey from URL input to infinite audio output, now routed through the Section Conductor.</p>
      <FlowDiagram />
      <h3 style={h3Style}>Detailed Sequence</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { step: 1, title: "Input", desc: "User pastes YouTube URL(s) or uploads audio file(s). Server extracts audio via yt-dlp or stores upload." },
          { step: 2, title: "Stem Separation", desc: "Audio split into stems. Vocal stem preserved as section-aligned slices (verse, chorus, etc.) for direct playback. Other stems analyzed for DNA." },
          { step: 3, title: "Song DNA Assembly", desc: "Musical features, vocal profile, lyrical themes, and vocal slice references all combined into the Song DNA object." },
          { step: 4, title: "Initial Setup", desc: "Lyria RealTime session started. First Suno vocal segment pre-generated. Vocal stem slices loaded into client buffer." },
          { step: 5, title: "Conductor Starts", desc: "Section Conductor enters BUILD phase. Lyria instrumental plays, original vocal stem begins fading in." },
          { step: 6, title: "Peak → Breakdown", desc: "Original vocals at full volume for PEAK. Then all vocals drop for BREAKDOWN (Lyria solo). During breakdown, Suno generates the next AI vocal segment in background." },
          { step: 7, title: "Drift → Rebuild", desc: "AI vocals (Suno) enter for DRIFT phase. Then crossfade from AI vocals back toward original stems for REBUILD." },
          { step: 8, title: "Cycle Repeats", desc: "Conductor returns to BUILD. Evolution algorithm shifts all parameters. Each cycle sounds different from the last but connected to the seed." },
        ].map((item) => (
          <div key={item.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ minWidth: 32, height: 32, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>{item.step}</div>
            <div>
              <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 13 }}>{item.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // 8: API Costs
    <div key="costs">
      <h2 style={h2Style}>API Cost Estimates</h2>
      <p style={pStyle}>The hybrid vocal approach significantly reduces costs. Original stems and Lyria are free — Suno is only needed during drift/rebuild phases (~30-40% of playback).</p>
      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              <th style={thStyle}>Service</th>
              <th style={thStyle}>Usage / Hour</th>
              <th style={thStyle}>Rate</th>
              <th style={thStyle}>Cost / Hour</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Suno V5 (drift vocals)", "~3-4 segments × 4 min", "~$0.10/song", "$0.30-0.40"],
              ["Lyria RealTime", "6 × 10min sessions", "Free (Gemini API)", "$0.00"],
              ["Original vocal stems", "Pre-separated at start", "Already extracted", "$0.00"],
              ["Claude (lyrics)", "~3-4 calls", "~$0.01/call (Sonnet)", "$0.04"],
              ["yt-dlp + ffmpeg", "One-time at start", "Self-hosted", "$0.00"],
              ["Storage (R2)", "~300MB/hr", "$0.015/GB", "$0.005"],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "10px 12px", color: j === 3 ? "#10b981" : "#94a3b8" }}>{cell}</td>
                ))}
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #f97316" }}>
              <td colSpan={3} style={{ padding: "10px 12px", color: "#f8fafc", fontWeight: 700 }}>TOTAL PER HOUR</td>
              <td style={{ padding: "10px 12px", color: "#f97316", fontWeight: 700, fontSize: 16 }}>~$0.35-0.45</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={warnStyle}>
        <strong>~50% cheaper than the previous all-AI-vocal design</strong> ($0.89/hr), because the original vocal stems and Lyria breakdowns handle the majority of playback for free. You only burn Suno credits during drift phases. The Lyria RealTime API is currently free during its experimental phase.
      </div>
      <p style={pStyle}>
        At ~$0.40/hr, a $9.99/month subscription easily covers several hours of daily generation. This is a very viable business model.
      </p>
    </div>,

    // 9: Build Plan
    <div key="plan">
      <h2 style={h2Style}>Build Plan for Claude Code</h2>
      <p style={pStyle}>Optimized for vibe-coding — each phase produces something testable. Phase 2 now focuses on the Section Conductor as the central piece.</p>

      {[
        { phase: "Phase 1", title: "Seed → Song DNA + Stems", time: "1-2 days", tasks: [
          "Set up Next.js project with Tailwind",
          "Build URL input + file upload UI",
          "Server route: yt-dlp audio extraction",
          "Integrate Suno stem separation API",
          "Slice vocal stems into section-aligned chunks (verse, chorus, etc.)",
          "Build Song DNA extraction pipeline (BPM, key, chords)",
          "Use Claude to analyze lyrics/themes from vocal transcription",
          "Store stems + DNA in R2, display Song DNA as a visual card",
        ]},
        { phase: "Phase 2", title: "Section Conductor + Stem Playback", time: "2-3 days", tasks: [
          "Build the Section Conductor state machine (build/peak/breakdown/drift/rebuild)",
          "Web Audio API: three-source mixer with independent gain envelopes",
          "Implement original stem playback with pitch-shift and time-stretch via Tone.js",
          "Build crossfade transitions between Conductor phases",
          "Basic player UI with phase indicator strip",
          "Test with just stems + silence (no AI generation yet) — verify the arc feels musical",
        ]},
        { phase: "Phase 3", title: "Lyria + Suno Integration", time: "2-3 days", tasks: [
          "Connect Lyria RealTime via WebSocket for continuous instrumental",
          "Map Song DNA to Lyria prompt weights, implement drift per cycle",
          "Handle 10-min Lyria session limits (auto-reconnect)",
          "Integrate Suno V5 API for drift-phase vocal generation",
          "Claude lyric generation with Conductor-aware context",
          "Pre-generate Suno segments during breakdown phases",
          "Wire all three sources into the mixer via the Conductor",
        ]},
        { phase: "Phase 4", title: "Polish & Ship", time: "2-3 days", tasks: [
          "Build immersive visualizer — color-coded per Conductor phase",
          "Live lyrics display (original vs AI-generated distinction)",
          "User controls: weirdness, energy, vocal balance sliders",
          "Source level indicators (Lyria / Stem / Suno meters)",
          "Journey timeline showing completed evolution cycles",
          "Error handling, loading states, mobile responsive",
          "Deploy to Vercel + set up R2 storage",
        ]},
      ].map((phase, i) => (
        <div key={i} style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ color: "#f97316", fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>{phase.phase}</span>
              <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16, marginLeft: 10 }}>{phase.title}</span>
            </div>
            <span style={{ color: "#64748b", fontSize: 12 }}>{phase.time}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {phase.tasks.map((task, j) => (
              <div key={j} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#334155", flexShrink: 0 }} />
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{task}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ ...cardStyle, border: "1px solid #f97316", background: "rgba(249,115,22,0.05)" }}>
        <div style={{ color: "#f97316", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Claude Code Tip</div>
        <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
          The Section Conductor is the most important piece to get right. Start Phase 2 by telling Claude Code: "Build a state machine that cycles through build/peak/breakdown/drift/rebuild phases. Each phase should control gain levels for three audio sources. For now, use test audio files — I want to hear the crossfades between phases work smoothly." Get the arc feeling musical before you add any AI generation.
        </p>
      </div>
    </div>,
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#0a0e1a", color: "#e2e8f0", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a0a2e 50%, #0f172a 100%)", borderBottom: "1px solid #1e293b", padding: "32px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>∞</span>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: -0.5 }}>Infinite Remix</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>App Design Document — Hybrid Vocal Architecture — Vibe-Coded with Claude Code</p>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, zIndex: 10, overflowX: "auto" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 0, padding: "0 24px" }}>
          {sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: "12px 16px",
                fontSize: 12,
                fontWeight: active === i ? 700 : 500,
                color: active === i ? "#f97316" : "#64748b",
                background: "none",
                border: "none",
                borderBottom: active === i ? "2px solid #f97316" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        {content[active]}
      </div>

      {/* Footer nav */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 48px", display: "flex", justifyContent: "space-between" }}>
        {active > 0 && (
          <button onClick={() => setActive(active - 1)} style={navBtnStyle}>
            ← {sections[active - 1]}
          </button>
        )}
        <div />
        {active < sections.length - 1 && (
          <button onClick={() => setActive(active + 1)} style={{ ...navBtnStyle, background: "#f97316", color: "white", borderColor: "#f97316" }}>
            {sections[active + 1]} →
          </button>
        )}
      </div>
    </div>
  );
}

const pStyle = { color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 16 };
const h2Style = { color: "#f8fafc", fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: -0.3 };
const h3Style = { color: "#e2e8f0", fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 10 };
const cardStyle = { background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 16, marginBottom: 12 };
const codeStyle = { background: "#0a0e1a", border: "1px solid #1e293b", borderRadius: 8, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8b9dc3", lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre", marginBottom: 16 };
const warnStyle = { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 10, padding: 16, color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 16 };
const thStyle = { padding: "10px 12px", textAlign: "left", color: "#f8fafc", fontWeight: 600, fontSize: 12 };
const navBtnStyle = { padding: "10px 20px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer" };
