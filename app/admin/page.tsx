import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";

import { ArrivalFlow } from "@/components/admin/charts/arrival-flow";
import {
  OnTimeArea,
  TurnoutBars,
} from "@/components/admin/charts/service-series";
import { MetricCard } from "@/components/admin/metric-card";
import { UnitTurnout } from "@/components/admin/charts/unit-turnout";
import { ArrowIcon } from "@/components/admin/icons";
import { ServiceSummary } from "@/components/admin/service-summary";
import { PageHead, Panel } from "@/components/admin/shell";
import { ServiceRange } from "@/components/admin/service-range";
import { getCheckInsInRange, getServiceTotalsInRange } from "@/db/queries";
import {
  CUTOFF_MINUTES,
  GROUP_LABEL,
  formatChurchDate,
  formatCutoff,
} from "@/lib/attendance";

const shortDate = (iso: string) =>
  new Date(`${iso}T09:00:00Z`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
import {
  arrivalBuckets,
  percentDelta,
  standingBreakdown,
  summarise,
  unitBreakdown,
} from "@/lib/register";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview · TrackMate" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ from?: string; to?: string }> };

const isDate = (v?: string) =>
  v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;

export default async function OverviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const from = isDate(sp.from);
  const to = isDate(sp.to);

  const [rows, trend] = await Promise.all([
    getCheckInsInRange(from, to),
    getServiceTotalsInRange(from, to),
  ]);

  // Absence only means something for a single service, so it is the register's
  // job, not this page's — a range cannot be "absent".
  const stats = summarise(rows, 0);
  const standings = standingBreakdown(rows);

  const services = trend.length;
  const current = trend.at(-1);
  const previous = trend.at(-2);
  const onTimeRate =
    stats.total === 0 ? 0 : Math.round((stats.early / stats.total) * 100);
  const turnoutDelta =
    current && previous
      ? percentDelta(current.total, previous.total)
      : undefined;
  const onTimeDelta =
    current && previous
      ? percentDelta(current.onTimeRate, previous.onTimeRate)
      : undefined;

  const rangeLabel =
    services === 0
      ? "No services on record"
      : services === 1
        ? formatChurchDate(new Date(`${trend[0]!.serviceDate}T09:00:00Z`))
        : `${services} services · ${shortDate(trend[0]!.serviceDate)} – ${shortDate(trend.at(-1)!.serviceDate)}`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10">
      <PageHead eyebrow="Attendance overview" title={rangeLabel}>
        <ServiceRange />
      </PageHead>

      <ServiceSummary
        stats={stats}
        services={services}
        rangeLabel={rangeLabel}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <MetricCard
          title="Turnout"
          caption="On the register, service by service"
          value={(current?.total ?? 0).toLocaleString()}
          unit="latest service"
          delta={turnoutDelta}
          deltaLabel="vs the previous service"
        >
          <TurnoutBars data={trend} />
        </MetricCard>

        <MetricCard
          title="Punctuality"
          caption="Share beating their own cutoff"
          value={`${onTimeRate}%`}
          unit="on time"
          delta={onTimeDelta}
          deltaLabel="vs the previous service"
        >
          <OnTimeArea data={trend} />
        </MetricCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Arrival flow"
          caption={`Arrivals across every service in range, in ten-minute windows. Dashed lines mark the cutoffs — workforce ${formatCutoff(
            CUTOFF_MINUTES.workforce,
          )}, members ${formatCutoff(CUTOFF_MINUTES.member)}.`}
          action={
            <Link
              href="/admin/register"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              Open register
              <HugeiconsIcon icon={ArrowIcon} size={14} strokeWidth={2} />
            </Link>
          }
        >
          <ArrivalFlow buckets={arrivalBuckets(rows)} />
        </Panel>

        <Panel
          title="Who came"
          caption="Members and workforce, and how they attended."
        >
          <dl className="space-y-0">
            <SplitRow
              label={`${GROUP_LABEL.member}s`}
              value={stats.members}
              total={stats.total}
              tone="bg-chart-1"
            />
            <SplitRow
              label={GROUP_LABEL.workforce}
              value={stats.workforce}
              total={stats.total}
              tone="bg-chart-2"
            />
            <SplitRow
              label="Joined online"
              value={stats.online}
              total={stats.total}
              tone="bg-chart-3"
            />
          </dl>

          <div className="border-border/70 mt-6 border-t pt-5">
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
              Standing
            </p>
            <dl className="mt-4 space-y-0">
              {standings.map((s) => (
                <SplitRow
                  key={s.standing}
                  label={s.label}
                  value={s.count}
                  total={stats.total}
                  tone="bg-foreground/70"
                />
              ))}
            </dl>
          </div>
        </Panel>
      </div>

      <Panel
        title="Workforce by unit"
        caption="Who turned up to serve this morning."
      >
        <UnitTurnout units={unitBreakdown(rows)} />
      </Panel>
    </div>
  );
}

/** Label, count, and a proportion bar — a sparkline for one number. */
function SplitRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="border-border/60 flex items-center gap-4 border-b py-3 last:border-b-0">
      <dt className="w-32 shrink-0 text-[13px] font-medium">{label}</dt>
      <dd className="flex flex-1 items-center gap-3">
        <span className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
          <span
            className={cn("block h-full rounded-full transition-[width]", tone)}
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="w-14 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums">
          {value}
          <span className="text-muted-foreground/60 ml-1 text-[10px]">
            {pct}%
          </span>
        </span>
      </dd>
    </div>
  );
}
