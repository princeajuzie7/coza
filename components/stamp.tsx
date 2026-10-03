"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Seconds from mount to the moment the stamp hits the card. Exported so the
 * recoil and the staggered details key off one number rather than three
 * hand-tuned delays that drift apart the first time anyone edits this.
 */
export const STAMP_IMPACT = 0.31;

const DROP_DURATION = 0.5;

/**
 * A rubber stamp, animated as the object it is: it falls, accelerating, hits
 * hard, overshoots by a degree or two and settles. No spring — a stamp thuds,
 * it does not bounce. The blur clears as it lands, which is what a thing
 * arriving at speed actually looks like.
 */
export function Stamp({ label, className }: { label: string; className?: string }) {
  const reduceMotion = useReducedMotion();

  const classes = cn(
    "inline-block shrink-0 rounded-md border-[2.5px] border-current px-3 py-1.5 font-mono text-[15px] font-bold tracking-[0.14em] uppercase",
    className
  );

  // Honour the OS setting: the information is the word, not the motion.
  if (reduceMotion) return <span className={cn(classes, "-rotate-6")}>{label}</span>;

  return (
    <motion.span
      className={classes}
      initial={{ y: -170, scale: 2.6, rotate: -26, opacity: 0, filter: "blur(4px)" }}
      animate={{
        y: [-170, 5, 0],
        scale: [2.6, 0.93, 1],
        rotate: [-26, -2, -6],
        opacity: [0, 1, 1],
        filter: ["blur(4px)", "blur(0px)", "blur(0px)"],
      }}
      transition={{
        duration: DROP_DURATION,
        times: [0, STAMP_IMPACT / DROP_DURATION, 1],
        // Accelerate into the card, then settle out of the overshoot.
        ease: ["easeIn", "easeOut"],
      }}
    >
      {label}
    </motion.span>
  );
}
