"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { useTransform, motion } from "framer-motion";
import { Lock, Radio, MapPin, Thermometer } from "lucide-react";
import * as THREE from "three";
import SceneCanvas from "./three/SceneCanvas";
import { Scene, Backdrop, TextColumn, TextStage, Eyebrow, Title, Lead, useSceneProgress } from "./ui/Scene";
import theme from "../lib/theme";

/* Scroll timeline (scene progress) */
const T = {
  lidOpen: [0.1, 0.24],
  qr: [0.18, 0.3],
  sensors: [0.34, 0.42, 0.5], // RFID, GPS, Temp light up
  lidClose: [0.58, 0.68],
  chain: [0.76, 0.9],
};

const SENSORS = [
  {
    id: "rfid",
    label: "RFID",
    detail: "Identity at every scan",
    reading: "ID verified",
    icon: Radio,
    pos: [-0.62, 0.32, 0.2],
  },
  { id: "gps", label: "GPS", detail: "Live location", reading: "28.61°N 77.21°E", icon: MapPin, pos: [0, 0.32, -0.32] },
  {
    id: "temp",
    label: "Temp",
    detail: "Cold-chain integrity",
    reading: "4.2°C",
    icon: Thermometer,
    pos: [0.62, 0.32, 0.2],
  },
].map((s) => ({ ...s, color: theme.sensor[s.id] }));

const range = (p, [a, b]) => THREE.MathUtils.smoothstep(p, a, b);

/* ---------- Pieces ---------- */

function BlisterStrip() {
  const pills = useMemo(() => {
    const arr = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) arr.push([-0.44 + c * 0.22, 0, -0.1 + r * 0.2]);
    return arr;
  }, []);
  return (
    <group position={[0, 0.27, 0.02]}>
      <RoundedBox args={[1.2, 0.03, 0.5]} radius={0.012} smoothness={2}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </RoundedBox>
      {pills.map((p, i) => (
        <mesh key={i} position={[p[0], 0.03, p[2]]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.15} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// Each sensor switches on with a flash: shockwave across the tray, a light pillar, pulsing rings and a live reading.
function Sensor({ sensor, index }) {
  const progress = useSceneProgress();
  const led = useRef();
  const light = useRef();
  const pillar = useRef();
  const rings = useRef([]);
  const shock = useRef();
  const labelRef = useRef();
  const on = T.sensors[index];
  const Icon = sensor.icon;

  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const closed = range(p, T.lidClose);
    const lit = range(p, [on - 0.015, on + 0.01]) * (1 - closed * 0.7);
    const burst = p > on ? 1 - range(p, [on, on + 0.06]) : 0;
    const pulse = 0.8 + Math.sin(t * 5 + index) * 0.2;

    led.current.emissiveIntensity = 0.15 + lit * 4 * pulse + burst * 6;
    light.current.intensity = lit * 2.5 + burst * 6;
    pillar.current.scale.set(1, 0.01 + lit * (1 - closed), 1);
    pillar.current.material.opacity = lit * (1 - closed) * 0.22 + burst * 0.3;

    rings.current.forEach((ring, i) => {
      const k = (t * 0.7 + i * 0.5) % 1;
      ring.scale.setScalar(1 + k * 2.2);
      ring.material.opacity = lit * (1 - closed) * (1 - k) * 0.5;
    });

    // One-off shockwave across the whole box the moment the sensor turns on.
    const wave = p > on ? range(p, [on, on + 0.05]) : 0;
    shock.current.scale.setScalar(0.2 + wave * 6);
    shock.current.material.opacity = wave > 0 && wave < 1 ? (1 - wave) * 0.6 : 0;

    if (labelRef.current) {
      labelRef.current.style.opacity = lit * (1 - closed);
      labelRef.current.style.transform = `translateY(${(1 - lit) * 10}px) scale(${1 + burst * 0.15})`;
    }
  });

  return (
    <group position={sensor.pos}>
      <RoundedBox args={[0.22, 0.07, 0.22]} radius={0.02} smoothness={2}>
        <meshStandardMaterial color={theme.ink[700]} metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.055, 0]}>
        <sphereGeometry args={[0.05, 20, 20]} />
        <meshStandardMaterial
          ref={led}
          color={sensor.color}
          emissive={sensor.color}
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={light} position={[0, 0.25, 0]} color={sensor.color} intensity={0} distance={1.8} />
      <mesh ref={pillar} position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.09, 1.2, 16, 1, true]} />
        <meshBasicMaterial
          color={sensor.color}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(m) => (rings.current[i] = m)} position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.12, 40]} />
          <meshBasicMaterial
            color={sensor.color}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh ref={shock} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.14, 48]} />
        <meshBasicMaterial
          color={sensor.color}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <Html position={[0, 0.95, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={labelRef}
          style={{ opacity: 0, borderColor: `${sensor.color}80`, boxShadow: `0 0 24px -6px ${sensor.color}` }}
          className="flex items-center gap-2 whitespace-nowrap rounded-xl border bg-white/[0.06] px-3 py-1.5 backdrop-blur-md"
        >
          <Icon className="h-4 w-4" style={{ color: sensor.color }} />
          <span className="text-xs font-bold text-white">{sensor.label}</span>
          <span className="text-xs tabular-nums" style={{ color: sensor.color }}>
            {sensor.reading}
          </span>
        </div>
      </Html>
    </group>
  );
}

function QRHologram() {
  const progress = useSceneProgress();
  const texture = useLoader(THREE.TextureLoader, "/textures/qr_code.png");
  const group = useRef();
  const scan = useRef();
  const beam = useRef();
  const qrMat = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const show = range(progress.get(), T.qr) * (1 - range(progress.get(), T.lidClose) * 0.6);
    group.current.scale.set(show, show, show);
    group.current.visible = show > 0.01;
    group.current.position.y = 1.35 + Math.sin(t * 1.6) * 0.04;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    qrMat.current.opacity = 0.75 + Math.sin(t * 9) * 0.05;
    scan.current.position.y = 0.3 - ((t * 0.6) % 1) * 0.6;
    beam.current.material.opacity = 0.12 * show;
  });

  return (
    <>
      <mesh ref={beam} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.45, 0.15, 1.1, 32, 1, true]} />
        <meshBasicMaterial
          color={theme.brand.DEFAULT}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group ref={group}>
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial
            ref={qrMat}
            map={texture}
            color={theme.brand.soft}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh ref={scan} position={[0, 0.3, 0.01]}>
          <planeGeometry args={[0.66, 0.012]} />
          <meshBasicMaterial
            color={theme.brand.soft}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </>
  );
}

function SmartBox() {
  const progress = useSceneProgress();
  const lid = useRef();
  const seam = useRef();
  const lockRef = useRef();

  useFrame(() => {
    const p = progress.get();
    const open = range(p, T.lidOpen) * (1 - range(p, T.lidClose));
    lid.current.rotation.x = -open * 1.9;
    const sealed = range(p, [T.lidClose[1] - 0.02, T.lidClose[1] + 0.04]);
    seam.current.material.opacity = 0.15 + sealed * 0.85;
    if (lockRef.current) {
      lockRef.current.style.opacity = sealed;
      lockRef.current.style.transform = `scale(${0.8 + sealed * 0.2})`;
    }
  });

  return (
    <group>
      {/* Body */}
      <RoundedBox args={[1.8, 0.5, 1.1]} radius={0.06} smoothness={3} position={[0, 0, 0]}>
        <meshStandardMaterial color="#111a2e" metalness={0.55} roughness={0.35} />
      </RoundedBox>
      {/* Glowing seam — brightens when the box seals */}
      <mesh ref={seam} position={[0, 0.26, 0]}>
        <boxGeometry args={[1.83, 0.018, 1.13]} />
        <meshBasicMaterial
          color={theme.brand.DEFAULT}
          transparent
          opacity={0.15}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <BlisterStrip />
      {SENSORS.map((s, i) => (
        <Sensor key={s.id} sensor={s} index={i} />
      ))}

      {/* Lid, hinged on the back edge */}
      <group ref={lid} position={[0, 0.25, -0.55]}>
        <RoundedBox args={[1.8, 0.2, 1.1]} radius={0.05} smoothness={3} position={[0, 0.12, 0.55]}>
          <meshStandardMaterial color="#16213a" metalness={0.55} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0.225, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.14, 6]} />
          <meshBasicMaterial color={theme.brand.DEFAULT} toneMapped={false} />
        </mesh>
      </group>

      <Html position={[0, 0.85, 0.3]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={lockRef}
          style={{ opacity: 0 }}
          className="flex items-center gap-2 whitespace-nowrap rounded-full border border-brand/50 bg-ink-900/85 px-3 py-1.5 text-xs font-medium text-brand backdrop-blur"
        >
          <Lock className="h-3.5 w-3.5" /> Sealed · tamper-evident
        </div>
      </Html>

      <QRHologram />
    </group>
  );
}

/* Blockchain nodes that float in around the sealed box, with data pulses running along the links. */
function ChainNetwork() {
  const progress = useSceneProgress();
  const group = useRef();
  const pulses = useRef([]);
  const count = 6;

  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.3;
        return new THREE.Vector3(Math.cos(a) * 2.3, 0.4 + Math.sin(a * 2) * 0.3, Math.sin(a) * 1.6);
      }),
    [],
  );

  const linePositions = useMemo(() => {
    const arr = [];
    const hub = new THREE.Vector3(0, 0.1, 0);
    nodes.forEach((n, i) => {
      arr.push(...hub.toArray(), ...n.toArray());
      arr.push(...n.toArray(), ...nodes[(i + 1) % count].toArray());
    });
    return new Float32Array(arr);
  }, [nodes]);

  const lineMat = useRef();
  const nodeRefs = useRef([]);

  useFrame((state) => {
    const p = progress.get();
    const show = range(p, T.chain);
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.12;
    lineMat.current.opacity = show * 0.45;
    nodeRefs.current.forEach((m, i) => {
      const s = range(p, [T.chain[0] + i * 0.015, T.chain[0] + 0.06 + i * 0.015]);
      m.scale.setScalar(s);
      m.rotation.set(t * 0.4 + i, t * 0.3, 0);
    });
    pulses.current.forEach((m, i) => {
      const k = (t * 0.5 + i / count) % 1;
      m.position.set(0, 0.1, 0).lerp(nodes[i], k);
      m.scale.setScalar(show * (1 - Math.abs(k - 0.5)) * 1.2);
    });
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color={theme.brand.DEFAULT} transparent opacity={0} depthWrite={false} />
      </lineSegments>
      {nodes.map((n, i) => (
        <group key={i} position={n} ref={(el) => (nodeRefs.current[i] = el)} scale={0}>
          <mesh>
            <icosahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial
              color={theme.brand.deep}
              emissive={theme.brand.DEFAULT}
              emissiveIntensity={0.6}
              flatShading
            />
          </mesh>
          <mesh scale={1.5}>
            <icosahedronGeometry args={[0.11, 0]} />
            <meshBasicMaterial color={theme.brand.soft} wireframe transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
      {nodes.map((_, i) => (
        <mesh key={`p${i}`} ref={(el) => (pulses.current[i] = el)} scale={0}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={theme.brand.soft} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ children }) {
  const progress = useSceneProgress();
  const rig = useRef();

  useFrame((state, delta) => {
    const p = progress.get();
    const mobile = state.viewport.aspect < 1;
    const intro = range(p, [0, 0.08]);
    const zoomOut = range(p, T.chain);
    // Lean in and look down into the open tray while the sensors switch on.
    const inspect = range(p, [T.sensors[0] - 0.08, T.sensors[0] - 0.02]) * (1 - range(p, T.lidClose));
    rig.current.position.set(mobile ? 0 : 1.9, mobile ? -1.3 : -0.3 - (1 - intro) * 0.4 - inspect * 0.3, 0);
    rig.current.scale.setScalar(
      (mobile ? 0.8 : 1.15) * (0.85 + intro * 0.15) * (1 - zoomOut * 0.18) * (1 + inspect * 0.3),
    );

    const ease = Math.min(1, delta * 3);
    const targetY = -0.5 + p * 0.9 + state.pointer.x * 0.25;
    rig.current.rotation.y += (targetY - rig.current.rotation.y) * ease;
    rig.current.rotation.x += (0.12 + inspect * 0.45 - state.pointer.y * 0.1 - rig.current.rotation.x) * ease;
  });

  return <group ref={rig}>{children}</group>;
}

function SensorList() {
  const progress = useSceneProgress();
  return (
    <ul className="space-y-3 pt-2">
      {SENSORS.map((s, i) => (
        <SensorRow key={s.id} sensor={s} progress={progress} on={T.sensors[i]} />
      ))}
    </ul>
  );
}

function SensorRow({ sensor, progress, on }) {
  const opacity = useTransform(progress, [on - 0.03, on], [0.3, 1]);
  const x = useTransform(progress, [on - 0.03, on], [-8, 0]);
  const glow = useTransform(progress, [on - 0.01, on + 0.01, on + 0.07], [0, 1, 0.35]);
  const Icon = sensor.icon;
  return (
    <motion.li style={{ opacity, x }} className="relative flex items-center gap-4 rounded-2xl px-3 py-2.5">
      <motion.span
        style={{ opacity: glow, borderColor: `${sensor.color}66`, background: `${sensor.color}14` }}
        className="absolute inset-0 rounded-2xl border backdrop-blur-sm"
      />
      <span
        className="relative grid h-11 w-11 place-items-center rounded-xl border"
        style={{ color: sensor.color, borderColor: `${sensor.color}55`, background: `${sensor.color}1a` }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="relative">
        <span className="block text-lg font-bold text-white">{sensor.label}</span>
        <span className="block text-sm text-slate-300">{sensor.detail}</span>
      </span>
    </motion.li>
  );
}

export default function SolutionScene() {
  return (
    <Scene id="solution" length={4}>
      <Backdrop tone="brand" />

      <SceneCanvas camera={{ position: [0, 2.4, 6.5], fov: 40 }} onCreated={({ camera }) => camera.lookAt(0, 0.2, 0)}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <pointLight position={[-4, 2, -2]} intensity={12} color={theme.brand.DEFAULT} />
        <Rig>
          <SmartBox />
          <ChainNetwork />
        </Rig>
      </SceneCanvas>

      <TextColumn>
        <TextStage from={0} to={0.2}>
          <Eyebrow chapter="solution" />
          <Title>One smart box for every strip of medicine.</Title>
          <Lead>TrustChain IoT: Blockchain + IoT + AI, securing every strip of medicine.</Lead>
        </TextStage>

        <TextStage from={0.28} to={0.54}>
          <Eyebrow chapter="solution" />
          <Title>Three sensors watch it the whole way.</Title>
          <SensorList />
        </TextStage>

        <TextStage from={0.62} to={0.74}>
          <Eyebrow chapter="solution" />
          <Title>Then it seals itself.</Title>
          <Lead>
            Once packed, the smart lock engages. Any attempt to open or swap the contents is detected and reported.
          </Lead>
        </TextStage>

        <TextStage from={0.82} to={1}>
          <Eyebrow chapter="solution" />
          <Title>
            …and joins the <span className="text-brand">chain</span>.
          </Title>
          <Lead>
            Every reading is signed and written to the blockchain: an immutable history from factory to patient.
          </Lead>
        </TextStage>
      </TextColumn>
    </Scene>
  );
}
