import { useCallback, useState } from "react";
import type { PhrasalVerb } from "../data/phrasalVerbs";
import { shuffle } from "../utils/shuffle";

export type RoundType = "choose-image" | "choose-word" | "choose-phrase";

export type Round = {
  type: RoundType;
  target: PhrasalVerb;
  options: PhrasalVerb[];
};

const ROUND_TYPES: RoundType[] = ["choose-image", "choose-word", "choose-phrase"];

function buildRound(words: PhrasalVerb[], type: RoundType): Round {
  const target = words[Math.floor(Math.random() * words.length)];
  const others = shuffle(words.filter((w) => w.id !== target.id)).slice(0, 3);
  return {
    type,
    target,
    options: shuffle([target, ...others]),
  };
}

function buildMixedRound(words: PhrasalVerb[]): Round {
  const type = ROUND_TYPES[Math.floor(Math.random() * ROUND_TYPES.length)];
  return buildRound(words, type);
}

function createRound(words: PhrasalVerb[], modeId: string): Round {
  if (modeId === "mixed") return buildMixedRound(words);
  return buildRound(words, modeId as RoundType);
}

export function useGameSession(words: PhrasalVerb[], modeId: string) {
  const [currentRound, setCurrentRound] = useState(() => createRound(words, modeId));
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const answer = useCallback(
    (id: number, multiplier: number) => {
      if (feedback) return;

      setSelectedId(id);
      const isCorrect = id === currentRound.target.id;
      setTotalAnswered((n) => n + 1);

      if (isCorrect) {
        setScore((s) => s + 10 * multiplier);
        setCorrectCount((n) => n + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
        setFeedback("correct");
      } else {
        setStreak(0);
        setFeedback("wrong");
      }
    },
    [currentRound.target.id, feedback],
  );

  const nextRound = useCallback(() => {
    setCurrentRound(createRound(words, modeId));
    setQuestionNumber((n) => n + 1);
    setFeedback(null);
    setSelectedId(null);
  }, [words, modeId]);

  return {
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
  };
}
