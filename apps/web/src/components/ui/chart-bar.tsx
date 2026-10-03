"use client";

import { type ComponentProps, useId } from "react";
import { Bar as RechartsBar, BarChart as RechartsBarChart } from "recharts";
import {
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

export type BarChartProps = ChartProps<ComponentProps<typeof RechartsBarChart>>;

/**
 * Compares values across categories. Compose the parts:
 *
 *   <BarChart aria-label="Orders by channel" data={data}>
 *     <Chart.Grid />
 *     <Chart.XAxis dataKey="channel" />
 *     <Chart.YAxis />
 *     <Chart.Tooltip />
 *     <Bar dataKey="orders" />
 *   </BarChart>
 *
 * For horizontal bars, set `layout="vertical"`, give `XAxis` `type="number"`, and give
 * `YAxis` `type="category"` and a `dataKey`.
 */
export function BarChart({ children, ...props }: BarChartProps) {
  const { frame, chart } = splitFrameProps(props);
  return (
    <Root {...frame} empty={props.data?.length === 0}>
      <RechartsBarChart responsive barGap={4} barCategoryGap="24%" {...frameProps} {...chart}>
        {children}
      </RechartsBarChart>
    </Root>
  );
}

export interface BarProps extends Omit<
  ComponentProps<typeof RechartsBar>,
  "dataKey" | "fill" | "hide" | "stackId"
> {
  /** The key in each data item that holds this series' value. Also names it in the legend. */
  dataKey: string;
  /** Defaults to the first series color. */
  color?: string;
  /** Stacks this series on the others that are stacked. */
  stacked?: boolean;
  /** `solid` by default. Use `hatch` or `dots` to tell series apart without color. */
  pattern?: ChartPattern;
}

/** One series, drawn as bars. Unstacked bars have rounded ends. */
export function Bar({
  dataKey,
  color = seriesColors[0],
  stacked,
  pattern = "solid",
  ...props
}: BarProps) {
  const { hiddenSeries } = useChart();
  const id = useId();

  return (
    <>
      <SeriesPattern id={id} color={color} pattern={pattern} />
      <RechartsBar
        dataKey={dataKey}
        fill={patternFill(pattern, id, color)}
        stroke={pattern === "solid" ? undefined : color}
        strokeOpacity={0.8}
        animationDuration={700}
        animationEasing="ease-out"
        radius={stacked ? 0 : 3}
        maxBarSize={48}
        stackId={stacked ? "stack" : undefined}
        hide={hiddenSeries.includes(dataKey)}
        {...props}
      />
    </>
  );
}
