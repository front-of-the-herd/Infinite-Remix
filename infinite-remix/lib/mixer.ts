// Three-source Web Audio mixer for the hybrid vocal system.

import type { SourceWeights } from '@/types';

export class HybridMixer {
  private ctx: AudioContext;
  private gains: { instrumental: GainNode; originalStem: GainNode; suno: GainNode };
  private compressor: DynamicsCompressorNode;
  private sunoSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.ctx = new AudioContext();

    // Create gain nodes for each source
    this.gains = {
      instrumental: this.ctx.createGain(),
      originalStem: this.ctx.createGain(),
      suno:         this.ctx.createGain(),
    };

    // Compressor on the master bus — keeps levels coherent across phase transitions
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 6;
    this.compressor.ratio.value = 3;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    // Wire graph: each gain → compressor → destination
    for (const gain of Object.values(this.gains)) {
      gain.connect(this.compressor);
    }
    this.compressor.connect(this.ctx.destination);

    // Start all gains at zero — first transitionToPhase() sets them
    for (const gain of Object.values(this.gains)) {
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  get audioContext(): AudioContext {
    return this.ctx;
  }

  // Returns gain nodes so stem player / future sources can connect to them
  getGainNode(source: keyof typeof this.gains): GainNode {
    return this.gains[source];
  }

  // Smooth crossfade to the weights for the incoming phase
  transitionToPhase(weights: SourceWeights, fadeDuration = 3): void {
    const now = this.ctx.currentTime;
    const target = now + fadeDuration;

    this.gains.instrumental.gain.linearRampToValueAtTime(weights.instrumental, target);
    this.gains.originalStem.gain.linearRampToValueAtTime(weights.originalStem, target);
    this.gains.suno.gain.linearRampToValueAtTime(weights.suno, target);
  }

  // Connects the Tone.js transport output to the instrumental gain node
  connectInstrumentalStream(stream: AudioNode): void {
    stream.connect(this.gains.instrumental);
  }

  // Play a decoded Suno vocal segment through the suno gain node.
  // Stops any previously playing segment first.
  connectSunoSegment(buffer: AudioBuffer): void {
    this.stopSunoSegment();

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gains.suno);
    source.start();
    source.onended = () => {
      if (this.sunoSource === source) this.sunoSource = null;
    };
    this.sunoSource = source;
  }

  // Stop the active Suno segment (called when leaving drift/rebuild)
  stopSunoSegment(): void {
    if (this.sunoSource) {
      try { this.sunoSource.stop(); } catch { /* already stopped */ }
      this.sunoSource.disconnect();
      this.sunoSource = null;
    }
  }

  // Fetch a remote audio URL and decode it into an AudioBuffer
  async fetchAndDecode(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return this.ctx.decodeAudioData(arrayBuffer);
  }

  // Resume AudioContext if suspended (required after user gesture in browsers)
  async resume(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  dispose(): void {
    this.stopSunoSegment();
    this.ctx.close();
  }
}
