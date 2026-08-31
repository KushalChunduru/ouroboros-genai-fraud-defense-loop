import { ReactNode } from "react";

export default function StepSection({
  id,
  index,
  title,
  status,
  divider = true,
  children,
}: {
  id: string;
  index: number;
  title: string;
  status: "done" | "current" | "pending";
  divider?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-10" style={divider ? { borderTop: "1px solid var(--border)" } : undefined}>
      <div className="flex items-center gap-3 mb-5">
        <span className="data badge-outline h-8 w-8 text-sm shrink-0" data-state={status}>
          {status === "done" ? "✓" : index}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
