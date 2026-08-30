"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Counts up to `value` when it changes -- used only for numbers that were
 * just computed (detector metrics), so the motion communicates "this was
 * just scored," not decoration on a number that was always there.
 */
export default function Counter({ value, decimals = 1, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = value.toFixed(decimals) + suffix;
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = v.toFixed(decimals) + suffix;
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref} className="data">{(0).toFixed(decimals)}{suffix}</span>;
}
