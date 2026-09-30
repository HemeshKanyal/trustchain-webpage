"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import ShaderParticles from "./ShaderParticles";
import useChapter from "../../lib/useChapter";
import theme from "../../lib/theme";

// Two flow colours per chapter; the background eases between them as you scroll.
const TONES = {
  problem: [theme.danger.DEFAULT, "#7c3aed"],
  solution: [theme.brand.DEFAULT, "#3b82f6"],
  technology: [theme.layer.blockchain, theme.layer.ai],
  workflow: [theme.brand.DEFAULT, theme.layer.blockchain],
  "in-action": [theme.brand.DEFAULT, theme.warn.DEFAULT],
  features: [theme.brand.DEFAULT, theme.safe.DEFAULT],
  business: [theme.brand.DEFAULT, theme.layer.blockchain],
  impact: [theme.safe.DEFAULT, theme.brand.DEFAULT],
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Domain-warped fbm "liquid" that the cursor pushes around and lights up.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uA;
  uniform vec3 uB;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * aspect;
    vec2 m = (uMouse - 0.5) * aspect;
    float d = length(p - m);
    vec2 push = (p - m) * exp(-d * d * 6.0) * 1.6;

    float t = uTime * 0.035;
    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.1));
    vec2 r = vec2(fbm(p * 1.4 + 2.0 * q + push * 2.5 + vec2(1.7, 9.2) + t * 1.3),
                  fbm(p * 1.4 + 2.0 * q + push * 2.5 + vec2(8.3, 2.8) - t));
    float f = fbm(p * 1.4 + 2.5 * r);

    vec3 flow = mix(uA, uB, clamp(length(q) * 1.1, 0.0, 1.0));
    vec3 c = vec3(0.016, 0.024, 0.043);
    c += flow * smoothstep(0.22, 1.0, f) * 0.62;
    c += mix(uA, uB, 0.5) * exp(-d * d * 7.0) * 0.16;
    c *= 1.0 - 0.25 * length(vUv - 0.5);
    c += (hash(vUv * uRes + uTime) - 0.5) * 0.012; // grain, prevents banding
    gl_FragColor = vec4(c, 1.0);
  }
`;

function Liquid({ chapter }) {
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uA: { value: new THREE.Color(TONES.problem[0]) },
      uB: { value: new THREE.Color(TONES.problem[1]) },
    }),
    [],
  );
  const target = useMemo(() => [new THREE.Color(), new THREE.Color()], []);

  useEffect(() => {
    const onMove = (e) => mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const [a, b] = TONES[chapter] ?? TONES.problem;
    target[0].set(a);
    target[1].set(b);
    const k = Math.min(1, delta * 1.5);
    uniforms.uA.value.lerp(target[0], k);
    uniforms.uB.value.lerp(target[1], k);
    uniforms.uMouse.value.lerp(mouse.current, Math.min(1, delta * 4));
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/** Fixed, site-wide interactive backdrop that sits behind every chapter. */
export default function AmbientBackground() {
  const chapter = useChapter();
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Liquid chapter={chapter} />
        <ShaderParticles
          count={700}
          spread={26}
          color="#94a3b8"
          size={0.035}
          opacity={0.35}
          radius={1.6}
          strength={0.7}
          spin={0.01}
        />
      </Canvas>
    </div>
  );
}
