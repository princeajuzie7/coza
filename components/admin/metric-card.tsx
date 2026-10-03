import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { TrendDownIcon, TrendUpIcon } from "./icons";

/**
 * A headline figure with its own chart beneath it: title and delta on one line,
 * the number big enough to read across a desk, a hairline, then the series.
 * The chart is the evidence for the number, not decoration beside it.
 */
export function MetricCard({
  title,
  caption,
  value,
  unit,
  delta,
  deltaLabel,
  children,
  className,
}: {
  title: string;
  caption: string;
  value: string | number;
  unit?: string;
  /** Percentage change. `null` means there is no baseline to compare against. */
  delta?: number | null;
  deltaLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-card flex flex-col rounded-xl border", className)}>
      <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">{caption}</p>
        </div>
        <Delta value={delta} label={deltaLabel} />
      </header>

      <p className="flex items-baseline gap-2 px-5 pt-5 sm:px-6">
        <span className="font-mono text-[clamp(1.9rem,3.5vw,2.6rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
          {value}
        </span>
        {unit && <span className="text-muted-foreground text-[13px] font-medium">{unit}</span>}
      </p>

      <div className="border-border/70 mt-5 border-t pt-2 pb-2">{children}</div>
    </section>
  );
}

function Delta({ value, label }: { value?: number | null; label?: string }) {
  if (value === undefined) return null;

  // No baseline: say so rather than printing a number that means nothing.
  if (value === null) {
    return (
      <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-1 font-mono text-[10px] font-semibold tracking-wide">
        new
      </span>
    );
  }

  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums",
        up ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" : "bg-red-500/12 text-red-700 dark:text-red-400"
      )}
      title={label}
    >
      <HugeiconsIcon icon={up ? TrendUpIcon : TrendDownIcon} size={12} strokeWidth={2.4} />
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}
