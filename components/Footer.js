"use client";

import { motion } from "framer-motion";
// Link imported from next/link below
import Link from "next/link"; // Assuming standard next/link

const Footer = () => {
    return (
        <footer className="relative w-full bg-black overflow-hidden pt-20 pb-10">
            {/* Orb Horizon Line */}
            <motion.div
                initial={{ opacity: 0.5, boxShadow: "0 0 0px rgba(74, 222, 128, 0)" }}
                whileInView={{
                    opacity: [0.5, 1, 0.5],
                    boxShadow: [
                        "0 0 10px rgba(74, 222, 128, 0.1)",
                        "0 0 30px rgba(74, 222, 128, 0.4)",
                        "0 0 10px rgba(74, 222, 128, 0.1)",
                    ],
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                viewport={{ once: false, amount: 0.5 }} // Re-trigger slightly if wanted, or use once: true
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[200px] border-t border-green-500/30 rounded-[100%] bg-transparent z-10 pointer-events-none"
            />

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-green-500/20 rounded-full"
                        style={{
                            width: Math.random() * 3 + 1 + "px",
                            height: Math.random() * 3 + 1 + "px",
                            top: Math.random() * 100 + "%",
                            left: Math.random() * 100 + "%",
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50],
                            opacity: [0.1, 0.5, 0.1],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center justify-between text-zinc-500 text-sm tracking-wide">

                {/* Left: Logo */}
                <div className="flex flex-col cursor-pointer select-none">
                    <h1 className="text-2xl font-extrabold tracking-wider text-white">
                        TRUSTCHAIN
                    </h1>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        Trust. Secured
                    </span>
                </div>

                {/* Center: Links */}
                <div className="flex items-center gap-12">
                    {["About", "Platform", "Security", "Contact"].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()}`} className="group relative">
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-green-400 font-bold text-gray-300">
                                {item}
                            </span>
                            <motion.span
                                className="absolute left-0 right-0 -bottom-1 h-[1px] bg-green-500/50"
                                initial={{ opacity: 0, scaleX: 0.5 }}
                                whileHover={{ opacity: 1, scaleX: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.div
                                className="absolute inset-0 blur-md bg-green-500/10 -z-10"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                            />
                        </Link>
                    ))}
                </div>

                {/* Right: Copyright */}
                <div className="text-zinc-600 text-xs">
                    © {new Date().getFullYear()} TrustChain. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
