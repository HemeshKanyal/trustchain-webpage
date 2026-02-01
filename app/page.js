"use client";

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
  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <Navbar />

      {/* Sections */}
      <section><HeroScene /></section>
      <section className="relative h-[300vh]"><SolutionScene /></section>
      <section><PyramidScene /></section>
      <section><WorkflowScene /></section>
      <section><IoTScene /></section>
      <section><FeaturesScene /></section>
      <section><BusinessScene /></section>
      <section><ImpactScene /></section>
    </main>
  );
}
