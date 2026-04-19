import type { HybridMixer } from '@/lib/mixer';
import type { Phase, Evolution } from '@/types';

export class SunoInstrumentalPlayer {
  private mixer: HybridMixer;
  private url: string;
  private sourceNode: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;

  constructor(mixer: HybridMixer, url: string) {
    this.mixer = mixer;
    this.url = url;
  }

  async load(): Promise<void> {
    this.buffer = await this.mixer.fetchAndDecode(this.url);
  }

  // Shim to match the API footprint of InstrumentalSession so Player.tsx can seamlessly call it
  public updateState(phase: Phase, evolution: Evolution): void {
     // Under Strategy A, the Suno player just loops endlessly without phase muting
  }

  start(): void {
    if (!this.buffer) throw new Error('SunoInstrumentalPlayer: buffer not loaded');
    
    this.sourceNode = this.mixer.audioContext.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.loop = true;
    this.sourceNode.connect(this.mixer.getGainNode('instrumental'));
    this.sourceNode.start(0);
  }

  stop(): void {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch { /* ignore */ }
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  dispose(): void {
    this.stop();
    this.buffer = null;
  }
}
