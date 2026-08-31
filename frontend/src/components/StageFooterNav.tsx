"use client";

import Link from "next/link";
import { useConsole } from "./ConsoleContext";

/* Keeps the split-into-pages workflow feeling like one run, not five
   disconnected screens: every stage page ends with an explicit link to
   whatever comes next (or back), so the sequence the sidebar implies is
   also walkable start to finish without hunting for the right nav item. */
export default function StageFooterNav({ currentId }: { currentId: string }) {
  const { stages } = useConsole();
  const i = stages.findIndex((s) => s.id === currentId);
  const prev = i > 0 ? stages[i - 1] : null;
  const next = i >= 0 && i < stages.length - 1 ? stages[i + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="flex items-center justify-between gap-4 mt-4 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
      {prev ? (
        <Link href={prev.href} className="btn btn-ghost">
          &larr; {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="btn btn-solid">
          Continue to {next.label} &rarr;
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
