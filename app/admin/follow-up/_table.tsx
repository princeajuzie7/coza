"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { HugeiconsIcon } from "@hugeicons/react";

import { PhoneIcon } from "@/components/admin/icons";
import { DataTable, type DataTableFilterMeta } from "@/components/data-table";
import { GROUP_LABEL } from "@/lib/attendance";
import { FOLLOW_UP_TIERS, type FollowUp } from "@/lib/register";
import { cn } from "@/lib/utils";

const meta = (m: DataTableFilterMeta) => m;

const shortDate = (iso: string) =>
  new Date(`${iso}T09:00:00Z`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const columns: ColumnDef<FollowUp>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    meta: meta({ filterable: true, filterVariant: "text", filterLabel: "name" }),
    cell: ({ row }) => <span className="font-semibold tracking-tight">{row.original.fullName}</span>,
  },
  {
    accessorKey: "tier",
    header: "Status",
    size: 150,
    meta: meta({
      filterable: true,
      filterVariant: "select",
      filterLabel: "status",
      filterOptions: (Object.keys(FOLLOW_UP_TIERS) as Array<keyof typeof FOLLOW_UP_TIERS>).map((t) => ({
        label: FOLLOW_UP_TIERS[t].label,
        value: t,
      })),
    }),
    cell: ({ row }) => {
      const tier = FOLLOW_UP_TIERS[row.original.tier];
      return (
        <span className="inline-flex items-center gap-2 text-[13px]">
          <span className={cn("size-1.5 rounded-full", tier.dot)} />
          {tier.label}
        </span>
      );
    },
  },
  {
    accessorKey: "servicesAway",
    header: "Services away",
    size: 130,
    meta: meta({ filterable: true, filterVariant: "number", filterLabel: "services away" }),
    cell: ({ row }) => (
      <span className="font-mono text-[13px] tabular-nums">{row.original.servicesAway}</span>
    ),
  },
  {
    accessorKey: "lastSeen",
    header: "Last seen",
    size: 140,
    cell: ({ row }) => <span className="text-[13px]">{shortDate(row.original.lastSeen)}</span>,
  },
  {
    accessorKey: "group",
    header: "Group",
    size: 120,
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
    accessorKey: "phone",
    header: "Phone",
    size: 170,
    meta: meta({ filterable: true, filterVariant: "phone", filterLabel: "phone" }),
    cell: ({ row }) => <span className="font-mono text-[12px] tabular-nums">{row.original.phone}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) =>
      row.original.email ? (
        <span className="text-muted-foreground text-[13px]">{row.original.email}</span>
      ) : (
        <span className="text-muted-foreground/80 inline-flex items-center gap-1.5 text-[12px] font-medium">
          <HugeiconsIcon icon={PhoneIcon} size={12} strokeWidth={2} />
          Call instead
        </span>
      ),
  },
];

export function FollowUpTable({ rows }: { rows: FollowUp[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="Everyone on record was on this register."
    />
  );
}
