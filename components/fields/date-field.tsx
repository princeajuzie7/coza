"use client";

import * as React from "react";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof Label>;
type ErrorProps = React.ComponentProps<"p">;

export interface DateFieldProps
  extends MixinProps<"label", Omit<LabelProps, "children">>,
    MixinProps<"error", Omit<ErrorProps, "children">>,
    MixinProps<"calendar", Omit<React.ComponentProps<typeof Calendar>, "selected" | "onSelect" | "mode">> {
  id: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export const DateField = ({
  id,
  value,
  onChange,
  label,
  error,
  placeholder = "Pick a date",
  disabled,
  className,
  triggerClassName,
  ...mixProps
}: DateFieldProps) => {
  const { label: labelProps, error: errorProps, calendar } = splitProps(mixProps, "label", "error", "calendar");
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label {...labelProps} htmlFor={id} className={cn("text-foreground/80", labelProps.className)}>
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "border-input bg-card flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:opacity-50",
            !value && "text-muted-foreground",
            triggerClassName
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          <span className="truncate">{value ? format(value, "d MMM yyyy") : placeholder}</span>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            {...calendar}
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            autoFocus
          />
          {value && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && (
        <p {...errorProps} role="alert" className={cn("text-destructive text-xs font-medium", errorProps.className)}>
          {error}
        </p>
      )}
    </div>
  );
};
