"use client";

import * as React from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { serviceDate } from "@/lib/attendance";

const iso = (d: Date) => serviceDate(d);
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);

const PRESETS = [
  { label: "Last 30 days", range: () => ({ from: daysAgo(30), to: new Date() }) },
  { label: "Last 90 days", range: () => ({ from: daysAgo(90), to: new Date() }) },
  { label: "Last 6 months", range: () => ({ from: daysAgo(182), to: new Date() }) },
  { label: "All time", range: () => undefined },
];

/**
 * The range lives in the URL, not in component state: the server reads it to
 * scope every query, a steward can paste the link to a pastor, and the back
 * button does what it should.
 */
export function ServiceRange() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const from = params.get("from");
  const to = params.get("to");

  const value: DateRange | undefined = from
    ? { from: new Date(`${from}T12:00:00`), to: to ? new Date(`${to}T12:00:00`) : undefined }
    : undefined;

  const onChange = (range: DateRange | undefined) => {
    const next = new URLSearchParams(params);
    if (range?.from) next.set("from", iso(range.from));
    else next.delete("from");
    if (range?.to) next.set("to", iso(range.to));
    else next.delete("to");

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return <DateRangePicker value={value} onChange={onChange} presets={PRESETS} placeholder="All services" />;
}
