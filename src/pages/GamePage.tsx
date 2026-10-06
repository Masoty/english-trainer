import { Navigate, useParams } from "react-router-dom";
import { allPhrasalVerbs, gameModes } from "../data/phrasalVerbs";
import { Layout } from "../components/Layout";
import { PhrasalImage } from "../components/PhrasalImage";
import { useGameSession } from "../hooks/useGameSession";

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
  const accuracy =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;
  const streakProgress = streak > 0 ? Math.min(100, (streak % 10) * 10 + 10) : 8;

  return (
    <Layout
      backTo={`/category/${categoryId}`}
      backLabel="Режими"
      score={score}
      streak={streak}
    >
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
      <p className="round-label endless-label">Безкінечне тренування — грай скільки завгодно</p>

      {type === "choose-image" && (
        <section className="game-panel" key={`${questionNumber}-image`}>
          <div className="prompt-card">
            <p className="prompt-label">Знайди картинку для:</p>
            <h2 className="prompt-phrase">{target.phrase}</h2>
            <p className="prompt-phonetic">{target.phonetic}</p>
            {feedback && <p className="prompt-reveal-uk">{target.uk}</p>}
          </div>
          <div className={`image-options ${feedback ? "revealed" : ""}`}>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`image-option ${optionClass(opt.id, target.id, selectedId, feedback)} ${feedback ? "revealed" : ""}`}
                disabled={!!feedback}
                onClick={() => answer(opt.id, mode.multiplier)}
              >
                <div className="image-option-media">
                  <PhrasalImage src={opt.image} alt={opt.phrase} phrase={opt.phrase} />
                </div>
                {feedback && (
                  <div className="option-reveal">
                    <span className="option-reveal-phrase">{opt.phrase}</span>
                    <span className="option-reveal-uk">{opt.uk}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {type === "choose-word" && (
        <section className="game-panel" key={`${questionNumber}-word`}>
          <div className="hero-image-wrap">
            <PhrasalImage
              src={target.image}
              alt={target.phrase}
              phrase={target.phrase}
              className="hero-image"
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
                onClick={() => answer(opt.id, mode.multiplier)}
              >
                <span className="option-primary">{opt.uk}</span>
                {feedback && <span className="option-reveal-inline">{opt.phrase}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {type === "choose-phrase" && (
        <section className="game-panel" key={`${questionNumber}-phrase`}>
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
                onClick={() => answer(opt.id, mode.multiplier)}
              >
                <span className="option-primary">{opt.phrase}</span>
                {feedback && <span className="option-reveal-inline">{opt.uk}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {feedback && (
        <div className={`feedback-bar ${feedback}`}>
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
          <button type="button" className="btn-primary btn-next" onClick={nextRound}>
            Далі ⟶
          </button>
        </div>
      )}
    </Layout>
  );
}
