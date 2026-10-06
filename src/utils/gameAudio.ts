let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.08,
  when = 0,
) {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + when);
  amp.gain.setValueAtTime(gain, ctx.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + duration + 0.02);
}

export function unlockAudio() {
  getContext();
}

export function playTap() {
  tone(520, 0.05, "triangle", 0.05);
}

export function playCorrect() {
  tone(523, 0.12, "sine", 0.07, 0);
  tone(659, 0.14, "sine", 0.07, 0.1);
  tone(784, 0.16, "sine", 0.06, 0.22);
}

export function playWrong() {
  tone(220, 0.2, "sawtooth", 0.05, 0);
  tone(185, 0.25, "sawtooth", 0.04, 0.12);
}

export function playNext() {
  tone(440, 0.08, "sine", 0.04, 0);
  tone(554, 0.1, "sine", 0.035, 0.06);
}
