/**
 * Lightweight, zero-dependency Web Audio API synthesizer for playful kid-friendly sound effects.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

// Retrieve initial sound preference from localStorage
try {
  const saved = localStorage.getItem('kidcolor_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch (e) {
  // Ignore localStorage errors
}

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    localStorage.setItem('kidcolor_sound_enabled', String(enabled));
  } catch (e) {}
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled) {
    playPop();
  }
  return soundEnabled;
}

/**
 * Satisfying bubble pop sound (used when selecting colors or tapping buttons)
 */
export function playPop(frequency = 520): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Brush stroke for filling a region: a soft paintbrush "swish" (filtered noise sweeping up)
 * with a small bubbly "bloop" as the colour lands. The bloop's pitch drifts a little each
 * time so repeated fills sound playful instead of mechanical. Silent when sound is off.
 */
let fillStep = 0;
export function playFill(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Brush swish: short burst of noise through a sweeping band-pass filter
    const length = Math.floor(ctx.sampleRate * 0.2);
    const noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
    const swishGain = ctx.createGain();
    swishGain.gain.setValueAtTime(0.0001, now);
    swishGain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
    swishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(filter);
    filter.connect(swishGain);
    swishGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);

    // Bloop as the colour lands
    const base = 300 + (fillStep++ % 7) * 45;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(base * 2.2, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.065);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + 0.05);
    osc.stop(now + 0.22);
  } catch (e) {}
}

/**
 * Soft tactile click
 */
export function playClick(): void {
  playPop(650);
}

/**
 * Smooth swish sound (for undo / redo / slide)
 */
export function playSwish(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {}
}

/**
 * Sparkle / Magic Chime sound (for Magic AI, Pro unlock, Modal open)
 */
export function playChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startTime = ctx.currentTime + idx * 0.07;

      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  } catch (e) {}
}

/**
 * Victory fanfare (for saving/downloading masterpiece)
 */
export function playFanfare(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, d: 0.1, t: 0.0 },   // C5
      { f: 659.25, d: 0.1, t: 0.12 },  // E5
      { f: 783.99, d: 0.1, t: 0.24 },  // G5
      { f: 1046.5, d: 0.3, t: 0.38 },  // C6 (held)
    ];

    notes.forEach(({ f, d, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startTime = ctx.currentTime + t;

      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + d + 0.02);
    });
  } catch (e) {}
}
