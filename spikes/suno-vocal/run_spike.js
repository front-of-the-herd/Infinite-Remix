#!/usr/bin/env node
/**
 * SPIKE: Suno V5 drift vocal generation
 * Endpoint: api.sunoapi.org/api/v1/generate
 *
 * What this proves:
 *   1. API key works for generation (not just file upload)
 *   2. Custom lyrics are sung as provided (not auto-generated)
 *   3. Style prompt produces something in the Fascinated hi-nrg/freestyle DNA
 *   4. Generation completes in a useful timeframe (~2-3 min)
 *   5. Audio URL is downloadable and at usable quality
 *   6. This is what will play during Drift phase in the Section Conductor
 *
 * Usage:
 *   SUNO_API_KEY=your_key node spikes/suno-vocal/run_spike.js
 *
 * Cost: ~10 credits (one generation call = 2 songs, we only need 1)
 * Model: V5
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY  = process.env.SUNO_API_KEY;
const BASE_URL = 'https://api.sunoapi.org';
const OUT_DIR  = path.resolve(__dirname, 'output');

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS  = 300_000; // 5 min

const G = s => `\x1b[32m${s}\x1b[0m`;
const R = s => `\x1b[31m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const pass = s => console.log(` ${G('✓')} ${s}`);
const fail = s => { console.log(` ${R('✗')} ${s}`); process.exit(1); };
const info = s => console.log(` ${Y('→')} ${s}`);

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------
async function apiFetch(method, endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (json.code !== undefined && json.code !== 200) {
    throw new Error(`API error ${json.code}: ${json.msg} (${endpoint})`);
  }
  return json.data ?? json;
}

async function poll(endpoint, label, isDone) {
  const start = Date.now();
  let attempt = 0;
  let lastStatus = '';
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    attempt++;
    const data = await apiFetch('GET', endpoint);
    const status = data?.status ?? '?';
    if (status !== lastStatus) {
      process.stdout.write(`\n   ${Y('→')} ${label}: ${status}`);
      lastStatus = status;
    } else {
      process.stdout.write('.');
    }
    if (isDone(data)) {
      process.stdout.write('\n');
      return data;
    }
    if (data?.status === 'FAILED') {
      process.stdout.write('\n');
      fail(`${label} failed: ${JSON.stringify(data?.errorMessage ?? data)}`);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  process.stdout.write('\n');
  throw new Error(`Timeout waiting for ${label}`);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

// ---------------------------------------------------------------------------
// Drift lyrics — written as Claude would generate them for cycle 1
// Based on Fascinated's DNA: themes of desire/longing, AABB rhyme, 118bpm
// ---------------------------------------------------------------------------
const DRIFT_LYRICS = `[verse]
The city lights are calling out your name tonight
I'm searching through the shadows for your light
Every beat that pulses through this crowded room
Takes me back to you and your perfume

[chorus]
I'm so drawn to you, can't let this feeling go
Something in your eyes sets my heart aglow
Pulled into your orbit like a midnight tide
Nowhere else I'd rather be than by your side`;

const STYLE_PROMPT = 'hi-nrg, freestyle, 80s dance, female soprano vocals, bright breathy voice, heavy reverb and delay, synthesizer, upbeat, euphoric';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log('\n════════════════════════════════════════════');
console.log('  Suno V5 Drift Vocal Generation Spike');
console.log('════════════════════════════════════════════\n');

if (!API_KEY) fail('SUNO_API_KEY env var not set');
fs.mkdirSync(OUT_DIR, { recursive: true });

// --- Step 1: Generate drift vocal segment ---
info('Generating drift vocal segment (V5, custom lyrics)...');
info(`Style: ${STYLE_PROMPT.slice(0, 60)}...`);
info('Lyrics: [verse] + [chorus], ~32s target');
console.log('');

const START = Date.now();

const genResult = await apiFetch('POST', '/api/v1/generate', {
  customMode:          true,
  instrumental:        false,
  model:               'V5',
  prompt:              DRIFT_LYRICS,
  style:               STYLE_PROMPT,
  title:               'Fascinated Drift Cycle 1',
  vocalGender:         'f',
  weirdnessConstraint: 0.3,   // stay close to seed style in cycle 1
  callBackUrl:         'https://example.com/noop',
});

const taskId = genResult.taskId;
if (!taskId) fail(`No taskId returned: ${JSON.stringify(genResult)}`);
pass(`Generation started — taskId: ${taskId}`);
info('Polling for completion (typically 2–3 min)...');

// --- Step 2: Poll for completion ---
const details = await poll(
  `/api/v1/generate/record-info?taskId=${taskId}`,
  'generation',
  data => data?.status === 'SUCCESS' && data?.response?.sunoData?.length > 0
);

const elapsed = ((Date.now() - START) / 1000).toFixed(0);
pass(`Generation complete in ${elapsed}s`);

// --- Step 3: Extract audio URLs (returns 2 songs — take the first) ---
const songs = details.response.sunoData;
pass(`Got ${songs.length} song(s)`);

const song = songs[0];
const audioUrl = song.audioUrl ?? song.audio_url;
const duration = song.duration ?? '?';

if (!audioUrl) fail(`No audioUrl in response: ${JSON.stringify(song)}`);

pass(`Audio URL: ${audioUrl}`);
info(`Duration: ${duration}s | Title: ${song.title}`);

// --- Step 4: Download ---
info('Downloading...');
const dest = path.join(OUT_DIR, 'drift_vocal_cycle1.mp3');
await downloadFile(audioUrl, dest);
const sizeMB = (fs.statSync(dest).size / 1_048_576).toFixed(1);
pass(`Downloaded drift_vocal_cycle1.mp3 (${sizeMB}MB)`);

// --- Step 5: Write results ---
const results = {
  spike:        'suno-v5-drift-vocal-generation',
  date:         new Date().toISOString().split('T')[0],
  status:       'PASS',
  model:        'V5',
  generation_time_s: parseInt(elapsed),
  song: {
    taskId,
    audioId:  song.id,
    title:    song.title,
    duration: song.duration,
    audioUrl,
  },
  style_prompt: STYLE_PROMPT,
  lyrics_used:  DRIFT_LYRICS,
  output:       dest,
  manual_checks: [
    'Does the voice sound like a soprano female vocalist? (matches Fascinated)',
    'Are the custom lyrics actually sung (not auto-generated ones)?',
    'Does the style feel hi-nrg / 80s freestyle?',
    'Would this work as a drift phase segment after hearing the original Fascinated chorus?',
    'Is the audio quality good enough to mix with Lyria instrumental?',
    'How does generation latency (~' + elapsed + 's) affect the UX of seed submission?',
  ],
  phase3_implications: [
    'audioId (' + song.id + ') can be passed to extend endpoint for longer segments',
    'Style prompt + lyrics are the two levers Claude controls per cycle',
    'weirdnessConstraint: 0.3 for early cycles, increase toward 1.0 as evolution progresses',
    'vocalGender: f is confirmed required for Fascinated-style DNA',
    'Generation happens during breakdown phase (16s) — at ' + elapsed + 's this ' + (parseInt(elapsed) < 16 ? 'FITS ✓' : 'EXCEEDS the 16s window ✗ — pre-generate earlier'),
  ],
};

fs.writeFileSync(path.join(OUT_DIR, 'spike_results.json'), JSON.stringify(results, null, 2));

// --- Summary ---
console.log('\n════════════════════════════════════════════');
console.log(`  ${G('SPIKE PASS')} — Drift vocal generated`);
console.log('════════════════════════════════════════════\n');
console.log(`  Output: spikes/suno-vocal/output/drift_vocal_cycle1.mp3`);
console.log(`  Time:   ${elapsed}s`);
console.log('');
console.log('  Listen and ask:');
console.log('  "Would I want to hear this after the Fascinated chorus?"');
console.log('  If yes — Suno vocal generation is proven for Phase 3.\n');
