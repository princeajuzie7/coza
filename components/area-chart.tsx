/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { Area, CartesianGrid, AreaChart as RechartsAreaChart, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";

export type BaseChartData = Record<string, string | number>;

export type ChartColor = "var(--chart-1)" | "var(--chart-2)" | "var(--chart-3)" | "var(--chart-4)" | "var(--chart-5)";

export type AreaChartSeries<T extends BaseChartData> = {
  key: Extract<keyof T, string>;
  color?: ChartColor;
  fillOpacity?: number;
};

interface AreaChartProps<T extends BaseChartData>
  extends Omit<React.ComponentProps<typeof ChartContainer>, "children">,
    MixinProps<"xAxis", Omit<React.ComponentProps<typeof XAxis>, "dataKey" | "key" | "ref">>,
    MixinProps<
      "tooltip",
      Omit<React.ComponentProps<typeof ChartTooltipContent>, "nameKey" | "labelFormatter" | "key" | "ref">
    >,
    MixinProps<"area", Omit<React.ComponentProps<typeof Area>, "dataKey" | "key" | "ref">>,
    MixinProps<"grid", React.ComponentProps<typeof CartesianGrid>> {
  data: T[];
  config: ChartConfig;
  xAxisKey: Extract<keyof T, string>;
  activeKey: Extract<keyof T, string>;
  color: ChartColor;
  series?: AreaChartSeries<T>[];
  xAxisFormatter?: (value: any) => string;
  tooltipLabelFormatter?: (value: any, payload?: any) => React.ReactNode;
  className?: string;
  showTooltip?: boolean;
  showXAxis?: boolean;
  // fade each area from its color at the top to near-transparent at the baseline
  gradient?: boolean;
  // ponytail: prevents tiny data max from stretching to full chart height
  yDomain?: [number | "auto", number | "auto" | ((dataMax: number) => number)];
}

export function AreaChart<T extends BaseChartData>({
  data,
  config,
  xAxisKey,
  activeKey,
  color,
  series,
  xAxisFormatter,
  tooltipLabelFormatter,
  className,
  showTooltip = true,
  showXAxis = true,
  gradient = false,
  yDomain,
  ...mixinProps
}: AreaChartProps<T>) {
  const uid = React.useId().replace(/:/g, "");
  const defaultFormatter = (value: any) => {
    if (value == null) return "";
    const date = new Date(value);

    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : String(value);
  };

  const formatX = xAxisFormatter || defaultFormatter;
  const formatTooltip = tooltipLabelFormatter || defaultFormatter;

  const { xAxis, tooltip, area, rest, grid } = splitProps(mixinProps, "xAxis", "tooltip", "area", "grid");

  const chartLabel =
    typeof rest["aria-label"] === "string"
      ? rest["aria-label"]
      : config[activeKey]?.label != null
        ? String(config[activeKey].label)
        : "Area chart";

  const areasToRender: AreaChartSeries<T>[] = series ?? [{ key: activeKey, color, fillOpacity: 0.2 }];
  const isMultiSeries = areasToRender.length > 1;

  return (
    <ChartContainer
      {...rest}
      config={config}
      role="img"
      aria-label={rest["aria-label"] ?? chartLabel}
      className={cn("aspect-auto h-[250px] w-full", className)}
    >
      <RechartsAreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
        {gradient && (
          <defs>
            {areasToRender.map((entry) => {
              const c = entry.color ?? `var(--color-${String(entry.key)})`;
              return (
                <linearGradient key={String(entry.key)} id={`${uid}-${String(entry.key)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={c} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>
        )}
        <CartesianGrid vertical={false} {...grid} />
        {yDomain && <YAxis hide domain={yDomain} />}

        {showXAxis && (
          <XAxis
            {...xAxis}
            dataKey={xAxisKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={formatX}
          />
        )}

        {showTooltip && (
          <ChartTooltip
            content={
              <ChartTooltipContent
                {...tooltip}
                className={cn(
                  "border-muted/40 w-fit gap-1 px-2.5 py-1.5 text-[11px] shadow-lg backdrop-blur-sm",
                  tooltip.className,
                  "min-w-30"
                )}
                labelClassName="font-medium text-muted-foreground/80 mb-0.5"
                nameKey={isMultiSeries ? undefined : activeKey}
                labelFormatter={formatTooltip}
              />
            }
          />
        )}

        {areasToRender.map((entry) => {
          const stroke = entry.color ?? `var(--color-${String(entry.key)})`;
          return (
            <Area
              key={String(entry.key)}
              type="monotone"
              stroke={stroke}
              fill={gradient ? `url(#${uid}-${String(entry.key)})` : stroke}
              fillOpacity={gradient ? 1 : (entry.fillOpacity ?? 0.2)}
              strokeWidth={2}
              // Live polling re-mounts this every 10s; replaying the grow-in is noise.
              isAnimationActive={false}
              {...(isMultiSeries ? {} : area)}
              dataKey={entry.key}
            />
          );
        })}
      </RechartsAreaChart>
    </ChartContainer>
  );
}
