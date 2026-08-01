// Web Audio API Synthesizer for sound effects and 3D background ambient music

let audioCtx: AudioContext | null = null;
let ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
let ambientGainNode: GainNode | null = null;
let isAmbientPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Play short synthesized UI sound effects */
export function playSoundEffect(type: 'click' | 'rotate' | 'unlock' | 'delete' | 'favorite' | 'photo_snap', enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'rotate') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'unlock') {
      // Arpeggio chord for vault unlock
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + index * 0.06);
        gain.gain.setValueAtTime(0.1, now + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.3);
      });
    } else if (type === 'delete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'favorite') {
      const freqs = [440, 659.25];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.22);
      });
    } else if (type === 'photo_snap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch (err) {
    // Audio context initialization fallback
  }
}

/** Generates soothing ambient pad background music for 3D Gallery */
export function toggleAmbientBackgroundMusic(play: boolean) {
  if (play === isAmbientPlaying) return;

  if (!play) {
    stopAmbientBackgroundMusic();
    return;
  }

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(0.001, now);
    ambientGainNode.gain.linearRampToValueAtTime(0.06, now + 2);

    // Warm ambient chords (Fmaj7 / Cmaj9 frequencies: F3, C4, E4, G4, B4)
    const chordFrequencies = [174.61, 261.63, 329.63, 392.0, 493.88];

    // Filter for warm analog feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    ambientOscillators = chordFrequencies.map((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle subtle frequency LFO detune
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.03, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      oscGain.gain.setValueAtTime(0.2, now);
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);

      return { osc, gain: oscGain };
    });

    filter.connect(ambientGainNode);
    ambientGainNode.connect(ctx.destination);
    isAmbientPlaying = true;
  } catch (e) {
    console.warn("Ambient audio error:", e);
  }
}

export function stopAmbientBackgroundMusic() {
  if (!isAmbientPlaying) return;
  try {
    if (ambientGainNode && audioCtx) {
      const now = audioCtx.currentTime;
      ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
      ambientGainNode.gain.linearRampToValueAtTime(0.001, now + 1);
      setTimeout(() => {
        ambientOscillators.forEach(({ osc }) => {
          try {
            osc.stop();
          } catch (e) {}
        });
        ambientOscillators = [];
        isAmbientPlaying = false;
      }, 1000);
    } else {
      isAmbientPlaying = false;
    }
  } catch (e) {
    isAmbientPlaying = false;
  }
}
