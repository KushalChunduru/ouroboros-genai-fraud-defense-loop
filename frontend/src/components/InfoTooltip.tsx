"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const [shift, setShift] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

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

  // Clamp back into the viewport -- fixed left/right offsets aren't enough
  // since this trigger sits inline in wrapping paragraph text and can land
  // anywhere from the left edge to the right edge of the screen.
  useLayoutEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const overflowRight = rect.right - (window.innerWidth - 8);
    const overflowLeft = 8 - rect.left;
    if (overflowRight > 0) setShift(-overflowRight);
    else if (overflowLeft > 0) setShift(overflowLeft);
    else setShift(0);
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
        <span
          ref={panelRef}
          role="tooltip"
          className="card-2 absolute z-30 p-3 text-xs"
          style={{
            display: "block",
            top: "calc(100% + 6px)",
            [align]: 0,
            width: 240,
            transform: shift ? `translateX(${shift}px)` : undefined,
            boxShadow: "var(--shadow-lg)",
            textTransform: "none",
            letterSpacing: "normal",
            fontWeight: 400,
          }}
        >
          {title && <span className="font-medium mb-1" style={{ display: "block", color: "var(--accent)" }}>{title}</span>}
          <span style={{ display: "block", color: "var(--muted)" }}>{children}</span>
        </span>
      )}
    </span>
  );
}
