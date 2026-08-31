"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Click-to-open info popover, not hover-only -- works on touch devices, and
 * is the actual pattern fintech dashboards (Stripe, Mercury) use for
 * explaining jargon inline rather than a wall of always-visible caption
 * text. Closes on outside click or Escape.
 */
export default function InfoTooltip({
  title, children, align = "left",
}: {
  title?: string; children: ReactNode; align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={title ? `More info: ${title}` : "More info"}
        aria-expanded={open}
        className="badge-outline h-4 w-4 text-[9px] shrink-0 leading-none"
        style={{ cursor: "pointer", textTransform: "none" }}
      >
        i
      </button>
      {open && (
        <div
          role="tooltip"
          className="card-2 absolute z-30 p-3 text-xs"
          style={{
            top: "calc(100% + 6px)",
            [align]: 0,
            width: 240,
            boxShadow: "0 12px 28px -8px rgba(0,0,0,0.55)",
            textTransform: "none",
            letterSpacing: "normal",
            fontWeight: 400,
          }}
        >
          {title && <div className="font-medium mb-1" style={{ color: "var(--accent)" }}>{title}</div>}
          <div style={{ color: "var(--muted)" }}>{children}</div>
        </div>
      )}
    </span>
  );
}
