"use client";

import Link from "next/link";
import NetworkCanvas from "./NetworkCanvas";
import OrbitalLoops from "./OrbitalLoops";
import OuroborosMark from "./OuroborosMark";

const LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#pillars", label: "How it works" },
  { href: "#loop", label: "Closed loop" },
  { href: "#features", label: "Features" },
];

export default function FramedHero() {
  return (
    <div className="relative px-3 pt-3 md:px-5 md:pt-5">
      {/* Bleed glow: color escapes past the frame edges, like light spilling around a screen. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-40" style={{ background: "var(--accent)", filter: "blur(90px)" }} />
        <div className="absolute -top-16 right-0 h-80 w-80 rounded-full opacity-30" style={{ background: "#a94fc0", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-25" style={{ background: "var(--accent-2)", filter: "blur(100px)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto rounded-[28px] border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="hero-sky" />
        <div className="absolute inset-0" style={{ maskImage: "linear-gradient(to bottom, black 30%, transparent 90%)" }}>
          <NetworkCanvas />
        </div>

        <div className="relative flex flex-col">
          <nav className="flex items-center justify-between gap-4 px-6 md:px-10 pt-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <OuroborosMark size={17} />
              </div>
              <span className="font-semibold tracking-tight">Ouroboros</span>
            </Link>

            <div className="hidden md:flex items-center gap-7 text-sm" style={{ color: "rgba(231,233,245,0.75)" }}>
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>

            <Link
              href="/console"
              className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
            >
              Launch Console
              <span className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "white", color: "#0b0d14" }}>
                →
              </span>
            </Link>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 items-center px-6 md:px-10 py-16 md:py-24">
            <div>
              <div
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(231,233,245,0.85)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-2)" }} />
                Mastercard Innovation Challenge · GFF 2026
              </div>

              <h1 className="text-4xl md:text-[3.4rem] font-semibold tracking-tight leading-[1.05] text-white">
                The attack and the defense, trained in the same loop
              </h1>

              <p className="mt-5 text-base max-w-md" style={{ color: "rgba(231,233,245,0.7)" }}>
                Ouroboros identifies emerging GenAI-powered payment fraud, simulates it at scale, and defends
                against it with a fused detector — then runs the whole system as a self-play arms race so the
                defense&apos;s own blind spots become tomorrow&apos;s attack hypotheses.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link
                  href="/console"
                  className="flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full font-medium transition-transform hover:-translate-y-0.5"
                  style={{ background: "white", color: "#0b0d14" }}
                >
                  Launch the console
                  <span className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "#0b0d14", color: "white" }}>
                    →
                  </span>
                </Link>
                <a
                  href="#pillars"
                  className="px-6 py-2.5 rounded-full font-medium transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="hidden md:block h-80">
              <OrbitalLoops />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
