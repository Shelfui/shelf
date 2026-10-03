"use client";

import { type ComponentProps, useId } from "react";
import { Area as RechartsArea, AreaChart as RechartsAreaChart } from "recharts";
import {
  ActiveDot,
  type ChartPattern,
  type ChartProps,
  SeriesPattern,
  patternFill,
  Root,
  frameProps,
  seriesColors,
  splitFrameProps,
  useChart,
} from "./chart";
import { type ChartCurve, curveType } from "./chart-format";

export type AreaChartProps = ChartProps<ComponentProps<typeof RechartsAreaChart>>;

/**
 * Trends over a continuous range, such as revenue by month. Compose the parts:
 *
 *   <AreaChart aria-label="Revenue by month" data={data}>
 *     <Chart.Grid />
 *     <Chart.XAxis dataKey="month" />
 *     <Chart.YAxis format={{ style: "currency", currency: "USD" }} />
 *     <Chart.Tooltip />
 *     <Area dataKey="revenue" />
 *   </AreaChart>
 *
 * It fills its container's width. Use `aspect` for the shape, and `Chart.Legend` with more than one series.
 */
export function AreaChart({ children, ...props }: AreaChartProps) {
  const { frame, chart } = splitFrameProps(props);
  return (
    <Root {...frame} empty={props.data?.length === 0}>
      <RechartsAreaChart responsive {...frameProps} {...chart}>
        {children}
      </RechartsAreaChart>
    </Root>
  );
}

export interface AreaProps extends Omit<
  ComponentProps<typeof RechartsArea>,
  "dataKey" | "type" | "stroke" | "fill" | "hide" | "stackId"
> {
  /** The key in each data item that holds this series' value. Also names it in the legend. */
  dataKey: string;
  /** Defaults to the first series color. */
  color?: string;
  curve?: ChartCurve;
  /** Stacks this series on the others that are stacked. */
  stacked?: boolean;
  /** What fills the area: diagonal `hatch` lines by default, `dots`, or a soft `gradient`. */
  pattern?: Exclude<ChartPattern, "solid"> | "gradient";
}

/** One series, drawn as a line with a patterned fill beneath it. */
export function Area({
  dataKey,
  color = seriesColors[0],
  curve = "smooth",
  stacked,
  pattern = "hatch",
  ...props
}: AreaProps) {
  const { hiddenSeries } = useChart();
  const id = useId();

  return (
    <>
      {pattern === "gradient" ? (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.36} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      ) : (
        <SeriesPattern id={id} color={color} pattern={pattern} />
      )}
      <RechartsArea
        dataKey={dataKey}
        type={curveType(curve)}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        animationDuration={700}
        animationEasing="ease-out"
        fill={pattern === "gradient" ? `url(#${id})` : patternFill(pattern, id, color)}
        stackId={stacked ? "stack" : undefined}
        hide={hiddenSeries.includes(dataKey)}
        dot={false}
        activeDot={<ActiveDot color={color} />}
        {...props}
      />
    </>
  );
}
