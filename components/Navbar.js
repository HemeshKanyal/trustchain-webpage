"use client";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { CHAPTERS, chapterIndex, LINKS } from "../lib/chapters";
import useChapter from "../lib/useChapter";

export default function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [show, setShow] = useState(true);
  const chapter = useChapter();

  // Hide while scrolling down, reveal when scrolling up. Re-renders only when the direction flips.
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const next = current <= previous || current < 80;
    if (next !== show) setShow(next);
  });

  const current = CHAPTERS.find((c) => c.id === chapter);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[100] bg-transparent transition-transform duration-500 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between px-8 py-6">
        {/* Logo + tagline */}
        <a
          href="#problem"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0 });
          }}
          className="select-none"
        >
          <span className="block text-3xl font-extrabold tracking-wider text-white md:text-4xl">TRUSTCHAIN</span>
          <span className="block text-xs uppercase tracking-[0.2em] text-gray-400">Trust. Secured</span>
        </a>

        {/* Current chapter */}
        <div className="hidden items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500 md:flex">
          <AnimatePresence mode="wait">
            <motion.span
              key={chapter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <span className="tabular-nums text-brand">{chapterIndex(chapter)}</span>
              <span className="text-slate-300">{current?.label}</span>
            </motion.span>
          </AnimatePresence>
          <span className="tabular-nums">/ {String(CHAPTERS.length).padStart(2, "0")}</span>
        </div>

        <a
          href={LINKS.demo}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-black"
        >
          Get Started
        </a>
      </div>

      {/* Story progress */}
      <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-brand/60" />
    </nav>
  );
}
