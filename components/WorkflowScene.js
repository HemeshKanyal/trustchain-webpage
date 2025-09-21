// WorkflowScene.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Icons
const Icon = {
  Admin: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Manufacturer: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7V4h10v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Distributor: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="19" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 11h4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Pharmacy: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>),
  Doctor: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Patient: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
};

const DEFAULT_STEPS = [
  { id: "admin", label: "Admin", icon: Icon.Admin },
  { id: "manufacturer", label: "Manufacturer", icon: Icon.Manufacturer },
  { id: "distributor", label: "Distributor", icon: Icon.Distributor },
  { id: "pharmacy", label: "Pharmacy", icon: Icon.Pharmacy },
  { id: "doctor", label: "Doctor", icon: Icon.Doctor },
  { id: "patient", label: "Patient", icon: Icon.Patient }
];

export default function WorkflowScene({
  steps = DEFAULT_STEPS,
  durationPerStep = 0.7,
  pauseMs = 350,
  pillId = "MED-001",
  onStep = () => {},
  onComplete = () => {}
}) {
  const containerRef = useRef(null);
  const stageRefs = useRef([]);
  const positions = useRef([]);
  const controls = useAnimation();
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const { ref: inViewRef, inView } = useInView({ threshold: 0.35, triggerOnce: true });

  useEffect(() => {
    function calcPositions() {
      const container = containerRef.current;
      if (!container) return;
      positions.current = stageRefs.current.map(el => el ? el.offsetLeft + el.offsetWidth / 2 : 0);
    }
    calcPositions();
    window.addEventListener('resize', calcPositions);
    return () => window.removeEventListener('resize', calcPositions);
  }, [steps.length]);

  useEffect(() => {
    if (inView && !playing) runSequence();
  }, [inView]);

  async function runSequence() {
    setPlaying(true);
    for (let i = 0; i < positions.current.length; i++) {
      const x = positions.current[i] - 18;
      await controls.start({ x, transition: { duration: durationPerStep, ease: 'easeInOut' } });
      setActiveStep(i);
      try { onStep({ step: steps[i], index: i }); } catch {}
      await new Promise(r => setTimeout(r, pauseMs));
    }
    setActiveStep(-1);
    setPlaying(false);
    onComplete();
  }

  const contractVariants = { hidden: { opacity: 0, y: -8, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } };
  const scrollVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <section ref={inViewRef} className="relative py-24 bg-gradient-to-b from-gray-900 via-indigo-950 to-black overflow-hidden font-inter">
      
      {/* Floating futuristic background shapes */}
      <motion.div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-72 h-72 top-10 left-1/4 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
        <motion.div className="absolute w-60 h-60 top-32 right-1/3 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
        <motion.div className="absolute w-80 h-80 bottom-10 left-1/3 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Title */}
        <motion.h3
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-12 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Smart Contract Workflow
        </motion.h3>

        {/* Glass card */}
        <div ref={containerRef} className="relative bg-gray-800/40 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-gray-700/50 overflow-hidden">

          {/* Decorative dashed path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M40 80 C 200 10, 400 10, 960 80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="6 6" />
          </svg>

          {/* nodes row */}
          <div className="relative z-10 flex items-center justify-between gap-6 w-full">
            {steps.map((s, i) => {
              const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
              return (
                <motion.div
                  key={s.id}
                  ref={el => { stageRefs.current[i] = el; ref(el); }}
                  className="flex-1 flex flex-col items-center text-center"
                  variants={scrollVariants}
                  initial="hidden"
                  animate={inView ? "show" : "hidden"}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  {/* Node with neon burst */}
                  <motion.div
                    animate={activeStep===i ? { scale: 1.2, boxShadow: "0 0 24px 8px rgba(0,255,255,0.5)" } : { scale: 1, boxShadow: "0 0 6px 0 rgba(0,0,0,0.2)" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-20 h-20 rounded-xl flex items-center justify-center mb-2 ${activeStep===i ? 'bg-gradient-to-tr from-cyan-400 to-purple-500 ring-4 ring-cyan-300' : 'bg-gray-700 hover:bg-gray-600'} shadow-lg`}
                  >
                    <div className="text-white w-10 h-10">{s.icon}</div>
                  </motion.div>

                  <div className="text-sm text-gray-300 font-medium mb-2 tracking-wide">{s.label}</div>

                  <motion.div
                    initial="hidden"
                    animate={activeStep===i ? 'show':'hidden'}
                    variants={contractVariants}
                    transition={{ type:'spring', stiffness:300, damping:20 }}
                  >
                    {activeStep===i && <div className="inline-flex items-center gap-2 bg-cyan-600/95 text-white text-xs px-3 py-1 rounded-full shadow-lg tracking-wide">🔒 Contract</div>}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* moving medicine strip with comet trail */}
          <motion.div animate={controls} className="absolute top-[30px] left-0 z-20 pointer-events-none" style={{ x: 0 }}>
            <div className="relative w-40 h-12 flex items-center px-4">
              
              {/* Comet tail */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-64 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-cyan-600 opacity-70 blur-2xl"
                initial={{ width: 0 }}
                animate={{ width: 256 }}
                transition={{ duration: durationPerStep * DEFAULT_STEPS.length, ease: "easeOut" }}
              />

              {/* Floating spark particles */}
              {[...Array(8)].map((_, idx) => (
                <motion.div
                  key={idx}
                  className="absolute w-1 h-1 rounded-full bg-white/80"
                  initial={{ x: 0, y: 6, opacity: 0 }}
                  animate={{ x: Math.random() * 40 - 20, y: Math.random() * 8 - 4, opacity: 1 }}
                  transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.8 + Math.random() }}
                />
              ))}

              {/* Pill content */}
              <div className="relative w-full h-full rounded-full flex items-center shadow-2xl bg-gradient-to-r from-yellow-300 to-yellow-500 overflow-hidden z-10">
                <div className="w-6 h-6 bg-white rounded-full mr-3 shadow-md z-10" />
                <div className="flex-1 text-sm font-semibold text-gray-900 z-10 tracking-wide">{pillId}</div>
              </div>
            </div>
          </motion.div>

          {/* replay button */}
          <div className="absolute right-4 bottom-4 z-30">
            <button onClick={() => { if(!playing) runSequence(); }} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md tracking-wide">Replay</button>
          </div>
        </div>

        <p className="mt-6 text-lg md:text-xl text-gray-400 leading-relaxed tracking-wide">
          The strip moves along the supply chain. The contract badge appears when a step is recorded on-chain. Use <code>onStep</code> hook to call your backend or blockchain node.
        </p>
      </div>
    </section>
  );
}
