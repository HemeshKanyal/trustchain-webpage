"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Factory, Truck, Store, Stethoscope, UserRound, FileCheck2 } from "lucide-react";
import * as THREE from "three";
import SceneCanvas from "./three/SceneCanvas";
import { Scene, Backdrop, Eyebrow, Title, Panel, EASE, useSceneProgress, useActiveStep } from "./ui/Scene";
import theme from "../lib/theme";

const STEPS = [
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    duty: "Registers verified manufacturers and assigns every participant a role on the network.",
  },
  {
    id: "manufacturer",
    label: "Manufacturer",
    icon: Factory,
    duty: "Mints a unique on-chain identity for every batch and every strip it produces.",
  },
  {
    id: "distributor",
    label: "Distributor",
    icon: Truck,
    duty: "Logs each custody transfer, with live IoT telemetry attached to the shipment.",
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: Store,
    duty: "Verifies authenticity on arrival, before anything is stocked or dispensed.",
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: Stethoscope,
    duty: "Prescribes against verified batches, with the full history one scan away.",
  },
  {
    id: "patient",
    label: "Patient",
    icon: UserRound,
    duty: "Scans the QR code and sees the medicine is genuine, from factory to hand.",
  },
];

const LAST = STEPS.length - 1;
const TRAVEL_START = 0.04;
const TRAVEL = 0.86;

// Scroll → position along the route. The box pauses at each station (first 40% of a leg), then moves on.
function travel(p) {
  const x = THREE.MathUtils.clamp((p - TRAVEL_START) / TRAVEL, 0, 1) * LAST;
  const leg = Math.min(Math.floor(x), LAST - 1);
  const f = x - leg;
  return { x, t: (leg + THREE.MathUtils.smoothstep(f, 0.4, 1)) / LAST };
}
const BREAKPOINTS = STEPS.slice(1).map((_, i) => TRAVEL_START + (TRAVEL * (i + 1)) / LAST);

// Stations zig-zag into depth so the camera move feels like a journey, not a slider.
const STATIONS = STEPS.map((_, i) => new THREE.Vector3(-12 + i * 4.8, 0, i % 2 ? -2.4 : 1.2));
const CURVE = new THREE.CatmullRomCurve3(STATIONS, false, "centripetal");

const range = (p, a, b) => THREE.MathUtils.smoothstep(p, a, b);

/* ---------- Ground ---------- */

const groundVertex = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const groundFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec2 uFocus;
  varying vec2 vWorld;
  void main() {
    vec2 g = abs(fract(vWorld / 1.5) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.025, min(g.x, g.y));
    float fade = 1.0 - smoothstep(4.0, 16.0, length(vWorld - uFocus));
    gl_FragColor = vec4(uColor, line * 0.22 * fade + 0.25 * fade);
  }
`;

function Ground({ focus }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#64748b") }, uFocus: { value: new THREE.Vector2() } }),
    [],
  );
  useFrame(() => uniforms.uFocus.value.set(focus.current.x, focus.current.z));
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[80, 40]} />
      <shaderMaterial
        vertexShader={groundVertex}
        fragmentShader={groundFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ---------- Route ---------- */

const TUBE_SEGMENTS = 320;
const TUBE_RADIAL = 8;

function Route({ travelled }) {
  const base = useMemo(() => new THREE.TubeGeometry(CURVE, TUBE_SEGMENTS, 0.035, TUBE_RADIAL, false), []);
  const lit = useMemo(() => new THREE.TubeGeometry(CURVE, TUBE_SEGMENTS, 0.06, TUBE_RADIAL, false), []);
  useFrame(() => {
    const segs = Math.floor(travelled.current * TUBE_SEGMENTS);
    lit.setDrawRange(0, segs * TUBE_RADIAL * 6);
  });
  return (
    <group position={[0, 0.02, 0]}>
      <mesh geometry={base}>
        <meshBasicMaterial color="#334155" />
      </mesh>
      <mesh geometry={lit}>
        <meshBasicMaterial color={theme.brand.DEFAULT} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------- Stations ---------- */

function Station({ index, position, active }) {
  const progress = useSceneProgress();
  const ring = useRef();
  const beam = useRef();
  const holo = useRef();
  const shock = useRef();
  const light = useRef();
  const off = useMemo(() => new THREE.Color("#334155"), []);
  const on = useMemo(() => new THREE.Color(theme.brand.DEFAULT), []);
  const step = STEPS[index];
  const Icon = step.icon;

  useFrame((state) => {
    const { x } = travel(progress.get());
    const reached = range(x, index - 0.05, index);
    const here = 1 - Math.min(1, Math.abs(x - index) * 1.6);
    const wave = x >= index ? range(x, index, index + 0.35) : 0;
    const t = state.clock.elapsedTime;

    ring.current.color.lerpColors(off, on, reached);
    beam.current.material.opacity = reached * 0.08 + Math.max(0, here) * 0.25;
    holo.current.scale.setScalar(reached * (1 + Math.max(0, here) * 0.25));
    holo.current.rotation.set(t * 0.6, t * 0.9, 0);
    holo.current.position.y = 1.7 + Math.sin(t * 2 + index) * 0.08;
    shock.current.scale.setScalar(1 + wave * 5);
    shock.current.material.opacity = wave > 0 && wave < 1 ? (1 - wave) * 0.9 : 0;
    light.current.intensity = Math.max(0, here) * 5;
  });

  const state = index < active ? "done" : index === active ? "active" : "next";

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.24, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
        <ringGeometry args={[0.72, 0.86, 6]} />
        <meshBasicMaterial ref={ring} color="#334155" toneMapped={false} />
      </mesh>
      <mesh ref={shock} position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 48]} />
        <meshBasicMaterial
          color={theme.brand.soft}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={beam} position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.35, 0.8, 2.3, 6, 1, true]} />
        <meshBasicMaterial
          color={theme.brand.DEFAULT}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Contract hologram */}
      <group ref={holo} position={[0, 1.7, 0]} scale={0}>
        <mesh>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color={theme.brand.deep}
            emissive={theme.brand.DEFAULT}
            emissiveIntensity={0.8}
            flatShading
          />
        </mesh>
        <mesh scale={1.55}>
          <octahedronGeometry args={[0.28, 0]} />
          <meshBasicMaterial color={theme.brand.soft} wireframe transparent opacity={0.45} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, 1.2, 0]} color={theme.brand.DEFAULT} intensity={0} distance={5} />

      <Html position={[0, 2.55, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        {/* Only the neighbourhood of the shipment is labelled, so passed stations don't clutter the headline. */}
        <div
          className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${
            Math.abs(index - active) <= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`flex items-center gap-2 whitespace-nowrap rounded-2xl border px-3 py-2 backdrop-blur-md transition-all duration-500 ${
              state === "active"
                ? "scale-110 border-brand/70 bg-brand/15 shadow-[0_0_30px_-6px_rgba(45,212,191,0.8)]"
                : state === "done"
                  ? "border-brand/30 bg-white/[0.05]"
                  : "border-white/10 bg-white/[0.03] opacity-60"
            }`}
          >
            <Icon className={`h-4 w-4 ${state === "next" ? "text-slate-400" : "text-brand"}`} />
            <span className="text-sm font-bold text-white">{step.label}</span>
          </div>
          <AnimatePresence>
            {state !== "next" && (
              <motion.span
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand backdrop-blur"
              >
                <FileCheck2 className="h-3 w-3" /> Contract sealed
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Html>
    </group>
  );
}

/* ---------- The shipment ---------- */

function Shipment({ focus, travelled }) {
  const progress = useSceneProgress();
  const group = useRef();
  const tangent = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const { t } = travel(progress.get());
    travelled.current = t;
    const p = CURVE.getPoint(t);
    focus.current.copy(p);
    CURVE.getTangent(t, tangent);
    group.current.position.set(p.x, 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.05, p.z);
    group.current.rotation.y = Math.atan2(-tangent.z, tangent.x);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[0.8, 0.3, 0.5]} radius={0.04} smoothness={3}>
        <meshStandardMaterial color="#1e2a47" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.82, 0.02, 0.52]} />
        <meshBasicMaterial color={theme.brand.DEFAULT} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.6, 0]} color={theme.brand.DEFAULT} intensity={6} distance={4} />
    </group>
  );
}

/* Camera trails the shipment from above and to the front, like a drone shot. */
function FollowCamera({ focus }) {
  const look = useRef(new THREE.Vector3(-12, 0, 0));
  const desired = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const mobile = state.viewport.aspect < 1;
    const f = focus.current;
    desired.set(f.x - (mobile ? 0 : 2.2), mobile ? 7 : 5.2, f.z + (mobile ? 11 : 8.5));
    const k = Math.min(1, delta * 2.5);
    state.camera.position.lerp(desired, k);
    look.current.lerp(desired.set(f.x - (mobile ? 0 : 3.2), 0.9, f.z - 0.5), k);
    state.camera.lookAt(look.current);
  });
  return null;
}

function World() {
  const focus = useRef(STATIONS[0].clone());
  const travelled = useRef(0);
  const active = useActiveStep(BREAKPOINTS);
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 6]} intensity={1.2} />
      <FollowCamera focus={focus} />
      <Ground focus={focus} />
      <Route travelled={travelled} />
      {STATIONS.map((pos, i) => (
        <Station key={STEPS[i].id} index={i} position={pos} active={active} />
      ))}
      <Shipment focus={focus} travelled={travelled} />
    </>
  );
}

function StepDetail({ active }) {
  const step = STEPS[active];
  const Icon = step.icon;
  return (
    <Panel className="min-h-[120px] overflow-hidden p-5 md:p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-brand/30 bg-brand/15 text-brand">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step {active + 1} of {STEPS.length}
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-white">{step.label}</div>
              <p className="mt-1 max-w-xl text-base leading-relaxed text-slate-300">{step.duty}</p>
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-400 backdrop-blur">
            <div>
              contract <span className="text-brand">{step.id}.handover()</span>
            </div>
            <div>
              status <span className="text-safe">confirmed ✓</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Panel>
  );
}

function WorkflowSceneContent() {
  const active = useActiveStep(BREAKPOINTS);

  return (
    <>
      <Backdrop tone="brand" at="50% 60%" />

      <SceneCanvas camera={{ position: [-14, 5.2, 9.7], fov: 42 }}>
        <World />
      </SceneCanvas>

      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-between px-6 pb-8 pt-28 md:px-12 md:pb-10">
        <div className="max-w-3xl space-y-4">
          <Eyebrow chapter="workflow" />
          <Title>Every handover, sealed on-chain.</Title>
        </div>
        <div className="w-full max-w-3xl">
          <StepDetail active={active} />
        </div>
      </div>
    </>
  );
}

export default function WorkflowScene() {
  return (
    <Scene id="workflow" length={4.5}>
      <WorkflowSceneContent />
    </Scene>
  );
}
