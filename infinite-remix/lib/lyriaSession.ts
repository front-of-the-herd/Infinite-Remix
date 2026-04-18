// Lyria RealTime client — streams raw PCM from /api/lyria and schedules
// AudioBuffers into the mixer's lyria gain node for gapless playback.
//
// PCM format from Lyria: 16-bit signed integers, 48kHz, stereo (interleaved).
// Each sample pair (L, R) is 4 bytes; converting to Float32 divides by 32768.

import type { SongDNA, Evolution } from '@/types';
import type { HybridMixer } from '@/lib/mixer';

interface WeightedPrompt {
  text: string;
  weight: number;
}

// Bytes per stereo frame (2 channels × 2 bytes per 16-bit sample)
const BYTES_PER_FRAME = 4;
const SAMPLE_RATE     = 48000;
// How far ahead to start the first buffer, in seconds
const START_AHEAD_S   = 0.1;

function buildLyriaPrompts(dna: SongDNA, evolution: Evolution): WeightedPrompt[] {
  return [
    { text: dna.musical.genreTags.join(', '), weight: 1.0 },
    { text: dna.lyrical.mood,                 weight: 0.7 },
    { text: `${evolution.bpm} bpm`,           weight: 0.5 },
  ];
}

// Decode a raw PCM chunk (16-bit signed stereo interleaved) into a Web Audio AudioBuffer
function decodePcmChunk(pcmBytes: Uint8Array, ctx: AudioContext): AudioBuffer {
  // pcmBytes.slice() produces a new Uint8Array with its own ArrayBuffer,
  // ensuring Int16Array alignment starts at byte 0
  const int16 = new Int16Array(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength / 2);
  const frameCount = int16.length / 2; // 2 samples (L+R) per frame

  const audioBuffer = ctx.createBuffer(2, frameCount, SAMPLE_RATE);
  const leftChannel  = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);

  for (let i = 0; i < frameCount; i++) {
    leftChannel[i]  = int16[i * 2]     / 32768.0;
    rightChannel[i] = int16[i * 2 + 1] / 32768.0;
  }

  return audioBuffer;
}

export class LyriaSession {
  private ctx: AudioContext;
  private mixer: HybridMixer;
  private nextPlayTime: number = 0;
  private abortController: AbortController | null = null;

  constructor(mixer: HybridMixer) {
    this.ctx   = mixer.audioContext;
    this.mixer = mixer;
  }

  async connect(dna: SongDNA, evolution: Evolution): Promise<void> {
    const prompts = buildLyriaPrompts(dna, evolution);

    this.abortController = new AbortController();
    this.nextPlayTime    = this.ctx.currentTime + START_AHEAD_S;

    let response: Response;
    try {
      response = await fetch('http://localhost:3001/lyria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts, bpm: evolution.bpm }),
        signal: this.abortController.signal,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('LyriaSession: fetch failed', err);
      }
      return;
    }

    if (!response.ok || !response.body) {
      console.error('LyriaSession: bad response', response.status);
      return;
    }

    const reader = response.body.getReader();
    // Accumulate bytes across fetch chunks so we always process complete stereo frames
    let leftover = new Uint8Array(0);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Prepend any leftover bytes from the previous iteration
        const incoming = new Uint8Array(leftover.length + value.length);
        incoming.set(leftover);
        incoming.set(value, leftover.length);

        // Only decode complete stereo frames
        const frameCount  = Math.floor(incoming.length / BYTES_PER_FRAME);
        const usableBytes = frameCount * BYTES_PER_FRAME;

        // Save any partial frame for next iteration
        leftover = incoming.slice(usableBytes);

        if (frameCount === 0) continue;

        // Decode — use a fresh slice so Int16Array sees offset 0
        const pcmBytes   = incoming.slice(0, usableBytes);
        const audioBuffer = decodePcmChunk(pcmBytes, this.ctx);

        // Schedule the buffer to play gaplessly after the previous one
        // Reset if we've fallen behind real time (e.g. tab was hidden)
        if (this.nextPlayTime < this.ctx.currentTime) {
          this.nextPlayTime = this.ctx.currentTime + START_AHEAD_S;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.mixer.getGainNode('lyria'));
        source.start(this.nextPlayTime);
        this.nextPlayTime += audioBuffer.duration;
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('LyriaSession: stream read error', err);
      }
    }
  }

  // Update prompts mid-session — requires Phase 4 architecture (new connection or
  // a separate /api/lyria/update endpoint). Stub for now.
  updatePrompts(_prompts: WeightedPrompt[]): void {
    console.log('LyriaSession: updatePrompts called — not yet implemented');
  }

  stop(): void {
    this.abortController?.abort();
  }
}
