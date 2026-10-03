"use client";

import * as React from "react";

import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { DateField } from "@/components/fields/date-field";
import { NumberField } from "@/components/fields/number-field";
import { PhoneNumberField } from "@/components/fields/phone-number-field";
import { SelectField } from "@/components/fields/select-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_COUNTRY, type PhoneNumber, phoneNumberFromString, phoneNumberToString } from "@/lib/phone";
import { cn } from "@/lib/utils";
import {
  type DataTableFilterMeta,
  type DataTableFilterOption,
  type NumberFilterOperator,
  type NumberFilterValue,
  parseFilterDate,
} from "./index";

const NUMBER_OPERATORS = [
  { value: "eq", label: "is equal to" },
  { value: "between", label: "is between" },
  { value: "gt", label: "is greater than" },
  { value: "lt", label: "is less than" },
] as const;

const EMPTY_FILTER_OPTIONS: DataTableFilterOption[] = [];

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type FilterFormValues = {
  text: string;
  operator: NumberFilterOperator;
  numberValue?: number;
  numberMin?: number;
  numberMax?: number;
  select: string;
  multiselect: string[];
  date?: Date;
  phoneNumber: PhoneNumber;
};

// ─── Display ─────────────────────────────────────────────────────────────────

const getDisplayLabel = (value: unknown, variant: string, options: DataTableFilterOption[]): string | null => {
  if (value === undefined || value === "" || value === null) return null;

  if (variant === "number" && typeof value === "object") {
    const { operator, value: val, min, max } = value as NumberFilterValue;
    const op = NUMBER_OPERATORS.find((o) => o.value === operator)?.label;
    return operator === "between" ? `${op} ${min} – ${max}` : `${op} ${val}`;
  }

  if (variant === "multiselect" && Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.length <= 2
      ? value.map((v) => options.find((o) => String(o.value) === v)?.label ?? v).join(", ")
      : `${value.length} selected`;
  }

  if (variant === "date") {
    const parsed = parseFilterDate(value);
    if (parsed) return format(parsed, "d MMM yyyy");
  }

  if (variant === "boolean") return value ? "Yes" : "No";
  if (variant === "phone" && typeof value === "string") return value;

  return options.find((o) => o.value === value)?.label ?? String(value);
};

// ─── Serialisation ───────────────────────────────────────────────────────────

const serializeFilter = (values: FilterFormValues, variant: string) => {
  if (variant === "text") return values.text.trim() || undefined;
  if (variant === "select") return values.select || undefined;
  if (variant === "multiselect") return values.multiselect.length ? values.multiselect : undefined;
  if (variant === "date") return values.date ? values.date.toISOString() : undefined;
  if (variant === "phone") return values.phoneNumber.number ? phoneNumberToString(values.phoneNumber) : undefined;

  if (variant === "number") {
    if (values.operator === "between") {
      return values.numberMin !== undefined && values.numberMax !== undefined
        ? { operator: "between", min: values.numberMin, max: values.numberMax }
        : undefined;
    }
    return values.numberValue !== undefined ? { operator: values.operator, value: values.numberValue } : undefined;
  }
};

const getFilterFormDefaults = (variant: string, filterValue: unknown): FilterFormValues => {
  const base: FilterFormValues = {
    text: "",
    operator: "eq",
    numberValue: undefined,
    numberMin: undefined,
    numberMax: undefined,
    select: "",
    multiselect: [],
    date: undefined,
    phoneNumber: { number: "", countryCode: DEFAULT_COUNTRY },
  };

  if (!filterValue) return base;

  if (variant === "text") return { ...base, text: String(filterValue) };
  if (variant === "select") return { ...base, select: String(filterValue) };
  if (variant === "date") return { ...base, date: parseFilterDate(filterValue) };
  if (variant === "multiselect")
    return { ...base, multiselect: Array.isArray(filterValue) ? filterValue.map(String) : [] };
  if (variant === "phone")
    return {
      ...base,
      phoneNumber: typeof filterValue === "string" ? phoneNumberFromString(filterValue) : base.phoneNumber,
    };

  if (variant === "number") {
    if (typeof filterValue === "object") {
      const v = filterValue as NumberFilterValue;
      return { ...base, operator: v.operator, numberValue: v.value, numberMin: v.min, numberMax: v.max };
    }
    return { ...base, numberValue: Number(filterValue) };
  }

  return base;
};

export const DataTableFilterPill = <TData, TValue>({
  column,
  isDropdownItem,
}: {
  column: Column<TData, TValue>;
  isDropdownItem?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const filterValue = column.getFilterValue();
  const {
    filterVariant = "text",
    filterOptions: filterOptionsFromMeta,
    filterLabel,
  } = (column.columnDef.meta ?? {}) as DataTableFilterMeta;

  const filterOptions = filterOptionsFromMeta ?? EMPTY_FILTER_OPTIONS;

  const label =
    filterLabel ?? (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id);

  const form = useForm<FilterFormValues>({
    defaultValues: React.useMemo(
      () => getFilterFormDefaults(filterVariant, filterValue),
      [filterVariant, filterValue]
    ),
  });

  const { control, watch, handleSubmit, reset } = form;
  const operator = watch("operator");
  const multiselect = watch("multiselect");

  // Re-sync whenever the popover opens, so a cleared filter is reflected.
  React.useEffect(() => {
    if (open) reset(getFilterFormDefaults(filterVariant, filterValue));
  }, [open, reset, filterVariant, filterValue]);

  const displayValue = React.useMemo(
    () => getDisplayLabel(filterValue, filterVariant, filterOptions),
    [filterValue, filterVariant, filterOptions]
  );

  const handleApply = (values: FilterFormValues) => {
    column.setFilterValue(serializeFilter(values, filterVariant));
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    if (!filterValue) return;
    e.stopPropagation();
    column.setFilterValue(undefined);
    setOpen(false);
  };

  if (isDropdownItem) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hover:bg-muted flex w-full items-center rounded-sm px-2 py-1.5 text-left text-xs"
      >
        <Plus className="mr-2 size-3 opacity-50" />
        {label}
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all",
          filterValue
            ? "border-primary/30 bg-primary/10 text-primary ring-primary/15 ring-1"
            : "bg-card border-border text-muted-foreground hover:bg-muted"
        )}
      >
        <svg
          onClick={handleClear}
          aria-hidden="true"
          width="12"
          height="12"
          fill="currentColor"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("cursor-pointer transition-transform duration-150", filterValue ? "rotate-45" : undefined)}
        >
          <path d="M8.75 4.25a.75.75 0 0 0-1.5 0v3h-3a.75.75 0 0 0 0 1.5h3v3a.75.75 0 0 0 1.5 0v-3h3a.75.75 0 0 0 0-1.5h-3v-3Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 8a8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8c4.43 0 8 3.581 8 8Zm-1.5 0A6.5 6.5 0 0 1 8 14.5 6.5 6.5 0 0 1 1.5 8 6.5 6.5 0 0 1 8 1.5c3.6 0 6.5 2.908 6.5 6.5Z"
          />
        </svg>
        <span>{capitalise(label)}</span>
        {displayValue && (
          <>
            <span className="mx-0.5 opacity-30">|</span>
            <span className="text-foreground max-w-32 truncate">{displayValue}</span>
          </>
        )}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 gap-0 p-3">
        <form className="space-y-3" onSubmit={handleSubmit(handleApply)}>
          <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-[0.16em] uppercase">
            Filter by {label}
          </p>

          <div className="grid gap-2">
            {filterVariant === "text" && (
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input {...form.register("text")} placeholder="Search…" className="h-9 pl-8 text-sm" autoFocus />
              </div>
            )}

            {filterVariant === "phone" && (
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneNumberField
                    id="phone-filter"
                    label={null}
                    error={null}
                    value={field.value}
                    onChange={field.onChange}
                    groupClassName="h-10 rounded-lg"
                    inputClassName="h-10 text-sm"
                  />
                )}
              />
            )}

            {filterVariant === "number" && (
              <div className="grid gap-2">
                <Controller
                  name="operator"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      id="op"
                      value={field.value}
                      onChange={(v) => field.onChange(v as NumberFilterOperator)}
                      items={NUMBER_OPERATORS.map((o) => ({ value: o.value, label: o.label }))}
                      triggerClassName="h-9 rounded-lg text-sm"
                    />
                  )}
                />
                {operator === "between" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Controller
                      name="numberMin"
                      control={control}
                      render={({ field }) => (
                        <NumberField id="min" value={field.value} onChange={field.onChange} placeholder="Min" allowDecimal />
                      )}
                    />
                    <Controller
                      name="numberMax"
                      control={control}
                      render={({ field }) => (
                        <NumberField id="max" value={field.value} onChange={field.onChange} placeholder="Max" allowDecimal />
                      )}
                    />
                  </div>
                ) : (
                  <Controller
                    name="numberValue"
                    control={control}
                    render={({ field }) => (
                      <NumberField id="val" value={field.value} onChange={field.onChange} allowDecimal />
                    )}
                  />
                )}
              </div>
            )}

            {filterVariant === "multiselect" && (
              <div className="max-h-52 space-y-1 overflow-y-auto">
                {filterOptions.map((opt) => (
                  <label
                    key={String(opt.value)}
                    className="hover:bg-muted flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5"
                  >
                    <Checkbox
                      checked={multiselect.includes(String(opt.value))}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          "multiselect",
                          checked
                            ? [...multiselect, String(opt.value)]
                            : multiselect.filter((v) => v !== String(opt.value))
                        )
                      }
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {filterVariant === "select" && (
              <Controller
                name="select"
                control={control}
                render={({ field }) => (
                  <SelectField
                    id="sel"
                    items={filterOptions.map((o) => ({ value: String(o.value), label: o.label }))}
                    value={field.value}
                    onChange={field.onChange}
                    triggerClassName="h-9 rounded-lg text-sm"
                  />
                )}
              />
            )}

            {filterVariant === "date" && (
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateField id="dt" value={field.value} onChange={field.onChange} triggerClassName="h-9" />
                )}
              />
            )}

            {filterVariant === "boolean" && (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <span className="text-xs font-medium">{capitalise(label)}</span>
                <Switch
                  checked={!!filterValue}
                  onCheckedChange={(v) => {
                    column.setFilterValue(v);
                    setOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {filterVariant !== "boolean" && (
            <Button type="submit" className="h-9 w-full text-xs font-bold">
              Apply
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};
