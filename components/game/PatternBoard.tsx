"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { Phase, Status } from "@/hooks/useGame";

type Props = {
  size: number;
  pattern: number[];
  phase: Phase;
  status: Status;
  onComplete: (path: number[]) => void;
};

const VIEW = 100;

export default function PatternBoard({
  size, pattern, phase, status, onComplete,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const pathRef = useRef<number[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [tail, setTail] = useState<{ x: number; y: number } | null>(null);

  const cell = VIEW / size;
  const center = (i: number) => ({
    x: ((i % size) + 0.5) * cell,
    y: (Math.floor(i / size) + 0.5) * cell,
  });

  const toPoint = (e: React.PointerEvent) => {
    const r = boardRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * VIEW,
      y: ((e.clientY - r.top) / r.height) * VIEW,
    };
  };

  const hit = (p: { x: number; y: number }) => {
    for (let i = 0; i < size * size; i++) {
      const c = center(i);
      if (Math.hypot(c.x - p.x, c.y - p.y) < cell * 0.32) return i;
    }
    return -1;
  };

  const setBoth = (next: number[]) => {
    pathRef.current = next;
    setPath(next);
  };

  const onDown = (e: React.PointerEvent) => {
    if (phase !== "input") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = toPoint(e);
    const h = hit(p);
    setBoth(h >= 0 ? [h] : []);
    setTail(p);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = toPoint(e);
    setTail(p);
    const h = hit(p);
    if (h >= 0 && !pathRef.current.includes(h)) {
      setBoth([...pathRef.current, h]);
      navigator.vibrate?.(8); // Android web-e haptic
    }
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setTail(null);
    onComplete(pathRef.current);
  };

  const active = phase === "show" ? pattern : path;
  const color =
    status === "correct" ? "#34d399" : status === "wrong" ? "#fb7185" : "#a78bfa";
  const d = active
    .map((n, i) => `${i ? "L" : "M"}${center(n).x} ${center(n).y}`)
    .join(" ");
  const last = path.length ? center(path[path.length - 1]) : null;

  return (
    <div
      ref={boardRef}
      className="aspect-square w-full touch-none select-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {active.length > 1 && (
          <motion.path
            key={phase === "show" ? "show" : "draw"}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
            initial={phase === "show" ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{
              duration: phase === "show" ? 0.2 * active.length + 0.4 : 0,
              ease: "easeInOut",
            }}
          />
        )}

        {phase === "input" && tail && last && (
          <line
            x1={last.x} y1={last.y} x2={tail.x} y2={tail.y}
            stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.5}
          />
        )}

        {Array.from({ length: size * size }, (_, i) => {
          const c = center(i);
          const idx = active.indexOf(i);
          const lit = idx >= 0;
          const delay = phase === "show" && lit ? idx * 0.2 : 0;

          return (
            <g key={i}>
              {lit && (
                <motion.circle
                  cx={c.x} cy={c.y} fill={color}
                  initial={{ r: 5, opacity: 0.35 }}
                  animate={{ r: [5, 9.5], opacity: [0.35, 0] }}
                  transition={{
                    duration: 1.4, delay, ease: "easeOut",
                    repeat: phase === "show" ? Infinity : 0,
                  }}
                />
              )}
              <motion.circle
                cx={c.x} cy={c.y}
                initial={false}
                animate={{ r: lit ? 5.2 : 2.6, fill: lit ? color : "#475569" }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
              />
              {phase === "show" && lit && (
                <motion.text
                  x={c.x} y={c.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={4.5} fontWeight={700} fill="#0f172a"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay }}
                >
                  {idx + 1}
                </motion.text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}