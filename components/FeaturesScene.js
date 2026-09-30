"use client";

import { motion, useTransform } from "framer-motion";
import { QrCode, ScanLine, BellRing, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  Scene,
  Backdrop,
  TextColumn,
  TextStage,
  Eyebrow,
  Title,
  Lead,
  Panel,
  StepList,
  useSceneProgress,
  useStage,
  useActiveStep,
} from "./ui/Scene";
import theme from "../lib/theme";

/* Each feature owns a third of the scroll. */
const PHASES = [
  [0, 0.3],
  [0.36, 0.63],
  [0.69, 1],
];

/* ---------- 1. Unique ID ---------- */

function UniqueId() {
  const progress = useSceneProgress();
  const [a, b] = PHASES[0];
  const scale = useTransform(progress, [a + 0.04, b - 0.08], [1, 1.8], { clamp: true });
  const tag = useStage(progress, a + 0.14, b, 0.04);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div style={{ scale, transformOrigin: "82% 50%" }} className="w-[80%] max-w-[340px]">
        <svg viewBox="0 0 320 150" className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <defs>
            <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e2e8f0" />
              <stop offset="0.5" stopColor="#94a3b8" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
            <radialGradient id="blister" cx="0.35" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>
          <rect x="1" y="1" width="318" height="148" rx="14" fill="url(#foil)" />
          {Array.from({ length: 10 }).map((_, i) => (
            <circle
              key={i}
              cx={34 + (i % 5) * 38}
              cy={i < 5 ? 48 : 102}
              r="15"
              fill="url(#blister)"
              stroke="#94a3b8"
              strokeWidth="1"
            />
          ))}
          <rect x="226" y="37" width="76" height="76" rx="6" fill="#fff" />
          <image href="/assets/qr-code.png" x="232" y="43" width="64" height="64" />
          <rect
            x="226"
            y="37"
            width="76"
            height="76"
            rx="6"
            fill="none"
            stroke={theme.brand.DEFAULT}
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      <div className="absolute bottom-[8%] left-1/2 w-[88%] max-w-[380px] -translate-x-1/2">
        <motion.div style={tag}>
          <Panel className="p-4 font-mono text-[11px] leading-relaxed text-slate-400">
            <div className="mb-2 flex items-center gap-2 font-sans text-sm text-white">
              <QrCode className="h-4 w-4 text-brand" /> Unique on-chain identity
            </div>
            <div>
              id <span className="text-brand">TC-IN-2025-0007731-042</span>
            </div>
            <div>
              batch <span className="text-slate-200">7731</span> · strip{" "}
              <span className="text-slate-200">42 / 600</span>
            </div>
            <div>
              hash <span className="text-slate-200">0x7a3f…c21e</span>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- 2. Holographic tablet scan ---------- */

function TabletScan() {
  const progress = useSceneProgress();
  const [a, b] = PHASES[1];
  const beamY = useTransform(progress, [a + 0.03, a + 0.17], ["8%", "88%"], { clamp: true });
  const beamOpacity = useTransform(progress, [a + 0.02, a + 0.04, a + 0.17, a + 0.19], [0, 1, 1, 0]);
  const verified = useStage(progress, a + 0.18, b, 0.03);
  const glow = useTransform(progress, [a + 0.17, a + 0.2], [0, 1], { clamp: true });

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative aspect-square w-[70%] max-w-[340px]">
        {/* Scanner frame */}
        {[
          "left-0 top-0 border-l-2 border-t-2",
          "right-0 top-0 border-r-2 border-t-2",
          "left-0 bottom-0 border-l-2 border-b-2",
          "right-0 bottom-0 border-r-2 border-b-2",
        ].map((c) => (
          <span key={c} className={`absolute h-10 w-10 rounded-sm border-brand/70 ${c}`} />
        ))}
        <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.12),transparent_65%)]" />

        {/* Capsule */}
        <div className="absolute left-1/2 top-1/2 h-[26%] w-[64%] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-22, -18, -22] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-full w-full overflow-hidden rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="h-full w-1/2 bg-gradient-to-b from-slate-100 to-slate-300" />
            <div className="h-full w-1/2 bg-gradient-to-b from-teal-400 to-teal-700" />
            <motion.div
              style={{ opacity: glow }}
              className="absolute inset-0 rounded-full ring-2 ring-safe shadow-[0_0_40px_rgba(52,211,153,0.6)]"
            />
          </motion.div>
        </div>

        {/* Beam */}
        <motion.div
          style={{ top: beamY, opacity: beamOpacity }}
          className="absolute inset-x-2 h-0.5 bg-brand shadow-[0_0_20px_4px_rgba(45,212,191,0.6)]"
        />
      </div>

      <div className="absolute bottom-[8%] left-1/2 w-[88%] max-w-[340px] -translate-x-1/2">
        <motion.div style={verified}>
          <Panel className="flex items-center gap-3 border-safe/40 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-safe/15 text-safe">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-medium text-white">Verified genuine</div>
              <div className="text-xs text-slate-400">Matches batch 7731 · manufacturer signature valid</div>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- 3. Recall network ---------- */

const M = { x: 30, y: 150 };
const D = [60, 150, 240].map((y) => ({ x: 130, y }));
const P = [35, 85, 125, 175, 215, 265].map((y, i) => ({ x: 235, y, parent: Math.floor(i / 2) }));
const PT = Array.from({ length: 12 }, (_, i) => ({ x: 360, y: 18 + i * 24.5, parent: Math.floor(i / 2) }));

// The recalled batch travelled through distributor 0 → pharmacies 0,1 → patients 0–3.
const R0 = PHASES[2][0];
const LEVEL = [R0 + 0.02, R0 + 0.08, R0 + 0.14, R0 + 0.2];

function useAlert(at, affected) {
  const progress = useSceneProgress();
  const fill = useTransform(
    progress,
    [at - 0.03, at],
    [theme.ink[600], affected ? theme.danger.DEFAULT : theme.ink[600]],
  );
  return fill;
}

function Edge({ from, to, at, affected }) {
  const progress = useSceneProgress();
  const pathLength = useTransform(progress, [at - 0.05, at], [0, 1], { clamp: true });
  return (
    <>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
      {affected && (
        <motion.path
          d={`M${from.x},${from.y} L${to.x},${to.y}`}
          stroke={theme.danger.DEFAULT}
          strokeWidth="1.5"
          fill="none"
          style={{ pathLength }}
        />
      )}
    </>
  );
}

function Node({ node, r, at, affected, pulse }) {
  const fill = useAlert(at, affected);
  const progress = useSceneProgress();
  const ring = useTransform(progress, [at, at + 0.02], [0, 1], { clamp: true });
  return (
    <g>
      {pulse && affected && (
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={r}
          fill="none"
          stroke={theme.danger.DEFAULT}
          style={{ opacity: ring }}
          animate={{ r: [r, r * 2.6], strokeOpacity: [0.8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.circle cx={node.x} cy={node.y} r={r} style={{ fill }} stroke="rgba(255,255,255,0.15)" />
    </g>
  );
}

function RecallNetwork() {
  const progress = useSceneProgress();
  const alert = useStage(progress, LEVEL[3] + 0.03, 1, 0.03);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 300" className="w-[92%] max-w-[480px] overflow-visible">
        {D.map((d, i) => (
          <Edge key={`md${i}`} from={M} to={d} at={LEVEL[1]} affected={i === 0} />
        ))}
        {P.map((p, i) => (
          <Edge key={`dp${i}`} from={D[p.parent]} to={p} at={LEVEL[2]} affected={p.parent === 0} />
        ))}
        {PT.map((pt, i) => (
          <Edge key={`pp${i}`} from={P[pt.parent]} to={pt} at={LEVEL[3]} affected={pt.parent <= 1} />
        ))}

        <Node node={M} r={11} at={LEVEL[0]} affected />
        {D.map((d, i) => (
          <Node key={`d${i}`} node={d} r={8} at={LEVEL[1]} affected={i === 0} />
        ))}
        {P.map((p, i) => (
          <Node key={`p${i}`} node={p} r={6.5} at={LEVEL[2]} affected={p.parent === 0} />
        ))}
        {PT.map((pt, i) => (
          <Node key={`pt${i}`} node={pt} r={5} at={LEVEL[3]} affected={pt.parent <= 1} pulse />
        ))}

        {[
          [M.x, "Maker"],
          [130, "Distributors"],
          [235, "Pharmacies"],
          [360, "Patients"],
        ].map(([x, label]) => (
          <text
            key={label}
            x={x}
            y="298"
            textAnchor="middle"
            className="fill-slate-500 text-[9px] uppercase tracking-widest"
          >
            {label}
          </text>
        ))}
      </svg>

      <div className="absolute bottom-[8%] left-1/2 w-[88%] max-w-[340px] -translate-x-1/2">
        <motion.div style={alert}>
          <Panel className="flex items-center gap-3 border-danger/40 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-danger/15 text-danger">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-medium text-white">Recall: batch 7731</div>
              <div className="text-xs text-slate-400">4 patients alerted · 2 pharmacies blocked from dispensing</div>
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

function Visual({ phase, children }) {
  const progress = useSceneProgress();
  const [a, b] = PHASES[phase];
  const style = useStage(progress, a, b, 0.04);
  return (
    <motion.div style={style} className="col-start-1 row-start-1 h-full w-full">
      {children}
    </motion.div>
  );
}

function FeaturesSceneContent() {
  const active = useActiveStep([PHASES[1][0] - 0.03, PHASES[2][0] - 0.03]);

  return (
    <>
      <Backdrop tone={active === 2 ? "danger" : active === 1 ? "safe" : "brand"} />

      {/* Visual stage */}
      <div className="absolute inset-x-0 bottom-0 top-[45%] mx-auto grid max-w-7xl px-6 md:inset-y-0 md:top-0 md:grid-cols-2 md:px-12">
        <div className="hidden md:block" />
        <div className="grid h-full overflow-hidden">
          <Visual phase={0}>
            <UniqueId />
          </Visual>
          <Visual phase={1}>
            <TabletScan />
          </Visual>
          <Visual phase={2}>
            <RecallNetwork />
          </Visual>
        </div>
      </div>

      <TextColumn>
        <TextStage from={0} to={PHASES[0][1]}>
          <Eyebrow chapter="features" />
          <div className="flex items-center gap-2 text-sm text-brand">
            <QrCode className="h-4 w-4" /> Unique ID
          </div>
          <Title>Every strip has its own identity.</Title>
          <Lead>
            Not just every batch: every single strip gets a QR code bound to a unique, tamper-proof record on-chain.
          </Lead>
        </TextStage>
        <TextStage from={PHASES[1][0]} to={PHASES[1][1]}>
          <Eyebrow chapter="features" tone="safe" />
          <div className="flex items-center gap-2 text-sm text-safe">
            <ScanLine className="h-4 w-4" /> Traceable to the tablet
          </div>
          <Title>Even a loose tablet can prove it&apos;s real.</Title>
          <Lead>
            A holographic scan matches the tablet to its batch signature, so pharmacists and patients can verify it in
            seconds.
          </Lead>
        </TextStage>
        <TextStage from={PHASES[2][0]} to={1}>
          <Eyebrow chapter="features" tone="danger" />
          <div className="flex items-center gap-2 text-sm text-danger">
            <BellRing className="h-4 w-4" /> Recall-safe
          </div>
          <Title>Recalls reach the right people, instantly.</Title>
          <Lead>
            Because every handover is on-chain, a recall follows the exact path the batch took, and only the affected
            patients are alerted.
          </Lead>
        </TextStage>
      </TextColumn>

      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 px-12 md:block">
        <StepList steps={["Unique ID", "Holographic verification", "Instant recall"]} active={active} />
      </div>
    </>
  );
}

export default function FeaturesScene() {
  return (
    <Scene id="features" length={4}>
      <FeaturesSceneContent />
    </Scene>
  );
}
