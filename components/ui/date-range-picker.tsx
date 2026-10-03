"use client";

import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ServiceIcon } from "@/components/admin/icons";

export type { DateRange };

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  presets,
  className,
  numberOfMonths = 2,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  /** Shortcuts rendered beside the calendar — the answer most people want. */
  presets?: Array<{ label: string; range: () => DateRange | undefined }>;
  className?: string;
  numberOfMonths?: number;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("h-9 justify-start gap-2 px-3 text-[13px] font-medium", !value && "text-muted-foreground", className)}
          />
        }
      >
        <HugeiconsIcon icon={ServiceIcon} size={15} strokeWidth={1.8} className="shrink-0" />
        {value?.from ? (
          value.to ? (
            <>
              {format(value.from, "d MMM")} &ndash; {format(value.to, "d MMM yyyy")}
            </>
          ) : (
            format(value.from, "d MMM yyyy")
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>

      {/* flex-row explicitly: PopoverContent ships `flex flex-col`, and a bare
          `flex` does not override the direction — the calendar would wrap below
          the presets and leave a gap beside them. */}
      <PopoverContent align="end" className="flex w-auto flex-row items-stretch gap-0 p-0">
        {presets && (
          <div className="border-border flex w-40 shrink-0 flex-col gap-0.5 border-r p-2">
            <p className="text-muted-foreground px-2 pt-1 pb-2 font-mono text-[9px] tracking-[0.18em] uppercase">
              Quick ranges
            </p>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onChange(preset.range())}
                className="hover:bg-muted rounded-md px-2 py-1.5 text-left text-[13px] transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        <div>
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={numberOfMonths}
            autoFocus
          />
          {value && (
            <div className="border-border border-t p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onChange(undefined)}>
                Clear range
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
