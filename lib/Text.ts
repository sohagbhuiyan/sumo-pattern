export const TEXT = {
  title: "SUMO PATTERN",
  subtitle: "Tuktuki On Fire! 🔥",
  tagline: "Dekho. Mone rakho. Abar আঁকো.",

  stats: { level: "Level", score: "Score", best: "Best" },

  message: {
    idle: "Pattern mone rakho, tarpor same order-e drag koro",
    show: (s: number) => `Pattern mone rakho — ${s}s`,
    input: "Ekhon pattern ta drag kore আঁকো",
    retry: "Vul hoyeche. Pattern ta ek-i ache, abar try koro",
    correct: "Perfect! 🎉",
    wrong: "Hoy nai!",
  },

  button: {
    start: "Start Game",
    continue: (level: number) => `Continue — Level ${level}`,
    reset: "Reset progress",
    skip: "Ready, skip",
    again: "Show again",
    next: "Next Level →",
  },
};
