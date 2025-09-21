"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll) {
        setShow(false); // scrolling down → hide
      } else {
        setShow(true); // scrolling up → show
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 py-6 
        transition-transform duration-500 
        ${show ? "translate-y-0" : "-translate-y-full"} 
        bg-transparent`}
    >
      {/* Left corner → Logo + Tagline */}
      <div
        className="cursor-pointer select-none"
        onClick={() => window.location.reload()}
      >
        <h1 className="text-4xl font-extrabold tracking-wider">
          TRUSTCHAIN
        </h1>
        <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Trust. Secured
        </span>
      </div>

      {/* Right corner → Auth buttons */}
      <div className="flex gap-4">
        <button className="px-4 py-2 border border-white/40 rounded-md text-sm hover:bg-white hover:text-black transition">
          Get Started
        </button>
      </div>
    </nav>
  );
}
