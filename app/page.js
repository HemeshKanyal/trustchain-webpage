"use client";
import { useRef } from "react";
import { Scroll } from "framer-motion";
import Navbar from "../components/Navbar";
import HeroScene from "../components/HeroScene";
import SolutionScene from "../components/SolutionScene";
import PyramidScene from "../components/PyramidScene";
import WorkflowScene from "../components/WorkflowScene";
import IoTScene from "../components/IoTScene";
import FeaturesScene from "../components/FeaturesScene";
import BusinessScene from "../components/BusinessScene";
import ImpactScene from "../components/ImpactScene";

export default function Home() {
  const containerRef = useRef(null);

  return (
    <main
      ref={containerRef}
      className="relative w-full h-screen snap-y snap-mandatory overflow-scroll bg-[#0a0a0a] text-white"
    >
      {/* Navbar */}
      <Navbar />

      {/* Sections */}
      <section><HeroScene scrollRef={containerRef} /></section>
      <section><SolutionScene scrollRef={containerRef} /></section>
      <section><PyramidScene scrollRef={containerRef} /></section>
      <section><WorkflowScene scrollRef={containerRef} /></section>
      <section><IoTScene scrollRef={containerRef} /></section>
      <section><FeaturesScene scrollRef={containerRef} /></section>
      <section><BusinessScene scrollRef={containerRef} /></section>
      <section><ImpactScene scrollRef={containerRef} /></section>
    </main>
  );
}
