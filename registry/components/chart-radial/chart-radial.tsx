"use client";

import { type ComponentProps, useId } from "react";
import {
  Cell,
  RadialBar as RechartsRadialBar,
  RadialBarChart as RechartsRadialBarChart,
} from "recharts";
import { colors } from "../../foundations/tokens.stylex";
import {
  type ChartProps,
  Root,
  SeriesPattern,
  frameProps,
  patternFill,
  seriesColors,
  slicePattern,
  splitFrameProps,
} from "../chart/chart";

export type RadialChartProps = ChartProps<ComponentProps<typeof RechartsRadialBarChart>>;

/**
 * Progress toward a goal, or a few values on concentric rings. Compose the parts:
 *
 *   <RadialChart aria-label="Storage used" data={[{ name: "Used", value: 72 }]} startAngle={90} endAngle={-270}>
 *     <RadialBar dataKey="value" max={100} />
 *   </RadialChart>
 *
 * For a single value in a known range, Meter or Progress is often simpler.
 */
export function RadialChart({ children, aspect = 1, ...props }: RadialChartProps) {
  const { frame, chart } = splitFrameProps({ aspect, ...props });
  return (
    <Root {...frame} empty={props.data?.length === 0}>
      <RechartsRadialBarChart
        responsive
        innerRadius="65%"
        outerRadius="100%"
        {...frameProps}
        {...chart}
      >
        {children}
      </RechartsRadialBarChart>
    </Root>
  );
}

export interface RadialBarProps extends Omit<
  ComponentProps<typeof RechartsRadialBar>,
  "dataKey" | "fill" | "background" | "children"
> {
  /** The key in each data item that holds its value. */
  dataKey: string;
  /** Ring colors, in data order. Defaults to the series colors. */
  ringColors?: readonly string[];
  /** The value that fills a ring all the way. Defaults to the largest value. */
  max?: number;
  /** The data, needed to color one ring per item. */
  data?: ReadonlyArray<unknown>;
}

/** The rings. */
export function RadialBar({
  dataKey,
  ringColors = seriesColors,
  max,
  data = [],
  ...props
}: RadialBarProps) {
  const id = useId();
  const ringColor = (index: number) => ringColors[index % ringColors.length] ?? seriesColors[0];

  return (
    <>
      {data.map((_, index) => (
        <SeriesPattern
          // react-doctor-disable-next-line react-doctor/no-array-index-as-key
          key={index}
          id={`${id}-${index}`}
          color={ringColor(index)}
          pattern={slicePattern(index)}
        />
      ))}
      <RechartsRadialBar
        dataKey={dataKey}
        cornerRadius={8}
        background={{ fill: colors.muted }}
        {...(max === undefined ? {} : { max })}
        {...props}
      >
        {data.map((_, index) => (
          <Cell
            // react-doctor-disable-next-line react-doctor/no-array-index-as-key
            key={index}
            fill={patternFill(slicePattern(index), `${id}-${index}`, ringColor(index))}
          />
        ))}
      </RechartsRadialBar>
    </>
  );
}
