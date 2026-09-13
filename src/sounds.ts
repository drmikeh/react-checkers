const MUTE_STORAGE_KEY = 'checkers-sound-muted';

let audioContext: AudioContext | null = null;
let muted = readStoredMute();

function readStoredMute(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(value));
  } catch {
    // ignore storage failures (private browsing, disabled storage, etc.)
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

interface Tone {
  frequency: number;
  startTime: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function playTones(tones: Tone[]): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (const tone of tones) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const start = now + tone.startTime;
    const end = start + tone.duration;
    const peakGain = tone.gain ?? 0.2;

    oscillator.type = tone.type ?? 'sine';
    oscillator.frequency.setValueAtTime(tone.frequency, start);

    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(peakGain, start + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(end);
  }
}

export function playMoveSound(): void {
  playTones([{ frequency: 380, startTime: 0, duration: 0.1, type: 'sine', gain: 0.15 }]);
}

export function playCaptureSound(): void {
  playTones([
    { frequency: 180, startTime: 0, duration: 0.12, type: 'square', gain: 0.18 },
    { frequency: 110, startTime: 0.05, duration: 0.14, type: 'square', gain: 0.16 },
  ]);
}

export function playGameOverSound(humanWon: boolean): void {
  if (humanWon) {
    playTones([
      { frequency: 523.25, startTime: 0, duration: 0.15, type: 'triangle', gain: 0.2 },
      { frequency: 659.25, startTime: 0.12, duration: 0.15, type: 'triangle', gain: 0.2 },
      { frequency: 783.99, startTime: 0.24, duration: 0.3, type: 'triangle', gain: 0.22 },
    ]);
  } else {
    playTones([
      { frequency: 392, startTime: 0, duration: 0.2, type: 'sawtooth', gain: 0.16 },
      { frequency: 311.13, startTime: 0.18, duration: 0.4, type: 'sawtooth', gain: 0.16 },
    ]);
  }
}
