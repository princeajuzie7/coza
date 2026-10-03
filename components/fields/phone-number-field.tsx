"use client";

import * as React from "react";

import { type TCountryCode, getCountryData } from "countries-list";
import { countries } from "country-flag-icons";
import * as CountryFlags from "country-flag-icons/react/3x2";
import { AsYouType, type CountryCode } from "libphonenumber-js";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { DEFAULT_COUNTRY, type PhoneNumber } from "@/lib/phone";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof Label>;
type ErrorProps = React.ComponentProps<"p">;
type HelpTextProps = React.ComponentProps<"p">;

export interface PhoneNumberFieldProps
  extends MixinProps<"flag", { className?: string }>,
    MixinProps<"label", Omit<LabelProps, "children">>,
    MixinProps<"input", Omit<React.ComponentProps<typeof InputGroupInput>, "onChange" | "value">>,
    MixinProps<"error", Omit<ErrorProps, "children">>,
    MixinProps<"helpText", Omit<HelpTextProps, "children">>,
    MixinProps<"group", Omit<React.ComponentProps<typeof InputGroup>, "children">> {
  id: string;
  value: PhoneNumber;
  onChange: (v: PhoneNumber) => void;
  disabled?: boolean;
  label: LabelProps["children"] | null;
  error: ErrorProps["children"] | null;
  helpText?: HelpTextProps["children"] | null;
  /** Muted note beside the label, e.g. "optional". */
  hint?: React.ReactNode;
}

const COUNTRIES_DATA = countries.flatMap((countryCode) => {
  const { name, phone } = getCountryData(countryCode as TCountryCode);
  if (!name || !phone.length) return [];

  return phone.map((prefix) => ({
    name,
    prefix: `+${prefix}`,
    countryCode,
    searchKey: `${name} ${countryCode} +${prefix}`.toLowerCase(),
  }));
});

const CountryFlag = React.memo(({ countryCode, className }: { countryCode: string; className?: string }) => {
  const FlagComponent = CountryFlags[countryCode as TCountryCode] ?? CountryFlags.NG;

  return <FlagComponent className={cn("border-border/40 h-4 w-6 shrink-0 rounded-[3px] border object-cover", className)} />;
});

CountryFlag.displayName = "CountryFlag";

const formatAsYouType = (raw: string, countryCode: string): string => {
  const formatted = new AsYouType(countryCode as CountryCode).input(raw);
  const digits = raw.replace(/\D/g, "");

  // AsYouType echoes back raw digits when it can't match a pattern — fall back to simple grouping
  if (formatted === digits && digits.length >= 6) {
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  return formatted;
};

export const PhoneNumberField = React.forwardRef<HTMLInputElement, PhoneNumberFieldProps>(
  ({ id, value, onChange, disabled, label, error, helpText, hint, ...mixProps }: PhoneNumberFieldProps, ref) => {
    const {
      group,
      label: labelProps,
      flag,
      input,
      error: errorProps,
      helpText: helpTextProps,
    } = splitProps(mixProps, "label", "flag", "input", "error", "helpText", "group");

    const [open, setOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const selectedCountry = React.useMemo(
      () => COUNTRIES_DATA.find((c) => c.countryCode === value.countryCode),
      [value.countryCode]
    );

    const sortedCountries = React.useMemo(
      () =>
        [...COUNTRIES_DATA].sort((a, b) => {
          if (a.countryCode === value.countryCode) return -1;
          if (b.countryCode === value.countryCode) return 1;
          return 0;
        }),
      [value.countryCode]
    );

    const displayNumber = React.useMemo(
      () => (value.number ? formatAsYouType(value.number, value.countryCode) : ""),
      [value.number, value.countryCode]
    );

    const handleCountrySelect = React.useCallback(
      (countryCode: string) => {
        const digits = value.number.replace(/\D/g, "");
        onChange({ countryCode, number: digits ? formatAsYouType(digits, countryCode) : "" });
        setOpen(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      },
      [onChange, value.number]
    );

    const handleNumberChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const newDigits = raw.replace(/\D/g, "");
        const prevDigits = displayNumber.replace(/\D/g, "");

        // When the user backspaces a formatting character (paren, space, dash) the digit
        // count stays the same but the raw string shrinks — remove the preceding digit too
        // so the field doesn't get stuck (e.g. perpetually showing "(708)").
        const digits =
          newDigits.length === prevDigits.length && raw.length < displayNumber.length
            ? newDigits.slice(0, -1)
            : newDigits;

        onChange({ ...value, number: digits ? formatAsYouType(digits, value.countryCode) : "" });
      },
      [onChange, value, displayNumber]
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

        <InputGroup
          {...group}
          className={cn(
            "bg-card h-12 w-full rounded-xl border-[1.5px] p-0 shadow-none transition-[color,box-shadow,border-color]",
            "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",
            error && "border-destructive",
            group.className
          )}
        >
          <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger
              disabled={disabled}
              aria-label="Select dialling country"
              className="border-input hover:bg-accent/60 flex h-full shrink-0 items-center gap-2 rounded-l-[10px] border-r px-3.5 text-sm outline-none transition-colors focus-visible:ring-0 disabled:opacity-50"
            >
              <CountryFlag countryCode={value.countryCode || DEFAULT_COUNTRY} className={flag.className} />
              <span className="font-mono text-sm tabular-nums">{selectedCountry?.prefix ?? "+234"}</span>
            </PopoverTrigger>

            <PopoverContent align="start" sideOffset={6} className="w-[19rem] overflow-hidden p-0">
              <Command>
                <CommandInput placeholder="Search country…" />
                <CommandList className="max-h-72">
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {sortedCountries.map((country) => (
                      <CommandItem
                        key={`${country.countryCode}-${country.prefix}`}
                        value={country.searchKey}
                        onSelect={() => handleCountrySelect(country.countryCode)}
                        data-checked={value.countryCode === country.countryCode}
                        className="h-10 gap-3 rounded-lg px-2.5 data-[checked=true]:bg-primary/10"
                      >
                        <CountryFlag countryCode={country.countryCode} className={flag.className} />
                        <span className="flex-1 truncate">{country.name}</span>
                        <span className="text-muted-foreground font-mono text-sm tabular-nums">{country.prefix}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <InputGroupInput
            {...input}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            id={id}
            placeholder="803 123 4567"
            value={displayNumber}
            ref={mergedRef}
            onChange={handleNumberChange}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn("h-full flex-1 px-3.5 text-base", input.className)}
          />
        </InputGroup>

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

PhoneNumberField.displayName = "PhoneNumberField";
