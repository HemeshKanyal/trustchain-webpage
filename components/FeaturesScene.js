"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const UniqueFeaturesScene = () => {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Medicine strip with QR */}
      <motion.div
        className="relative w-[28rem] h-56 bg-gray-800 rounded-2xl border-8 flex items-center justify-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* QR code always visible */}
        <img
          src="/assets/qr-code.png"
          alt="QR Code"
          className="w-48 h-48 z-10"
        />

        {/* Scanner effect (thicker + glow) */}
        <motion.div
          className="absolute top-0 left-0 w-full h-10 bg-green-400 opacity-80 blur-lg"
          animate={{ y: ["0%", "350%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Border flash layer */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-8 border-transparent"
          whileInView={{
            borderColor: ["#4B5563", "#EF4444", "#4B5563"], // gray → red → gray
          }}
          transition={{
            delay: 1.5,
            duration: 1,
            repeat: 3, // flashes 3 times
          }}
        />
      </motion.div>

      {/* Floating tablet */}
      <motion.div
        className="mt-14"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <img
          src="/assets/icons/tablet.png"
          alt="Tablet"
          className="w-28 h-28"
        />
      </motion.div>

      {/* Recall alert */}
      <motion.div
        className="flex items-center mt-12 space-x-4 text-red-500 text-4xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <AlertTriangle className="w-14 h-14" />
        <span className="font-bold">Recall Alert</span>
      </motion.div>

      {/* Supporting text */}
      <div className="mt-14 space-y-5 text-4xl font-bold text-gray-200">
        {["Unique ID", "Traceable", "Recall Safe"].map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.4, duration: 0.6 }}
          >
            {text}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UniqueFeaturesScene;
