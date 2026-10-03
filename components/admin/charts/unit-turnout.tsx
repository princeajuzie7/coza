"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { UnitCount } from "@/lib/register";

const config = { present: { label: "Serving", color: "var(--color-chart-2)" } } satisfies ChartConfig;

/** Horizontal, because unit names are words — rotating them to fit is a tell. */
export function UnitTurnout({ units }: { units: UnitCount[] }) {
  if (units.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No workforce checked in yet.</p>;
  }

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(180, units.length * 34) }}>
      <BarChart data={units} layout="vertical" margin={{ left: 4, right: 28 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="unit"
          tickLine={false}
          axisLine={false}
          width={132}
          fontSize={11}
          tickMargin={6}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="present" fill="var(--color-present)" radius={4} barSize={16} isAnimationActive={false}>
          <LabelList dataKey="present" position="right" offset={8} fontSize={11} className="fill-foreground" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
