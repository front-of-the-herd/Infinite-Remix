// Suno V5 API client — typed port of spikes/suno-vocal/run_spike.js
// Endpoint: https://api.sunoapi.org/api/v1/generate
// Proven working in spike (75s generation time, PASS status).

import type { SongDNA } from '@/types';

const BASE_URL = 'https://api.sunoapi.org';
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS  = 300_000; // 5 min

// ---------------------------------------------------------------------------
// Internal types matching the Suno API response shape
// ---------------------------------------------------------------------------

interface SunoApiResponse<T> {
  code?: number;
  msg?: string;
  data?: T;
}

interface GenerateResult {
  taskId: string;
}

interface SunoSong {
  id: string;
  title: string;
  duration: number;
  audioUrl?: string;
  audio_url?: string;
}

interface PollResult {
  status: string;
  errorMessage?: unknown;
  response?: {
    sunoData?: SunoSong[];
  };
}

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  method: 'GET' | 'POST',
  endpoint: string,
  body?: Record<string, unknown>,
  apiKey?: string
): Promise<T> {
  const key = apiKey ?? process.env.SUNO_API_KEY;
  if (!key) throw new Error('SUNO_API_KEY is not set');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json: SunoApiResponse<T> = await res.json();

  if (json.code !== undefined && json.code !== 200) {
    throw new Error(`Suno API error ${json.code}: ${json.msg} (${endpoint})`);
  }

  return (json.data ?? json) as T;
}

// ---------------------------------------------------------------------------
// Poll until done or timeout
// ---------------------------------------------------------------------------

async function poll(
  endpoint: string,
  isDone: (data: PollResult) => boolean,
  apiKey?: string
): Promise<PollResult> {
  const start = Date.now();

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const data = await apiFetch<PollResult>('GET', endpoint, undefined, apiKey);

    if (data?.status === 'FAILED') {
      throw new Error(
        `Suno generation failed: ${JSON.stringify(data?.errorMessage ?? data)}`
      );
    }

    if (isDone(data)) return data;

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error('Suno: timeout waiting for generation to complete');
}

// ---------------------------------------------------------------------------
// Build drift lyrics from DNA context and cycle number
// Claude writes these in Phase 3 — for now the template mirrors the spike lyrics.
// ---------------------------------------------------------------------------

function buildDriftLyrics(dna: SongDNA, cycle: number, prevLyrics: string): string {
  const theme = dna.lyrical.themes[cycle % dna.lyrical.themes.length];
  const prevRef = prevLyrics.length > 0
    ? `(evolving from: "${prevLyrics.slice(0, 80)}...")`
    : '';

  // Template that Claude will replace with a proper generation call in Phase 3
  return `[verse]
The ${theme} grows stronger every night
${prevRef}
Something pulls me toward your light
Every beat that pulses through this room
Takes me back to you and your perfume

[chorus]
I'm so drawn to you, can't let this feeling go
Something in your eyes sets my heart aglow
Pulled into your orbit like a midnight tide
Nowhere else I'd rather be than by your side`;
}

function buildStylePrompt(dna: SongDNA, weirdness: number): string {
  const baseStyle = dna.musical.genreTags.join(', ');
  const vocalStyle =
    dna.vocal.gender === 'female'
      ? 'female soprano vocals, bright breathy voice'
      : 'male tenor vocals, warm breathy voice';
  const intensity =
    weirdness > 0.6 ? 'experimental, hypnotic' : 'upbeat, euphoric';

  return `${baseStyle}, ${vocalStyle}, heavy reverb and delay, synthesizer, ${intensity}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a Suno V5 drift vocal segment.
 * Called during the breakdown phase so the segment is ready for the drift phase.
 * Returns the audioUrl of the first generated song.
 */
export interface DriftVocalResult {
  audioUrl: string;
  lyrics: string;
}

export async function generateDriftVocal(
  dna: SongDNA,
  cycle: number,
  prevLyrics: string,
  apiKey?: string
): Promise<DriftVocalResult> {
  const lyrics = buildDriftLyrics(dna, cycle, prevLyrics);
  const style  = buildStylePrompt(dna, 0.2 + cycle * 0.02);

  const genResult = await apiFetch<GenerateResult>(
    'POST',
    '/api/v1/generate',
    {
      customMode:          true,
      instrumental:        false,
      model:               'V5',
      prompt:              lyrics,
      style,
      title:               `${dna.meta.title} Drift Cycle ${cycle + 1}`,
      vocalGender:         dna.vocal.gender === 'female' ? 'f' : 'm',
      weirdnessConstraint: Math.min(0.2 + cycle * 0.02, 1.0),
      callBackUrl:         'https://example.com/noop',
    },
    apiKey
  );

  const { taskId } = genResult;
  if (!taskId) {
    throw new Error(`Suno: no taskId returned: ${JSON.stringify(genResult)}`);
  }

  const details = await poll(
    `/api/v1/generate/record-info?taskId=${taskId}`,
    data => data?.status === 'SUCCESS' && (data?.response?.sunoData?.length ?? 0) > 0,
    apiKey
  );

  const songs = details.response?.sunoData;
  if (!songs || songs.length === 0) {
    throw new Error('Suno: no songs in response');
  }

  const song = songs[0];
  const audioUrl = song.audioUrl ?? song.audio_url;
  if (!audioUrl) {
    throw new Error(`Suno: no audioUrl in response: ${JSON.stringify(song)}`);
  }

  return { audioUrl, lyrics };
}

/**
 * Strategy A: Generate a single deep instrumental bed for ambient looping
 */
export async function generateInstrumental(
  dna: SongDNA,
  apiKey?: string
): Promise<string> {
  const style = `${dna.musical.genreTags.join(', ')}, instrumental, continuous mix, hypnotic loop`;
  
  const genResult = await apiFetch<GenerateResult>(
    'POST',
    '/api/v1/generate',
    {
      customMode:          true,
      instrumental:        true,
      model:               'V5',
      prompt:              '',
      style,
      title:               `${dna.meta.title} Instrumental Bed`,
      vocalGender:         '',
      weirdnessConstraint: 0.1,
      callBackUrl:         'https://example.com/noop',
    },
    apiKey
  );

  const { taskId } = genResult;
  if (!taskId) throw new Error('Suno: no taskId returned for instrumental');

  const details = await poll(
    `/api/v1/generate/record-info?taskId=${taskId}`,
    data => data?.status === 'SUCCESS' && (data?.response?.sunoData?.length ?? 0) > 0,
    apiKey
  );

  const songs = details.response?.sunoData;
  if (!songs || songs.length === 0) throw new Error('Suno: no instrumental songs returned');

  const song = songs[0];
  const audioUrl = song.audioUrl ?? song.audio_url;
  if (!audioUrl) throw new Error('Suno: missing audioUrl in instrumental response');

  return audioUrl;
}
