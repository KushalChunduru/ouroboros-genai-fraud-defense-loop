"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import NetworkCanvas from "./NetworkCanvas";

export default function Hero() {
  const [vectors, setVectors] = useState<number | null>(null);

  useEffect(() => {
    api.health().then((h) => setVectors(h.vectors)).catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 95%)" }}>
        <NetworkCanvas />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="flex flex-col items-center text-center gap-6">
          <div
            className="text-xs px-3 py-1 rounded-full card-2 inline-flex items-center gap-2"
            style={{ color: "var(--muted)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-2)" }} />
            Mastercard Innovation Challenge · GFF 2026
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            The attack and the defense,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              trained in the same loop
            </span>
          </h1>

          <p className="text-base md:text-lg max-w-2xl" style={{ color: "var(--muted)" }}>
            Ouroboros identifies emerging GenAI-powered payment fraud, simulates it with entity-level fidelity at
            scale, and defends against it with a fused detector — then runs the whole system as a self-play arms
            race so the defense&apos;s own blind spots become tomorrow&apos;s attack hypotheses.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link href="/console" className="btn-primary px-6 py-3 rounded-full font-medium">
              Launch the console →
            </Link>
            <a href="#pillars" className="card-2 card-hover px-6 py-3 rounded-full font-medium hover:-translate-y-0.5">
              See how it works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm" style={{ color: "var(--muted)" }}>
            <Stat value={vectors ?? 15} label="grounded attack vectors" />
            <Divider />
            <Stat value="3" label="pillars, one closed loop" />
            <Divider />
            <Stat value="2" label="self-improving feedback loops" />
            <Divider />
            <Stat value="0" label="real PII — fully synthetic" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
        {value}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="hidden sm:inline h-4 w-px" style={{ background: "var(--border)" }} />;
}
