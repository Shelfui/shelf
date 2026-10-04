"use client";

import {
  type Cell,
  type ColumnDef,
  type Column,
  FlexRender,
  type Header,
  type ReactTable,
  type Row,
  type RowData,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, type ReactNode, memo } from "react";
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

// A type-only slot: TanStack Table reads the type of `meta` on a column from it.
const columnMeta: DataTableColumnMeta = {};

/**
 * The TanStack Table features a Shelf data table uses. Add a feature here (and its row model)
 * to unlock more of TanStack Table, such as `columnPinningFeature` or `rowExpandingFeature`.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** Extra, optional column settings, set in a column's `meta`. */
export interface DataTableColumnMeta {
  /** Use `end` for numbers such as amounts. */
  align?: "start" | "end";
}

/** A TanStack column definition for a Shelf data table. */
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

/** The table instance that `useDataTable` returns and the other parts take. */
export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;

export interface UseDataTableOptions<TData extends RowData> {
  /** Keep this array stable: define it outside the component or wrap it in `useMemo`. */
  columns: DataTableColumnDef<TData>[];
  /** Keep this array stable too, so sorting and filtering are not redone on every render. */
  data: TData[];
  getRowId: (row: TData) => string;
  /** @default 10 */
  pageSize?: number;
  /**
   * Set to `false` to show every row, for a table that scrolls instead of paging.
   * @default true
   */
  paginate?: boolean;
}

/**
 * A TanStack table with sorting, filtering, pagination, row selection, and column visibility.
 * It returns the plain TanStack table, so every TanStack method works on it:
 *
 *   const table = useDataTable({ columns, data, getRowId: (row) => row.id });
 *   table.getColumn("customer")?.setFilterValue("acme");
 */
export function useDataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  paginate = true,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  return useTable<DataTableFeatures, TData>({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    manualPagination: !paginate,
    // The first click sorts ascending, for numbers too.
    sortDescFirst: false,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });
}

export type DataTableProps<TData extends RowData> = Styled<
  Omit<ComponentProps<"div">, "children">
> & {
  table: DataTableInstance<TData>;
  /** Adds a checkbox column with select-all for the current page. */
  selectable?: boolean;
  /** Controls above the table, such as a filter `Input` and `DataTableColumnsMenu`. */
  toolbar?: ReactNode;
  /** Replaces the default footer, which is `DataTablePagination`. */
  footer?: ReactNode;
  /** Names the table for assistive tech. */
  label?: string;
};

/**
 * A Shelf Table driven by a TanStack table from `useDataTable`.
 *
 *   const columns: DataTableColumnDef<Invoice>[] = [
 *     { accessorKey: "customer", header: "Customer" },
 *     {
 *       accessorKey: "amount",
 *       header: "Amount",
 *       cell: ({ row }) => format(row.original.amount),
 *       meta: { align: "end" },
 *     },
 *   ];
 *
 *   const table = useDataTable({ columns, data: invoices, getRowId: (row) => row.id });
 *   <DataTable table={table} label="Invoices" selectable />
 *
 * Sortable columns get a sort button that cycles ascending, descending, and unsorted, and sets
 * `aria-sort` on the header. Turn it off for a column with `enableSorting: false`.
 */
export function DataTable<TData extends RowData>({
  table,
  selectable = false,
  toolbar,
  footer,
  label,
  style,
  ...props
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length + (selectable ? 1 : 0);

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
            <DataTableHeaderRow table={table} selectable={selectable} />
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <DataTableRow
                key={row.id}
                row={row}
                cells={row.getVisibleCells()}
                selected={row.getIsSelected()}
                selectable={selectable}
              />
            ))}
            {rows.length === 0 && (
              <Table.Row style={styles.row}>
                <Table.Cell colSpan={columnCount} style={styles.empty}>
                  No results.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
      {footer === undefined ? (
        <DataTablePagination table={table} selectable={selectable} />
      ) : (
        footer
      )}
    </div>
  );
}

export interface DataTableHeaderRowProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  selectable?: boolean;
}

/** The header row: a select-all checkbox and a sort button on every sortable column. */
export function DataTableHeaderRow<TData extends RowData>({
  table,
  selectable = false,
}: DataTableHeaderRowProps<TData>) {
  const rows = table.getRowModel().rows;
  const selectedOnPage = rows.filter((row) => row.getIsSelected()).length;

  return table.getHeaderGroups().map((group) => (
    <Table.Row key={group.id}>
      {selectable && (
        <Table.Head style={styles.select}>
          <Checkbox
            aria-label={
              table.options.manualPagination ? "Select all rows" : "Select all rows on this page"
            }
            style={styles.checkbox}
            checked={rows.length > 0 && selectedOnPage === rows.length}
            indeterminate={selectedOnPage > 0 && selectedOnPage < rows.length}
            disabled={rows.length === 0}
            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        </Table.Head>
      )}
      {group.headers.map((header) => (
        <DataTableHead
          key={header.id}
          header={header}
          sorted={header.column.getIsSorted()}
          canSort={header.column.getCanSort()}
        />
      ))}
    </Table.Row>
  ));
}

interface DataTableHeadProps<TData extends RowData> {
  header: Header<DataTableFeatures, TData>;
  sorted: false | "asc" | "desc";
  canSort: boolean;
}

function DataTableHeadView<TData extends RowData>({
  header,
  sorted,
  canSort,
}: DataTableHeadProps<TData>) {
  const align = header.column.columnDef.meta?.align;
  const SortIcon =
    sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon;
  const title = header.isPlaceholder ? null : <FlexRender header={header} />;

  return (
    <Table.Head
      aria-sort={
        canSort
          ? sorted === "asc"
            ? "ascending"
            : sorted === "desc"
              ? "descending"
              : "none"
          : undefined
      }
      style={align === "end" && styles.end}
    >
      {canSort ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => header.column.toggleSorting()}
          style={[styles.sort, align === "end" && styles.sortEnd]}
        >
          {title}
          <SortIcon {...stylex.props(!sorted && styles.sortIconIdle)} />
        </Button>
      ) : (
        title
      )}
    </Table.Head>
  );
}

// `memo` drops the generic signature, so the cast puts it back.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const DataTableHead = memo(DataTableHeadView) as typeof DataTableHeadView;

export interface DataTableRowProps<TData extends RowData> {
  row: Row<DataTableFeatures, TData>;
  /** `row.getVisibleCells()`. Passing it in keeps the row from rendering when nothing changed. */
  cells: Cell<DataTableFeatures, TData>[];
  /** `row.getIsSelected()`. */
  selected: boolean;
  selectable?: boolean;
  /** Styles merged after the row's own, such as a fixed height. */
  style?: stylex.StaticStyles;
}

/**
 * One body row. It only renders again when its row, cells, or selection change, so selecting
 * one row does not render the rest.
 */
function DataTableRowView<TData extends RowData>({
  row,
  cells,
  selected,
  selectable = false,
  style,
  ...props
}: DataTableRowProps<TData> & Omit<ComponentProps<"tr">, "style" | "className">) {
  return (
    <Table.Row
      {...props}
      data-state={selected ? "selected" : undefined}
      style={[styles.row, selected && styles.rowSelected, style]}
    >
      {selectable && (
        <Table.Cell style={styles.select}>
          <Checkbox
            aria-label="Select row"
            style={styles.checkbox}
            checked={selected}
            onCheckedChange={(checked) => row.toggleSelected(checked)}
          />
        </Table.Cell>
      )}
      {cells.map((cell) => (
        <Table.Cell key={cell.id} style={cell.column.columnDef.meta?.align === "end" && styles.end}>
          <FlexRender cell={cell} />
        </Table.Cell>
      ))}
    </Table.Row>
  );
}

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- `memo` drops the generic signature
export const DataTableRow = memo(DataTableRowView) as typeof DataTableRowView;

export interface DataTablePaginationProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  /** Shows how many rows are selected. */
  selectable?: boolean;
}

/** "N of M selected", the page number, and previous and next buttons. */
export function DataTablePagination<TData extends RowData>({
  table,
  selectable = false,
}: DataTablePaginationProps<TData>) {
  const { pageIndex } = table.state.pagination;

  return (
    <div data-slot="data-table-footer" {...stylex.props(styles.footer)}>
      <span {...stylex.props(styles.summary)}>
        {selectable && <DataTableSelectionCount table={table} />}
      </span>
      <span {...stylex.props(styles.summary)}>
        Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Go to previous page"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Go to next page"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

/** "N of M selected", counting the rows that pass the filters. */
export function DataTableSelectionCount<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>;
}) {
  const selected = table.getFilteredSelectedRowModel().rows.length;
  const total = table.getFilteredRowModel().rows.length;
  return (
    <>
      {selected.toLocaleString("en-US")} of {total.toLocaleString("en-US")} selected
    </>
  );
}

/** A "Columns" menu of checkbox items that show and hide columns. */
export function DataTableColumnsMenu<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger render={<Button variant="outline" size="sm" />}>
        Columns
        <ChevronDownIcon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenu.CheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked)}
            >
              {columnTitle(column)}
            </DropdownMenu.CheckboxItem>
          ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

/** A column's header text, or its id when the header is not plain text. */
function columnTitle<TData extends RowData>(column: Column<DataTableFeatures, TData>): string {
  const header = column.columnDef.header;
  return typeof header === "string" ? header : column.id;
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
