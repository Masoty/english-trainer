type SoundControlsProps = {
  sfxEnabled: boolean;
  voiceEnabled: boolean;
  onToggleSfx: () => void;
  onToggleVoice: () => void;
};

export function SoundControls({
  sfxEnabled,
  voiceEnabled,
  onToggleSfx,
  onToggleVoice,
}: SoundControlsProps) {
  return (
    <div className="sound-controls" role="group" aria-label="Налаштування звуку">
      <button
        type="button"
        className={`sound-toggle ${sfxEnabled ? "on" : "off"}`}
        onClick={onToggleSfx}
        aria-pressed={sfxEnabled}
        title={sfxEnabled ? "Вимкнути звукові ефекти" : "Увімкнути звукові ефекти"}
      >
        {sfxEnabled ? "🔊" : "🔇"}
      </button>
      <button
        type="button"
        className={`sound-toggle ${voiceEnabled ? "on" : "off"}`}
        onClick={onToggleVoice}
        aria-pressed={voiceEnabled}
        title={voiceEnabled ? "Вимкнути озвучення фраз" : "Увімкнути озвучення фраз"}
      >
        {voiceEnabled ? "🎙️" : "🎙️✕"}
      </button>
    </div>
  );
}
