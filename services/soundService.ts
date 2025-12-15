// Simple audio service using Web Audio API

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const createOscillator = (type: OscillatorType, freq: number, duration: number, startTime: number, gainValue: number = 0.1) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const playSound = (type: 'success' | 'click' | 'error' | 'levelup' | 'quest') => {
  if (!audioCtx) return;
  
  const now = audioCtx.currentTime;

  switch (type) {
    case 'success':
        // High pitch ping
        createOscillator('sine', 800, 0.1, now);
        createOscillator('triangle', 1200, 0.1, now + 0.05);
        break;
    case 'click':
        // Subtle click
        createOscillator('triangle', 300, 0.05, now, 0.05);
        break;
    case 'error':
        // Low buzzy sound
        createOscillator('sawtooth', 150, 0.3, now, 0.2);
        createOscillator('sawtooth', 120, 0.3, now + 0.1, 0.2);
        break;
    case 'levelup':
        // Ascending major arpeggio
        createOscillator('sine', 440, 0.2, now); // A4
        createOscillator('sine', 554, 0.2, now + 0.1); // C#5
        createOscillator('sine', 659, 0.2, now + 0.2); // E5
        createOscillator('sine', 880, 0.4, now + 0.3); // A5
        // Confetti sound simulation (noise burst)
        break;
    case 'quest':
        // Magical chime
        createOscillator('sine', 600, 0.3, now);
        createOscillator('sine', 900, 0.3, now + 0.1);
        break;
  }
};