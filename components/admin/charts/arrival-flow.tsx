"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CUTOFF_MINUTES, formatCutoff } from "@/lib/attendance";
import type { ArrivalBucket } from "@/lib/register";

const config = {
  early: { label: "Early", color: "var(--color-chart-1)" },
  late: { label: "Late", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

/**
 * The shape of the morning. Stacked because what matters is not just how many
 * arrived in a ten-minute window but how many of them were already late — and
 * the cutoff lines show exactly where the register turns.
 */
export function ArrivalFlow({ buckets }: { buckets: ArrivalBucket[] }) {
  if (buckets.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No arrivals recorded yet.</p>;
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={buckets} margin={{ left: -20, right: 8, top: 8 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" fontSize={11} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} width={40} />

        {(["workforce", "member"] as const).map((group) => (
          <ReferenceLine
            key={group}
            x={formatCutoff(CUTOFF_MINUTES[group]).replace(/:00 /, " ")}
            stroke="var(--color-muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{
              value: group === "member" ? "members" : "workforce",
              position: "insideTopRight",
              fontSize: 9,
              fill: "var(--color-muted-foreground)",
            }}
          />
        ))}

        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="early" stackId="a" fill="var(--color-early)" radius={[0, 0, 2, 2]} isAnimationActive={false} />
        <Bar dataKey="late" stackId="a" fill="var(--color-late)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
