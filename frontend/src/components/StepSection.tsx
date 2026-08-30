import { ReactNode } from "react";

export default function StepSection({
  id,
  index,
  title,
  status,
  children,
}: {
  id: string;
  index: number;
  title: string;
  status: "done" | "current" | "pending";
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-10 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3 mb-5">
        <span
          className="data h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0"
          style={{
            background: status === "done" ? "var(--legit)" : status === "current" ? "var(--accent)" : "var(--surface-2)",
            color: status === "pending" ? "var(--muted)" : status === "done" ? "#04231c" : "white",
            border: status === "pending" ? "1px solid var(--border)" : undefined,
          }}
        >
          {status === "done" ? "✓" : index}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
