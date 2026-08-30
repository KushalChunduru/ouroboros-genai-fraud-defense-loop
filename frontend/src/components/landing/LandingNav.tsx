"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#pillars", label: "How it works" },
  { href: "#loop", label: "Closed loop" },
  { href: "#features", label: "Features" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-0 z-20 transition-colors"
      style={{
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        background: scrolled ? "rgba(11,13,20,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-base font-bold"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            &#8734;
          </div>
          <span className="font-semibold tracking-tight">Ouroboros</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <Link href="/console" className="btn-primary px-4 py-2 rounded-full text-sm font-medium">
          Launch Console →
        </Link>
      </div>
    </div>
  );
}
