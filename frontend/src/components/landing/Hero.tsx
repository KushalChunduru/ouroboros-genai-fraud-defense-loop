"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Hero() {
  const [vectors, setVectors] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    api.health().then((h) => setVectors(h.vectors)).catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="hero-wash absolute inset-0 h-[520px]" aria-hidden="true" />
      <div className="dot-grid absolute inset-0 h-[420px]" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20">
      <motion.div
        className="max-w-3xl"
        initial={reduce ? undefined : { opacity: 0, y: 10 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="eyebrow mb-5">Mastercard Innovation Challenge · GFF 2026</div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.98]">
          The attack and the defense, trained in{" "}
          <span className="text-gradient">the same loop</span>.
        </h1>

        <p className="mt-5 text-base md:text-lg max-w-xl" style={{ color: "var(--muted)" }}>
          Ouroboros identifies emerging GenAI-powered payment fraud, simulates it with entity-level fidelity at
          scale, and defends against it with a fused detector — then runs the whole system as a self-play arms
          race so the defense&apos;s own blind spots become tomorrow&apos;s attack hypotheses.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link href="/console" className="btn btn-solid">
            Run the live console →
          </Link>
          <a href="#pillars" className="btn btn-ghost">
            How it works
          </a>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
        <Stat value={vectors ?? 15} label="grounded attack vectors" />
        <Stat value="3" label="pillars, one closed loop" />
        <Stat value="2" label="self-improving feedback loops" />
        <Stat value="0" label="real PII — fully synthetic" />
      </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="data text-2xl font-medium">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}
