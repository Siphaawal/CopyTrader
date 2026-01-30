// Web Audio API sound effects
const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export const sounds = {
  click: () => {
    playTone(800, 0.05, 'sine', 0.08);
  },

  success: () => {
    playTone(523.25, 0.1, 'sine', 0.08); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.08), 100); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.08), 200); // G5
  },

  error: () => {
    playTone(200, 0.15, 'sawtooth', 0.06);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.06), 150);
  },

  hover: () => {
    playTone(1200, 0.02, 'sine', 0.03);
  },

  toggle: () => {
    playTone(600, 0.05, 'triangle', 0.08);
    setTimeout(() => playTone(900, 0.05, 'triangle', 0.08), 50);
  },

  notification: () => {
    playTone(880, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(1108.73, 0.1, 'sine', 0.1), 120);
    setTimeout(() => playTone(1318.51, 0.15, 'sine', 0.1), 240);
  },

  tabSwitch: () => {
    playTone(500, 0.03, 'sine', 0.06);
    setTimeout(() => playTone(700, 0.05, 'sine', 0.06), 30);
  },

  fetch: () => {
    playTone(400, 0.08, 'triangle', 0.05);
    setTimeout(() => playTone(600, 0.08, 'triangle', 0.05), 80);
    setTimeout(() => playTone(800, 0.1, 'triangle', 0.05), 160);
  },
};

// Resume audio context on first user interaction (required by browsers)
export function initAudio() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}
