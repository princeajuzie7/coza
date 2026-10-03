"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof Label>;
type ErrorProps = React.ComponentProps<"p">;
type HelpTextProps = React.ComponentProps<"p">;
type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;

export type SelectFieldItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  /** Draw a divider above this item — for an option that is a different kind of answer. */
  separatorBefore?: boolean;
};

export interface SelectFieldProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange" | "items">,
    MixinProps<"trigger", Omit<SelectTriggerProps, "children">>,
    MixinProps<"label", Omit<LabelProps, "children">>,
    MixinProps<"error", Omit<ErrorProps, "children">>,
    MixinProps<"helpText", Omit<HelpTextProps, "children">> {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: LabelProps["children"];
  error?: ErrorProps["children"];
  helpText?: HelpTextProps["children"];
  items: SelectFieldItem[];
  placeholder?: string;
  /** Muted note beside the label, e.g. "optional". */
  hint?: React.ReactNode;
}

export const SelectField = ({
  id,
  value,
  onChange,
  items,
  label,
  error,
  helpText,
  hint,
  placeholder = "Select...",
  ...mixProps
}: SelectFieldProps) => {
  const {
    label: labelProps,
    error: errorProps,
    helpText: helpTextProps,
    trigger: triggerProps,
    rest,
  } = splitProps(mixProps, "label", "error", "helpText", "trigger");

  // Base UI renders the *label* of the selected item in <SelectValue> only when
  // Root knows the value→label map, so hand it over rather than echoing raw values.
  const labelByValue = React.useMemo(
    () => items.map(({ value: v, label: l }) => ({ value: v, label: l })),
    [items]
  );

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <Label {...labelProps} htmlFor={id} className={cn("text-foreground/80", labelProps.className)}>
            {label}
          </Label>
          {hint && <span className="text-muted-foreground/70 text-[11px] leading-none font-medium">{hint}</span>}
        </div>
      )}

      <Select
        {...rest}
        items={labelByValue}
        value={value === "" ? null : value}
        onValueChange={(next) => onChange((next as string | null) ?? "")}
      >
        <SelectTrigger
          size="lg"
          {...triggerProps}
          id={id}
          aria-invalid={!!error}
          className={cn(
            "bg-card w-full rounded-xl border-[1.5px] px-3.5 text-base shadow-none transition-[color,box-shadow,border-color] focus-visible:ring-[3px]",
            "data-placeholder:text-muted-foreground/40",
            triggerProps?.className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent alignItemWithTrigger={false} align="start" sideOffset={6} className="rounded-xl">
          {items.map((item) => (
            <React.Fragment key={item.value}>
              {item.separatorBefore && <SelectSeparator />}
              <SelectItem value={item.value} disabled={item.disabled} className="h-11 rounded-lg px-3 text-[15px]">
                {item.label}
              </SelectItem>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>

      {helpText && !error && (
        <p {...helpTextProps} className={cn("text-muted-foreground/80 text-xs", helpTextProps.className)}>
          {helpText}
        </p>
      )}

      {error && (
        <p {...errorProps} role="alert" className={cn("text-destructive text-xs font-medium", errorProps.className)}>
          {error}
        </p>
      )}
    </div>
  );
};
