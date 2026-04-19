import * as Tone from 'tone';
import type { Phase, Evolution } from '@/types';
import type { HybridMixer } from '@/lib/mixer';

export class InstrumentalSession {
  private mixer: HybridMixer;
  
  private kick: Tone.MembraneSynth;
  private snare: Tone.NoiseSynth;
  private hihat: Tone.MetalSynth;
  private bass: Tone.FMSynth;
  private padSynth: Tone.PolySynth;
  
  private drumLoop: Tone.Loop;
  private bassLoop: Tone.Loop;
  
  private currentPhase: Phase = 'build';

  constructor(mixer: HybridMixer) {
    this.mixer = mixer;
    const dest = mixer.getGainNode('instrumental');
    
    // 1. Kick Drum
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).connect(dest);
    this.kick.volume.value = -4;

    // 2. Snare
    this.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).connect(dest);
    this.snare.volume.value = -12;

    // 3. HiHat
    this.hihat = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(dest);
    this.hihat.volume.value = -18;

    // 4. Driving Bassline
    this.bass = new Tone.FMSynth({
      harmonicity: 1,
      modulationIndex: 2,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    });
    const bassFilter = new Tone.Filter(800, 'lowpass').connect(dest);
    this.bass.connect(bassFilter);
    this.bass.volume.value = -6;

    // 5. Ambient Pad (Lush chord bed)
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 1, sustain: 1, release: 4 }
    });
    const chorus = new Tone.Chorus(4, 2.5, 0.5).start();
    const reverb = new Tone.Reverb(4);
    this.padSynth.chain(chorus, reverb);
    // Cast to connect generic Tone output to raw WebAudio GainNode securely
    (reverb as unknown as { output: AudioNode }).output.connect(dest);
    this.padSynth.volume.value = -16;

    // Drum Loop (16th notes)
    let step = 0;
    this.drumLoop = new Tone.Loop((time) => {
      // 4/4 Kick pattern
      if (step % 4 === 0) {
        if (this.shouldPlayKick()) this.kick.triggerAttackRelease('C1', '8n', time);
      }
      
      // Snare on 2 and 4
      if (step % 8 === 4) {
        if (this.shouldPlaySnare()) this.snare.triggerAttackRelease('16n', time);
      }
      
      // Hihat 16th notes (accent on off-beats)
      if (this.shouldPlayHihat()) {
        const vel = step % 4 === 2 ? 0.8 : 0.2;
        this.hihat.triggerAttackRelease('32n', time, vel);
      }

      step = (step + 1) % 16;
    }, '16n');

    // Bass Loop (Driving 16th note groove)
    let bassStep = 0;
    const bassNotes = ['F2', 'F2', 'C3', 'Ab2', 'F2', 'F2', 'Eb2', 'C3'];
    this.bassLoop = new Tone.Loop((time) => {
      if (this.shouldPlayBass()) {
        const note = bassNotes[bassStep % bassNotes.length];
        this.bass.triggerAttackRelease(note, '16n', time);
      }
      bassStep = (bassStep + 1) % 16;
    }, '8n');

    // Start background pad continuously shifting chords
    Tone.Transport.scheduleRepeat((time) => {
      const chords = [['F3', 'Ab3', 'C4'], ['Db3', 'F3', 'Ab3'], ['Ab2', 'Eb3', 'Ab3'], ['Eb3', 'G3', 'Bb3']];
      const chord = chords[Math.floor((Tone.Transport.seconds / 4) % chords.length)];
      this.padSynth.triggerAttackRelease(chord, '1m', time, 0.5);
    }, '1m');
  }

  // Dynamic Phase muting logic
  private shouldPlayKick(): boolean {
    return this.currentPhase === 'build' || this.currentPhase === 'peak' || this.currentPhase === 'drift';
  }
  
  private shouldPlaySnare(): boolean {
    return this.currentPhase === 'peak' || this.currentPhase === 'drift';
  }
  
  private shouldPlayHihat(): boolean {
    return this.currentPhase === 'peak' || this.currentPhase === 'drift' || this.currentPhase === 'rebuild';
  }
  
  private shouldPlayBass(): boolean {
    return this.currentPhase === 'build' || this.currentPhase === 'peak' || this.currentPhase === 'drift';
  }

  public updateState(phase: Phase, evolution: Evolution): void {
    this.currentPhase = phase;
    Tone.Transport.bpm.rampTo(evolution.bpm, 1);
  }

  public start(): void {
    Tone.Transport.start();
    this.drumLoop.start(0);
    this.bassLoop.start(0);
  }

  public stop(): void {
    Tone.Transport.stop();
    this.drumLoop.stop();
    this.bassLoop.stop();
  }

  public dispose(): void {
    this.stop();
    this.kick.dispose();
    this.snare.dispose();
    this.hihat.dispose();
    this.bass.dispose();
    this.padSynth.dispose();
    this.drumLoop.dispose();
    this.bassLoop.dispose();
  }
}
