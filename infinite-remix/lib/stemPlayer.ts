// Loads and plays vocal stem slices via Web Audio API.
// 200ms fade in/out on every slice to prevent clicks (measured in Demucs spike).
// PitchShift is lazily initialised after Tone.start() — see getPitchShift().

import * as Tone from 'tone';
import type { VocalSlice, Evolution } from '@/types';
import type { HybridMixer } from '@/lib/mixer';

const FADE_S = 0.2; // 200ms — measured as necessary in demucs spike

export class StemPlayer {
  private mixer: HybridMixer;
  private _pitchShift: Tone.PitchShift | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();

  constructor(mixer: HybridMixer) {
    this.mixer = mixer;
    // PitchShift is NOT created here — Tone.start() must be called first.
    // See getPitchShift() below.
  }

  // Lazily create PitchShift once, after Tone.start() has been called by the Player.
  // TODO: re-enable PitchShift once Tone/WebAudio context sync is resolved.
  private getPitchShift(): Tone.PitchShift {
    if (!this._pitchShift) {
      this._pitchShift = new Tone.PitchShift();
      this._pitchShift.toDestination();
      this._pitchShift.disconnect();
      (this._pitchShift as unknown as { output: AudioNode }).output.connect(
        this.mixer.getGainNode('originalStem')
      );
    }
    return this._pitchShift;
  }

  // Fetch and decode a WAV file; results are cached to avoid repeated fetches
  private async fetchBuffer(file: string): Promise<AudioBuffer> {
    const cached = this.bufferCache.get(file);
    if (cached) return cached;

    const res = await fetch(`/${file}`);
    if (!res.ok) throw new Error(`StemPlayer: failed to fetch ${file} (${res.status})`);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await this.mixer.audioContext.decodeAudioData(arrayBuffer);
    this.bufferCache.set(file, audioBuffer);
    return audioBuffer;
  }

  // Stop any currently playing slice with a short fade-out
  private stopActive(): void {
    if (!this.activeSource) return;
    const now = this.mixer.audioContext.currentTime;
    try {
      this.activeSource.stop(now + FADE_S);
    } catch {
      // Already stopped — ignore
    }
    this.activeSource = null;
  }

  async playSlice(slice: VocalSlice, evolution: Evolution): Promise<void> {
    this.stopActive();

    const buffer = await this.fetchBuffer(slice.file);
    const ctx = this.mixer.audioContext;
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Time stretch via playbackRate
    source.playbackRate.value = evolution.stemEffects.timeStretch;

    // TODO: re-enable PitchShift once Tone/WebAudio context sync is resolved.
    // Route: bufferSource → mixer originalStem gain node (direct, no pitch shift)
    source.connect(this.mixer.getGainNode('originalStem'));

    // Fade in — use the originalStem gain node on the mixer
    const gainNode = this.mixer.getGainNode('originalStem');
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value || 1, now + FADE_S);

    source.start(now);

    // Schedule fade out 200ms before the end of the buffer
    const durationS = buffer.duration / evolution.stemEffects.timeStretch;
    const fadeOutStart = now + durationS - FADE_S;
    if (fadeOutStart > now) {
      gainNode.gain.setValueAtTime(gainNode.gain.value || 1, fadeOutStart);
      gainNode.gain.linearRampToValueAtTime(0, now + durationS);
    }

    this.activeSource = source;
  }

  stop(): void {
    this.stopActive();
  }

  dispose(): void {
    this.stopActive();
    this._pitchShift?.dispose();
    this.bufferCache.clear();
  }
}
