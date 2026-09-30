"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Blocks, Radio, BrainCircuit, ShieldCheck } from "lucide-react";
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
  StepList,
  useSceneProgress,
  useActiveStep,
} from "./ui/Scene";
import theme from "../lib/theme";

const LAYERS = [
  {
    id: "blockchain",
    label: "Blockchain",
    tagline: "Immutable ledger",
    icon: Blocks,
    color: theme.layer.blockchain,
    body: "Every event is time-stamped and written to a ledger that no one can quietly edit, building trust between manufacturers, suppliers, hospitals and patients.",
    points: ["Tamper-proof custody history", "Faster audits, less paperwork"],
  },
  {
    id: "iot",
    label: "IoT",
    tagline: "Real-time data",
    icon: Radio,
    color: theme.layer.iot,
    body: "Sensors report temperature, location and authenticity continuously, so a broken cold chain is caught the moment it happens.",
    points: ["Live temperature & GPS", "Instant alerts on any breach"],
  },
  {
    id: "ai",
    label: "AI",
    tagline: "Fraud detection",
    icon: BrainCircuit,
    color: theme.layer.ai,
    body: "Models watch the data stream for anomalies, flagging counterfeits and suspicious pricing before they ever reach a patient.",
    points: ["Anomaly & counterfeit detection", "Demand forecasting and compliance"],
  },
];

// Holds on each face, then turns to the next during the last 35% of its slot.
const FACES_END = 0.85;
function faceValue(p) {
  const x = THREE.MathUtils.clamp(p / FACES_END, 0, 1) * 3;
  const seg = Math.min(Math.floor(x), 2);
  const f = x - seg;
  return seg + (seg < 2 ? THREE.MathUtils.smoothstep(f, 0.65, 1) : 0);
}

const BASE_R = 1.7;
const BASE_Y = -0.95;
const APEX_Y = 1.45;

function usePyramidGeometry() {
  return useMemo(() => {
    const base = [0, 1, 2].map((k) => {
      const a = -Math.PI / 3 + (k * 2 * Math.PI) / 3;
      return new THREE.Vector3(BASE_R * Math.sin(a), BASE_Y, BASE_R * Math.cos(a));
    });
    const apex = new THREE.Vector3(0, APEX_Y, 0);

    const faces = [0, 1, 2].map((i) => {
      const a = base[i];
      const b = base[(i + 1) % 3];
      const g = new THREE.BufferGeometry().setFromPoints([a, b, apex]);
      g.computeVertexNormals();
      const centroid = new THREE.Vector3().add(a).add(b).add(apex).divideScalar(3);
      const normal = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(apex, a)).normalize();
      if (normal.dot(centroid) < 0) normal.negate();
      return { geometry: g, centroid, normal };
    });

    const edges = new Float32Array(
      [
        [base[0], base[1]],
        [base[1], base[2]],
        [base[2], base[0]],
        [base[0], apex],
        [base[1], apex],
        [base[2], apex],
      ].flatMap(([p, q]) => [...p.toArray(), ...q.toArray()]),
    );

    return { faces, edges, apex };
  }, []);
}

function Pyramid() {
  const progress = useSceneProgress();
  const { faces, edges, apex } = usePyramidGeometry();
  const group = useRef();
  const faceMats = useRef([]);
  const labels = useRef([]);
  const beacon = useRef();
  const edgeMat = useRef();
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const p = progress.get();
    const v = faceValue(p);
    const finale = THREE.MathUtils.smoothstep(p, FACES_END, FACES_END + 0.08);
    const mobile = state.viewport.aspect < 1;

    // Offset so the active face sits at an angle and a neighbouring face shows the depth.
    group.current.rotation.y = (-v * 2 * Math.PI) / 3 + 0.45 - finale * 0.9 + state.pointer.x * 0.15;
    const ease = Math.min(1, delta * 3);
    const tiltTarget = -finale * 0.15 - state.pointer.y * 0.08;
    group.current.rotation.x += (tiltTarget - group.current.rotation.x) * ease;
    group.current.position.set(mobile ? 0 : 2, mobile ? -1.4 : -0.1, 0);
    group.current.scale.setScalar(mobile ? 0.75 : 1);

    faces.forEach((face, i) => {
      const glow = Math.max(0, 1 - Math.abs(v - i)) * (1 - finale) + finale * 0.45;
      faceMats.current[i].emissiveIntensity = 0.03 + glow * 0.35;
      faceMats.current[i].opacity = 0.75 + glow * 0.2;

      // Show a face's label only while that face points at the camera.
      tmp.copy(face.normal).applyQuaternion(group.current.quaternion);
      const facing = THREE.MathUtils.smoothstep(tmp.z, 0.7, 0.9) * (1 - finale);
      if (labels.current[i]) labels.current[i].style.opacity = facing;
    });

    edgeMat.current.opacity = 0.35 + finale * 0.5;
    beacon.current.scale.setScalar(0.3 + finale * (0.45 + Math.sin(state.clock.elapsedTime * 3) * 0.06));
  });

  return (
    <group ref={group}>
      {faces.map((face, i) => {
        const Icon = LAYERS[i].icon;
        return (
          <group key={LAYERS[i].id}>
            <mesh geometry={face.geometry}>
              <meshStandardMaterial
                ref={(m) => (faceMats.current[i] = m)}
                color={theme.ink[700]}
                emissive={LAYERS[i].color}
                emissiveIntensity={0.04}
                metalness={0.3}
                roughness={0.45}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <Html
              position={face.centroid.clone().addScaledVector(face.normal, 0.05).toArray()}
              center
              zIndexRange={[20, 0]}
              style={{ pointerEvents: "none" }}
            >
              <div
                ref={(el) => (labels.current[i] = el)}
                style={{ opacity: 0 }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <Icon className="h-6 w-6" style={{ color: LAYERS[i].color }} />
                <span className="whitespace-nowrap text-sm font-bold text-white">{LAYERS[i].label}</span>
              </div>
            </Html>
          </group>
        );
      })}

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={edgeMat} color="#e2e8f0" transparent opacity={0.35} />
      </lineSegments>

      {/* TrustChain capstone */}
      <mesh ref={beacon} position={apex}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial color={theme.brand.soft} toneMapped={false} />
      </mesh>
    </group>
  );
}

function LayerText({ layer, index }) {
  const Icon = layer.icon;
  return (
    <>
      <Eyebrow chapter="technology" />
      <div className="flex items-center gap-3 text-sm font-semibold" style={{ color: layer.color }}>
        <Icon className="h-5 w-5" />
        <span>
          Layer {index + 1} of 3 · {layer.tagline}
        </span>
      </div>
      <Title>{layer.label}</Title>
      <Lead>{layer.body}</Lead>
      <ul className="space-y-2 pt-1 text-sm text-slate-300">
        {layer.points.map((pt) => (
          <li key={pt} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: layer.color }} /> {pt}
          </li>
        ))}
      </ul>
    </>
  );
}

function PyramidSceneContent() {
  const active = useActiveStep([0.28, 0.567, 0.85]);

  return (
    <>
      <Backdrop tone="brand" />

      <SceneCanvas camera={{ position: [0, 2.6, 7], fov: 40 }} onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 6]} intensity={1.2} />
        <pointLight position={[0, 0.2, 0]} intensity={4} color="#e2e8f0" />
        <Pyramid />
      </SceneCanvas>

      <TextColumn>
        <TextStage from={0} to={0.2}>
          <LayerText layer={LAYERS[0]} index={0} />
        </TextStage>
        <TextStage from={0.3} to={0.48}>
          <LayerText layer={LAYERS[1]} index={1} />
        </TextStage>
        <TextStage from={0.6} to={0.8}>
          <LayerText layer={LAYERS[2]} index={2} />
        </TextStage>
        <TextStage from={0.9} to={1}>
          <Eyebrow chapter="technology" />
          <div className="flex items-center gap-3 text-sm text-brand">
            <ShieldCheck className="h-5 w-5" /> The capstone
          </div>
          <Title>
            One system.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${theme.layer.blockchain}, ${theme.layer.iot}, ${theme.layer.ai})`,
              }}
            >
              Three layers of trust.
            </span>
          </Title>
          <Lead>
            TrustChain fuses Blockchain, IoT and AI into a single platform that secures the medical supply chain from
            production to patient.
          </Lead>
        </TextStage>
      </TextColumn>

      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 px-12 md:block">
        <StepList
          steps={["Blockchain", "IoT", "AI", "TrustChain"]}
          colors={[...LAYERS.map((l) => l.color), theme.brand.soft]}
          active={active}
        />
      </div>
    </>
  );
}

export default function PyramidScene() {
  return (
    <Scene id="technology" length={4}>
      <PyramidSceneContent />
    </Scene>
  );
}
