"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, type ReactNode, useState } from "react";
import { media } from "../../foundations/conditions.stylex";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import * as DropdownMenu from "../dropdown-menu/dropdown-menu";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../icons/icons";
import * as Table from "../table/table";
import type { Styled } from "../../lib/utils";

export interface DataTableColumn<Row> {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Makes the column sortable, by the value it returns. */
  sortValue?: (row: Row) => string | number;
  /** Use `end` for numbers such as amounts. */
  align?: "start" | "end";
}

type SortDirection = "ascending" | "descending";

export type DataTableProps<Row> = Styled<Omit<ComponentProps<"div">, "children">> & {
  /** The columns to show, in order. Leave hidden columns out. */
  columns: DataTableColumn<Row>[];
  /** The rows to show. Filter them before passing them in. */
  data: Row[];
  getRowId: (row: Row) => string;
  /** @default 10 */
  pageSize?: number;
  /** Adds a checkbox column with select-all for the current page. */
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  /** Controls above the table, such as a filter `Input` and `DataTableColumnsMenu`. */
  toolbar?: ReactNode;
  /** Names the table for assistive tech. */
  label?: string;
};

/**
 * A Shelf Table with sorting, row selection, and pagination, in plain React state.
 * Filtering and column visibility stay with you: pass the rows and columns to show.
 *
 *   <DataTable
 *     label="Invoices"
 *     columns={[
 *       { id: "customer", header: "Customer", cell: (row) => row.customer, sortValue: (row) => row.customer },
 *       { id: "amount", header: "Amount", cell: (row) => format(row.amount), sortValue: (row) => row.amount, align: "end" },
 *     ]}
 *     data={invoices}
 *     getRowId={(row) => row.id}
 *     selectable
 *   />
 *
 * Sort buttons cycle ascending, descending, and unsorted, and set `aria-sort` on the header.
 */
export function DataTable<Row>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  toolbar,
  label,
  style,
  ...props
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<{ id: string; direction: SortDirection } | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pageIndex, setPageIndex] = useState(0);

  const sortValue = sort && columns.find((column) => column.id === sort.id)?.sortValue;
  const sorted = sortValue
    ? data.toSorted((a, b) => {
        const order = compare(sortValue(a), sortValue(b));
        return sort.direction === "ascending" ? order : -order;
      })
    : data;

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(pageIndex, pageCount - 1);
  const rows = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const pageIds = rows.map(getRowId);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const selectedCount = data.filter((row) => selected.has(getRowId(row))).length;

  function updateSelection(next: Set<string>) {
    setSelected(next);
    onSelectionChange?.([...next]);
  }

  function toggleSort(id: string) {
    if (sort?.id !== id) setSort({ id, direction: "ascending" });
    else if (sort.direction === "ascending") setSort({ id, direction: "descending" });
    else setSort(null);
  }

  return (
    <div data-slot="data-table" {...props} {...stylex.props(styles.root, style)}>
      {toolbar && (
        <div data-slot="data-table-toolbar" {...stylex.props(styles.toolbar)}>
          {toolbar}
        </div>
      )}
      <div {...stylex.props(styles.frame)}>
        <Table.Root aria-label={label}>
          <Table.Header>
            <Table.Row>
              {selectable && (
                <Table.Head style={styles.select}>
                  <Checkbox
                    aria-label="Select all rows on this page"
                    style={styles.checkbox}
                    checked={rows.length > 0 && selectedOnPage === rows.length}
                    indeterminate={selectedOnPage > 0 && selectedOnPage < rows.length}
                    disabled={rows.length === 0}
                    onCheckedChange={(checked) => {
                      const next = new Set(selected);
                      for (const id of pageIds) {
                        if (checked) next.add(id);
                        else next.delete(id);
                      }
                      updateSelection(next);
                    }}
                  />
                </Table.Head>
              )}
              {columns.map((column) => {
                const direction = sort?.id === column.id ? sort.direction : undefined;
                const SortIcon =
                  direction === "ascending"
                    ? ArrowUpIcon
                    : direction === "descending"
                      ? ArrowDownIcon
                      : ArrowUpDownIcon;

                return (
                  <Table.Head
                    key={column.id}
                    aria-sort={column.sortValue ? (direction ?? "none") : undefined}
                    style={column.align === "end" && styles.end}
                  >
                    {column.sortValue ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort(column.id)}
                        style={[styles.sort, column.align === "end" && styles.sortEnd]}
                      >
                        {column.header}
                        <SortIcon {...stylex.props(!direction && styles.sortIconIdle)} />
                      </Button>
                    ) : (
                      column.header
                    )}
                  </Table.Head>
                );
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => {
              const id = getRowId(row);
              const isSelected = selected.has(id);

              return (
                <Table.Row
                  key={id}
                  data-state={isSelected ? "selected" : undefined}
                  style={[styles.row, isSelected && styles.rowSelected]}
                >
                  {selectable && (
                    <Table.Cell style={styles.select}>
                      <Checkbox
                        aria-label="Select row"
                        style={styles.checkbox}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const next = new Set(selected);
                          if (checked) next.add(id);
                          else next.delete(id);
                          updateSelection(next);
                        }}
                      />
                    </Table.Cell>
                  )}
                  {columns.map((column) => (
                    <Table.Cell key={column.id} style={column.align === "end" && styles.end}>
                      {column.cell(row)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
            {rows.length === 0 && (
              <Table.Row style={styles.row}>
                <Table.Cell colSpan={columns.length + (selectable ? 1 : 0)} style={styles.empty}>
                  No results.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <div data-slot="data-table-footer" {...stylex.props(styles.footer)}>
        <span {...stylex.props(styles.summary)}>
          {selectable && `${selectedCount} of ${data.length} selected`}
        </span>
        <span {...stylex.props(styles.summary)}>
          Page {page + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Go to previous page"
          disabled={page === 0}
          onClick={() => setPageIndex(page - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Go to next page"
          disabled={page >= pageCount - 1}
          onClick={() => setPageIndex(page + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

export interface DataTableColumnsMenuProps<Row> {
  /** Every column that can be shown, including hidden ones. */
  columns: DataTableColumn<Row>[];
  /** The ids of the columns to show. */
  visible: string[];
  onVisibleChange: (visible: string[]) => void;
}

/** A "Columns" menu of checkbox items that show and hide columns. */
export function DataTableColumnsMenu<Row>({
  columns,
  visible,
  onVisibleChange,
}: DataTableColumnsMenuProps<Row>) {
  const shown = new Set(visible);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button variant="outline" size="sm" />}>
        Columns
        <ChevronDownIcon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {columns.map((column) => (
          <DropdownMenu.CheckboxItem
            key={column.id}
            checked={shown.has(column.id)}
            onCheckedChange={(checked) =>
              onVisibleChange(
                checked
                  ? columns.map((c) => c.id).filter((id) => id === column.id || shown.has(id))
                  : visible.filter((id) => id !== column.id),
              )
            }
          >
            {column.header}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

const styles = stylex.create({
  root: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    width: "100%",
  },
  toolbar: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  frame: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
  },
  select: {
    paddingInlineEnd: 0,
    width: spacing["6"],
  },
  checkbox: {
    verticalAlign: "middle",
  },
  end: {
    textAlign: "end",
  },
  sort: {
    paddingInline: spacing["2"],
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    marginInlineStart: `calc(-1 * ${spacing["2"]})`,
  },
  sortEnd: {
    marginInlineEnd: `calc(-1 * ${spacing["2"]})`,
    marginInlineStart: 0,
  },
  sortIconIdle: {
    opacity: 0.5,
  },
  row: {
    backgroundColor: {
      default: null,
      ":hover": {
        default: null,
        [media.hover]: `color-mix(in oklab, ${colors.muted} 40%, transparent)`,
      },
    },
    borderBottomWidth: {
      default: 1,
      ":last-child": 0,
    },
  },
  rowSelected: {
    backgroundColor: `color-mix(in oklab, ${colors.muted} 60%, transparent)`,
  },
  empty: {
    color: colors.mutedForeground,
    textAlign: "center",
    height: "6rem",
  },
  footer: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  summary: {
    color: colors.mutedForeground,
    flexGrow: {
      default: 0,
      ":first-child": 1,
    },
  },
});
