"use client";

import * as React from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * ScrollReveal — parallax-style scroll-linked transform.
 *
 * Useful for hero text that should drift up as the user scrolls, or images
 * that subtly shift in/out of view to add depth. Don't overuse — one or
 * two scroll-linked elements per page is plenty.
 */
export interface ScrollRevealProps {
  /** Vertical drift amount in pixels (positive = element moves down). */
  yRange?: [number, number];
  /** Opacity range as user scrolls. */
  opacityRange?: [number, number];
  className?: string;
  children: React.ReactNode;
}

export function ScrollReveal({
  yRange = [0, -50],
  opacityRange = [1, 0.6],
  className,
  children,
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y: MotionValue<number> = useTransform(scrollYProgress, [0, 1], yRange);
  const opacity: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    opacityRange,
  );

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
