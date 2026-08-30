"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function StatsStrip() {
  const [vectors, setVectors] = useState<number | null>(null);

  useEffect(() => {
    api.health().then((h) => setVectors(h.vectors)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm" style={{ color: "var(--muted)" }}>
      <Stat value={vectors ?? 15} label="grounded attack vectors" />
      <Divider />
      <Stat value="3" label="pillars, one closed loop" />
      <Divider />
      <Stat value="2" label="self-improving feedback loops" />
      <Divider />
      <Stat value="0" label="real PII — fully synthetic" />
    </div>
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
