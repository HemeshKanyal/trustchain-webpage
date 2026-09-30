"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { motion, useTransform } from "framer-motion";
import * as THREE from "three";
import SceneCanvas from "./three/SceneCanvas";
import ShaderParticles from "./three/ShaderParticles";
import Globe from "./three/Globe";
import { Scene, Stage, Eyebrow, Title, Lead, Panel, EASE, useSceneProgress } from "./ui/Scene";
import { FOCUS } from "../lib/hotspots";
import { rotationToFace, lerpAngle, sweepLongitude } from "../lib/geo";

const smooth = (t) => t * t * (3 - 2 * t);

/* Scroll 0.2 → 0.65 flies the globe from the right-hand side into a close-up of India/Africa. */
function GlobeRig() {
  const progress = useSceneProgress();
  const rig = useRef();
  const globe = useRef();
  // Starts over the Americas (sin = -0.85 → about -60°) heading east.
  const phase = useRef(-1.02);
  const target = useMemo(() => rotationToFace(FOCUS.lat, FOCUS.lon), []);

  useFrame((state, delta) => {
    if (!rig.current || !globe.current) return;
    const f = smooth(THREE.MathUtils.clamp((progress.get() - 0.2) / 0.45, 0, 1));
    const mobile = state.viewport.aspect < 1;

    phase.current += delta * 0.09 * (1 - f);
    const idleY = rotationToFace(0, sweepLongitude(phase.current)).y;
    globe.current.rotation.y = lerpAngle(idleY, target.y, f);
    globe.current.rotation.x = THREE.MathUtils.lerp(0.25, target.x, f);

    const from = mobile ? { x: 0, y: -1.6, s: 0.8 } : { x: 2.6, y: 0, s: 1 };
    const to = mobile ? { x: 0, y: -0.9, s: 1.15 } : { x: 2.5, y: -0.1, s: 1.45 };
    rig.current.position.set(
      THREE.MathUtils.lerp(from.x, to.x, f),
      THREE.MathUtils.lerp(from.y, to.y, f),
      0
    );
    rig.current.scale.setScalar(THREE.MathUtils.lerp(from.s, to.s, f));

    // Subtle cursor tilt that calms down once we are focused on the region.
    const ease = Math.min(1, delta * 3);
    const tilt = 1 - f * 0.7;
    rig.current.rotation.x += (-state.pointer.y * 0.12 * tilt - rig.current.rotation.x) * ease;
    rig.current.rotation.y += (state.pointer.x * 0.18 * tilt - rig.current.rotation.y) * ease;
  });

  return (
    <group ref={rig}>
      <Globe ref={globe} secure={0} />
    </group>
  );
}

function ScrollHint() {
  const progress = useSceneProgress();
  const opacity = useTransform(progress, [0, 0.08], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500"
    >
      Scroll
      <span className="relative h-10 w-px overflow-hidden bg-white/10">
        <motion.span
          className="absolute inset-x-0 top-0 h-4 bg-slate-300"
          animate={{ y: [-16, 40] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}

export default function HeroScene() {
  return (
    <Scene id="problem" length={2.5}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(244,63,94,0.10),transparent_60%)]" />

      <SceneCanvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ShaderParticles count={1500} spread={30} color="#64748b" size={0.03} opacity={0.35} radius={1.2} strength={0.5} spin={0.01} />
        <GlobeRig />
      </SceneCanvas>

      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl items-start px-6 pt-28 md:items-center md:px-12 md:pt-0">
        <div className="grid w-full max-w-xl lg:max-w-3xl">
          <Stage from={0} to={0.22} className="col-start-1 row-start-1 self-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE }}
              className="space-y-6"
            >
              <Eyebrow chapter="problem" tone="danger" />
              <Title as="h1" className="lg:text-8xl">
                10–30% of medicines worldwide are <span className="text-danger">fake</span>.
              </Title>
              <Lead className="text-lg md:text-xl">Trust is broken. Lives are lost.</Lead>
            </motion.div>
          </Stage>

          <Stage from={0.5} to={1} className="col-start-1 row-start-1 space-y-6 self-center">
            <Eyebrow chapter="problem" tone="danger" />
            <Title>The crisis hits hardest where care is hardest to reach.</Title>
            <Panel className="p-5">
              <div className="text-5xl font-extrabold tracking-tight text-danger">1 in 10</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                medical products in low- and middle-income countries is substandard or falsified.
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-600">WHO, 2017</p>
            </Panel>
          </Stage>
        </div>
      </div>

      <ScrollHint />
    </Scene>
  );
}
