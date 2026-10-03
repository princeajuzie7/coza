"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof Label>;
type ErrorProps = React.ComponentProps<"p">;
type HelpTextProps = React.ComponentProps<"p">;

interface TextFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange">,
    MixinProps<"label", Omit<LabelProps, "children">>,
    MixinProps<"error", Omit<ErrorProps, "children">>,
    MixinProps<"helpText", Omit<HelpTextProps, "children">> {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: LabelProps["children"] | null;
  error: ErrorProps["children"] | null;
  helpText?: HelpTextProps["children"] | null;
  /** Shown in muted type beside the label, e.g. "optional". */
  hint?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, value, onChange, label, error, helpText, hint, ...mixProps }, ref) => {
    const {
      label: labelProps,
      error: errorProps,
      helpText: helpTextProps,
      rest,
    } = splitProps(mixProps, "label", "error", "helpText");

    const { className, ...inputProps } = rest;

    return (
      <div className="group/field space-y-2">
        {label && (
          <div className="flex items-baseline justify-between gap-3">
            <Label {...labelProps} htmlFor={id} className={cn("text-foreground/80", labelProps.className)}>
              {label}
            </Label>
            {hint && <span className="text-muted-foreground/70 text-[11px] leading-none font-medium">{hint}</span>}
          </div>
        )}

        <Input
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...inputProps}
          aria-invalid={!!error}
          className={cn(
            "bg-card h-12 w-full rounded-xl border-[1.5px] px-3.5 text-base shadow-none transition-[color,box-shadow,border-color]",
            "placeholder:text-muted-foreground/40 focus-visible:ring-[3px]",
            className
          )}
        />

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
  }
);
TextField.displayName = "TextField";
