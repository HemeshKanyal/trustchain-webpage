"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useInView } from "framer-motion";

// A Canvas that only renders while it is near the viewport and caps the
// device pixel ratio, so off-screen scenes cost nothing.
export default function SceneCanvas({ children, className = "absolute inset-0", ...props }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "200px 0px" });

  return (
    <div ref={ref} className={className}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        {...props}
      >
        {children}
      </Canvas>
    </div>
  );
}
