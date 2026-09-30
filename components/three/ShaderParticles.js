"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Cursor repulsion runs in the vertex shader, so the CPU only updates a
// handful of uniforms per frame instead of touching every particle.
const vertexShader = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uSize;
  uniform float uScale;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec2 d = world.xy - uMouse;
    float dist = length(d);
    float push = (1.0 - smoothstep(0.0, uRadius, dist)) * uStrength;
    world.xy += (d / max(dist, 0.0001)) * push;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (uScale / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, uOpacity * smoothstep(0.5, 0.2, d));
  }
`;

export default function ShaderParticles({
  count = 3000,
  spread = 20,
  color = "#38bdf8",
  size = 0.035,
  opacity = 0.6,
  radius = 1.8,
  strength = 0.8,
  spin = 0.03,
}) {
  const pointsRef = useRef();
  const target = useRef(new THREE.Vector2(999, 999));
  const { gl, viewport } = useThree();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * spread;
    return arr;
  }, [count, spread]);

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(999, 999) },
      uRadius: { value: radius },
      uStrength: { value: strength },
      uSize: { value: size },
      uScale: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [radius, strength, size, color, opacity]
  );

  // Track the cursor relative to this canvas, even when an HTML overlay sits on top of it.
  useEffect(() => {
    const onMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      target.current.set((nx * viewport.width) / 2, (ny * viewport.height) / 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl, viewport.width, viewport.height]);

  useFrame((state, delta) => {
    uniforms.uMouse.value.lerp(target.current, Math.min(1, delta * 6));
    uniforms.uScale.value = (state.size.height * state.gl.getPixelRatio()) / 2;
    if (pointsRef.current) pointsRef.current.rotation.y += delta * spin;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
