"use client";

import Link from "next/link";
import OuroborosMark from "./OuroborosMark";

const LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#pillars", label: "How it works" },
  { href: "#loop", label: "Closed loop" },
  { href: "#features", label: "Console" },
];

export default function Nav() {
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <OuroborosMark size={18} />
          <span className="font-semibold tracking-tight text-sm">Ouroboros</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: "var(--muted)" }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <Link href="/console" className="btn btn-solid">
          Open console
        </Link>
      </div>
    </div>
  );
}
