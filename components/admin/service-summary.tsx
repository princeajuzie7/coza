import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { STATUS_STYLE } from "@/lib/attendance";
import type { RegisterStats } from "@/lib/register";
import { cn } from "@/lib/utils";
import { ClockIcon, OnlineIcon, PhoneIcon } from "./icons";

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

/**
 * Replaces the row of six equal cells. Three problems with that shape: it gave
 * a headline total and an operational to-do the same weight, it left the
 * baseline ragged where only some cells had a sub-line, and — worst — it showed
 * Early and Late as two unrelated numbers when they are the two halves of the
 * total. Here the total leads, the split is drawn as the one proportion it
 * actually is, and the rest sit underneath as secondary readouts.
 */
export function ServiceSummary({
  stats,
  services,
  rangeLabel,
}: {
  stats: RegisterStats;
  services: number;
  rangeLabel: string;
}) {
  const earlyPct = pct(stats.early, stats.total);
  const latePct = 100 - earlyPct;

  return (
    <section className="bg-card overflow-hidden rounded-xl border">
      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12">
        {/* The headline figure, given the room it deserves. */}
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">Check-ins in range</p>
          <p className="mt-3 font-mono text-[clamp(2.5rem,6vw,3.75rem)] leading-none font-semibold tracking-[-0.045em] tabular-nums">
            {stats.total.toLocaleString()}
          </p>
          <p className="text-muted-foreground/70 mt-3 text-[11px]">{rangeLabel}</p>
        </div>

        {/* One bar, because this is one quantity split two ways. */}
        <div className="min-w-0">
          {/* No "62% on time" figure here: the legend below already carries the
              share, and the Punctuality card headlines it. One number, one home. */}
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
            Early / late split
          </p>

          <div className="mt-3 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            <div className={cn("h-full rounded-l-full", STATUS_STYLE.early.dot)} style={{ width: `${earlyPct}%` }} />
            <div className={cn("h-full rounded-r-full", STATUS_STYLE.late.dot)} style={{ width: `${latePct}%` }} />
          </div>

          <dl className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <Leg label="Early" value={stats.early} share={earlyPct} dot={STATUS_STYLE.early.dot} note="beat their cutoff" />
            <Leg label="Late" value={stats.late} share={latePct} dot={STATUS_STYLE.late.dot} note="after the cutoff" />
          </dl>
        </div>
      </div>

      {/* Secondary readouts: smaller, because they are not the headline. */}
      <dl className="border-border/70 grid grid-cols-1 border-t sm:grid-cols-3 sm:divide-x sm:divide-border/70">
        <Secondary
          icon={ClockIcon}
          label="Average per service"
          value={services === 0 ? 0 : Math.round(stats.total / services)}
          note={`across ${services} ${services === 1 ? "service" : "services"}`}
        />
        <Secondary
          icon={OnlineIcon}
          label="Joined online"
          value={stats.online}
          share={pct(stats.online, stats.total)}
          note="on eChurch"
        />
        <Secondary
          icon={PhoneIcon}
          label="No email on file"
          value={stats.noEmail}
          share={pct(stats.noEmail, stats.total)}
          note="reach these by phone"
          emphasis
        />
      </dl>
    </section>
  );
}

function Leg({
  label,
  value,
  share,
  dot,
  note,
}: {
  label: string;
  value: number;
  share: number;
  dot: string;
  note: string;
}) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className={cn("size-1.5 shrink-0 translate-y-[-1px] rounded-full", dot)} />
      <dt className="text-[13px] font-medium">{label}</dt>
      <dd className="font-mono text-[15px] font-semibold tabular-nums">
        {value.toLocaleString()}
        <span className="text-muted-foreground/60 ml-1.5 text-[11px] font-normal">{share}%</span>
      </dd>
      <span className="text-muted-foreground/50 hidden text-[11px] sm:inline">{note}</span>
    </div>
  );
}

function Secondary({
  icon,
  label,
  value,
  share,
  note,
  emphasis,
}: {
  icon: IconSvgElement;
  label: string;
  value: number;
  share?: number;
  note: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border-border/70 flex items-center gap-4 border-t px-5 py-4 first:border-t-0 sm:border-t-0 sm:px-6">
      <HugeiconsIcon
        icon={icon}
        size={17}
        strokeWidth={1.8}
        className={cn("shrink-0", emphasis ? "text-brand-orange" : "text-muted-foreground/60")}
      />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">{label}</p>
        <p className="text-muted-foreground/60 mt-1 truncate text-[11px]">{note}</p>
      </div>
      <p className="shrink-0 text-right">
        <span className="font-mono text-[22px] leading-none font-semibold tabular-nums">{value.toLocaleString()}</span>
        {share !== undefined && (
          <span className="text-muted-foreground/60 mt-1 block font-mono text-[10px] tabular-nums">{share}%</span>
        )}
      </p>
    </div>
  );
}
