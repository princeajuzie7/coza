"use client";

import { AreaChart } from "@/components/area-chart";
import { BarChart } from "@/components/bar-chart";
import type { ChartConfig } from "@/components/ui/chart";

const shortDate = (iso: unknown) =>
  new Date(`${String(iso)}T09:00:00Z`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

const turnoutConfig = { total: { label: "On the register", color: "var(--chart-1)" } } satisfies ChartConfig;
const onTimeConfig = { onTimeRate: { label: "On time", color: "var(--chart-2)" } } satisfies ChartConfig;

export function TurnoutBars({ data }: { data: Array<{ serviceDate: string; total: number }> }) {
  return (
    <BarChart
      data={data}
      config={turnoutConfig}
      categoryKey="serviceDate"
      activeKey="total"
      color="var(--chart-1)"
      categoryFormatter={shortDate}
      tooltipLabelFormatter={shortDate}
      hideValueAxis
      // Through the `bar` mixin: live polling re-mounts this every 10s and
      // replaying the grow-in each time is noise.
      barIsAnimationActive={false}
      barRadius={6}
      className="h-[180px]"
    />
  );
}

export function OnTimeArea({ data }: { data: Array<{ serviceDate: string; onTimeRate: number }> }) {
  return (
    <AreaChart
      data={data}
      config={onTimeConfig}
      xAxisKey="serviceDate"
      activeKey="onTimeRate"
      color="var(--chart-2)"
      gradient
      xAxisFormatter={shortDate}
      tooltipLabelFormatter={shortDate}
      // A tiny spread across the last few services would otherwise fill the
      // panel and read as a dramatic swing.
      yDomain={[0, 100]}
      gridStrokeDasharray="3 3"
      className="h-[180px]"
    />
  );
}
