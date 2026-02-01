"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Instances, Instance } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

/* ---------- Designer Choice: "Digital Data Flow" Background ---------- */
/* 
   Concept: Instead of random chaotic dust, we use structured, geometric data points.
   Visuals: Floating cubes (representing data blocks/IoT nodes).
   Motion: Slow, vertical ascent (like data uploading/processing) + gentle rotation.
   Vibe: Tech, Premium, Organized.
*/
function TechBackground() {
  const count = 150; // Fewer, more deliberate particles
  const meshRef = useRef();

  // Generate random initial positions and speeds
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 25; // Wide spread
      const y = (Math.random() - 0.5) * 20; // Vertical spread
      const z = (Math.random() - 0.5) * 10 - 5; // Background depth
      const speed = Math.random() * 0.02 + 0.005; // Different speeds
      const rotSpeed = (Math.random() - 0.5) * 0.02;
      const scale = Math.random() * 0.5 + 0.1; // Varied sizes
      temp.push({ x, y, z, speed, rotSpeed, scale, initialY: y });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    // Update each instance
    particles.forEach((p, i) => {
      // 1. Move Upwards
      p.y += p.speed;
      // Loop from bottom if it goes too high
      if (p.y > 10) p.y = -10;

      // 2. Gentle Rotation
      const object = meshRef.current.children[i];
      if (object) {
        object.position.set(p.x, p.y, p.z);
        object.rotation.x += p.rotSpeed;
        object.rotation.y += p.rotSpeed;
        object.scale.setScalar(p.scale);
      }
    });
  });

  return (
    <group ref={meshRef}>
      {particles.map((p, i) => (
        <TechParticle key={i} />
      ))}
    </group>
  );
}

// Single Instance of a Tech Particle
function TechParticle() {
  return (
    <mesh>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial
        color="#0891b2" // Cyan/Teal for "Tech/Trust"
        emissive="#0891b2"
        emissiveIntensity={0.8}
        transparent
        opacity={0.4}
        roughness={0.2}
      />
    </mesh>
  );
}


/* ---------- Medicine Box with Improved Lid ---------- */
function MedicineBox() {
  const ref = useRef();
  const lidRef = useRef();

  useFrame(() => {
    if (!ref.current || !lidRef.current) return;

    // Fixed scale - always visible
    ref.current.scale.setScalar(1);

    // Fixed Rotation for Lid (Open ~60 degrees)
    lidRef.current.rotation.x = (Math.PI / 3);
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
        position={[0, 0.27, -0.4]} // move pivot to back edge
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
      <mesh position={[0, 0.5, -0.53]} rotation={[0, 0, 0]}>
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
function BlockchainNode({ position }) {
  // Fixed scale

  return (
    <mesh position={position}>
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
    // Keep it visible or subtle pulse
    lineRef.current.material.opacity = 0.4;
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
  // Simple scan effect always running

  const startY = 0.8;
  const scanHeight = 0.4;

  useFrame((state) => {
    if (!qrRef.current || !scanRef.current) return;
    const t = state.clock.getElapsedTime();

    qrRef.current.position.y = 0.6 + Math.sin(t * 2) * 0.03;
    qrRef.current.material.opacity = 0.8;

    scanRef.current.position.y = startY - ((t % 1) * scanHeight);
    scanRef.current.material.opacity = 0.6;
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
  const nodePositions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      arr.push([Math.cos(angle) * 1.2, 0.4, Math.sin(angle) * 1.2]);
    }
    return arr;
  }, []);

  const groupRef = useRef();
  const mainGroupRef = useRef(); // New ref for the whole group

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Rotate blockchain nodes
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2;
    }

    // Hover entire group
    if (mainGroupRef.current) {
      mainGroupRef.current.position.y = Math.sin(t * 0.8) * 0.15; // Amplitude 0.15, Speed 0.8
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.3} />

      {/* 🚀 Replaced particles with TechBackground */}
      <TechBackground />

      <group ref={mainGroupRef}>
        <MedicineBox />

        {/* Sensors */}
        <Sensor position={[-0.6, 0.25, 0.3]} color="#22c55e" pulseSpeed={3} />
        <Sensor position={[0.6, 0.25, 0.3]} color="#3b82f6" pulseSpeed={4} />
        <Sensor position={[0, 0.25, 0.5]} color="#ef4444" pulseSpeed={5} />

        {/* Blockchain nodes + connections */}
        <group ref={groupRef}>
          {nodePositions.map((pos, i) => (
            <BlockchainNode key={i} position={pos} />
          ))}
          <BlockchainConnections nodePositions={nodePositions} />
        </group>

        {/* QR Hologram */}
        <QRHologram scrollYProgress={scrollYProgress} />
      </group>

      <OrbitControls enableZoom={false} rotateSpeed={1.5} />
    </>
  );
}

/* ---------- Main Export ---------- */
export default function SolutionScene() {
  const { scrollYProgress } = useScroll();
  // Text overlay always visible or fade in gently
  const overlayOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);

  return (
    <div className="sticky top-0 w-full h-screen bg-gray-950 overflow-hidden">
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
