"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Globe, Briefcase } from "lucide-react";

const BusinessImpactScene = () => {
  const bars = [
    { label: "Adoption", value: 70 },
    { label: "Demand", value: 90 },
    { label: "Scalability", value: 80 },
    { label: "Impact", value: 65 },
  ];

  const maxBarHeight = 300; // max px for 100%
  const particleCount = 40; // number of floating particles

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden px-12">
      {/* Background Particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-green-500 rounded-full opacity-40"
          initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
          animate={{ y: [0, window.innerHeight], opacity: [0.3, 0.8, 0.3] }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "loop",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Faint Grid Lines */}
      <div className="absolute inset-0 grid grid-rows-5 border-t border-gray-800 pointer-events-none"></div>

      {/* Graph container */}
      <div className="relative w-full max-w-4xl h-80 flex items-end">
        {/* Y-axis */}
        <div className="absolute left-0 bottom-0 h-full flex flex-col justify-between">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="relative flex items-center -left-10">
              <span className="text-gray-400 text-sm">{val}%</span>
              <div className="h-px w-full bg-gray-800 absolute left-0 -z-10"></div>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between w-full ml-12">
          {bars.map((bar, i) => (
            <motion.div
              key={bar.label}
              className="flex flex-col items-center w-20 mx-4"
              initial={{ height: 0 }}
              whileInView={{ height: (bar.value / 100) * maxBarHeight }}
              transition={{ duration: 1, delay: i * 0.3 }}
            >
              <motion.div
                className="w-full rounded-t-xl shadow-[0_0_25px_rgba(34,197,94,0.9)]"
                style={{
                  background: "linear-gradient(to top, #22c55e, #86efac)",
                  height: (bar.value / 100) * maxBarHeight,
                }}
              />
              <p className="mt-3 text-lg font-semibold">{bar.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Y-axis label */}
        <div className="absolute top-0 left-0 flex flex-col justify-between h-full">
          <span className="text-gray-400 text-sm rotate-[-90deg] origin-left">
            %
          </span>
        </div>
      </div>

      {/* Floating Badges */}
      <div className="absolute top-20 right-20 flex flex-col space-y-10">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Globe className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.9)]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
        >
          <Briefcase className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 2 }}
        >
          <Shield className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.9)]" />
        </motion.div>
      </div>

      {/* Main Text */}
      <motion.div
        className="absolute bottom-20 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,197,94,0.9)]">
          Proven demand. Scalable across industries.
        </h2>
        <p className="mt-6 text-xl text-gray-300">
          Driving sustainability, security, and global trust.
        </p>
      </motion.div>
    </div>
  );
};

export default BusinessImpactScene;
