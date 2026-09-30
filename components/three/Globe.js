"use client";

import { forwardRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import landPoints from "../../lib/landPoints.json";
import { latLonToVector3 } from "../../lib/geo";
import { HOTSPOTS, ROUTES } from "../../lib/hotspots";
import theme from "../../lib/theme";

export const GLOBE_RADIUS = 2;

// Colours at secure = 0 (counterfeit crisis) and secure = 1 (TrustChain in place).
const DANGER = { land: "#7c8db5", hotspot: theme.danger.DEFAULT, glow: "#be123c" };
const SECURE = { land: "#5eead4", hotspot: theme.safe.DEFAULT, glow: theme.brand.deep };

/* ---------- Shaders ---------- */

// Dots fade out toward the limb so the sphere reads as round, not as a flat disc of sprites.
const landVertex = /* glsl */ `
  uniform float uSize;
  uniform float uScale;
  varying float vFacing;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 center = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vFacing = dot(normalize(world.xyz - center), normalize(cameraPosition - world.xyz));
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (uScale / -mv.z);
  }
`;

const landFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5 || vFacing < 0.0) discard;
    gl_FragColor = vec4(uColor, 0.75 * smoothstep(0.5, 0.3, d) * smoothstep(0.0, 0.35, vFacing));
  }
`;

// A solid core plus an expanding ring, each hotspot on its own phase.
const hotspotVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uSize;
  uniform float uScale;
  varying float vPhase;
  varying float vFacing;
  void main() {
    vPhase = aPhase;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 center = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vFacing = dot(normalize(world.xyz - center), normalize(cameraPosition - world.xyz));
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * (uScale / -mv.z);
  }
`;

const hotspotFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying float vPhase;
  varying float vFacing;
  void main() {
    if (vFacing < 0.0) discard;
    float d = length(gl_PointCoord - 0.5);
    float t = fract(uTime * 0.5 + vPhase);
    float ring = smoothstep(0.035, 0.0, abs(d - t * 0.48)) * (1.0 - t);
    float core = smoothstep(0.1, 0.06, d);
    float halo = smoothstep(0.25, 0.0, d) * 0.35;
    float a = max(max(core, ring), halo) * smoothstep(0.0, 0.25, vFacing);
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.5), a);
  }
`;

// A comet of light travelling along each supply route.
const arcVertex = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOffset;
  uniform float uOpacity;
  varying float vT;
  void main() {
    float head = fract(uTime * 0.35 + uOffset);
    float trail = clamp((head - vT) / 0.35, 0.0, 1.0);
    float comet = (vT <= head) ? (1.0 - trail) : 0.0;
    gl_FragColor = vec4(uColor, (0.18 + comet * 0.82) * uOpacity);
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(max(0.0, 0.58 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    gl_FragColor = vec4(uColor, 1.0) * intensity * 0.9;
  }
`;

/* ---------- Pieces ---------- */

function usePointScale(uniforms) {
  useFrame((state) => {
    uniforms.uScale.value = (state.size.height * state.gl.getPixelRatio()) / 2;
  });
}

function LandDots({ color }) {
  const positions = useMemo(() => {
    const arr = new Float32Array((landPoints.length / 2) * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < landPoints.length; i += 2) {
      latLonToVector3(landPoints[i], landPoints[i + 1], GLOBE_RADIUS * 1.003, v);
      v.toArray(arr, (i / 2) * 3);
    }
    return arr;
  }, []);

  const uniforms = useMemo(() => ({ uColor: color, uSize: { value: 0.07 }, uScale: { value: 1 } }), [color]);
  usePointScale(uniforms);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={landVertex}
        fragmentShader={landFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function Hotspots({ color }) {
  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(HOTSPOTS.length * 3);
    const sizes = new Float32Array(HOTSPOTS.length);
    const phases = new Float32Array(HOTSPOTS.length);
    const v = new THREE.Vector3();
    HOTSPOTS.forEach((h, i) => {
      latLonToVector3(h.lat, h.lon, GLOBE_RADIUS * 1.01, v).toArray(positions, i * 3);
      sizes[i] = h.w;
      phases[i] = (i * 0.618) % 1;
    });
    return { positions, sizes, phases };
  }, []);

  const uniforms = useMemo(
    () => ({ uColor: color, uTime: { value: 0 }, uSize: { value: 0.75 }, uScale: { value: 1 } }),
    [color]
  );
  usePointScale(uniforms);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={hotspotVertex}
        fragmentShader={hotspotFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Arc({ from, to, color, opacity, offset }) {
  const { line, material } = useMemo(() => {
    const a = latLonToVector3(from.lat, from.lon, 1).normalize();
    const b = latLonToVector3(to.lat, to.lon, 1).normalize();
    const lift = 0.06 + a.angleTo(b) * 0.16;
    const segments = 64;
    const pos = new Float32Array((segments + 1) * 3);
    const ts = new Float32Array(segments + 1);
    const q = new THREE.Quaternion();
    const full = new THREE.Quaternion().setFromUnitVectors(a, b);
    const v = new THREE.Vector3();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      q.identity().slerp(full, t);
      v.copy(a).applyQuaternion(q).multiplyScalar(GLOBE_RADIUS * (1.01 + Math.sin(Math.PI * t) * lift));
      v.toArray(pos, i * 3);
      ts[i] = t;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aT", new THREE.BufferAttribute(ts, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uTime: { value: 0 },
        uOffset: { value: offset },
        uOpacity: opacity,
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { line: new THREE.Line(geometry, material), material };
  }, [from, to, color, opacity, offset]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <primitive object={line} />;
}

function Routes({ opacity }) {
  const byName = useMemo(() => Object.fromEntries(HOTSPOTS.map((h) => [h.name, h])), []);
  return ROUTES.map(([a, b], i) => (
    <Arc
      key={`${a}-${b}`}
      from={byName[a]}
      to={byName[b]}
      color={theme.brand.soft}
      opacity={opacity}
      offset={(i * 0.37) % 1}
    />
  ));
}

/* ---------- Globe ---------- */

/**
 * Dark dotted globe used by the first and last chapters.
 * `secure` (number or MotionValue, 0 → 1) morphs it from red counterfeit
 * hotspots into green verified nodes connected by live supply routes.
 */
const Globe = forwardRef(function Globe({ secure = 0 }, ref) {
  const u = useMemo(
    () => ({
      land: { value: new THREE.Color() },
      hotspot: { value: new THREE.Color() },
      glow: { value: new THREE.Color() },
      routes: { value: 0 },
    }),
    []
  );
  const palette = useMemo(
    () => ({
      danger: Object.fromEntries(Object.entries(DANGER).map(([k, c]) => [k, new THREE.Color(c)])),
      secure: Object.fromEntries(Object.entries(SECURE).map(([k, c]) => [k, new THREE.Color(c)])),
    }),
    []
  );
  const atmosphereUniforms = useMemo(() => ({ uColor: u.glow }), [u]);
  const showRoutes = typeof secure !== "number" || secure > 0;

  useFrame(() => {
    const s = typeof secure === "number" ? secure : secure.get();
    u.land.value.lerpColors(palette.danger.land, palette.secure.land, s);
    u.hotspot.value.lerpColors(palette.danger.hotspot, palette.secure.hotspot, s);
    u.glow.value.lerpColors(palette.danger.glow, palette.secure.glow, s);
    u.routes.value = THREE.MathUtils.clamp((s - 0.5) * 2, 0, 1);
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial color={theme.ink[900]} />
      </mesh>
      <LandDots color={u.land} />
      <Hotspots color={u.hotspot} />
      {showRoutes && <Routes opacity={u.routes} />}
      <mesh scale={1.12}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={atmosphereUniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
});

export default Globe;
