"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { motion, useTransform } from "framer-motion";
import { Thermometer, MapPin, Radio, Blocks, BrainCircuit, AlertTriangle, CheckCircle2 } from "lucide-react";
import * as THREE from "three";
import SceneCanvas from "./three/SceneCanvas";
import {
  Scene,
  Backdrop,
  TextColumn,
  TextStage,
  Eyebrow,
  Title,
  Lead,
  Panel,
  useSceneProgress,
  useStage,
  useActiveStep,
} from "./ui/Scene";
import theme from "../lib/theme";

/* Scroll timeline (scene progress) */
const SPIKE = [0.35, 0.5];
const CRITICAL_AT = 0.48;
const LEDGER_AT = 0.58;
const AI_AT = 0.78;

const tempAt = (p) => 25 + 16.2 * THREE.MathUtils.smoothstep(p, SPIKE[0], SPIKE[1]);

/* ---------- 3D ---------- */

const roadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Road and ground in one plane: lanes and grid scroll toward the camera so the truck appears to drive.
const roadFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLine;
  uniform vec3 uAlert;
  uniform float uCritical;
  varying vec2 vUv;
  void main() {
    float x = (vUv.x - 0.5) * 40.0;
    float y = vUv.y * 80.0 + uTime * 10.0;
    vec3 lineCol = mix(uLine, uAlert, uCritical);

    float onRoad = 1.0 - smoothstep(3.5, 3.6, abs(x));
    vec3 col = mix(vec3(0.02, 0.03, 0.05), vec3(0.045, 0.055, 0.08), onRoad);

    float dash = step(0.55, fract(y / 4.0)) * (1.0 - smoothstep(0.05, 0.09, abs(x))) * onRoad;
    float edge = 1.0 - smoothstep(0.03, 0.08, abs(abs(x) - 3.3));
    vec2 g = abs(fract(vec2(x, y) / 2.0) - 0.5);
    float grid = (1.0 - smoothstep(0.0, 0.03, min(g.x, g.y))) * (1.0 - onRoad);

    col += lineCol * (dash * 0.7 + edge * 0.9) + vec3(0.25, 0.3, 0.4) * grid * 0.25;
    float fade = (1.0 - smoothstep(0.35, 0.85, vUv.y)) * smoothstep(0.0, 0.04, vUv.y) * (1.0 - smoothstep(10.0, 20.0, abs(x)));
    gl_FragColor = vec4(col, fade);
  }
`;

function Road() {
  const progress = useSceneProgress();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLine: { value: new THREE.Color(theme.brand.DEFAULT) },
      uAlert: { value: new THREE.Color(theme.danger.DEFAULT) },
      uCritical: { value: 0 },
    }),
    [],
  );
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uCritical.value = THREE.MathUtils.smoothstep(progress.get(), CRITICAL_AT - 0.04, CRITICAL_AT);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
      <planeGeometry args={[40, 80]} />
      <shaderMaterial
        vertexShader={roadVertex}
        fragmentShader={roadFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

const WHEELS = [-1.6, 0.5, 1.4].flatMap((z) => [
  [-0.72, 0.32, z],
  [0.72, 0.32, z],
]);

function Truck() {
  const progress = useSceneProgress();
  const body = useRef();
  const wheels = useRef([]);
  const stripes = useRef([]);
  const chip = useRef();
  const safe = useMemo(() => new THREE.Color(theme.brand.DEFAULT), []);
  const alert = useMemo(() => new THREE.Color(theme.danger.DEFAULT), []);

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const critical = THREE.MathUtils.smoothstep(p, CRITICAL_AT - 0.04, CRITICAL_AT);
    body.current.position.y = Math.sin(t * 9) * 0.012;
    wheels.current.forEach((w) => w && (w.rotation.y += delta * 12)); // spin about the axle
    stripes.current.forEach((m) => {
      if (!m) return;
      m.color.lerpColors(safe, alert, critical);
      m.opacity = critical ? 0.65 + Math.sin(t * 10) * 0.35 * critical : 1;
    });
    if (chip.current) {
      chip.current.textContent = `${tempAt(p).toFixed(1)}°C`;
      chip.current.parentElement.dataset.critical = p >= CRITICAL_AT ? "1" : "0";
    }
  });

  return (
    <group ref={body}>
      {/* Chassis */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.3, 0.22, 4.3]} />
        <meshStandardMaterial color="#0b1120" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Refrigerated container */}
      <RoundedBox args={[1.55, 1.5, 3.1]} radius={0.06} smoothness={3} position={[0, 1.37, 0.55]}>
        <meshStandardMaterial color="#3a4a6b" metalness={0.35} roughness={0.4} />
      </RoundedBox>
      {[-1, 1].map((side, i) => (
        <mesh key={side} position={[side * 0.785, 1.05, 0.55]} rotation={[0, (side * Math.PI) / 2, 0]}>
          <planeGeometry args={[3.0, 0.07]} />
          <meshBasicMaterial
            ref={(m) => (stripes.current[i] = m)}
            color={theme.brand.DEFAULT}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
      <RoundedBox args={[1.1, 0.5, 0.3]} radius={0.04} smoothness={2} position={[0, 1.85, -1.05]}>
        <meshStandardMaterial color="#222f4d" metalness={0.5} roughness={0.35} />
      </RoundedBox>
      {/* Cab */}
      <RoundedBox args={[1.45, 1.15, 1.05]} radius={0.12} smoothness={3} position={[0, 1.05, -1.75]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 1.25, -2.285]}>
        <planeGeometry args={[1.2, 0.45]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.7, -2.29]}>
          <boxGeometry args={[0.25, 0.1, 0.02]} />
          <meshBasicMaterial color="#fef3c7" toneMapped={false} />
        </mesh>
      ))}
      {/* Wheels */}
      {WHEELS.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <group ref={(g) => (wheels.current[i] = g)}>
            <mesh>
              <cylinderGeometry args={[0.32, 0.32, 0.26, 20]} />
              <meshStandardMaterial color="#05070d" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.135, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.01, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        </mesh>
      ))}

      {/* Floating telemetry chip */}
      <Html position={[0, 2.55, 0.55]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          data-critical="0"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand/40 bg-ink-900/85 px-3 py-1 text-xs font-medium text-brand backdrop-blur transition-colors data-[critical='1']:border-danger/60 data-[critical='1']:text-danger"
        >
          <Thermometer className="h-3.5 w-3.5" />
          <span ref={chip} className="tabular-nums">
            25.0°C
          </span>
        </div>
      </Html>
    </group>
  );
}

// Road and truck share one group, so the truck always sits on the road surface and follows its direction.
// The shot is framed by aiming the camera, not by moving the truck off the road.
function Rig({ children }) {
  const rig = useRef();
  useFrame((state, delta) => {
    const mobile = state.viewport.aspect < 1;
    rig.current.scale.setScalar(mobile ? 0.7 : 0.85);
    const ease = Math.min(1, delta * 2);
    rig.current.rotation.y += (-0.35 + state.pointer.x * 0.15 - rig.current.rotation.y) * ease;
    state.camera.lookAt(mobile ? 0.6 : -4.6, mobile ? 1.6 : 1.1, -1);
  });
  return <group ref={rig}>{children}</group>;
}

/* ---------- HUD ---------- */

// Temperature trace: steady at 25°C, then the excursion. Revealed as you scroll.
const TRACE = "M0,46 L20,45 L40,46.5 L60,45.5 L80,46 L100,45 L120,46 L135,44 L150,34 L165,18 L180,10 L200,9";

function TelemetryPanel({ critical }) {
  const progress = useSceneProgress();
  const temp = useTransform(progress, (p) => `${tempAt(p).toFixed(1)}°C`);
  // The flat part of the trace fills in first; the spike only draws during the spike.
  const pathLength = useTransform(progress, [0, SPIKE[0], SPIKE[1]], [0.2, 0.68, 1], { clamp: true });

  return (
    <Panel
      className={`p-4 transition-colors duration-500 ${critical ? "border-danger/50 shadow-[0_0_40px_-10px_rgba(244,63,94,0.6)]" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Shipment TC-7731</div>
          <div className="text-sm text-white">Live telemetry</div>
        </div>
        {critical ? (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-danger"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> CRITICAL
          </motion.span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-safe/10 px-2.5 py-1 text-[11px] font-medium text-safe">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-safe" /> Nominal
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Thermometer className="h-4 w-4" /> Temp
        </div>
        <motion.span
          className={`text-2xl font-extrabold tracking-tight tabular-nums ${critical ? "text-danger" : "text-white"}`}
        >
          {temp}
        </motion.span>
      </div>
      <svg viewBox="0 0 200 56" className="mt-2 h-14 w-full overflow-visible">
        <defs>
          <linearGradient id="trace" x1="0" x2="1">
            <stop offset="0.6" stopColor={theme.safe.DEFAULT} />
            <stop offset="0.8" stopColor={theme.danger.DEFAULT} />
          </linearGradient>
        </defs>
        <line x1="0" x2="200" y1="36" y2="36" stroke="rgba(244,63,94,0.35)" strokeDasharray="3 4" strokeWidth="1" />
        <text x="200" y="33" textAnchor="end" className="fill-slate-600 text-[8px]">
          limit 30°C
        </text>
        <motion.path
          d={TRACE}
          fill="none"
          stroke="url(#trace)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>

      <div className="mt-3 space-y-2 border-t border-white/5 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="flex items-center gap-2 text-slate-400">
            <MapPin className="h-4 w-4" /> GPS
          </span>
          <span className="flex items-center gap-1 text-safe">
            Stable <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-2 text-slate-400">
            <Radio className="h-4 w-4" /> RFID
          </span>
          <span className="flex items-center gap-1 text-safe">
            Scanned <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Panel>
  );
}

function LedgerPanel() {
  const progress = useSceneProgress();
  const style = useStage(progress, LEDGER_AT, 1);
  const rows = [
    { block: "18,204", text: "temp 25.1°C", ok: true },
    { block: "18,205", text: "GPS checkpoint", ok: true },
    { block: "18,206", text: "ANOMALY · temp 41.2°C", ok: false },
  ];
  return (
    <motion.div style={style}>
      <Panel className="p-4">
        <div className="flex items-center gap-2 text-sm text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/15 text-brand shadow-[0_0_20px_-2px_rgba(45,212,191,0.6)]">
            <Blocks className="h-4 w-4" />
          </span>
          Written to the blockchain
        </div>
        <ul className="mt-3 space-y-1.5 font-mono text-[11px]">
          {rows.map((r) => (
            <li
              key={r.block}
              className={`flex justify-between rounded-md px-2 py-1 ${r.ok ? "text-slate-400" : "bg-danger/10 text-danger"}`}
            >
              <span>#{r.block}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </motion.div>
  );
}

function AIPanel() {
  const progress = useSceneProgress();
  const style = useStage(progress, AI_AT, 1);
  return (
    <motion.div style={style}>
      <Panel className="border-warn/30 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-white">
            <BrainCircuit className="h-4 w-4 text-warn" /> AI risk check
          </span>
          <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-semibold text-warn">Batch flagged</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
          <li>• Temperature excursion beyond safe limit</li>
          <li>• Packaging scan mismatch at last checkpoint</li>
          <li>• Resale price far below market</li>
        </ul>
      </Panel>
    </motion.div>
  );
}

function IoTSceneContent() {
  const critical = useActiveStep([CRITICAL_AT]) === 1;

  return (
    <>
      <Backdrop tone={critical ? "danger" : "brand"} at="55% 60%" />

      <SceneCanvas
        camera={{ position: [6.5, 3.6, 7.5], fov: 38 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 4]} intensity={1.8} />
        <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#93c5fd" />
        <pointLight position={[-3, 2, 2]} intensity={8} color={critical ? theme.danger.DEFAULT : theme.brand.DEFAULT} />
        <Rig>
          <Road />
          <group position={[0.9, 0, 0]}>
            <Truck />
          </group>
        </Rig>
      </SceneCanvas>

      <TextColumn>
        <TextStage from={0} to={0.3}>
          <Eyebrow chapter="in-action" />
          <Title>Live telemetry, every second of the journey.</Title>
          <Lead>In transit, the smart box streams temperature, location and identity straight to TrustChain.</Lead>
        </TextStage>
        <TextStage from={0.38} to={0.54}>
          <Eyebrow chapter="in-action" tone="danger" />
          <Title>
            Then the cold chain <span className="text-danger">breaks</span>.
          </Title>
          <Lead>The container heats past its safe limit, and the sensor catches it the same second.</Lead>
        </TextStage>
        <TextStage from={0.62} to={0.74}>
          <Eyebrow chapter="in-action" />
          <Title>Recorded. Permanently.</Title>
          <Lead>The anomaly is signed and written to the blockchain. No one can quietly delete it later.</Lead>
        </TextStage>
        <TextStage from={0.82} to={1}>
          <Eyebrow chapter="in-action" />
          <Title>AI connects the dots.</Title>
          <Lead>
            The excursion is cross-checked with packaging and pricing signals, and the batch is flagged before it
            reaches a pharmacy.
          </Lead>
        </TextStage>
      </TextColumn>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-6 bottom-6 md:inset-x-auto md:bottom-auto md:right-12 md:top-1/2 md:w-80 md:-translate-y-1/2">
        <div className="space-y-3">
          <TelemetryPanel critical={critical} />
          <div className="hidden space-y-3 md:block">
            <LedgerPanel />
            <AIPanel />
          </div>
        </div>
      </div>
    </>
  );
}

export default function IoTScene() {
  return (
    <Scene id="in-action" length={4}>
      <IoTSceneContent />
    </Scene>
  );
}
