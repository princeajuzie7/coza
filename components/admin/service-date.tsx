"use client";

import * as React from "react";

import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { serviceDate } from "@/lib/attendance";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "./icons";

/** Noon avoids any chance of a timezone shift pushing the date back a day. */
const toDate = (iso: string) => new Date(`${iso}T12:00:00`);

/**
 * The single-service twin of the range picker on the overview. The rail of
 * date pills it replaces did not scale — it showed the last ten services and
 * silently hid the rest, and nine identical pills is a lot of furniture for
 * one value.
 *
 * Days without a service are disabled rather than hidden, so the calendar
 * shows at a glance when the church actually met.
 */
export function ServiceDatePicker({ dates, active }: { dates: string[]; active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const today = serviceDate(new Date());
  const available = React.useMemo(() => new Set(dates), [dates]);
  const recent = React.useMemo(() => [...dates].sort().reverse().slice(0, 4), [dates]);

  const select = (iso: string) => {
    const next = new URLSearchParams(params);
    if (iso === today) next.delete("date");
    else next.set("date", iso);

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" className="h-9 justify-start gap-2 px-3 text-[13px] font-medium" />}
      >
        <HugeiconsIcon icon={ServiceIcon} size={15} strokeWidth={1.8} className="shrink-0" />
        {active === today ? "Today" : format(toDate(active), "d MMM yyyy")}
      </PopoverTrigger>

      {/* flex-row explicitly: PopoverContent ships `flex flex-col`, and a bare
          `flex` does not override the direction. */}
      <PopoverContent align="end" className="flex w-auto flex-row items-stretch gap-0 p-0">
        <div className="border-border flex w-44 shrink-0 flex-col gap-0.5 border-r p-2">
          <p className="text-muted-foreground px-2 pt-1 pb-2 font-mono text-[9px] tracking-[0.18em] uppercase">
            Recent services
          </p>
          {recent.map((iso) => (
            <button
              key={iso}
              onClick={() => select(iso)}
              className={cn(
                "flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                iso === active ? "bg-muted font-semibold" : "hover:bg-muted"
              )}
            >
              <span>{iso === today ? "Today" : format(toDate(iso), "d MMM")}</span>
              <span className="text-muted-foreground/60 font-mono text-[10px]">{format(toDate(iso), "EEE")}</span>
            </button>
          ))}
        </div>

        <Calendar
          mode="single"
          defaultMonth={toDate(active)}
          selected={toDate(active)}
          onSelect={(d) => d && select(serviceDate(d))}
          // Only days the church actually met are selectable.
          disabled={(d) => !available.has(serviceDate(d))}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
