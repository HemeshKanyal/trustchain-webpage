"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

// 🔹 Interactive Particle Background
function InteractiveParticles({ count = 3000 }) {
  const particlesRef = useRef();
  const basePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 20;
    return arr;
  }, [count]);

  const positions = useMemo(() => new Float32Array(basePositions), [basePositions]);
  const mouse = useRef([0, 0]);

  // Track mouse movement
  useEffect(() => {
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth) * 20 - 10; // scale to particle space
      const y = -(e.clientY / window.innerHeight) * 20 + 10; // invert y
      mouse.current = [x, y];
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      const dx = x - mouse.current[0];
      const dy = y - mouse.current[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repel if close to cursor
      if (dist < 3) {
        const force = (1 - dist / 3) * 0.2;
        x += dx * force;
        y += dy * force;
      }

      // Smooth return to base position
      const ox = basePositions[i * 3];
      const oy = basePositions[i * 3 + 1];
      const oz = basePositions[i * 3 + 2];
      x += (ox - x) * 0.02;
      y += (oy - y) * 0.02;
      z += (oz - z) * 0.02;

      pos.setXYZ(i, x, y, z);
    }

    pos.needsUpdate = true;
    particlesRef.current.rotation.y += 0.0005;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#22c55e" transparent opacity={0.5} />
    </points>
  );
}

// 🔹 Hotspot
function GreenHotspot({ position }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(0.8 + 0.4 * Math.sin(performance.now() * 0.005));
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.7} />
    </mesh>
  );
}

// 🔹 Globe with Earth texture
function Globe() {
  const globeRef = useRef();
  const earthTexture = useLoader(THREE.TextureLoader, "/textures/earth_daymap.jpg");

  const hotspotPositions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2.02;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      arr.push([x, y, z]);
    }
    return arr;
  }, []);

  useFrame(() => {
    if (globeRef.current) globeRef.current.rotation.y += 0.002;
  });

  return (
    <group ref={globeRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0.1} />
      </Sphere>
      {hotspotPositions.map((pos, i) => (
        <GreenHotspot key={i} position={pos} />
      ))}
    </group>
  );
}

// 🔹 Impact Scene
export default function ImpactScene() {
  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <InteractiveParticles count={3000} />
        <Globe />
      </Canvas>

      {/* Text Overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-green-200 bg-clip-text text-transparent drop-shadow-lg">
          Secure. Traceable. Global Impact.
        </h2>
        <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-xl">
          Empowering industries worldwide with trust, security, and transparency in every supply chain.
        </p>
        <motion.button
          className="mt-8 px-10 py-4 bg-green-500 rounded-xl font-bold text-black shadow-lg hover:bg-green-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
