"use client";

import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Shield, Cpu, Satellite, Blocks } from "lucide-react";


// Import the Inter font in your global CSS or Tailwind config
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

const layers = [
  { id: "ai", label: "AI", color: "#FF6F61" },
  { id: "iot", label: "IoT", color: "#1ABC9C" },
  { id: "blockchain", label: "Blockchain", color: "#3498DB" },
  { id: "trustchain", label: "TrustChain", color: "#9B59B6" },
];

export default function PyramidScene() {
  const [activeLayer, setActiveLayer] = useState("blockchain");

  const widths = [133.33, 266.66, 520, 1000];
  const heights = [66.66, 53.33, 93.33, 160];

  return (
    <div className="flex flex-col w-full text-white relative font-sans">
      {/* Pyramid Section */}
      <div className="relative w-full min-h-screen flex">
        {/* Full Section Grid Background */}
        <GridBackground activeLayer={activeLayer} />

        {/* Left Pyramid */}
        <div className="w-1/2 relative z-10">
          <div className="sticky top-24 flex flex-col items-center justify-center h-screen">
            <div className="relative flex flex-col items-center">
              {layers.map((layer, index) => {
                const isActive = activeLayer === layer.id;
                const shapeClip =
                  index === 0
                    ? "polygon(50% 10%, 95% 100%, 5% 100%)"
                    : "polygon(27% 0%, 73% 0%, 94% 100%, 6% 100%)";

                return (
                  <motion.div
                    key={layer.id}
                    className="mb-2 relative rounded-t-lg cursor-pointer"
                    style={{
                      width: `${widths[index]}px`,
                      height: `${heights[index]}px`,
                      clipPath: shapeClip,
                      background: isActive ? layer.color : "#111111",
                      border: `1px solid ${
                        isActive ? layer.color : "rgba(255,255,255,0.05)"
                      }`,
                      transition: "all 0.5s ease",
                    }}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      y: isActive ? -5 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center h-full font-semibold text-base tracking-wide text-white">
                      {layer.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sections */}
        <div className="w-1/2 flex flex-col space-y-64 py-32 px-12 z-10">
          {layers.map((layer) => (
            <Section
              key={layer.id}
              id={layer.id}
              label={layer.label}
              color={layer.color}
              onActive={() => setActiveLayer(layer.id)}
            />
          ))}
        </div>
      </div>

      {/* Extra sections after pyramid */}
      {/* <div className="w-full py-32 bg-gray-900 flex flex-col items-center space-y-32">
        <Section
          id="extra1"
          label="Extra Section 1"
          color="#555"
          onActive={() => {}}
        />
        <Section
          id="extra2"
          label="Extra Section 2"
          color="#555"
          onActive={() => {}}
        />
      </div> */}
    </div>
  );
}

// Grid Background covering full pyramid section
function GridBackground({ activeLayer }) {
  const ambientColors = {
    ai: "rgba(255,111,97,0.25)",
    iot: "rgba(26,188,156,0.25)",
    blockchain: "rgba(52,152,219,0.25)",
    trustchain: "rgba(155,89,182,0.25)",
  };

  return (
    <div
      className="absolute inset-0 w-full h-full z-0"
      style={{
        background: `radial-gradient(circle at 40% 50%, ${ambientColors[activeLayer]}, transparent 90%)`,
      }}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          animation: "moveGrid 30s linear infinite",
        }}
      />
      <style>{`
        @keyframes moveGrid {
          0% { background-position: 0 0; }
          100% { background-position: 400px 400px; }
        }
      `}</style>
    </div>
  );
}

// Section component
function Section({ id, label, color, onActive }) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: false });

  React.useEffect(() => {
    if (inView) onActive();
  }, [inView, onActive]);

  return (
    <div
      ref={ref}
      className="h-screen flex items-center justify-center z-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: inView ? 1 : 0,
          y: inView ? 0 : 20,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-xl"
      >
        <h2 className="text-8xl font-semibold mb-6 tracking-tight text-white">
          {label}
        </h2>
        <p className="text-gray-300 text-2xl leading-relaxed font-normal space-y-4">
  {label === "Blockchain" && (
    <>
      <div className="flex items-start gap-2">
        <Blocks className="w-6 h-6 text-blue-400 flex-shrink-0" />
        <span>
          <strong>Blockchain</strong> provides an immutable ledger that ensures medical records
          cannot be altered or tampered with. Every update is time-stamped and
          securely stored, building trust between hospitals, suppliers, and patients.
        </span>
      </div>
      <div className="flex items-start gap-2">
        <Shield className="w-6 h-6 text-green-400 flex-shrink-0" />
        <span>
          Reduces paperwork, streamlines audits, and enhances data security in
          the healthcare supply chain.
        </span>
      </div>
    </>
  )}

  {label === "IoT" && (
    <>
      <div className="flex items-start gap-2">
        <Satellite className="w-6 h-6 text-teal-400 flex-shrink-0" />
        <span>
          <strong>IoT devices</strong> enable real-time monitoring of temperature, location, and product
          authenticity with pinpoint accuracy.
        </span>
      </div>
      <div className="flex items-start gap-2">
        <Shield className="w-6 h-6 text-red-400 flex-shrink-0" />
        <span>
          If any irregularity occurs, such as a broken cold chain, the system sends
          immediate alerts to prevent compromised medicines from being used.
        </span>
      </div>
    </>
  )}

  {label === "AI" && (
    <>
      <div className="flex items-start gap-2">
        <Cpu className="w-6 h-6 text-purple-400 flex-shrink-0" />
        <span>
          <strong>Artificial Intelligence</strong> powers predictive analytics and anomaly detection,
          helping identify fraud or counterfeit drugs before they cause harm.
        </span>
      </div>
      <div className="flex items-start gap-2">
        <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0" />
        <span>
          Provides insights into supply chain optimization, demand forecasting,
          and compliance automation.
        </span>
      </div>
    </>
  )}

  {label === "TrustChain" && (
    <>
      <div className="flex items-start gap-2">
        <Shield className="w-6 h-6 text-indigo-400 flex-shrink-0" />
        <span>
          <strong>TrustChain</strong> integrates Blockchain, IoT, and AI into a unified system for
          securing the entire medical supply chain.
        </span>
      </div>
      <div className="flex items-start gap-2">
        <Blocks className="w-6 h-6 text-pink-400 flex-shrink-0" />
        <span>
          Ensures transparency, efficiency, and safety from production to patient delivery.
        </span>
      </div>
    </>
  )}
</p>

      </motion.div>
    </div>
  );
}
