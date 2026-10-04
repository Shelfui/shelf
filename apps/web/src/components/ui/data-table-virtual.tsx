"use client";

import * as stylex from "@stylexjs/stylex";
import type { RowData } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type ComponentProps, type ReactNode, useRef } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import {
  DataTableHeaderRow,
  type DataTableInstance,
  DataTableRow,
  DataTableSelectionCount,
} from "./data-table";
import * as Table from "./table";

/** The height of one row in pixels. It must match `styles.row`, since the rows are measured once. */
const ROW_HEIGHT = 44;

export type DataTableVirtualProps<TData extends RowData> = Styled<
  Omit<ComponentProps<"div">, "children">
> & {
  /** From `useDataTable({ ..., paginate: false })`. */
  table: DataTableInstance<TData>;
  /** Adds a checkbox column with select-all for every row that passes the filters. */
  selectable?: boolean;
  /** Controls above the table, such as a filter `Input` and `DataTableColumnsMenu`. */
  toolbar?: ReactNode;
  /** Names the table and its scrolling area for assistive tech. */
  label: string;
};

/**
 * A data table for thousands of rows. It scrolls inside a fixed-height area and renders only
 * the rows in view, so ten thousand rows cost about as much as thirty.
 *
 *   const table = useDataTable({ columns, data, getRowId: (row) => row.id, paginate: false });
 *   <DataTableVirtual table={table} label="Events" selectable />
 *
 * It keeps real table markup with a sticky header, and sets `aria-rowcount` and `aria-rowindex`
 * so screen readers still hear the position in the full list. Rows are a fixed 44px tall.
 * Set the area's height with `style`.
 */
export function DataTableVirtual<TData extends RowData>({
  table,
  selectable = false,
  toolbar,
  label,
  style,
  ...props
}: DataTableVirtualProps<TData>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  // React Compiler skips memoizing this component, because the virtualizer's functions change
  // identity. The component re-renders on scroll anyway, so nothing goes stale.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => rows[index]!.id,
    overscan: 8,
  });
  const items = virtualizer.getVirtualItems();
  const before = items[0]?.start ?? 0;
  const after = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0);
  const columnCount = table.getVisibleLeafColumns().length + (selectable ? 1 : 0);

  return (
    <div data-slot="data-table-virtual" {...props} {...stylex.props(styles.root)}>
      {toolbar && (
        <div data-slot="data-table-toolbar" {...stylex.props(styles.toolbar)}>
          {toolbar}
        </div>
      )}
      <div
        ref={scrollRef}
        role="region"
        aria-label={`${label}, scrollable`}
        tabIndex={0}
        {...stylex.props(styles.scroller, style)}
      >
        <table aria-label={label} aria-rowcount={rows.length + 1} {...stylex.props(styles.table)}>
          <Table.Header style={styles.header}>
            <DataTableHeaderRow table={table} selectable={selectable} />
          </Table.Header>
          <Table.Body>
            {before > 0 && <Spacer height={before} columnCount={columnCount} />}
            {items.map((item) => {
              const row = rows[item.index]!;
              return (
                <DataTableRow
                  key={row.id}
                  row={row}
                  cells={row.getVisibleCells()}
                  selected={row.getIsSelected()}
                  selectable={selectable}
                  style={styles.row}
                  aria-rowindex={item.index + 2}
                />
              );
            })}
            {after > 0 && <Spacer height={after} columnCount={columnCount} />}
            {rows.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={columnCount} style={styles.empty}>
                  No results.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </table>
      </div>
      <div data-slot="data-table-footer" {...stylex.props(styles.footer)}>
        <span {...stylex.props(styles.summary)}>
          {selectable && <DataTableSelectionCount table={table} />}
        </span>
        <span>
          {rows.length.toLocaleString("en-US")} {rows.length === 1 ? "row" : "rows"}
        </span>
      </div>
    </div>
  );
}

/** Stands in for the rows above or below the ones rendered, so the scrollbar is the full size. */
function Spacer({ height, columnCount }: { height: number; columnCount: number }) {
  return (
    <tr aria-hidden="true">
      <td colSpan={columnCount} {...stylex.props(styles.spacer(height))} />
    </tr>
  );
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
  scroller: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "auto",
    height: "30rem",
  },
  table: {
    fontSynthesis: "none",
    borderCollapse: "collapse",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "100%",
  },
  // The header stays in view. A box shadow draws its bottom border, since a sticky element
  // leaves collapsed borders behind.
  header: {
    backgroundColor: colors.background,
    boxShadow: `inset 0 -1px 0 ${colors.border}`,
    position: "sticky",
    zIndex: 1,
    top: 0,
  },
  row: {
    height: "44px",
  },
  // A runtime value: the height of the rows that are scrolled out of view.
  spacer: (height: number) => ({
    padding: 0,
    height: `${height}px`,
  }),
  empty: {
    color: colors.mutedForeground,
    textAlign: "center",
    height: "6rem",
  },
  footer: {
    gap: spacing["2"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    justifyContent: "space-between",
    lineHeight: typography.lineHeightSm,
  },
  summary: {
    flexGrow: 1,
  },
});
