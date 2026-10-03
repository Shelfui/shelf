"use client";

import { type ComponentProps } from "react";
import { Scatter as RechartsScatter, ScatterChart as RechartsScatterChart } from "recharts";
import {
  type ChartProps,
  Root,
  frameProps,
  seriesColors,
  splitFrameProps,
  useChart,
} from "./chart";

export { ZAxis } from "recharts";

export type ScatterChartProps = ChartProps<ComponentProps<typeof RechartsScatterChart>>;

/**
 * How two measures relate, one dot per item. Both axes are numbers. Compose the parts:
 *
 *   <ScatterChart aria-label="Price against rating">
 *     <Chart.Grid vertical />
 *     <Chart.XAxis type="number" dataKey="price" name="Price" />
 *     <Chart.YAxis type="number" dataKey="rating" name="Rating" />
 *     <Chart.Tooltip />
 *     <Scatter data={data} name="Products" />
 *   </ScatterChart>
 *
 * Add a `ZAxis` with a `range` to size the dots by a third measure.
 */
export function ScatterChart({ children, ...props }: ScatterChartProps) {
  const { frame, chart } = splitFrameProps(props);
  return (
    <Root {...frame}>
      <RechartsScatterChart responsive {...frameProps} {...chart}>
        {children}
      </RechartsScatterChart>
    </Root>
  );
}

export interface ScatterProps extends Omit<
  ComponentProps<typeof RechartsScatter>,
  "fill" | "hide" | "name"
> {
  /** Names the series in the legend and tooltip. Hiding it through the legend uses this name. */
  name: string;
  /** Defaults to the first series color. */
  color?: string;
}

/** One series, drawn as dots. */
export function Scatter({ name, color = seriesColors[0], ...props }: ScatterProps) {
  const { hiddenSeries } = useChart();

  return (
    <RechartsScatter
      name={name}
      fill={color}
      fillOpacity={0.7}
      stroke={color}
      hide={hiddenSeries.includes(name)}
      {...props}
    />
  );
}
