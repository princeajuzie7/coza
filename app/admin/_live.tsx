"use client";

import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useNow } from "@/components/live-clock";
import { formatChurchTime, serviceDate } from "@/lib/attendance";
import { cn } from "@/lib/utils";

const REFRESH_MS = 10_000;

/**
 * Requirement #3, without a socket: re-run the server component on a timer.
 * router.refresh() streams a fresh RSC payload into the existing tree, so the
 * table's filters, sort order and selected tab all survive the update.
 *
 * It reads the date from the URL itself so it can stop polling on an archived
 * service — refreshing a day that cannot change is just noise.
 *
 * ponytail: polling is right until a steward notices a name appearing late
 * enough to matter. Swap for a stream only if 10s proves too slow in the lobby.
 */
export function LiveIndicator() {
  const router = useRouter();
  const params = useSearchParams();
  const now = useNow();

  const date = params.get("date");
  const isLive = !date || date === serviceDate(new Date());

  React.useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [isLive, router]);

  return (
    <span className="text-muted-foreground inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
      <span className="relative flex size-1.5">
        {isLive && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
        )}
        <span
          className={cn("relative inline-flex size-1.5 rounded-full", isLive ? "bg-emerald-500" : "bg-muted-foreground/40")}
        />
      </span>
      {isLive ? <>Live · {now ? formatChurchTime(now, true) : "--:--:--"}</> : <>Archive · {date}</>}
    </span>
  );
}
