"use client";

import { AnimatePresence, motion } from "motion/react";
import PatternBoard from "./PatternBoard";
import { useGame } from "@/hooks/useGame";
import { SHOW_SECONDS } from "@/lib/pattern";
import { TEXT } from "@/lib/Text";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-2xl bg-white/5 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="text-xl font-bold tabular-nums"
        >
          {value}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={
        "w-full rounded-2xl px-4 py-3 font-semibold " +
        (variant === "primary"
          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"
          : "bg-white/10 text-slate-200")
      }
    >
      {children}
    </motion.button>
  );
}

export default function Game() {
  const g = useGame();

  const message = {
    idle: TEXT.message.idle,
    show: TEXT.message.show(g.timeLeft),
    input: g.mistakes > 0 ? TEXT.message.retry : TEXT.message.input,
    result: g.status === "correct" ? TEXT.message.correct : TEXT.message.wrong,
  }[g.phase];

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 p-4 text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <section className="relative w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
        <header className="text-center">
          <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            {TEXT.title}
          </h1>
          <p className="text-lg font-semibold text-slate-300">{TEXT.subtitle}</p>
          <p className="mt-1 text-xs text-slate-400">{TEXT.tagline}</p>
        </header>

        <div className="flex gap-2">
          <Stat label={TEXT.stats.level} value={g.level} />
          <Stat label={TEXT.stats.score} value={g.score} />
          <Stat label={TEXT.stats.best} value={g.best} />
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          {g.phase === "show" && (
            <motion.div
              key={g.round}
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: SHOW_SECONDS, ease: "linear" }}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="h-6 text-center text-sm text-slate-300"
          >
            {message}
          </motion.p>
        </AnimatePresence>

        <motion.div
          animate={g.status === "wrong" ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-slate-900/60 p-3"
        >
          <PatternBoard
            key={`${g.round}-${g.attempt}`}
            size={g.size}
            pattern={g.pattern}
            phase={g.phase}
            status={g.status}
            onComplete={g.submit}
          />
        </motion.div>

        <div className="flex flex-col gap-2">
          {g.phase === "idle" && g.ready && (
            <>
              <Btn onClick={() => g.start(g.level)}>
                {g.level > 1 ? TEXT.button.continue(g.level) : TEXT.button.start}
              </Btn>
              {g.level > 1 && (
                <Btn variant="ghost" onClick={g.resetProgress}>
                  {TEXT.button.reset}
                </Btn>
              )}
            </>
          )}
          {g.phase === "show" && (
            <Btn variant="ghost" onClick={g.skipToInput}>
              {TEXT.button.skip}
            </Btn>
          )}
          {g.phase === "input" && (
            <Btn variant="ghost" onClick={g.showAgain}>
              {TEXT.button.again}
            </Btn>
          )}
          {g.phase === "result" && g.status === "correct" && (
            <Btn onClick={g.next}>{TEXT.button.next}</Btn>
          )}
        </div>
      </section>
    </main>
  );
}