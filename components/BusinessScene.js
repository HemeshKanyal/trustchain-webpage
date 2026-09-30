"use client";

import { motion, useTransform } from "framer-motion";
import { Building2, Plug, Receipt, Leaf, HeartPulse, Scale } from "lucide-react";
import { Scene, Backdrop, TextColumn, TextStage, Eyebrow, Title, Lead, Panel, useSceneProgress } from "./ui/Scene";

const MODELS = [
  {
    icon: Building2,
    title: "B2B SaaS",
    body: "Subscription platform for manufacturers, distributors and pharmacies.",
    at: 0.14,
  },
  {
    icon: Plug,
    title: "API fees",
    body: "Verification API for hospitals, insurers and regulators, billed per call.",
    at: 0.26,
  },
  {
    icon: Receipt,
    title: "Per transaction",
    body: "A micro-fee on every custody event recorded on-chain.",
    at: 0.38,
  },
];

const ESG = [
  { icon: Leaf, title: "Environment", body: "Targeted recalls mean less wasted stock", at: 0.56 },
  { icon: HeartPulse, title: "Social", body: "Safer medicines for every patient", at: 0.64 },
  { icon: Scale, title: "Governance", body: "Auditable, regulator-ready records", at: 0.72 },
];

/** Scroll-scrubbed reveal shared by every card in this scene. */
function Reveal({ at, className = "", children }) {
  const progress = useSceneProgress();
  const opacity = useTransform(progress, [at - 0.06, at], [0, 1]);
  const y = useTransform(progress, [at - 0.06, at], [28, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

function MarketStat() {
  const progress = useSceneProgress();
  const value = useTransform(progress, [0.0, 0.14], [0, 30.5], { clamp: true });
  const text = useTransform(value, (v) => `US$${v.toFixed(1)}B`);
  return (
    <Panel className="p-5">
      <motion.div className="text-4xl font-extrabold tracking-tight tabular-nums text-brand md:text-6xl">
        {text}
      </motion.div>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        spent every year on substandard and falsified medicines in low- and middle-income countries.
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-600">WHO, 2017</p>
    </Panel>
  );
}

export default function BusinessScene() {
  return (
    <Scene id="business" length={3}>
      <Backdrop tone="brand" at="75% 45%" />

      <TextColumn>
        <TextStage from={0} to={1}>
          <Eyebrow chapter="business" />
          <Title>
            Proven demand. <span className="text-brand">Scalable across industries.</span>
          </Title>
          <Lead>A market measured in billions, and three revenue streams that grow with every verified handover.</Lead>
          <div className="hidden md:block">
            <MarketStat />
          </div>
        </TextStage>
      </TextColumn>

      <div className="pointer-events-none absolute inset-x-6 bottom-6 md:inset-x-auto md:bottom-auto md:right-12 md:top-1/2 md:w-[440px] md:-translate-y-1/2 lg:w-[520px]">
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Revenue model</div>
          {MODELS.map(({ icon: Icon, title, body, at }) => (
            <Reveal key={title} at={at}>
              <Panel className="flex items-start gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-base font-bold text-white">{title}</div>
                  <p className="text-sm leading-relaxed text-slate-400">{body}</p>
                </div>
              </Panel>
            </Reveal>
          ))}

          <div className="pt-4 text-[11px] uppercase tracking-[0.25em] text-slate-500">ESG impact</div>
          <div className="grid grid-cols-3 gap-3">
            {ESG.map(({ icon: Icon, title, body, at }) => (
              <Reveal key={title} at={at}>
                <Panel className="h-full p-3 text-center md:p-4">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: at * 4 }}
                    className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-safe/40 bg-safe/10 text-safe"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.span>
                  <div className="mt-2 text-sm font-medium text-white">{title}</div>
                  <p className="mt-1 hidden text-xs leading-snug text-slate-400 md:block">{body}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
