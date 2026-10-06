export function stopSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function speakEnglish(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text.trim()) return;

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function speakEnglishSequence(lines: string[], enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const parts = lines.map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return;

  stopSpeech();
  let index = 0;
  const speakNext = () => {
    if (index >= parts.length) return;
    const utterance = new SpeechSynthesisUtterance(parts[index]);
    index += 1;
    utterance.lang = "en-GB";
    utterance.rate = 0.9;
    utterance.onend = speakNext;
    window.speechSynthesis.speak(utterance);
  };
  speakNext();
}
