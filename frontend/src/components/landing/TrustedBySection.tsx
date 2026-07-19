"use client";

import { motion } from "framer-motion";

const logos = [
  "TechCrunch", "Forbes", "Wired", "The Verge", "Product Hunt",
  "Business Insider", "Fast Company", "TechRadar"
];

export default function TrustedBySection() {
  return (
    <section className="relative py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs tracking-[0.2em] uppercase text-white/20 mb-10"
        >
          Featured in leading publications
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {logos.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="text-sm sm:text-base font-bold text-white/15 hover:text-white/30 transition-colors tracking-tight"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}