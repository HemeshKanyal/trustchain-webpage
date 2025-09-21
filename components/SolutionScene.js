"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

/* ---------- Medicine Box with Improved Lid ---------- */
function MedicineBox({ boxScale, boxRotation, lockProgress }) {
  const ref = useRef();
  const lidRef = useRef();

  useFrame(() => {
    if (!ref.current || !lidRef.current) return;

    // Base scale
    const s = boxScale.get();
    if (Number.isFinite(s)) ref.current.scale.setScalar(s);

    // Lid rotation (smooth unfold + lock)
    const r = boxRotation.get();
    const lock = lockProgress.get(); // 0 -> fully open, 1 -> slightly locked
    if (Number.isFinite(r)) {
      // Pivot lid from the back edge
      lidRef.current.rotation.x = -r + lock * Math.PI * 0.15;
    }
  });

  return (
    <group ref={ref}>
      {/* Box base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 0.3, 0.6]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Box lid (pivot from back edge for realistic opening) */}
      <mesh
        ref={lidRef}
        position={[0, 0.27, -0.5]} // move pivot to back edge
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[1, 0.02, 0.6]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Optional label (no texture) */}
      <mesh position={[0, 0.07, 0]}>
        <planeGeometry args={[0.9, 0.35]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0.1]}>
        <planeGeometry args={[0.9, 0.35]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Optional corner edges for better look */}
      <mesh position={[0.45, 0, 0.25]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.45, 0, 0.25]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.45, 0, -0.25]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.45, 0, -0.25]}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.4, -0.74]}>
        <boxGeometry args={[0.06, 0.1, 0.07]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.12, 0.02, 0.12]} />
        <meshStandardMaterial color="#e30000ff" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.02, 0.1, 0.12]} />
        <meshStandardMaterial color="#e30000ff" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

/* ---------- Fresh Sensor Component (Glow + Pulse) ---------- */
function Sensor({ position = [0, 0, 0], color = "#34d399", pulseSpeed = 3 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    // Time-based pulsing
    const t = state.clock.getElapsedTime();
    const pulse = (Math.sin(t * pulseSpeed) + 1) / 2; // 0 → 1

    ref.current.material.emissiveIntensity = 0.5 + pulse * 1.5; // glow strength
    ref.current.scale.setScalar(0.9 + pulse * 0.2); // subtle size pulse
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 32, 32]} />
      <meshStandardMaterial
        key={color}
        color={color}
        emissive={color}
        emissiveIntensity={1}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}



/* ---------- Blockchain Node ---------- */
function BlockchainNode({ position, scale }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.6} />
    </mesh>
  );
}

/* ---------- Blockchain Connections ---------- */
function BlockchainConnections({ nodePositions, opacity }) {
  const lineRef = useRef();

  const points = useMemo(() => {
    const pts = [];
    nodePositions.forEach((pos, i) => {
      const next = nodePositions[(i + 1) % nodePositions.length];
      pts.push(...pos, ...next);
    });
    return new Float32Array(pts.flat());
  }, [nodePositions]);

  useFrame(() => {
    if (!lineRef.current) return;
    lineRef.current.material.opacity = opacity.get();
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={points} count={points.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.4} />
    </lineSegments>
  );
}

/* ---------- QR Hologram ---------- */
function QRHologram({ scrollYProgress }) {
  const qrRef = useRef();
  const scanRef = useRef();

  const texture = useLoader(THREE.TextureLoader, "/textures/qr_code.png");
  const pulse = useTransform(scrollYProgress, [0.45, 0.55], [0, 1]);

  const startY = 0.8;
  const scanHeight = 0.4;

  useFrame((state) => {
    if (!qrRef.current || !scanRef.current) return;
    const t = state.clock.getElapsedTime();

    qrRef.current.position.y = 0.6 + Math.sin(t * 2) * 0.03;
    qrRef.current.material.opacity = 0.5 + 0.3 * Math.sin(t * 6) * (pulse.get() ?? 0);

    scanRef.current.position.y = startY - ((t % 1) * scanHeight);
    scanRef.current.material.opacity = 0.6 * (pulse.get() ?? 0);
  });

  return (
    <group>
      <mesh ref={qrRef} position={[0, 0.6, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial map={texture} transparent color="#00f0ff" blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.5} />
      </mesh>
      <mesh ref={scanRef} position={[0, startY, 0.01]}>
        <planeGeometry args={[0.7, 0.02]} />
        <meshBasicMaterial color="#00ff00" transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ---------- Scene Content ---------- */
function SceneContent({ scrollYProgress }) {
  const boxScale = useTransform(scrollYProgress, [0.3, 0.38], [0, 1]);
  const boxRotation = useTransform(scrollYProgress, [0.38, 0.45], [Math.PI / 2, 0]);
  const lockProgress = useTransform(scrollYProgress, [0.45, 0.5], [0, 1]);

  const nodePositions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      arr.push([Math.cos(angle) * 1.2, 0.4, Math.sin(angle) * 1.2]);
    }
    return arr;
  }, []);

  const groupRef = useRef();
  const nodeScale = useTransform(scrollYProgress, [0.5, 0.6], [0.1, 1]);
  const lineOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 0.4]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.2;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.3} />

      <MedicineBox boxScale={boxScale} boxRotation={boxRotation} lockProgress={lockProgress} />

      {/* Sensors */}
      /* ---------- Sensors Placement ---------- */
      <Sensor position={[-0.6, 0.25, 0.3]} color="#22c55e" pulseSpeed={3} /> {/* Green - left front */}
      <Sensor position={[0.6, 0.25, 0.3]} color="#3b82f6" pulseSpeed={4} />  {/* Blue - right front */}
      <Sensor position={[0, 0.25, 0.5]} color="#ef4444" pulseSpeed={5} /> {/* Red - back center */}


      {/* Blockchain nodes + connections */}
      <group ref={groupRef}>
        {nodePositions.map((pos, i) => (
          <BlockchainNode key={i} position={pos} scale={nodeScale.get()} />
        ))}
        <BlockchainConnections nodePositions={nodePositions} opacity={lineOpacity} />
      </group>

      {/* QR Hologram */}
      <QRHologram scrollYProgress={scrollYProgress} />

      <OrbitControls enableZoom={true} rotateSpeed={1.5} />
    </>
  );
}

/* ---------- Main Export ---------- */
export default function SolutionScene() {
  const { scrollYProgress } = useScroll();
  const overlayOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  return (
    <div className="relative w-full h-screen bg-gray-950">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <SceneContent scrollYProgress={scrollYProgress} />
      </Canvas>

      {/* Overlay text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start px-12 pointer-events-none"
        style={{ opacity: overlayOpacity }}
      >
        <div className="max-w-lg text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            TrustChain IoT: Blockchain + IoT + AI
          </h2>
          <p className="mt-4 text-lg md:text-2xl text-green-400 font-semibold">
            Securing every strip of medicine with smart sensors & blockchain.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
