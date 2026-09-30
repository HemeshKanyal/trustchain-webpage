"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTransform } from "framer-motion";
import { ArrowRight, Github, FileText } from "lucide-react";
import SceneCanvas from "./three/SceneCanvas";
import ShaderParticles from "./three/ShaderParticles";
import Globe from "./three/Globe";
import { Scene, Stage, Eyebrow, Title, Lead, useSceneProgress } from "./ui/Scene";
import { FOCUS } from "../lib/hotspots";
import { rotationToFace, sweepLongitude } from "../lib/geo";
import { LINKS } from "../lib/chapters";
import theme from "../lib/theme";

/* The Scene 1 globe returns, facing the same region, and turns green as you scroll in. */
function SecureGlobe() {
  const progress = useSceneProgress();
  const secure = useTransform(progress, [0.05, 0.45], [0, 1], { clamp: true });
  const rig = useRef();
  const globe = useRef();
  const start = useMemo(() => rotationToFace(FOCUS.lat, FOCUS.lon), []);
  // Begins facing India/Africa (same view Scene 1 ended on), then sweeps east and west.
  const phase = useRef(Math.asin((52 - 25) / 100));

  useFrame((state, delta) => {
    if (!rig.current || !globe.current) return;
    const mobile = state.viewport.aspect < 1;
    phase.current += delta * 0.07;
    globe.current.rotation.set(start.x * 0.6, rotationToFace(0, sweepLongitude(phase.current)).y, 0);

    rig.current.position.set(mobile ? 0 : 2.2, mobile ? -1.4 : -0.1, 0);
    rig.current.scale.setScalar(mobile ? 0.85 : 1.3);

    const ease = Math.min(1, delta * 3);
    rig.current.rotation.x += (-state.pointer.y * 0.12 - rig.current.rotation.x) * ease;
    rig.current.rotation.y += (state.pointer.x * 0.18 - rig.current.rotation.y) * ease;
  });

  return (
    <group ref={rig}>
      <Globe ref={globe} secure={secure} />
    </group>
  );
}

const buttonBase =
  "pointer-events-auto inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors";

export default function ImpactScene() {
  return (
    <Scene id="impact" length={2}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(45,212,191,0.10),transparent_60%)]" />

      <SceneCanvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ShaderParticles count={1500} spread={30} color={theme.brand.soft} size={0.03} opacity={0.3} radius={1.2} strength={0.5} spin={0.01} />
        <SecureGlobe />
      </SceneCanvas>

      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl items-start px-6 pt-28 md:items-center md:px-12 md:pt-0">
        <div className="grid w-full max-w-xl lg:max-w-2xl">
          <Stage from={0} to={1} className="col-start-1 row-start-1 space-y-6 self-center">
            <Eyebrow chapter="impact" tone="safe" />
            <Title>
              TrustChain saves lives. <span className="text-brand">Secures medicines.</span> Builds trust.
            </Title>
            <Lead>
              Every strip verified, every handover on-chain, every alert in real time, from the factory
              floor to the patient&apos;s hand.
            </Lead>

            <Stage from={0.45} to={1} className="flex flex-wrap gap-3 pt-2">
              <a href={LINKS.demo} target="_blank" rel="noopener noreferrer" className={`${buttonBase} bg-brand text-ink-950 hover:bg-brand-soft`}>
                Try the demo <ArrowRight className="h-4 w-4" />
              </a>
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={`${buttonBase} border border-white/15 text-white hover:bg-white/5`}>
                <Github className="h-4 w-4" /> GitHub
              </a>
              {LINKS.pitchDeck && (
                <a href={LINKS.pitchDeck} target="_blank" rel="noopener noreferrer" className={`${buttonBase} border border-white/15 text-white hover:bg-white/5`}>
                  <FileText className="h-4 w-4" /> Pitch deck
                </a>
              )}
            </Stage>
          </Stage>
        </div>
      </div>
    </Scene>
  );
}
