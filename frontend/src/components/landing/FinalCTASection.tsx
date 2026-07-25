"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export default function FinalCTASection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[32px] bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/5 border border-white/[0.08] p-8 sm:p-12 overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-transparent blur-[100px]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-6">
              <Sparkles size={12} className="text-pink-400" />
              <span className="text-xs font-medium text-white/60">Ready to Start?</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-[1.05]">
              Ready to Make{" "}
              <span className="text-gradient">Every Connection</span>
              <br />
              Glow?
            </h2>

            <p className="text-lg text-white/40 max-w-lg mx-auto mb-8">
              Join SparkLive and start connecting with creators and viewers who share your passions. Your community is waiting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
              >
                <Sparkles size={18} />
                Get Started Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {[
                "Free to join",
                "No credit card required",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-xs text-white/40">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}