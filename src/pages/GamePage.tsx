import { useEffect, useState, type CSSProperties } from "react";
import { Navigate, useParams } from "react-router-dom";
import { allPhrasalVerbs, gameModes } from "../data/phrasalVerbs";
import { Layout } from "../components/Layout";
import { PhrasalImage } from "../components/PhrasalImage";
import { SoundControls } from "../components/SoundControls";
import { useAudioSettings } from "../hooks/useAudioSettings";
import { useGameSession } from "../hooks/useGameSession";
import { playCorrect, playNext, playTap, playWrong, unlockAudio } from "../utils/gameAudio";
import { playPhraseAudio, preloadPhraseAudio, stopPhraseAudio } from "../utils/phraseAudio";
import { speakEnglish, speakEnglishSequence, stopSpeech } from "../utils/speech";

const IMAGE_STAGGER_MS = 85;
const IMAGE_ENTER_MS = 380;
const IMAGE_FEEDBACK_MS = 750;
const IMAGE_EXIT_MS = 300;

type ImageAnimPhase = "enter" | "play" | "exit";

function optionClass(
  id: number,
  targetId: number,
  selectedId: number | null,
  feedback: "correct" | "wrong" | null,
): string {
  if (!feedback || selectedId === null) return "";
  if (id === targetId) return "option-correct";
  if (id === selectedId) return "option-wrong";
  return "option-dim";
}

export function GamePage() {
  const { categoryId, modeId } = useParams<{ categoryId: string; modeId: string }>();
  const mode = gameModes.find((m) => m.id === modeId);
  const { sfxEnabled, voiceEnabled, toggleSfx, toggleVoice } = useAudioSettings();

  if (categoryId !== "phrasal-verbs" || !mode) {
    return <Navigate to="/" replace />;
  }

  const session = useGameSession(allPhrasalVerbs, mode.id);
  const {
    currentRound,
    questionNumber,
    score,
    streak,
    bestStreak,
    totalAnswered,
    correctCount,
    feedback,
    selectedId,
    answer,
    nextRound,
  } = session;

  const { type, target, options } = currentRound;
  const [imageAnim, setImageAnim] = useState<ImageAnimPhase>("enter");
  const [imageRoundReady, setImageRoundReady] = useState(false);
  const accuracy =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;
  const streakProgress = streak > 0 ? Math.min(100, (streak % 10) * 10 + 10) : 8;

  useEffect(() => {
    if (!feedback) return;
    if (sfxEnabled) {
      if (feedback === "correct") playCorrect();
      else playWrong();
    }
    if (voiceEnabled && type !== "choose-image") {
      speakEnglishSequence([target.phrase, target.sentence], true);
    }
  }, [feedback, sfxEnabled, voiceEnabled, type, target.phrase, target.sentence]);

  useEffect(() => {
    stopSpeech();
    if (!voiceEnabled || feedback) return;
    if (type === "choose-image" || type === "choose-phrase") return;
    speakEnglish(target.phrase, true);
  }, [questionNumber, type, voiceEnabled, feedback, target.phrase]);

  useEffect(() => {
    stopSpeech();
    stopPhraseAudio();
  }, []);

  useEffect(() => {
    if (type !== "choose-image") return;
    let cancelled = false;
    setImageRoundReady(false);
    setImageAnim("enter");

    void (async () => {
      if (voiceEnabled) {
        await preloadPhraseAudio(target);
      }
      if (!cancelled) setImageRoundReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [questionNumber, type, target.phrase, target.id, voiceEnabled]);

  useEffect(() => {
    if (type !== "choose-image" || !imageRoundReady) return;
    if (voiceEnabled) playPhraseAudio(target);
    setImageAnim("enter");
    const readyAt = IMAGE_ENTER_MS + IMAGE_STAGGER_MS * 3;
    const t = window.setTimeout(() => setImageAnim("play"), readyAt);
    return () => window.clearTimeout(t);
  }, [imageRoundReady, questionNumber, type, voiceEnabled, target.phrase, target.id]);

  useEffect(() => {
    if (type !== "choose-image" || !feedback) return;
    const t = window.setTimeout(() => setImageAnim("exit"), IMAGE_FEEDBACK_MS);
    return () => window.clearTimeout(t);
  }, [feedback, type]);

  useEffect(() => {
    if (type !== "choose-image" || imageAnim !== "exit") return;
    const doneAt = IMAGE_EXIT_MS + IMAGE_STAGGER_MS * 3 + 40;
    const t = window.setTimeout(() => {
      stopSpeech();
      stopPhraseAudio();
      if (sfxEnabled) playNext();
      nextRound();
    }, doneAt);
    return () => window.clearTimeout(t);
  }, [imageAnim, type, nextRound, sfxEnabled]);

  const handleAnswer = (id: number) => {
    if (type === "choose-image" && imageAnim !== "play") return;
    unlockAudio();
    if (sfxEnabled) playTap();
    answer(id, mode.multiplier);
  };

  const handleNext = () => {
    unlockAudio();
    if (sfxEnabled) playNext();
    stopSpeech();
    stopPhraseAudio();
    nextRound();
  };

  return (
    <Layout
      shellClassName="game-shell"
      mainClassName="game-main"
      backTo={`/category/${categoryId}`}
      backLabel="Режими"
      score={score}
      streak={streak}
      headerExtra={
        <SoundControls
          sfxEnabled={sfxEnabled}
          voiceEnabled={voiceEnabled}
          onToggleSfx={toggleSfx}
          onToggleVoice={toggleVoice}
        />
      }
    >
      <div className="game-viewport">
      <div className="session-stats" aria-live="polite">
        <span className="session-stat">№{questionNumber}</span>
        <span className="session-stat">
          <span className="stat-long">Точність: </span>
          {correctCount}/{totalAnswered || 0} ({accuracy}%)
        </span>
        {bestStreak > 0 && (
          <span className="session-stat session-stat-record">
            <span className="stat-long">Рекорд серії: </span>
            {bestStreak}
          </span>
        )}
      </div>

      <div className="progress-track endless">
        <div
          className="progress-fill"
          style={{ width: `${streakProgress}%` }}
          title={streak > 0 ? `Серія: ${streak}` : "Безкінечний режим"}
        />
      </div>
      {type === "choose-image" && (
        <section
          className={`game-panel game-panel--choose-image ${imageRoundReady ? "game-panel--ready" : "game-panel--preloading"}`}
          key={`${questionNumber}-image`}
        >
          <div
            className={`prompt-card prompt-card-anim ${
              imageAnim === "enter" ? "prompt-card-anim--enter" : ""
            } ${imageAnim === "exit" ? "prompt-card-anim--exit" : ""}`}
          >
            <p className="prompt-label">Знайди картинку для:</p>
            <h2 className="prompt-phrase">{target.phrase}</h2>
            <p className="prompt-phonetic">{target.phonetic}</p>
            {feedback && <p className="prompt-reveal-uk">{target.uk}</p>}
          </div>
          <div
            className={`image-options image-options-anim ${
              imageAnim === "enter" ? "image-options-anim--enter" : ""
            } ${imageAnim === "exit" ? "image-options-anim--exit" : ""} ${feedback ? "revealed" : ""}`}
          >
            {options.map((opt, index) => (
              <button
                key={opt.id}
                type="button"
                style={
                  imageAnim === "enter" || imageAnim === "exit"
                    ? ({ "--stagger": `${index * IMAGE_STAGGER_MS}ms` } as CSSProperties)
                    : undefined
                }
                className={`image-option ${optionClass(opt.id, target.id, selectedId, feedback)} ${feedback ? "revealed" : ""}`}
                disabled={!!feedback || imageAnim !== "play"}
                onClick={() => handleAnswer(opt.id)}
              >
                <div className="image-option-media">
                  <PhrasalImage
                    src={opt.image}
                    alt={opt.phrase}
                    phrase={opt.phrase}
                    variant="thumb"
                  />
                </div>
                <p className="image-option-caption">{opt.uk}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {type === "choose-word" && (
        <section className="game-panel game-panel--choose-word" key={`${questionNumber}-word`}>
          <div className="hero-image-wrap">
            <PhrasalImage
              src={target.image}
              alt={target.phrase}
              phrase={target.phrase}
              className="hero-image"
              variant="full"
            />
          </div>
          {feedback && (
            <div className="hero-reveal">
              <p className="hero-reveal-phrase">{target.phrase}</p>
              <p className="hero-reveal-phonetic">{target.phonetic}</p>
            </div>
          )}
          <p className="prompt-label center">Обери правильний переклад:</p>
          <div className={`text-options ${feedback ? "revealed" : ""}`}>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`text-option ${optionClass(opt.id, target.id, selectedId, feedback)}`}
                disabled={!!feedback}
                onClick={() => handleAnswer(opt.id)}
              >
                <span className="option-primary">{opt.uk}</span>
                {feedback && <span className="option-reveal-inline">{opt.phrase}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {type === "choose-phrase" && (
        <section className="game-panel game-panel--choose-phrase" key={`${questionNumber}-phrase`}>
          <div className="prompt-card">
            <p className="prompt-label">Яке фразове дієслово?</p>
            <p className="prompt-uk">{target.uk}</p>
            {feedback && (
              <>
                <p className="prompt-reveal-phrase">{target.phrase}</p>
                <p className="prompt-phonetic">{target.phonetic}</p>
              </>
            )}
          </div>
          <div className={`text-options phrase-options ${feedback ? "revealed" : ""}`}>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`text-option ${optionClass(opt.id, target.id, selectedId, feedback)}`}
                disabled={!!feedback}
                onClick={() => handleAnswer(opt.id)}
              >
                <span className="option-primary">{opt.phrase}</span>
                {feedback && <span className="option-reveal-inline">{opt.uk}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {feedback && type !== "choose-image" && (
        <div className={`feedback-bar feedback-bar--compact ${feedback}`}>
          <div className="feedback-text">
            <p className="feedback-status">
              {feedback === "correct" ? "✓ Правильно!" : "✗ Не зовсім…"}
            </p>
            <div className="feedback-translation">
              <p className="feedback-phrase">{target.phrase}</p>
              <p className="feedback-phonetic">{target.phonetic}</p>
              <p className="feedback-uk">{target.uk}</p>
            </div>
            <p className="feedback-example">{target.sentence}</p>
          </div>
          <button type="button" className="btn-primary btn-next" onClick={handleNext}>
            Далі ⟶
          </button>
        </div>
      )}
      </div>
    </Layout>
  );
}
