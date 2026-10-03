"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SHOW_SECONDS,
  generatePattern,
  isSame,
  levelConfig,
} from "@/lib/pattern";
import { loadProgress, saveProgress } from "@/lib/storage";

export type Phase = "idle" | "show" | "input" | "result";
export type Status = "correct" | "wrong" | null;

const RETRY_DELAY = 800; // wrong dekhanor por abar input-e fire jabe

export function useGame() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<Status>(null);
  const [level, setLevel] = useState(1);
  const [size, setSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SHOW_SECONDS);
  const [round, setRound] = useState(0); // notun show shuru hole barbe
  const [attempt, setAttempt] = useState(0); // board clear korar jonno
  const [mistakes, setMistakes] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const endAt = useRef(0);

  // saved progress load
  useEffect(() => {
    const p = loadProgress();
    setLevel(p.level);
    setScore(p.score);
    setBest(p.best);
    setSize(levelConfig(p.level).size);
    setReady(true);
  }, []);

  const beginShow = useCallback(() => {
    setTimeLeft(SHOW_SECONDS);
    setRound((r) => r + 1);
    endAt.current = Date.now() + SHOW_SECONDS * 1000;
    setPhase("show");
  }, []);

  const start = useCallback(
    (lvl: number) => {
      const cfg = levelConfig(lvl);
      setLevel(lvl);
      setSize(cfg.size);
      setPattern(generatePattern(cfg.size, cfg.length));
      setStatus(null);
      setMistakes(0);
      setPeeked(false);
      setAttempt(0);
      beginShow();
    },
    [beginShow],
  );

  // same pattern abar dekhano (notun pattern toiri hoy na)
  const showAgain = useCallback(() => {
    setStatus(null);
    setPeeked(true);
    beginShow();
  }, [beginShow]);

  // show countdown
  useEffect(() => {
    if (phase !== "show") return;
    const id = setInterval(() => {
      const remaining = Math.ceil((endAt.current - Date.now()) / 1000);
      setTimeLeft(Math.max(remaining, 0));
      if (remaining <= 0) {
        clearInterval(id);
        setPhase("input");
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, round]);

  // vul hole: ek-i pattern rekhe board clear, abar input
  useEffect(() => {
    if (phase !== "result" || status !== "wrong") return;
    const id = setTimeout(() => {
      setStatus(null);
      setAttempt((a) => a + 1);
      setPhase("input");
    }, RETRY_DELAY);
    return () => clearTimeout(id);
  }, [phase, status]);

  const skipToInput = useCallback(() => setPhase("input"), []);

  const submit = useCallback(
    (path: number[]) => {
      if (path.length === 0) return; // faka tap, penalty nai

      if (!isSame(path, pattern)) {
        setMistakes((m) => m + 1);
        setStatus("wrong");
        setPhase("result");
        return;
      }

      const gained =
        mistakes === 0 && !peeked ? level * 10 : Math.ceil((level * 10) / 2);
      const nextScore = score + gained;
      const nextBest = Math.max(best, nextScore);

      setScore(nextScore);
      setBest(nextBest);
      setStatus("correct");
      setPhase("result");
      saveProgress({ level: level + 1, score: nextScore, best: nextBest });
    },
    [pattern, mistakes, peeked, level, score, best],
  );

  const next = useCallback(() => start(level + 1), [start, level]);

  const resetProgress = useCallback(() => {
    saveProgress({ level: 1, score: 0, best });
    setLevel(1);
    setScore(0);
    setSize(levelConfig(1).size);
  }, [best]);

  return {
    ready,
    phase,
    status,
    level,
    size,
    pattern,
    score,
    best,
    timeLeft,
    round,
    attempt,
    mistakes,
    start,
    showAgain,
    skipToInput,
    submit,
    next,
    resetProgress,
  };
}
