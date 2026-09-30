"use client";

import { MotionConfig } from "framer-motion";
import SmoothScroll from "../components/SmoothScroll";
import AmbientBackground from "../components/three/AmbientBackground";
import Navbar from "../components/Navbar";
import HeroScene from "../components/HeroScene";
import SolutionScene from "../components/SolutionScene";
import Footer from "../components/Footer";
import PyramidScene from "../components/PyramidScene";
import WorkflowScene from "../components/WorkflowScene";
import IoTScene from "../components/IoTScene";
import FeaturesScene from "../components/FeaturesScene";
import BusinessScene from "../components/BusinessScene";
import ImpactScene from "../components/ImpactScene";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <AmbientBackground />
      <main className="relative z-10 w-full min-h-screen text-white">
        {/* Navbar */}
        <Navbar />

        {/* Chapters (see lib/chapters.js) */}
        <HeroScene />
        <SolutionScene />
        <PyramidScene />
        <WorkflowScene />
        <IoTScene />
        <FeaturesScene />
        <BusinessScene />
        <ImpactScene />
        <Footer />
      </main>
    </MotionConfig>
  );
}
