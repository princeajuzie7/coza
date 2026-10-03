"use client";

import * as React from "react";

import {
  CUTOFF_MINUTES,
  GROUP_LABEL,
  type AttendeeGroup,
  type Punctuality,
  formatChurchDate,
  formatChurchTime,
  formatCutoff,
  punctuality,
  windowProgress,
} from "@/lib/attendance";
import { cn } from "@/lib/utils";

const subscribeToTick = (onTick: () => void) => {
  const id = setInterval(onTick, 1_000);
  return () => clearInterval(id);
};

/**
 * The wall clock is an external source, so subscribe to it rather than driving
 * it from an effect. The server snapshot is null, which is also what the client
 * renders first — hydration matches, and the time fills in a tick later.
 */
export function useNow(paused = false): Date | null {
  // Pausing unsubscribes and latches the last reading, so the clock stops dead
  // at the moment of submission instead of ticking on under the stamp.
  const latched = React.useRef<number | null>(null);

  const subscribe = React.useCallback(
    (onTick: () => void) => (paused ? () => {} : subscribeToTick(onTick)),
    [paused]
  );

  const getSnapshot = React.useCallback(() => {
    if (paused && latched.current !== null) return latched.current;
    latched.current = Math.floor(Date.now() / 1_000); // stable within a tick, as the store contract requires
    return latched.current;
  }, [paused]);

  const seconds = React.useSyncExternalStore(subscribe, getSnapshot, () => null);

  return React.useMemo(() => (seconds === null ? null : new Date(seconds * 1_000)), [seconds]);
}

/**
 * The live half of the ticket stub. Sits on the group's own ink, so the colour
 * carries the identity and the type can stay plain.
 */
export function StubClock({ group, frozen = false }: { group: AttendeeGroup; frozen?: boolean }) {
  const now = useNow(frozen);
  const verdict: Punctuality | null = now ? punctuality(group, now) : null;
  const progress = now ? windowProgress(group, now) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">Check-in</p>
          <p className="mt-1 text-[22px] leading-none font-extrabold tracking-tight">{GROUP_LABEL[group]}</p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">
            {verdict === "late" ? "Closed" : "Closes"}
          </p>
          <p className="mt-1 font-mono text-[22px] leading-none font-semibold tabular-nums">
            {formatCutoff(CUTOFF_MINUTES[group])}
          </p>
        </div>
      </div>

      <div>
        <p className="font-mono text-[clamp(2.6rem,13vw,4.5rem)] leading-none font-semibold tracking-tighter tabular-nums">
          {now ? formatChurchTime(now, true).replace(/\s?[AP]M$/i, "") : "--:--:--"}
          <span className="ml-2 align-baseline font-sans text-sm font-bold tracking-normal uppercase opacity-60">
            {now ? (formatChurchTime(now).match(/[AP]M/i)?.[0] ?? "") : ""}
          </span>
        </p>
        <p className="mt-2 text-[13px] font-medium opacity-70">{now ? formatChurchDate(now) : " "}</p>
      </div>

      {/* How much of the early window is spent. Fills, then goes solid when shut. */}
      <div className="h-1 overflow-hidden rounded-full bg-black/20">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            verdict === "late" ? "bg-black/45" : "bg-white/85"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="text-[11px] leading-relaxed opacity-60">
        {verdict === "late"
          ? "The early window has closed — you will be recorded as late."
          : "You are inside the early window. Submit before the time above."}
      </p>
    </div>
  );
}
