"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * FadeIn — small declarative wrapper for the most common motion pattern
 * (fade up + slide). Keeps individual section files free of motion ceremony.
 *
 * Respects `prefers-reduced-motion`: Framer Motion's `useReducedMotion`
 * is honored automatically when we use the `whileInView` API.
 */
export interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /** Stagger delay before the animation begins. */
  delay?: number;
  /** Total duration in seconds. */
  duration?: number;
  /** Distance the element travels from below before settling. */
  y?: number;
  /** Trigger on mount (true) or on scroll into view (false, default). */
  immediate?: boolean;
  children: React.ReactNode;
}

export function FadeIn({
  delay = 0,
  duration = 0.5,
  y = 16,
  immediate = false,
  className,
  children,
  ...props
}: FadeInProps) {
  const variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0 },
  };

  const animationProps = immediate
    ? { initial: "hidden" as const, animate: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <motion.div
      {...animationProps}
      variants={variants}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
