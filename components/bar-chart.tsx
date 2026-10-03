/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";
import { Bar, CartesianGrid, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";

export type BaseChartData = Record<string, string | number>;

export type ChartColor = "var(--chart-1)" | "var(--chart-2)" | "var(--chart-3)" | "var(--chart-4)" | "var(--chart-5)";

export type BarChartLayout = "horizontal" | "vertical";

interface BarChartProps<T extends BaseChartData>
  extends
    Omit<React.ComponentProps<typeof ChartContainer>, "children">,
    MixinProps<"xAxis", Omit<React.ComponentProps<typeof XAxis>, "dataKey" | "key" | "ref">>,
    MixinProps<"yAxis", Omit<React.ComponentProps<typeof YAxis>, "dataKey" | "key" | "ref">>,
    MixinProps<
      "tooltip",
      Omit<React.ComponentProps<typeof ChartTooltipContent>, "nameKey" | "labelFormatter" | "key" | "ref">
    >,
    MixinProps<"bar", Omit<React.ComponentProps<typeof Bar>, "dataKey" | "key" | "ref" | "fill">>,
    MixinProps<"grid", React.ComponentProps<typeof CartesianGrid>> {
  data: T[];
  config: ChartConfig;
  categoryKey: Extract<keyof T, string>;
  activeKey: Extract<keyof T, string>;
  color: ChartColor;
  layout?: BarChartLayout;
  categoryFormatter?: (value: any) => string;
  tooltipLabelFormatter?: (value: any, payload?: any) => React.ReactNode;
  className?: string;
  showTooltip?: boolean;
  showCategoryAxis?: boolean;
  hideValueAxis?: boolean;
}

export function BarChart<T extends BaseChartData>({
  data,
  config,
  categoryKey,
  activeKey,
  color,
  layout = "horizontal",
  categoryFormatter,
  tooltipLabelFormatter,
  className,
  showTooltip = true,
  showCategoryAxis = true,
  hideValueAxis = false,
  ...mixinProps
}: BarChartProps<T>) {
  const defaultCategoryFormatter = (value: any) => {
    if (value == null) return "";
    const str = String(value);
    return str.length > 12 ? `${str.slice(0, 12)}…` : str;
  };

  const formatCategory = categoryFormatter ?? defaultCategoryFormatter;
  const formatTooltip = tooltipLabelFormatter ?? ((value: any) => formatCategory(value));

  const { xAxis, yAxis, tooltip, bar, rest, grid } = splitProps(mixinProps, "xAxis", "yAxis", "tooltip", "bar", "grid");

  const isHorizontalBars = layout === "vertical";

  const chartLabel =
    typeof rest["aria-label"] === "string"
      ? rest["aria-label"]
      : config[activeKey]?.label != null
        ? String(config[activeKey].label)
        : "Bar chart";

  const fill = `var(--color-${activeKey})`;
  const defaultBarRadius: React.ComponentProps<typeof Bar>["radius"] = isHorizontalBars ? [0, 4, 4, 0] : 8;
  const defaultMargin = isHorizontalBars
    ? { left: 4, right: 12, top: 4, bottom: 4 }
    : { left: 12, right: 12, top: 4, bottom: 4 };

  return (
    <ChartContainer
      {...rest}
      config={config}
      role="img"
      aria-label={rest["aria-label"] ?? chartLabel}
      className={cn("aspect-auto h-[250px] w-full", className)}
    >
      <RechartsBarChart
        accessibilityLayer
        data={data}
        layout={isHorizontalBars ? "vertical" : "horizontal"}
        margin={defaultMargin}
      >
        <CartesianGrid vertical={isHorizontalBars} horizontal={!isHorizontalBars} {...grid} />

        {isHorizontalBars ? (
          <>
            {showCategoryAxis && (
              <YAxis
                type="category"
                dataKey={categoryKey}
                width={yAxis.width ?? 64}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={formatCategory}
                {...yAxis}
              />
            )}
            <XAxis type="number" hide={hideValueAxis} tickLine={false} axisLine={false} {...xAxis} />
          </>
        ) : (
          <>
            {showCategoryAxis && (
              <XAxis
                dataKey={categoryKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatCategory}
                {...xAxis}
              />
            )}
            <YAxis type="number" hide={hideValueAxis} tickLine={false} axisLine={false} {...yAxis} />
          </>
        )}

        {showTooltip && (
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                {...tooltip}
                className={cn(
                  "border-muted/40 w-fit min-w-[120px] gap-1 px-2 py-1.5 text-[11px] shadow-lg backdrop-blur-sm",
                  tooltip.className
                )}
                labelClassName="font-medium text-muted-foreground/80 mb-0.5"
                nameKey={activeKey}
                labelFormatter={formatTooltip}
              />
            }
          />
        )}

        <Bar
          dataKey={activeKey}
          fill={fill}
          radius={defaultBarRadius}
          barSize={isHorizontalBars ? 14 : undefined}
          {...bar}
        />
      </RechartsBarChart>
    </ChartContainer>
  );
}

/**
 * USAGE EXAMPLE
 *
 * const chartConfig = {
 *   sessions: { label: "Sessions", color: "var(--chart-1)" },
 * } satisfies ChartConfig;
 *
 * // Vertical bars (category on X)
 * <BarChart
 *   data={data}
 *   config={chartConfig}
 *   categoryKey="month"
 *   activeKey="sessions"
 *   color="var(--chart-1)"
 *   categoryFormatter={(v) => String(v).slice(0, 3)}
 * />
 *
 * // Horizontal bars (category on Y)
 * <BarChart
 *   data={platformData}
 *   config={chartConfig}
 *   categoryKey="platform"
 *   activeKey="sessions"
 *   color="var(--chart-1)"
 *   layout="vertical"
 *   tooltipHideLabel
 *   yAxisWidth={72}
 * />
 */
