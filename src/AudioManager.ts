interface PlayParameters {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
  amplitude?: number;
}

export class AudioManager {
  audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  play({
    frequency,
    durationMs,
    type = "sine",
    amplitude = 0.1,
  }: PlayParameters) {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const gain = this.audioContext.createGain();
    gain.gain.value = amplitude;
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + durationMs / 1000);
  }
}
