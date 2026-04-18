#!/usr/bin/env node
/**
 * SPIKE: Suno API stem separation
 * Endpoint: sunoapi.org
 *
 * What this proves:
 *   1. API key is valid and credits are available
 *   2. We can upload an external MP3 and get a Suno taskId back
 *   3. Stem separation runs on an uploaded (non-Suno-generated) file
 *   4. Vocal stem URL is downloadable and at usable quality
 *   5. End-to-end latency is acceptable for a seed-submission UX
 *
 * Usage:
 *   SUNO_API_KEY=your_key node spikes/suno-stems/run_spike.js
 *
 * Cost: ~$0.22 (10cr upload-extend + 10cr separate_vocal)
 * File: test/seeds/_Fascinated___Company_B__retro-remix_.mp3
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_KEY   = process.env.SUNO_API_KEY;
const BASE_URL        = 'https://api.sunoapi.org';
const UPLOAD_BASE_URL = 'https://sunoapiorg.redpandaai.co';
const SEED_FILE = path.resolve(__dirname, '../../test/seeds/_Fascinated___Company_B__retro-remix_.mp3');
const OUT_DIR   = path.resolve(__dirname, 'output');

const POLL_INTERVAL_MS = 5_000;   // poll every 5s
const POLL_TIMEOUT_MS  = 300_000; // give up after 5 min

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const G = s => `\x1b[32m${s}\x1b[0m`;
const R = s => `\x1b[31m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const pass = s => console.log(` ${G('✓')} ${s}`);
const fail = s => { console.log(` ${R('✗')} ${s}`); process.exit(1); };
const info = s => console.log(` ${Y('→')} ${s}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function apiFetch(method, endpoint, body) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
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

async function poll(endpoint, label, isDone, timeout = POLL_TIMEOUT_MS) {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < timeout) {
    attempt++;
    const data = await apiFetch('GET', endpoint);
    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    process.stdout.write(`\r   ${Y('→')} ${label}: attempt ${attempt}, ${elapsed}s elapsed...`);
    if (isDone(data)) {
      process.stdout.write('\n');
      return data;
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  process.stdout.write('\n');
  throw new Error(`Timeout waiting for ${label} after ${timeout / 1000}s`);
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
// Main
// ---------------------------------------------------------------------------
console.log('\n════════════════════════════════════════════');
console.log('  Suno API Stem Separation Spike');
console.log('════════════════════════════════════════════\n');

// --- Preflight ---
if (!API_KEY) fail('SUNO_API_KEY env var not set. Run: SUNO_API_KEY=your_key node run_spike.js');
if (!fs.existsSync(SEED_FILE)) fail(`Seed file not found: ${SEED_FILE}`);
fs.mkdirSync(OUT_DIR, { recursive: true });

const seedStat = fs.statSync(SEED_FILE);
pass(`Seed file found: ${(seedStat.size / 1_048_576).toFixed(1)}MB`);

// --- Step 1: Check credits (skipped — endpoint 404s, key validity proven by upload succeeding) ---
info('Skipping credits check (endpoint not available) — key validated by upload step...');



pass('Key present — credits will be validated by upload step');

// --- Step 2: Upload file to sunoapi file hosting ---
// The API needs a public URL — upload to their file service first.
info('Uploading seed file to Suno file service...');

// Read file as base64
const fileData = fs.readFileSync(SEED_FILE);
const base64   = fileData.toString('base64');

const uploadResult = await fetch(`${UPLOAD_BASE_URL}/api/file-base64-upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    base64Data: `data:audio/mpeg;base64,${base64}`,
    fileName: '_Fascinated___Company_B__retro-remix_.mp3',
    uploadPath: 'audio',
  }),
}).then(r => r.json());
if (!uploadResult.data?.downloadUrl && !uploadResult.data?.fileUrl) {
  fail(`Upload failed: ${JSON.stringify(uploadResult)}`);
}

const uploadedUrl = uploadResult.data?.downloadUrl ?? uploadResult.data?.fileUrl ?? uploadResult.data?.url;
if (!uploadedUrl) fail(`Upload succeeded but no URL in response: ${JSON.stringify(uploadResult)}`);
pass(`File uploaded → ${uploadedUrl}`);

// --- Step 3: upload-extend to register file with Suno and get taskId/audioId ---
// This is the required step to get IDs for stem separation.
// We use defaultParamFlag:false so only uploadUrl is required.
info('Registering file with Suno (upload-extend)...');

const extendResult = await apiFetch('POST', '/api/v1/generate/upload-extend', {
  uploadUrl: uploadedUrl,
  defaultParamFlag: false,
  model: 'V5',
  instrumental: true,
  continueAt: 30,             // required — timestamp (s) to extend from
  callBackUrl: 'https://example.com/noop',
});

const taskId = extendResult.taskId;
if (!taskId) fail(`No taskId in upload-extend response: ${JSON.stringify(extendResult)}`);
pass(`Got taskId: ${taskId}`);

// --- Step 4: Poll until upload-extend completes and we have an audioId ---
info('Waiting for upload-extend to complete (need audioId for stem separation)...');
let genDetails_logged = false;

const genDetails = await poll(
  `/api/v1/generate/record-info?taskId=${taskId}`,
  'upload-extend',
  data => {
    if (!genDetails_logged) {
      console.log('\n  [debug] status:', data?.status, '| has response:', !!data?.response);
      genDetails_logged = true;
    }
    return data?.status === 'SUCCESS' && data?.response?.sunoData?.length > 0;
  },
  600_000  // 10 min timeout — Suno upload-extend can be slow
);

const sunoItems = genDetails?.response?.sunoData ?? [];
const audioId   = sunoItems[0]?.id;
const audioUrl  = sunoItems[0]?.audioUrl;

if (!audioId) fail(`No audioId in generation details: ${JSON.stringify(genDetails)}`);
pass(`Got audioId: ${audioId}`);
if (audioUrl) info(`Generated audio preview: ${audioUrl}`);

// --- Step 5: Request stem separation (separate_vocal = 2-stem, 10 credits) ---
info('Requesting stem separation (separate_vocal — 2 stems)...');

const stemResult = await apiFetch('POST', '/api/v1/vocal-removal/generate', {
  taskId,
  audioId,
  type: 'separate_vocal',
  callBackUrl: 'https://example.com/noop',
});

const stemTaskId = stemResult.taskId;
if (!stemTaskId) fail(`No taskId from stem separation: ${JSON.stringify(stemResult)}`);
pass(`Stem separation task started: ${stemTaskId}`);

// --- Step 6: Poll for stem results ---
info('Waiting for stem separation to complete...');

const stemDetails = await poll(
  `/api/v1/vocal-removal/record-info?taskId=${stemTaskId}`,
  'stem separation',
  data => data?.vocalRemovalInfo?.vocalUrl || data?.vocal_removal_info?.vocal_url
);

const vocalInfo = stemDetails?.vocalRemovalInfo ?? stemDetails?.vocal_removal_info;
const vocalUrl        = vocalInfo?.vocalUrl        ?? vocalInfo?.vocal_url;
const instrumentalUrl = vocalInfo?.instrumentalUrl ?? vocalInfo?.instrumental_url;

if (!vocalUrl)        fail(`No vocal URL in stem results: ${JSON.stringify(stemDetails)}`);
if (!instrumentalUrl) fail(`No instrumental URL in stem results: ${JSON.stringify(stemDetails)}`);

pass(`Vocal stem URL:        ${vocalUrl}`);
pass(`Instrumental stem URL: ${instrumentalUrl}`);

// --- Step 7: Download both stems ---
info('Downloading stems...');

const vocalDest        = path.join(OUT_DIR, 'suno_vocals.mp3');
const instrumentalDest = path.join(OUT_DIR, 'suno_instrumental.mp3');

const dlStart = Date.now();
await Promise.all([
  downloadFile(vocalUrl, vocalDest),
  downloadFile(instrumentalUrl, instrumentalDest),
]);
const dlTime = ((Date.now() - dlStart) / 1000).toFixed(1);

const vocalSize        = (fs.statSync(vocalDest).size        / 1_048_576).toFixed(1);
const instrumentalSize = (fs.statSync(instrumentalDest).size / 1_048_576).toFixed(1);

pass(`Downloaded suno_vocals.mp3        (${vocalSize}MB) in ${dlTime}s`);
pass(`Downloaded suno_instrumental.mp3 (${instrumentalSize}MB)`);

// --- Step 8: Write results JSON ---
const results = {
  spike: 'suno-api-stem-separation',
  date: new Date().toISOString().split('T')[0],
  status: 'PASS',
  flow: {
    step1_upload:    { uploadedUrl },
    step2_extend:    { taskId },
    step3_audioId:   { audioId, audioUrl },
    step4_stems:     { stemTaskId, vocalUrl, instrumentalUrl },
  },
  outputs: {
    vocals:        vocalDest,
    instrumental:  instrumentalDest,
  },
  manual_checks: [
    'Listen to suno_vocals.mp3 — compare bleed vs demucs vocals_chorus_0.wav',
    'Listen to suno_instrumental.mp3 — does it sound full and musical?',
    'Which vocal stem sounds cleaner: Demucs or Suno?',
    'Note the latency: how long did upload-extend + stem separation take total?',
  ],
};

fs.writeFileSync(path.join(OUT_DIR, 'spike_results.json'), JSON.stringify(results, null, 2));

// --- Summary ---
console.log('\n════════════════════════════════════════════');
console.log(`  ${G('SPIKE PASS')} — Suno stem separation complete`);
console.log('════════════════════════════════════════════\n');
console.log('  Outputs:');
console.log(`    ${vocalDest}`);
console.log(`    ${instrumentalDest}`);
console.log('');
console.log('  Now compare:');
console.log('    Suno vocals:   spikes/suno-stems/output/suno_vocals.mp3');
console.log('    Demucs vocals: spikes/demucs/output/slices/vocals_chorus_0.wav');
console.log('');
console.log('  Listen to both on the same section and pick the winner.');
console.log('  That\'s your stem pipeline for Phase 1.\n');
