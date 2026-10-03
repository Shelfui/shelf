"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { seriesColors } from "./chart";
import { type ChartFormat, formatValue } from "./chart-format";
import { HEATMAP_LEVELS, LEVEL_STRENGTH, heatmapLevel } from "./heatmap-levels";

export interface HeatmapProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  /** Says what the grid shows, such as "Orders by weekday and hour". */
  "aria-label": string;
  /** One label per row. */
  rows: readonly string[];
  /** One label per column. */
  columns: readonly string[];
  /** `values[row][column]`. */
  values: ReadonlyArray<readonly number[]>;
  /** Defaults to the first series color. Stronger cells mix in more of it. */
  color?: string;
  /** Prints the number in each cell instead of only in its tooltip and for screen readers. */
  showValues?: boolean;
  format?: ChartFormat;
  locale?: string;
}

/**
 * Intensity across two categories, such as orders by weekday and hour. It is a real table, so screen
 * readers get every value, and cells are one color at five strengths, so it follows your theme.
 */
export function Heatmap({
  rows,
  columns,
  values,
  color = seriesColors[0],
  showValues = false,
  format,
  locale,
  style,
  ...props
}: HeatmapProps) {
  const all = values.flat();

  return (
    <div data-slot="heatmap" {...props} {...stylex.props(styles.root, style)}>
      <table {...stylex.props(styles.table)} aria-label={props["aria-label"]}>
        <thead>
          <tr>
            <td />
            {columns.map((column) => (
              <th key={column} scope="col" {...stylex.props(styles.header)}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row}>
              <th scope="row" {...stylex.props(styles.header, styles.rowHeader)}>
                {row}
              </th>
              {columns.map((column, c) => {
                const value = values[r]?.[c];
                if (value === undefined) return <td key={column} />;
                const level = heatmapLevel(value, all);
                const text = formatValue(value, format, locale);
                return (
                  <td
                    key={column}
                    title={`${row}, ${column}: ${text}`}
                    {...stylex.props(
                      styles.cell,
                      cellStyles.fill(levelFill(color, level)),
                      level === HEATMAP_LEVELS - 1 && styles.cellStrong,
                    )}
                  >
                    <span {...stylex.props(!showValues && styles.hidden)}>{text}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div aria-hidden {...stylex.props(styles.scale)}>
        Less
        {LEVEL_STRENGTH.map((strength, level) => (
          <span
            key={strength}
            {...stylex.props(styles.step, cellStyles.fill(levelFill(color, level)))}
          />
        ))}
        More
      </div>
    </div>
  );
}

/**
 * The fill for a level. Lighter levels fade the color out. The strongest darkens it toward the
 * foreground so the `background`-colored text on it keeps 4.5:1 in light and dark themes.
 */
function levelFill(color: string, level: number): string {
  if (level === HEATMAP_LEVELS - 1) {
    return `color-mix(in oklab, ${color} 82%, ${colors.foreground})`;
  }
  return `color-mix(in oklab, ${color} ${LEVEL_STRENGTH[level]}%, transparent)`;
}

const cellStyles = stylex.create({
  fill: (backgroundColor: string) => ({ backgroundColor }),
});

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    gap: spacing["3"],
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    maxWidth: "100%",
    overflowX: "auto",
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: spacing["1"],
    width: "100%",
  },
  header: {
    paddingInline: spacing["1"],
    color: colors.mutedForeground,
    fontWeight: typography.fontWeightRegular,
    textAlign: "center",
  },
  rowHeader: {
    paddingInlineStart: 0,
    textAlign: "start",
    whiteSpace: "nowrap",
  },
  cell: {
    borderRadius: radius.sm,
    boxSizing: "border-box",
    color: colors.foreground,
    fontFamily: typography.fontFamilyMono,
    fontVariantNumeric: "tabular-nums",
    textAlign: "center",
    height: "2rem",
    minWidth: "2rem",
  },
  cellStrong: {
    color: colors.background,
  },
  hidden: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
  scale: {
    gap: spacing["1.5"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
  },
  step: {
    borderRadius: radius.sm,
    height: "0.75rem",
    width: "1.25rem",
  },
});
