// IoTScene.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const IoTScene = () => {
  const [temp, setTemp] = useState(37);
  const [gps, setGps] = useState("✅");
  const [rfid, setRfid] = useState("✅");
  const [logs, setLogs] = useState([]);
  const roadRef = useRef(null);
  const [roadWidth, setRoadWidth] = useState(0);

  // Measure road width on mount & resize
  useEffect(() => {
    const updateWidth = () => {
      if (roadRef.current) {
        setRoadWidth(roadRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Simulate IoT data changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = 37 + Math.floor(Math.random() * 5);
      const newGps = Math.random() > 0.1 ? "✅" : "❌";
      const newRfid = Math.random() > 0.1 ? "✅" : "❌";

      setTemp(newTemp);
      setGps(newGps);
      setRfid(newRfid);

      setLogs((prev) => [
        { id: Date.now(), text: `Temp: ${newTemp}°C | GPS: ${newGps} | RFID: ${newRfid}` },
        ...prev.slice(0, 6),
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        height: "100vh",
        background: "radial-gradient(circle at center, #0a0a0a, #000)",
        fontFamily: "'Helvetica Neue', sans-serif",
      }}
      className="flex flex-col justify-center items-center text-white relative"
    >
      {/* Moving glowing grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,255,100,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,100,0.15)_1px,transparent_1px)] bg-[size:60px_60px] animate-[gridmove_12s_linear_infinite] blur-sm" />
      </div>

      <h2 className="text-5xl font-bold tracking-tight relative z-10 mb-10">
        IoT & AI in Action
      </h2>

      {/* Road */}
      <div
        ref={roadRef}
        style={{
          width: "90%",
          height: "100px",
          background: "linear-gradient(to right, #000000ff, #000000ff, #000000ff)",
          position: "relative",
          margin: "60px 0",
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: "0 0 60px 10px rgba(0, 255, 0, 0.4)", // ✅ green ambient glow
        }}
      >
        {/* Lane line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: "2px",
            background:
              "repeating-linear-gradient(to right, #aaa, #aaa 20px, transparent 20px, transparent 40px)",
            transform: "translateY(-50%)",
          }}
        />

        {/* Truck */}
        <motion.div
          style={{
            width: "80px",
            height: "40px",
            background: "#FFD700",
            borderRadius: "8px",
            position: "absolute",
            top: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
          }}
          animate={{ x: [0, roadWidth - 100] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          {/* Wheels */}
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              display: "flex",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#333",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#333",
              }}
            />
          </div>
        </motion.div>

        {/* IoT Data */}
        <div
          style={{
            position: "absolute",
            top: "-70px",
            left: "0",
            display: "flex",
            gap: "20px",
            fontSize: "16px",
            background: "rgba(0,0,0,0.5)",
            padding: "6px 12px",
            borderRadius: "8px",
            backdropFilter: "blur(6px)",
          }}
        >
          <span style={{ color: temp > 39 ? "#ff4d4d" : "#00ff00" }}>
            Temp: {temp}°C
          </span>
          <span style={{ color: gps === "❌" ? "#ff4d4d" : "#00ff00" }}>
            GPS: {gps}
          </span>
          <span style={{ color: rfid === "❌" ? "#ff4d4d" : "#00ff00" }}>
            RFID: {rfid}
          </span>
        </div>
      </div>

      {/* Logs */}
      <div
        style={{
          width: "300px",
          height: "300px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "16px",
          padding: "35px",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.2)",
          overflowY: "auto",
          boxShadow: "0 0 25px rgba(0,0,255,0.35)", // ✅ separate blue glow for logs
        }}
      >
        <h3 className="text-lg font-medium mb-2 text-blue-300">Live Logs</h3>
        <ul className="space-y-2 text-sm text-gray-200">
          {logs.map((log) => (
            <li key={log.id} className="opacity-80">
              {log.text}
            </li>
          ))}
        </ul>
      </div>

      <style jsx global>{`
        @keyframes gridmove {
          from {
            background-position: 0 0, 0 0;
          }
          to {
            background-position: 60px 60px, 60px 60px;
          }
        }
      `}</style>
    </section>
  );
};

export default IoTScene;
