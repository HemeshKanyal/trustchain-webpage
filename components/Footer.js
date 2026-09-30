"use client";

import { motion } from "framer-motion";
import { CHAPTERS, LINKS } from "../lib/chapters";

const FOOTER_LINKS = ["problem", "solution", "technology", "workflow", "impact"];

const Footer = () => {
    return (
        <footer className="relative w-full overflow-hidden pb-10 pt-20">
            {/* Orb Horizon Line */}
            <motion.div
                initial={{ opacity: 0.4 }}
                whileInView={{ opacity: [0.4, 1, 0.6] }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                viewport={{ once: true, amount: 0.5 }}
                className="pointer-events-none absolute left-1/2 top-0 z-10 h-[200px] w-[150%] -translate-x-1/2 rounded-[100%] border-t border-brand/30 shadow-[0_-20px_60px_-30px_rgba(45,212,191,0.5)]"
            />

            <div className="relative z-20 mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 text-sm text-slate-500 md:flex-row md:justify-between md:px-12">
                <div className="select-none">
                    <div className="text-2xl font-extrabold tracking-wider text-white">TRUSTCHAIN</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Trust. Secured</div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                    {FOOTER_LINKS.map((id) => (
                        <a key={id} href={`#${id}`} className="transition-colors hover:text-brand">
                            {CHAPTERS.find((c) => c.id === id).label}
                        </a>
                    ))}
                    <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand">
                        GitHub
                    </a>
                </div>

                <div className="text-xs text-slate-600">© {new Date().getFullYear()} TrustChain. All rights reserved.</div>
            </div>
        </footer>
    );
};

export default Footer;
