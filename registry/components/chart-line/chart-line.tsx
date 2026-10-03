"use client";

import { type ComponentProps } from "react";
import { Line as RechartsLine, LineChart as RechartsLineChart } from "recharts";
import {
  ActiveDot,
  type ChartProps,
  Root,
  frameProps,
  seriesColors,
  splitFrameProps,
  useChart,
} from "../chart/chart";
import { type ChartCurve, curveType } from "../chart/chart-format";

export type LineChartProps = ChartProps<ComponentProps<typeof RechartsLineChart>>;

/**
 * Change over a range, where the line itself matters more than the area under it. Compose the parts:
 *
 *   <LineChart aria-label="Visitors by day" data={data}>
 *     <Chart.Grid />
 *     <Chart.XAxis dataKey="day" />
 *     <Chart.YAxis />
 *     <Chart.Tooltip />
 *     <Line dataKey="visitors" />
 *   </LineChart>
 */
export function LineChart({ children, ...props }: LineChartProps) {
  const { frame, chart } = splitFrameProps(props);
  return (
    <Root {...frame} empty={props.data?.length === 0}>
      <RechartsLineChart responsive {...frameProps} {...chart}>
        {children}
      </RechartsLineChart>
    </Root>
  );
}

export interface LineProps extends Omit<
  ComponentProps<typeof RechartsLine>,
  "dataKey" | "type" | "stroke" | "fill" | "hide"
> {
  /** The key in each data item that holds this series' value. Also names it in the legend. */
  dataKey: string;
  /** Defaults to the first series color. */
  color?: string;
  curve?: ChartCurve;
  /** `solid` by default. `dashed` and `dotted` tell series apart without color. */
  pattern?: "solid" | "dashed" | "dotted";
}

const dashes = { solid: undefined, dashed: "7 5", dotted: "0.1 6" } as const;

/** One series, drawn as a line. Points show on hover and keyboard focus. */
export function Line({
  dataKey,
  color = seriesColors[0],
  curve = "smooth",
  pattern = "solid",
  ...props
}: LineProps) {
  const { hiddenSeries } = useChart();

  return (
    <RechartsLine
      dataKey={dataKey}
      type={curveType(curve)}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeDasharray={dashes[pattern]}
      animationDuration={700}
      animationEasing="ease-out"
      hide={hiddenSeries.includes(dataKey)}
      dot={false}
      activeDot={<ActiveDot color={color} />}
      {...props}
    />
  );
}
