"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useId } from "react";
import { Cell, Pie as RechartsPie, PieChart as RechartsPieChart, usePlotArea } from "recharts";
import { colors, typography } from "@/styles/shelf/tokens.stylex";
import {
  type ChartProps,
  Root,
  SeriesPattern,
  patternFill,
  slicePattern,
  frameProps,
  seriesColors,
  splitFrameProps,
  useChart,
} from "./chart";

export type PieChartProps = ChartProps<ComponentProps<typeof RechartsPieChart>>;

/**
 * Parts of a whole, for a handful of slices. Compose the parts:
 *
 *   <PieChart aria-label="Orders by channel">
 *     <Chart.Tooltip />
 *     <Chart.Legend />
 *     <Pie data={data} dataKey="orders" nameKey="channel" donut centerValue="1,284" centerLabel="Orders" />
 *   </PieChart>
 *
 * Past six slices, group the smallest into "Other". A bar chart reads better for many categories.
 */
export function PieChart({ children, aspect = 1.4, ...props }: PieChartProps) {
  const { frame, chart } = splitFrameProps({ aspect, ...props });
  return (
    <Root {...frame}>
      <RechartsPieChart responsive {...frameProps} {...chart}>
        {children}
      </RechartsPieChart>
    </Root>
  );
}

export interface PieProps extends Omit<
  ComponentProps<typeof RechartsPie>,
  "data" | "dataKey" | "nameKey" | "innerRadius" | "outerRadius" | "fill" | "children"
> {
  data: ReadonlyArray<Record<string, unknown>>;
  /** The key in each data item that holds its value. */
  dataKey: string;
  /** The key in each data item that holds its name. Also names the slice in the legend. */
  nameKey: string;
  /** A ring instead of a disc. */
  donut?: boolean;
  /** Slice colors, in data order. Defaults to the series colors. */
  sliceColors?: readonly string[];
  /** Large text in the middle of a donut, such as a total. */
  centerValue?: string;
  /** Smaller text under `centerValue`. */
  centerLabel?: string;
}

/** The slices. Slices hidden through the legend collapse to nothing. */
export function Pie({
  data,
  dataKey,
  nameKey,
  donut = false,
  sliceColors = seriesColors,
  centerValue,
  centerLabel,
  ...props
}: PieProps) {
  const { hiddenSeries } = useChart();
  const visible = data.map((item) =>
    hiddenSeries.includes(String(item[nameKey])) ? { ...item, [dataKey]: 0 } : item,
  );

  const id = useId();
  const sliceColor = (index: number) => sliceColors[index % sliceColors.length] ?? seriesColors[0];

  return (
    <>
      {data.map((item, index) => (
        <SeriesPattern
          key={String(item[nameKey])}
          id={`${id}-${index}`}
          color={sliceColor(index)}
          pattern={slicePattern(index)}
        />
      ))}
      <RechartsPie
        data={visible}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={donut ? "62%" : 0}
        outerRadius="100%"
        paddingAngle={2}
        cornerRadius={4}
        stroke={colors.background}
        strokeWidth={2}
        {...props}
      >
        {data.map((item, index) => (
          <Cell
            key={String(item[nameKey])}
            fill={patternFill(slicePattern(index), `${id}-${index}`, sliceColor(index))}
          />
        ))}
      </RechartsPie>
      {donut && centerValue !== undefined && (
        <CenterLabel value={centerValue} label={centerLabel} />
      )}
    </>
  );
}

interface CenterLabelProps {
  value: string;
  label: string | undefined;
}

function CenterLabel({ value, label }: CenterLabelProps) {
  const area = usePlotArea();
  if (!area) return null;
  const cx = area.x + area.width / 2;
  const cy = area.y + area.height / 2;

  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" data-slot="chart-center">
      <tspan x={cx} dy={label ? "-0.2em" : 0} {...stylex.props(styles.value)}>
        {value}
      </tspan>
      {label && (
        <tspan x={cx} dy="1.9em" {...stylex.props(styles.label)}>
          {label}
        </tspan>
      )}
    </text>
  );
}

const styles = stylex.create({
  value: {
    fill: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeLg,
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightSemibold,
  },
  label: {
    fill: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
  },
});
