"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof Label>;
type ErrorProps = React.ComponentProps<"p">;
type HelpTextProps = React.ComponentProps<"p">;

export interface SwitchFieldProps
  extends Omit<React.ComponentProps<typeof Switch>, "checked" | "onCheckedChange" | "value" | "onChange">,
    MixinProps<"label", Omit<LabelProps, "children">>,
    MixinProps<"error", Omit<ErrorProps, "children">>,
    MixinProps<"helpText", Omit<HelpTextProps, "children">> {
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
  label: LabelProps["children"];
  /** Reads differently on and off, so the off state is never left to inference. */
  helpText?: HelpTextProps["children"];
  error?: ErrorProps["children"] | null;
}

/**
 * A switch inside the same bordered box as the other controls, so it sits in
 * the form's rhythm rather than floating as a bare toggle. The whole row is the
 * label, which makes the hit target the full width — it is used on a phone.
 */
export const SwitchField = ({
  id,
  value,
  onChange,
  label,
  helpText,
  error,
  ...mixProps
}: SwitchFieldProps) => {
  const {
    label: labelProps,
    error: errorProps,
    helpText: helpTextProps,
    rest,
  } = splitProps(mixProps, "label", "error", "helpText");

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        {...labelProps}
        className={cn(
          "bg-card hover:bg-accent/40 flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border-[1.5px] px-3.5 py-3 transition-colors",
          "has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/[0.06]",
          labelProps.className
        )}
      >
        <span className="min-w-0">
          <span className="text-foreground block text-[15px] leading-5 font-medium">{label}</span>
          {helpText && (
            <span {...helpTextProps} className={cn("text-muted-foreground mt-0.5 block text-xs leading-4", helpTextProps.className)}>
              {helpText}
            </span>
          )}
        </span>

        <Switch {...rest} id={id} checked={value} onCheckedChange={onChange} className="shrink-0" />
      </Label>

      {error && (
        <p {...errorProps} role="alert" className={cn("text-destructive text-xs font-medium", errorProps.className)}>
          {error}
        </p>
      )}
    </div>
  );
};
