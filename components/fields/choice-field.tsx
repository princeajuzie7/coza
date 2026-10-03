"use client";

import * as React from "react";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { CheckIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof Label>;
type ErrorProps = React.ComponentProps<"p">;
type HelpTextProps = React.ComponentProps<"p">;

export type ChoiceFieldOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
};

export interface ChoiceFieldProps<T extends string>
  extends MixinProps<"label", Omit<LabelProps, "children">>,
    MixinProps<"error", Omit<ErrorProps, "children">>,
    MixinProps<"helpText", Omit<HelpTextProps, "children">> {
  id: string;
  value: T | "";
  onChange: (value: T) => void;
  options: ReadonlyArray<ChoiceFieldOption<T>>;
  label?: LabelProps["children"];
  error?: ErrorProps["children"];
  helpText?: HelpTextProps["children"];
  className?: string;
}

/**
 * A short, fixed set of answers shown as tappable cards instead of hidden
 * behind a dropdown — two taps saved for everyone arriving on a phone, and the
 * options stay readable while a volunteer fills the form for someone else.
 * Built on Base UI radios, so arrow-key navigation and labelling come for free.
 */
export function ChoiceField<T extends string>({
  id,
  value,
  onChange,
  options,
  label,
  error,
  helpText,
  className,
  ...mixProps
}: ChoiceFieldProps<T>) {
  const {
    label: labelProps,
    error: errorProps,
    helpText: helpTextProps,
  } = splitProps(mixProps, "label", "error", "helpText");

  return (
    <div className="space-y-2">
      {label && (
        <Label {...labelProps} id={`${id}-label`} className={cn("text-foreground/80", labelProps.className)}>
          {label}
        </Label>
      )}

      <RadioGroupPrimitive
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-invalid={!!error}
        value={value === "" ? null : value}
        onValueChange={(next) => onChange(next as T)}
        className={cn("grid gap-2.5", options.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2", className)}
      >
        {options.map((option) => (
          <RadioPrimitive.Root
            key={option.value}
            value={option.value}
            className={cn(
              "group/choice bg-card relative cursor-pointer rounded-xl border-[1.5px] px-3.5 py-3 text-left outline-none transition-all",
              "hover:border-border hover:bg-accent/40 border-input",
              "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:ring-[3px]",
              "data-checked:border-primary data-checked:bg-primary/[0.07] data-checked:shadow-[0_1px_0_0_var(--primary)]",
              "aria-invalid:border-destructive/60"
            )}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="text-foreground block text-[15px] leading-5 font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-4">{option.description}</span>
                )}
              </span>

              {/* Tick only once chosen — an empty circle on every card reads as clutter. */}
              <RadioPrimitive.Indicator
                className="bg-primary text-primary-foreground mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full"
                keepMounted={false}
              >
                <CheckIcon className="size-3" strokeWidth={3} />
              </RadioPrimitive.Indicator>
            </span>
          </RadioPrimitive.Root>
        ))}
      </RadioGroupPrimitive>

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
