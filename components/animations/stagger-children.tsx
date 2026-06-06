"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * StaggerChildren — orchestrates a staggered fade-up on direct children.
 *
 * Each direct child becomes a motion item that fades in sequence. Use it
 * to bring in a row of feature cards, a grid of USPs, or a vertical list.
 *
 * Pair with `<StaggerItem>` to opt children into the choreography. Plain
 * children that aren't wrapped in StaggerItem just render normally.
 */
export interface StaggerChildrenProps extends Omit<HTMLMotionProps<"div">, "children"> {
  staggerDelay?: number;
  initialDelay?: number;
  children: React.ReactNode;
}

export function StaggerChildren({
  staggerDelay = 0.1,
  initialDelay = 0,
  className,
  children,
  ...props
}: StaggerChildrenProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function StaggerItem({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children: React.ReactNode }) {
  return (
    <motion.div
      variants={itemVariants}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
