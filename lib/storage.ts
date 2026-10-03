const KEY = "pattern-remember:v1";

export type Progress = { level: number; score: number; best: number };

const DEFAULT: Progress = { level: 1, score: 0, best: 0 };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const p = JSON.parse(raw);
    return {
      level: Math.max(1, Number(p.level) || 1),
      score: Math.max(0, Number(p.score) || 0),
      best: Math.max(0, Number(p.best) || 0),
    };
  } catch {
    return DEFAULT;
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode / storage full: game cholbe, shudhu save hobe na */
  }
}
