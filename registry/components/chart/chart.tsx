"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, type ReactNode, createContext, use, useState } from "react";
import {
  CartesianGrid,
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  type LegendPayload,
  type TooltipContentProps,
} from "recharts";
import { colors, elevation, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { type ChartFormat, formatValue, toggleKey } from "./chart-format";

/**
 * Series colors in order. A series defaults to the first; give each further series the next:
 *
 *   <Area dataKey="visitors" />
 *   <Area dataKey="signups" color={seriesColors[1]} />
 *
 * Past six series, group the smallest into "Other". More colors stop being distinguishable.
 */
export const seriesColors = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
  colors.chart6,
] as const;

interface ChartState {
  locale: string | undefined;
  hiddenSeries: readonly string[];
  toggleSeries: (key: string) => void;
}

const ChartContext = createContext<ChartState>({
  locale: undefined,
  hiddenSeries: [],
  toggleSeries: () => {},
});

/** The chart's locale and which series the reader has hidden through the legend. */
export function useChart(): ChartState {
  return use(ChartContext);
}

export interface RootProps extends Styled<Omit<ComponentProps<"div">, "aria-label">> {
  /** Names the chart for screen readers, such as "Revenue by month". */
  "aria-label": string;
  /** Width over height. */
  aspect?: number;
  /** Shows `emptyMessage` instead of the chart. */
  empty?: boolean;
  emptyMessage?: ReactNode;
  /** The locale numbers are printed in. Defaults to the browser's. */
  locale?: string;
  /** Series hidden through the legend, by `dataKey`. */
  hiddenSeries?: readonly string[];
  defaultHiddenSeries?: readonly string[];
  onHiddenSeriesChange?: (hiddenSeries: string[]) => void;
}

/** The props every chart kind takes before the Recharts chart's own: name, size, locale, state. */
export type ChartFrameProps = Omit<RootProps, "children">;

/** The props of a chart kind: its Recharts props, minus sizing Shelf owns, plus the frame's. */
export type ChartProps<RechartsProps> = Omit<
  RechartsProps,
  | "className"
  | "style"
  | "responsive"
  | "width"
  | "height"
  | "title"
  | "desc"
  | "accessibilityLayer"
> &
  ChartFrameProps;

/** Separates a chart kind's props into the frame's and the Recharts chart's. */
export function splitFrameProps<P extends ChartFrameProps>(props: P) {
  const {
    "aria-label": label,
    aspect,
    emptyMessage,
    locale,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
    style,
    ...chart
  } = props;
  const frame: ChartFrameProps = {
    "aria-label": label,
    aspect,
    emptyMessage,
    locale,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
    style,
  };
  return { frame, chart };
}

/**
 * The frame every chart kind renders inside: a named group, the chart's size, an empty state,
 * and the state the legend and series share. You use `AreaChart` and its siblings, not this.
 */
export function Root({
  "aria-label": label,
  aspect = 2,
  empty = false,
  emptyMessage = "No data to show.",
  locale,
  hiddenSeries,
  defaultHiddenSeries = [],
  onHiddenSeriesChange,
  style,
  children,
  ...props
}: RootProps) {
  const [uncontrolled, setUncontrolled] = useState<readonly string[]>(defaultHiddenSeries);
  const hidden = hiddenSeries ?? uncontrolled;

  const state: ChartState = {
    locale,
    hiddenSeries: hidden,
    toggleSeries: (key) => {
      const next = toggleKey(hidden, key);
      if (hiddenSeries === undefined) setUncontrolled(next);
      onHiddenSeriesChange?.(next);
    },
  };

  return (
    <ChartContext value={state}>
      <div
        data-slot="chart"
        role="group"
        aria-label={label}
        {...props}
        {...stylex.props(styles.root, aspectStyles.ratio(aspect), style)}
      >
        {empty ? (
          <div data-slot="chart-empty" role="status" {...stylex.props(styles.empty)}>
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </ChartContext>
  );
}

export function Grid(props: ComponentProps<typeof CartesianGrid>) {
  return (
    <CartesianGrid
      vertical={false}
      stroke={colors.chartGrid}
      strokeDasharray="0.1 6"
      strokeLinecap="round"
      strokeWidth={2}
      data-slot="chart-grid"
      {...props}
    />
  );
}

interface FormatProps {
  /** `Intl.NumberFormat` options, or a function, for tick labels. */
  format?: ChartFormat;
}

type XAxisProps = Omit<ComponentProps<typeof RechartsXAxis>, "tickFormatter" | "format"> &
  FormatProps;
type YAxisProps = Omit<ComponentProps<typeof RechartsYAxis>, "tickFormatter" | "format"> &
  FormatProps;

export function XAxis({ format, ...props }: XAxisProps) {
  const { locale } = useChart();
  return (
    <RechartsXAxis
      axisLine={false}
      tickLine={false}
      tickMargin={8}
      tick={tick}
      tickFormatter={(value: unknown) => formatValue(value, format, locale)}
      {...props}
    />
  );
}

export function YAxis({ format, ...props }: YAxisProps) {
  const { locale } = useChart();
  return (
    <RechartsYAxis
      axisLine={false}
      tickLine={false}
      tickMargin={8}
      width="auto"
      tick={tick}
      tickFormatter={(value: unknown) => formatValue(value, format, locale)}
      {...props}
    />
  );
}

/** How a series is filled. `hatch` is diagonal lines and `dots` is a dot grid, for telling series apart without color. */
export type ChartPattern = "solid" | "hatch" | "dots";

/** The fill for a series: the color itself, or a reference to a `SeriesPattern` with this id. */
export function patternFill(pattern: ChartPattern, id: string, color: string): string {
  return pattern === "solid" ? color : `url(#${id})`;
}

/** Defines a pattern for `patternFill`. Render it inside the chart, next to the series. */
export function SeriesPattern({
  id,
  color,
  pattern,
}: {
  id: string;
  color: string;
  pattern: ChartPattern;
}) {
  if (pattern === "solid") return null;
  return (
    <defs>
      <pattern
        id={id}
        width={6}
        height={6}
        patternUnits="userSpaceOnUse"
        patternTransform={pattern === "hatch" ? "rotate(45)" : undefined}
      >
        <rect width={6} height={6} fill={color} fillOpacity={0.14} />
        {pattern === "hatch" ? (
          <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={2} strokeOpacity={0.7} />
        ) : (
          <circle cx={3} cy={3} r={1.1} fill={color} fillOpacity={0.8} />
        )}
      </pattern>
    </defs>
  );
}

/** The marker on a line or area under the pointer: a dot with a soft halo. Used by `Line` and `Area`. */
export function ActiveDot({ cx, cy, color }: { cx?: number; cy?: number; color: string }) {
  if (cx === undefined || cy === undefined) return null;
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={9} fill={color} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={4.5} fill={color} stroke={colors.background} strokeWidth={2} />
    </g>
  );
}

export interface TooltipProps {
  /** Formats each value in the tooltip. */
  format?: ChartFormat;
  /** Formats the heading, which is the hovered x value. */
  labelFormat?: ChartFormat;
}

/** The tooltip that follows the pointer or the arrow keys. */
export function Tooltip({ format, labelFormat }: TooltipProps) {
  return (
    <RechartsTooltip
      cursor={{ fill: colors.chartCursor, stroke: colors.chartGrid }}
      isAnimationActive={false}
      content={<TooltipContent format={format} labelFormat={labelFormat} />}
    />
  );
}

function tooltipColor(item: { color?: string; payload?: { fill?: string } }): string {
  return item.color ?? item.payload?.fill ?? colors.foreground;
}

/** The dash pattern of a dashed or dotted line series, so its swatch can match. */
function dashOf(item: { strokeDasharray?: unknown; payload?: unknown }): string | undefined {
  const own: unknown = item.strokeDasharray;
  const inherited: unknown =
    typeof item.payload === "object" && item.payload !== null && "strokeDasharray" in item.payload
      ? item.payload.strokeDasharray
      : undefined;
  const dash = own ?? inherited;
  return typeof dash === "string" ? dash : undefined;
}

/** The key beside a legend entry or tooltip value: a dot, a pattern tile, or a dashed stroke, matching the series. */
function Swatch({ color, dash }: { color: string; dash?: string | undefined }) {
  if (dash) {
    return (
      <svg aria-hidden width={16} height={8} {...stylex.props(styles.swatchSvg)}>
        <line
          x1={2}
          y1={4}
          x2={14}
          y2={4}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dash}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (color.startsWith("url(")) {
    return (
      <svg aria-hidden width={12} height={12} {...stylex.props(styles.swatchSvg)}>
        <rect
          x={0.5}
          y={0.5}
          width={11}
          height={11}
          rx={2}
          fill={color}
          stroke={colors.mutedForeground}
          strokeOpacity={0.7}
        />
      </svg>
    );
  }
  return <span aria-hidden {...stylex.props(styles.swatch, swatchStyles.color(color))} />;
}

/** Patterns for categorical charts (pie, radial), so neighbouring slices differ by more than shade. */
const slicePatterns: readonly ChartPattern[] = ["solid", "solid", "hatch", "dots", "hatch", "dots"];

export function slicePattern(index: number): ChartPattern {
  return slicePatterns[index % slicePatterns.length] ?? "solid";
}

function TooltipContent({
  active,
  payload,
  label,
  format,
  labelFormat,
}: Partial<TooltipContentProps> & TooltipProps) {
  const { locale } = useChart();
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div data-slot="chart-tooltip" {...stylex.props(styles.tooltip)}>
      {label !== undefined && (
        <div {...stylex.props(styles.tooltipLabel)}>{formatValue(label, labelFormat, locale)}</div>
      )}
      <ul {...stylex.props(styles.tooltipList)}>
        {payload.map((item) => (
          <li key={String(item.dataKey ?? item.name)} {...stylex.props(styles.tooltipRow)}>
            <Swatch color={tooltipColor(item)} dash={dashOf(item)} />
            <span {...stylex.props(styles.tooltipName)}>{item.name}</span>
            <span {...stylex.props(styles.tooltipValue)}>
              {formatValue(item.value, format, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One toggle per series. Pressing it hides or shows the series, and the axes rescale to what is shown. */
export function Legend(props: Pick<ComponentProps<typeof RechartsLegend>, "verticalAlign">) {
  return (
    <RechartsLegend
      verticalAlign="top"
      itemSorter={null}
      align="left"
      {...props}
      content={<LegendContent />}
    />
  );
}

function LegendContent({ payload = [] }: { payload?: readonly LegendPayload[] }) {
  const { hiddenSeries, toggleSeries } = useChart();
  // A series is toggled by its dataKey. Pie slices all share one dataKey, so they are toggled by name.
  const keyOf = (item: LegendPayload) => {
    const shared = payload.filter((other) => other.dataKey === item.dataKey).length > 1;
    return String(shared || item.dataKey === undefined ? item.value : item.dataKey);
  };
  // Two series on one dataKey (say an area and a line) share a toggle, so they share an entry.
  const items = payload.filter(
    (item, i) => payload.findIndex((o) => keyOf(o) === keyOf(item)) === i,
  );

  return (
    <ul data-slot="chart-legend" {...stylex.props(styles.legend)}>
      {items.map((item) => {
        const key = keyOf(item);
        const hidden = hiddenSeries.includes(key);
        return (
          <li key={key}>
            <button
              type="button"
              aria-pressed={!hidden}
              onClick={() => toggleSeries(key)}
              {...stylex.props(styles.legendItem, hidden && styles.legendItemHidden)}
            >
              <Swatch color={String(item.color)} dash={dashOf(item)} />
              {item.value}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const aspectStyles = stylex.create({
  ratio: (ratio: number) => ({ aspectRatio: ratio }),
});

const swatchStyles = stylex.create({
  color: (color: string) => ({ backgroundColor: color }),
});

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    boxSizing: "border-box",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    maxWidth: "100%",
    minWidth: 0,
    width: "100%",
  },
  frame: {
    height: "100%",
    width: "100%",
  },
  tick: {
    fill: colors.mutedForeground,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontVariantNumeric: "tabular-nums",
  },
  empty: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    alignItems: "center",
    boxSizing: "border-box",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  tooltip: {
    padding: spacing["2.5"],
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1.5"],
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    minWidth: "8rem",
  },
  tooltipLabel: {
    color: colors.mutedForeground,
    fontWeight: typography.fontWeightMedium,
  },
  tooltipList: {
    margin: 0,
    padding: 0,
    gap: spacing["1"],
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  tooltipRow: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
  tooltipName: {
    flexGrow: 1,
  },
  tooltipValue: {
    fontFamily: typography.fontFamilyMono,
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightMedium,
  },
  swatchSvg: {
    overflow: "visible",
    display: "block",
    flexShrink: 0,
  },
  swatch: {
    borderRadius: radius.full,
    flexShrink: 0,
    height: "0.5rem",
    width: "0.5rem",
  },
  legend: {
    margin: 0,
    padding: 0,
    gap: spacing["1"],
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
  legendItem: {
    borderColor: "transparent",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1.5"],
    paddingBlock: spacing["1"],
    paddingInline: spacing["2"],
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.muted,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: "inherit",
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
  },
  legendItemHidden: {
    textDecoration: "line-through",
    color: colors.mutedForeground,
  },
});

/** Spread onto the Recharts chart so it fills the frame. Used by the chart kinds. */
export const frameProps = stylex.props(styles.frame);

const tick = stylex.props(styles.tick);
