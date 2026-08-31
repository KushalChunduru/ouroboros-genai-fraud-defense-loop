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
      <div className="dot-grid absolute inset-0 h-[420px]" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-16 text-center">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={reduce ? undefined : { opacity: 0, y: 10 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="eyebrow mb-5">Mastercard Innovation Challenge · GFF 2026</div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.98]">
          The attack and the defense, trained in{" "}
          <span className="text-gradient">the same loop</span>.
        </h1>

        <p className="mt-5 text-base md:text-lg max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
          Ouroboros identifies emerging GenAI-powered payment fraud, simulates it with entity-level fidelity at
          scale, and defends against it with a fused detector — then runs the whole system as a self-play arms
          race so the defense&apos;s own blind spots become tomorrow&apos;s attack hypotheses.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link href="/console" className="btn btn-solid">
            Run the live console →
          </Link>
          <a href="#pillars" className="btn btn-ghost">
            How it works
          </a>
        </div>
      </motion.div>

      <ConsoleMockup />

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-14 pt-8 border-t max-w-3xl mx-auto" style={{ borderColor: "var(--border)" }}>
        <Stat value={vectors ?? 15} label="grounded attack vectors" />
        <Stat value="3" label="pillars, one closed loop" />
        <Stat value="2" label="self-improving feedback loops" />
        <Stat value="0" label="real PII — fully synthetic" />
      </div>
      </div>
    </section>
  );
}

/* A real preview of the console, not stock illustration -- the reference's
   laptop-mockup hero, translated into an honest browser-chrome frame around
   a miniature of the actual run-summary layout. */
function ConsoleMockup() {
  return (
    <div className="mt-14 max-w-4xl mx-auto rounded-[28px] p-2 md:p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
      <div className="rounded-[20px] overflow-hidden text-left" style={{ background: "var(--surface-2)" }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff8a80" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ffd180" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#8fe3c0" }} />
          <span className="data ml-3 text-xs" style={{ color: "var(--muted)" }}>ouroboros.app/console</span>
        </div>
        <div className="p-5 md:p-8 grid sm:grid-cols-3 gap-4">
          <div className="block-teal rounded-2xl p-5 sm:col-span-2">
            <div className="text-xs mesh-muted mb-3">Run summary — batch_ef8a0d0c70</div>
            <div className="flex gap-6">
              <div>
                <div className="data text-2xl font-semibold">98.5%</div>
                <div className="text-xs mesh-muted mt-0.5">Detector F1</div>
              </div>
              <div>
                <div className="data text-2xl font-semibold">0.7%</div>
                <div className="text-xs mesh-muted mt-0.5">False positive rate</div>
              </div>
              <div>
                <div className="data text-2xl font-semibold">1000</div>
                <div className="text-xs mesh-muted mt-0.5">Batch size</div>
              </div>
            </div>
          </div>
          <div className="card p-5 flex flex-col justify-center gap-2.5">
            <BarRow label="Identify" pct={100} color="var(--accent)" />
            <BarRow label="Generate" pct={100} color="var(--legit)" />
            <BarRow label="Defend" pct={98} color="var(--accent-2)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
        <span>{label}</span>
        <span className="data">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
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
