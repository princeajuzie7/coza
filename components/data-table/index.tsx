"use client";

import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type MixinProps, splitProps } from "@/lib/mixin";
import { cn } from "@/lib/utils";
import { DataTableFilterPill } from "./filter-pill";

export interface TableAction<TData> {
  label: string | ((row: TData) => string);
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  when?: (row: TData) => boolean;
}

export type DataTablePagination = {
  pageIndex: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (pageIndex: number) => void;
};

export type DataTableFilterOption = { label: string; value: string | boolean };

export type DataTableFilterMeta = {
  filterLabel?: string;
  filterable?: boolean;
  filterVariant?: "text" | "number" | "select" | "multiselect" | "date" | "boolean" | "phone";
  filterOptions?: DataTableFilterOption[];
};

export type NumberFilterOperator = "eq" | "between" | "gt" | "lt";

export type NumberFilterValue = {
  operator: NumberFilterOperator;
  value?: number;
  min?: number;
  max?: number;
};

const STICKY_ACTIONS_CLASS = "bg-card sticky right-0 shadow-[-1px_0_0_0_var(--border)]";

// ─── Filter functions ────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

const numberRangeFilterFn: FilterFn<any> = (row, columnId, filterValue: NumberFilterValue) => {
  if (!filterValue || typeof filterValue !== "object") return true;
  const val = Number(row.getValue(columnId));
  if (Number.isNaN(val)) return false;

  const { operator, value, min, max } = filterValue;
  switch (operator) {
    case "eq":
      return val === value;
    case "gt":
      return val > (value ?? -Infinity);
    case "lt":
      return val < (value ?? Infinity);
    case "between":
      return val >= (min ?? -Infinity) && val <= (max ?? Infinity);
    default:
      return true;
  }
};

const multiselectFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.includes(String(row.getValue(columnId)));
};

const textFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === "") return true;
  return String(row.getValue(columnId) ?? "")
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

const selectFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === "") return true;
  return String(row.getValue(columnId)) === String(filterValue);
};

export const parseFilterDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
};

const isSameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const dateFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const filterDate = parseFilterDate(filterValue);
  if (!filterDate) return true;
  const cellDate = parseFilterDate(row.getValue(columnId));
  if (!cellDate) return false;
  return isSameCalendarDay(cellDate, filterDate);
};

const phoneDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

const phoneFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue) return true;
  const filterDigits = phoneDigits(filterValue);
  if (!filterDigits) return true;
  return phoneDigits(row.getValue(columnId)).includes(filterDigits);
};

const booleanFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === "") return true;
  return Boolean(row.getValue(columnId)) === Boolean(filterValue);
};

interface DataTableProps<TData, TValue>
  extends React.ComponentProps<typeof Table>,
    MixinProps<"row", React.ComponentProps<typeof TableRow>>,
    MixinProps<"checkbox", React.ComponentProps<typeof Checkbox>>,
    MixinProps<"body", React.ComponentProps<typeof TableBody>>,
    MixinProps<"cell", React.ComponentProps<typeof TableCell>>,
    MixinProps<"container", React.ComponentProps<"div">> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  enableBulkSelect?: boolean;
  actions?: ((row: TData) => TableAction<TData>[]) | TableAction<TData>[];
  isLoading?: boolean;
  skeletonRowCount?: number;
  emptyMessage?: string;
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: (filters: ColumnFiltersState) => void;
  pagination?: DataTablePagination;
  /** Rendered beside the filter pills — export buttons, counts, a search box. */
  toolbar?: React.ReactNode;
}

export const DataTable = <TData, TValue>({
  columns,
  data,
  onRowClick,
  enableBulkSelect = false,
  actions: rowActionsProp,
  isLoading = false,
  skeletonRowCount = 6,
  emptyMessage = "No results found.",
  columnFilters: externalFilters,
  setColumnFilters: setExternalFilters,
  pagination,
  toolbar,
  ...mixProps
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [internalFilters, setInternalFilters] = React.useState<ColumnFiltersState>([]);

  const columnFilters = externalFilters ?? internalFilters;
  const onColumnFiltersChange = setExternalFilters ?? setInternalFilters;

  const { row, checkbox, body, cell, rest, container } = splitProps(
    mixProps,
    "row",
    "checkbox",
    "body",
    "cell",
    "container"
  );

  const tableColumns = React.useMemo(() => {
    const processedCols = columns.map((col) => {
      const meta = col.meta as DataTableFilterMeta | undefined;
      if (col.filterFn || !meta?.filterVariant) return col;

      const fnMap: Partial<Record<string, FilterFn<any>>> = {
        text: textFilterFn,
        number: numberRangeFilterFn,
        select: selectFilterFn,
        multiselect: multiselectFilterFn,
        date: dateFilterFn,
        phone: phoneFilterFn,
        boolean: booleanFilterFn,
      };

      const filterFn = fnMap[meta.filterVariant];
      return filterFn ? { ...col, filterFn } : col;
    });

    if (enableBulkSelect) {
      processedCols.unshift({
        id: "select",
        size: 40,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            className={cn(checkbox?.className, "translate-y-0.5 cursor-pointer")}
          />
        ),
        cell: ({ row: r }) => (
          <Checkbox
            checked={r.getIsSelected()}
            onCheckedChange={(v) => r.toggleSelected(!!v)}
            onClick={(e) => e.stopPropagation()}
            className={cn(checkbox?.className, "translate-y-0.5 cursor-pointer")}
          />
        ),
      });
    }

    if (rowActionsProp) {
      processedCols.push({
        id: "actions",
        size: 50,
        header: () => null,
        cell: ({ row: r }) => {
          const rowActions = (
            typeof rowActionsProp === "function" ? rowActionsProp(r.original) : rowActionsProp
          ).filter((a) => !a.when || a.when(r.original));
          if (!rowActions.length) return null;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" className="size-8" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  {rowActions.map((a, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        a.onClick(r.original);
                      }}
                      className={cn("py-1", a.variant === "destructive" && "text-destructive")}
                    >
                      {typeof a.label === "function" ? a.label(r.original) : a.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      });
    }
    return processedCols;
  }, [columns, enableBulkSelect, rowActionsProp, checkbox?.className]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      ...(pagination && { pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize } }),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: (updater) =>
      onColumnFiltersChange(typeof updater === "function" ? updater(columnFilters) : updater),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pagination ? { manualPagination: true, pageCount: -1 } : { getPaginationRowModel: getPaginationRowModel() }),
  });

  const filterableCols = table.getAllColumns().filter((col) => (col.columnDef.meta as DataTableFilterMeta)?.filterable);

  if (isLoading)
    return (
      <DataTableSkeleton
        columns={columns}
        enableBulkSelect={enableBulkSelect}
        actions={rowActionsProp}
        skeletonRowCount={skeletonRowCount}
      />
    );

  const canPrev = pagination ? pagination.hasPreviousPage : table.getCanPreviousPage();
  const canNext = pagination ? pagination.hasNextPage : table.getCanNextPage();
  const totalItems = pagination ? data.length : table.getFilteredRowModel().rows.length;
  const pageLabel = pagination ? ` · Page ${pagination.pageIndex + 1}` : "";

  return (
    <div {...container} className={cn("space-y-4", container?.className)}>
      {(filterableCols.length > 0 || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {filterableCols.map((col) => (
            <DataTableFilterPill key={col.id} column={col} />
          ))}
          {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <Table {...rest}>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow {...row} key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}
                      className={cn(
                        "font-mono text-[10px] tracking-[0.14em] uppercase",
                        h.column.id === "actions" && STICKY_ACTIONS_CLASS
                      )}
                    >
                      <div
                        className={cn(
                          h.column.getCanSort() && "hover:text-foreground flex cursor-pointer items-center gap-1 select-none"
                        )}
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" && <ChevronUpIcon className="size-3" />}
                        {h.column.getIsSorted() === "desc" && <ChevronDownIcon className="size-3" />}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody {...body}>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((r) => (
                  <TableRow
                    key={r.id}
                    data-state={r.getIsSelected() ? "selected" : undefined}
                    className={cn(onRowClick && "hover:bg-muted/50 cursor-pointer transition-colors")}
                    onClick={() => onRowClick?.(r.original)}
                  >
                    {r.getVisibleCells().map((c) => (
                      <TableCell
                        {...cell}
                        key={c.id}
                        className={cn(cell?.className, c.column.id === "actions" && STICKY_ACTIONS_CLASS)}
                      >
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="text-muted-foreground h-28 text-center text-sm">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground font-mono text-[11px] tracking-wide tabular-nums">
          {totalItems} {totalItems === 1 ? "record" : "records"}
          {pageLabel}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => (pagination ? pagination.onPageChange(pagination.pageIndex - 1) : table.previousPage())}
            disabled={!canPrev}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => (pagination ? pagination.onPageChange(pagination.pageIndex + 1) : table.nextPage())}
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const DataTableSkeleton = <TData, TValue>({
  columns,
  enableBulkSelect = false,
  actions,
  skeletonRowCount = 6,
}: Pick<DataTableProps<TData, TValue>, "columns" | "enableBulkSelect" | "actions" | "skeletonRowCount">) => (
  <div className="space-y-4">
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {enableBulkSelect && (
                <TableHead style={{ width: 40 }}>
                  <Skeleton className="size-4" />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead key={column.id ?? `col-${index}`}>
                  <Skeleton className="h-3 w-20" />
                </TableHead>
              ))}
              {actions && <TableHead style={{ width: 50 }} className={STICKY_ACTIONS_CLASS} />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                {enableBulkSelect && (
                  <TableCell>
                    <Skeleton className="size-4" />
                  </TableCell>
                )}
                {columns.map((column, colIndex) => (
                  <TableCell key={column.id ?? `skeleton-${rowIndex}-${colIndex}`}>
                    <Skeleton
                      className="h-4"
                      style={{ width: `${60 + ((rowIndex * 7 + colIndex * 11) % 40)}%` }}
                    />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className={STICKY_ACTIONS_CLASS}>
                    <div className="flex justify-end">
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);
