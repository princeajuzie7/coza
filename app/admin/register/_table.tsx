"use client";

import * as React from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { HugeiconsIcon } from "@hugeicons/react";

import { ExportIcon, PhoneIcon } from "@/components/admin/icons";

import { DataTable, type DataTableFilterMeta } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { BUS_TERMINALS, NO_BUS, STANDINGS, WORKFORCE_UNITS } from "@/constant";
import {
  ATTENDANCE_MODE_LABEL,
  GROUP_LABEL,
  STATUS_STYLE,
  type AttendeeGroup,
  formatChurchTime,
} from "@/lib/attendance";
import type { RegisterRow } from "@/lib/register";
import { cn } from "@/lib/utils";

const meta = (m: DataTableFilterMeta) => m;

const STANDING_LABEL = Object.fromEntries(STANDINGS.map((s) => [s.value, s.label])) as Record<string, string>;

const columns: ColumnDef<RegisterRow>[] = [
  {
    accessorKey: "checkedInAt",
    header: "Time",
    size: 96,
    cell: ({ row }) => (
      <span className="font-mono text-[13px] tabular-nums">{formatChurchTime(new Date(row.original.checkedInAt))}</span>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Name",
    meta: meta({ filterable: true, filterVariant: "text", filterLabel: "name" }),
    cell: ({ row }) => <span className="font-semibold tracking-tight">{row.original.fullName}</span>,
  },
  {
    accessorKey: "punctuality",
    header: "Status",
    size: 110,
    meta: meta({
      filterable: true,
      filterVariant: "select",
      filterLabel: "status",
      filterOptions: [
        { label: "Early", value: "early" },
        { label: "Late", value: "late" },
      ],
    }),
    cell: ({ row }) => {
      const s = STATUS_STYLE[row.original.punctuality];
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
            s.chip
          )}
        >
          <span className={cn("size-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      );
    },
  },
  {
    accessorKey: "group",
    header: "Group",
    size: 110,
    meta: meta({
      filterable: true,
      filterVariant: "select",
      filterLabel: "group",
      filterOptions: [
        { label: "Member", value: "member" },
        { label: "Workforce", value: "workforce" },
      ],
    }),
    cell: ({ row }) => <span className="text-[13px]">{GROUP_LABEL[row.original.group]}</span>,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    size: 150,
    meta: meta({
      filterable: true,
      filterVariant: "multiselect",
      filterLabel: "unit",
      filterOptions: WORKFORCE_UNITS.map((u) => ({ label: u, value: u })),
    }),
    cell: ({ row }) =>
      row.original.unit ? (
        <span className="text-[13px]">{row.original.unit}</span>
      ) : (
        <span className="text-muted-foreground/40">—</span>
      ),
  },
  {
    accessorKey: "standing",
    header: "Standing",
    size: 130,
    meta: meta({
      filterable: true,
      filterVariant: "multiselect",
      filterLabel: "standing",
      filterOptions: STANDINGS.map((s) => ({ label: s.label, value: s.value })),
    }),
    cell: ({ row }) => <span className="text-[13px]">{STANDING_LABEL[row.original.standing]}</span>,
  },
  {
    accessorKey: "attendanceMode",
    header: "Attended",
    size: 110,
    meta: meta({
      filterable: true,
      filterVariant: "select",
      filterLabel: "attended",
      filterOptions: [
        { label: "In person", value: "in_person" },
        { label: "Online", value: "online" },
      ],
    }),
    cell: ({ row }) => (
      <span className={cn("text-[13px]", row.original.attendanceMode === "online" && "text-brand-purple font-medium")}>
        {ATTENDANCE_MODE_LABEL[row.original.attendanceMode]}
      </span>
    ),
  },
  {
    accessorKey: "busTerminal",
    header: "Boarded",
    size: 140,
    meta: meta({
      filterable: true,
      filterVariant: "multiselect",
      filterLabel: "boarded",
      filterOptions: [
        { label: "Own transport", value: NO_BUS },
        ...BUS_TERMINALS.map((t) => ({ label: t, value: t })),
      ],
    }),
    cell: ({ row }) =>
      row.original.busTerminal === NO_BUS ? (
        <span className="text-muted-foreground text-[13px]">Own transport</span>
      ) : (
        <span className="text-[13px]">{row.original.busTerminal}</span>
      ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 160,
    meta: meta({ filterable: true, filterVariant: "phone", filterLabel: "phone" }),
    cell: ({ row }) => <span className="font-mono text-[12px] tabular-nums">{row.original.phone}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 200,
    cell: ({ row }) =>
      row.original.email ? (
        <span className="text-muted-foreground text-[13px]">{row.original.email}</span>
      ) : (
        // Requirement #5 made visible: these are the people staff must ring.
        <span className="text-muted-foreground/80 inline-flex items-center gap-1.5 text-[12px] font-medium">
          <HugeiconsIcon icon={PhoneIcon} size={12} strokeWidth={2} />
          Call instead
        </span>
      ),
  },
];

const TABS: Array<{ value: AttendeeGroup | "all"; label: string }> = [
  { value: "all", label: "Everyone" },
  { value: "member", label: "Members" },
  { value: "workforce", label: "Workforce" },
];

export function Register({ rows, serviceDate }: { rows: RegisterRow[]; serviceDate: string }) {
  const [tab, setTab] = React.useState<AttendeeGroup | "all">("all");

  const counts = React.useMemo(
    () => ({
      all: rows.length,
      member: rows.filter((r) => r.group === "member").length,
      workforce: rows.filter((r) => r.group === "workforce").length,
    }),
    [rows]
  );

  const visible = React.useMemo(() => (tab === "all" ? rows : rows.filter((r) => r.group === tab)), [rows, tab]);

  // Requirement #6: members and workforce are never mixed into one list.
  const activeColumns = React.useMemo(
    () => (tab === "member" ? columns.filter((c) => "accessorKey" in c && c.accessorKey !== "unit") : columns),
    [tab]
  );

  return (
    <div className="space-y-5">
      <div className="border-border flex flex-wrap items-center gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors",
              tab === t.value
                ? "border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                tab === t.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              )}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        key={tab}
        columns={activeColumns}
        data={visible}
        emptyMessage="No one has checked in for this service yet."
        containerClassName="space-y-4"
        toolbar={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={`/admin/export?date=${serviceDate}&group=${tab}`} download />}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <HugeiconsIcon icon={ExportIcon} size={14} strokeWidth={2} />
            Export CSV
          </Button>
        }
      />
    </div>
  );
}
