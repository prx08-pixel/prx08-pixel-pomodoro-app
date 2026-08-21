const PRESETS = [
  { name: "Soft Pad", freqA: 174.61, freqB: 220 },
  { name: "Deep Drift", freqA: 130.81, freqB: 164.81 },
  { name: "Focus Hum", freqA: 196, freqB: 246.94 },
] as const;

export const AMBIENT_TRACK_MS = 180_000;

export function ambientTrackCount(): number {
  return PRESETS.length;
}

export function ambientTrackName(index: number): string {
  const preset = PRESETS[((index % PRESETS.length) + PRESETS.length) % PRESETS.length];
  return preset?.name ?? "Soft Pad";
}

class AmbientPad {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private index = 0;
  private playing = false;

  get trackIndex(): number {
    return this.index;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  async toggle(): Promise<void> {
    if (this.playing) {
      this.stop();
      return;
    }
    await this.start();
  }

  async next(): Promise<void> {
    this.index = (this.index + 1) % PRESETS.length;
    if (this.playing) {
      this.stopVoices();
      await this.start();
    }
  }

  async previous(): Promise<void> {
    this.index = (this.index + PRESETS.length - 1) % PRESETS.length;
    if (this.playing) {
      this.stopVoices();
      await this.start();
    }
  }

  stop(): void {
    this.stopVoices();
    if (this.master && this.context) {
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    }
    this.playing = false;
  }

  private async start(): Promise<void> {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!this.context || this.context.state === "closed") {
      this.context = new AudioContextCtor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.0001;
      this.master.connect(this.context.destination);
    }

    await this.context.resume();
    this.stopVoices();

    const preset = PRESETS[this.index] ?? { name: "Soft Pad", freqA: 174.61, freqB: 220 };
    const now = this.context.currentTime;
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.connect(this.master!);

    const makeOsc = (freq: number, type: OscillatorType, detune: number) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.value = type === "sine" ? 0.045 : 0.012;
      osc.connect(gain);
      gain.connect(filter);
      osc.start(now);
      this.sources.push(osc);
    };

    makeOsc(preset.freqA, "sine", -6);
    makeOsc(preset.freqB, "sine", 8);
    makeOsc(preset.freqA / 2, "triangle", 0);

    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(0.0001, now);
    this.master!.gain.exponentialRampToValueAtTime(0.22, now + 0.35);
    this.playing = true;
  }

  private stopVoices(): void {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources = [];
  }
}

export const ambientPad = new AmbientPad();
