"use client";

import { createContext, useContext, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { chapterIndex, CHAPTERS } from "../../lib/chapters";

// Shared easing/timing so every chapter moves the same way.
export const EASE = [0.22, 1, 0.36, 1];

const ProgressContext = createContext(null);

/** 0 → 1 scroll progress of the current pinned scene. */
export function useSceneProgress() {
  return useContext(ProgressContext);
}

/**
 * A chapter of the story: a tall section whose content stays pinned while
 * the user scrolls through `length` screens. Children read progress with
 * useSceneProgress() and scrub their animation with it.
 */
export function Scene({ id, length = 2, className = "", children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id={id} ref={ref} data-chapter={id} className="relative" style={{ height: `${length * 100}vh` }}>
      <div className={`sticky top-0 h-screen w-full overflow-hidden ${className}`}>
        <ProgressContext.Provider value={scrollYProgress}>{children}</ProgressContext.Provider>
      </div>
    </section>
  );
}

/** Opacity + lift that is fully visible between `from` and `to` (scene progress). */
export function useStage(progress, from, to, fade = 0.06) {
  const opacity = useTransform(
    progress,
    [from - fade, from, to, to + fade],
    [from <= 0 ? 1 : 0, 1, 1, to >= 1 ? 1 : 0],
  );
  const y = useTransform(progress, [from - fade, from, to, to + fade], [from <= 0 ? 0 : 24, 0, 0, to >= 1 ? 0 : -24]);
  return { opacity, y };
}

/** Text block that is shown during a slice of the scene's scroll. */
export function Stage({ from, to, className = "", children }) {
  const progress = useSceneProgress();
  const style = useStage(progress, from, to);
  return (
    <motion.div className={className} style={style}>
      {children}
    </motion.div>
  );
}

/** The chapter label every scene opens with: "01 — The Problem". */
export function Eyebrow({ chapter, tone = "brand" }) {
  const label = CHAPTERS.find((c) => c.id === chapter)?.label;
  const toneClass = { brand: "text-brand", danger: "text-danger", safe: "text-safe" }[tone];
  return (
    <div className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] ${toneClass}`}>
      <span className="tabular-nums">{chapterIndex(chapter)}</span>
      <span className="h-px w-8 bg-current opacity-60" />
      <span>{label}</span>
    </div>
  );
}

export function Title({ as: Tag = "h2", className = "", children }) {
  return (
    <Tag
      className={`text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-white md:text-6xl lg:text-7xl ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Lead({ className = "", children }) {
  return <p className={`text-lg leading-relaxed text-slate-300 md:text-xl ${className}`}>{children}</p>;
}

/** Glass panel used for HUDs, cards and telemetry across all scenes: see-through, blurred, lit top edge. */
export function Panel({ className = "", children, ...props }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.09] via-white/[0.03] to-white/[0.01] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_24px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Index of the current step for a scene split at `breakpoints`
 * (e.g. [0.33, 0.66] → 0, 1 or 2). Re-renders only when the step changes.
 */
export function useActiveStep(breakpoints) {
  const progress = useSceneProgress();
  const indexFor = (p) => breakpoints.filter((b) => p >= b).length;
  const [index, setIndex] = useState(() => indexFor(progress.get()));
  useMotionValueEvent(progress, "change", (p) => {
    const next = indexFor(p);
    if (next !== index) setIndex(next);
  });
  return index;
}

const BACKDROP_TONES = {
  brand: "45,212,191",
  danger: "244,63,94",
  safe: "52,211,153",
};

/** Shared scene background: a soft glow in the scene's tone over a faint, edge-faded grid. */
export function Backdrop({ tone = "brand", at = "70% 50%" }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${at}, rgba(${BACKDROP_TONES[tone]},0.10), transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}

/** Vertical list of a scene's steps with the current one highlighted. */
export function StepList({ steps, active, colors = [], className = "" }) {
  return (
    <ol className={`space-y-3 ${className}`}>
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <span
            style={i === active && colors[i] ? { background: colors[i] } : undefined}
            className={`h-px transition-all duration-500 ${
              i === active ? "w-8 bg-brand" : i < active ? "w-4 bg-slate-500" : "w-4 bg-slate-700"
            }`}
          />
          <span
            className={`transition-colors duration-500 ${
              i === active ? "text-white" : i < active ? "text-slate-500" : "text-slate-600"
            }`}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The standard text column that sits left of each scene's visual. */
export function TextColumn({ children }) {
  return (
    <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl items-start px-6 pt-24 md:items-center md:px-12 md:pt-0">
      <div className="grid w-full max-w-xl lg:max-w-2xl">{children}</div>
    </div>
  );
}

/** Stage variant that stacks with its siblings in TextColumn. */
export function TextStage({ from, to, className = "", children }) {
  return (
    <Stage from={from} to={to} className={`col-start-1 row-start-1 space-y-5 self-center ${className}`}>
      {children}
    </Stage>
  );
}
