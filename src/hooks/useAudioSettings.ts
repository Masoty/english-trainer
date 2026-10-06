import { useCallback, useEffect, useState } from "react";

const FX_KEY = "english-trainer-sfx";
const VOICE_KEY = "english-trainer-voice";

function readBool(key: string, defaultValue: boolean) {
  if (typeof window === "undefined") return defaultValue;
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  return raw === "1";
}

export function useAudioSettings() {
  const [sfxEnabled, setSfxEnabled] = useState(() => readBool(FX_KEY, true));
  const [voiceEnabled, setVoiceEnabled] = useState(() => readBool(VOICE_KEY, true));

  useEffect(() => {
    localStorage.setItem(FX_KEY, sfxEnabled ? "1" : "0");
  }, [sfxEnabled]);

  useEffect(() => {
    localStorage.setItem(VOICE_KEY, voiceEnabled ? "1" : "0");
  }, [voiceEnabled]);

  const toggleSfx = useCallback(() => setSfxEnabled((v) => !v), []);
  const toggleVoice = useCallback(() => setVoiceEnabled((v) => !v), []);

  return { sfxEnabled, voiceEnabled, toggleSfx, toggleVoice };
}
