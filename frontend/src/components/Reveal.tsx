"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

/**
 * Scroll-reveal wrapper: content arrives once as it enters view. Used only on
 * section-level content (never per-card in a grid, never repeatedly) so it
 * reads as "the page is loading in" rather than a decorative loop.
 */
export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
