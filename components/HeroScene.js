"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere, OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { TextureLoader } from "three";

// 🌌 Dense Particle Background
function Particles() {
  const particlesRef = useRef();
  const count = 5000;

  const basePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  const positions = useMemo(() => new Float32Array(basePositions), [basePositions]);
  const mouse = useRef([0, 0]);

  useEffect(() => {
    const handleMouse = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ];
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ox = basePositions[i * 3];
      const oy = basePositions[i * 3 + 1];
      const oz = basePositions[i * 3 + 2];

      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      const dx = x / 10 - mouse.current[0];
      const dy = y / 10 - mouse.current[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1) {
        const force = (1 - dist) * 0.1;
        x += dx * force;
        y += dy * force;
      }

      x += (ox - x) * 0.015;
      y += (oy - y) * 0.015;
      z += (oz - z) * 0.015;

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
      <pointsMaterial size={0.035} color="#38bdf8" transparent opacity={0.65} />
    </points>
  );
}

// 🌌 Red Blinking Hotspot
function RedHotspot({ position }) {
  const materialRef = useRef();

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.3 + Math.abs(Math.sin(performance.now() * 0.01)) * 0.7;
    }
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#f87171"
        emissive="#f87171"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// 🌌 Latitude/Longitude to XYZ with optional offsets
function latLonToXYZ(latDeg, lonDeg, radius, offsetLat = 0, offsetLon = 0) {
  // Apply offsets
  const latRad = ((latDeg + offsetLat) * Math.PI) / 300;
  const lonRad = ((lonDeg + offsetLon) * Math.PI) / 40;

  const x = radius * Math.cos(latRad) * Math.cos(lonRad) ;
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);
  return [x, y, z];
}


// 🌌 Generate Hotspots (biased towards India + Africa)
function generateHotspots() {
  const hotspots = [];

  // India cluster
  for (let i = 0; i < 60; i++) {
    const lat = Math.random() * (36 - 6) + 6;
    const lon = Math.random() * (97 - 68) + 68;
    hotspots.push(latLonToXYZ(lat, lon, 2.02));
  }

  // Africa cluster
  for (let i = 0; i < 50; i++) {
    const lat = Math.random() * (37 + 35) - 35;
    const lon = Math.random() * (51 + 17) - 17;
    hotspots.push(latLonToXYZ(lat, lon, 2.02));
  }

  // A few safe scatter (restricted to major regions to avoid oceans)
  const safeRegions = [
    [40, -100], // USA
    [55, 10],   // Europe
    [35, 139],  // Japan
  ];
  safeRegions.forEach(([lat, lon]) => {
    for (let i = 0; i < 15; i++) {
      hotspots.push(latLonToXYZ(lat + Math.random() * 5, lon + Math.random() * 5, 2.02));
    }
  });

  return hotspots;
}

// 🌌 Futuristic Globe
function FuturisticGlobe() {
  const globeRef = useRef();
  const colorMap = useLoader(TextureLoader, "/textures/earth_daymap.jpg");
  const hotspotPositions = useMemo(() => generateHotspots(), []);

  const { scrollYProgress } = useScroll();
  const globeScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);
  const globePositionX = useTransform(scrollYProgress, [0, 0.3], [0, -0.8]);

  useFrame(() => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y += 0.005;
    globeRef.current.scale.setScalar(globeScale.get());
    globeRef.current.position.x = globePositionX.get() + 3;
  });

  return (
    <>
      <group ref={globeRef}>
        <Sphere args={[2, 128, 128]}>
          <meshStandardMaterial map={colorMap} roughness={0.7} metalness={0.1} />
        </Sphere>

        <Sphere args={[2.05, 128, 128]}>
          <meshStandardMaterial
            color="#0f172a"
            emissive="#6366f1"
            emissiveIntensity={0.3}
            roughness={0}
            metalness={0.5}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </Sphere>

        {hotspotPositions.map((pos, i) => (
          <RedHotspot key={i} position={pos} />
        ))}
      </group>

      {/* ✅ Controls now locked around India/Africa */}
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        target={[0.8, 0.2, 0]} // centers camera
        rotateSpeed={2}
      />
    </>
  );
}

// 🚀 Hero Scene
export default function HeroScene() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Particles />
        <FuturisticGlobe />
      </Canvas>

      <motion.div
        className="absolute inset-0 flex items-center justify-start px-12 pointer-events-none"
        style={{ opacity, y }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="max-w-lg text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            10–30% of medicines worldwide are fake.
          </h1>
          <motion.p
            className="mt-4 text-lg md:text-2xl text-red-400 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Trust is broken. Lives are lost.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
