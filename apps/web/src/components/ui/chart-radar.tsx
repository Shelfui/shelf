"use client";

import { type ComponentProps, useId } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar as RechartsRadar,
  RadarChart as RechartsRadarChart,
} from "recharts";
import { colors } from "@/styles/shelf/tokens.stylex";
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

export type RadarChartProps = ChartProps<ComponentProps<typeof RechartsRadarChart>>;

/**
 * Compares a few series across the same handful of axes. Compose the parts:
 *
 *   <RadarChart aria-label="Skills" data={data}>
 *     <AngleGrid />
 *     <AngleAxis dataKey="skill" />
 *     <Chart.Tooltip />
 *     <Radar dataKey="score" />
 *   </RadarChart>
 *
 * Use five to eight axes. With fewer, a bar chart reads better.
 */
export function RadarChart({ children, aspect = 1.4, ...props }: RadarChartProps) {
  const { frame, chart } = splitFrameProps({ aspect, ...props });
  return (
    <Root {...frame} empty={props.data?.length === 0}>
      <RechartsRadarChart responsive outerRadius="75%" {...frameProps} {...chart}>
        {children}
      </RechartsRadarChart>
    </Root>
  );
}

/** The web the axes hang on. */
export function AngleGrid(props: ComponentProps<typeof PolarGrid>) {
  return <PolarGrid stroke={colors.chartGrid} data-slot="chart-grid" {...props} />;
}

/** The label at the end of each axis. */
export function AngleAxis(props: ComponentProps<typeof PolarAngleAxis>) {
  return <PolarAngleAxis tickLine={false} {...props} />;
}

export interface RadarProps extends Omit<
  ComponentProps<typeof RechartsRadar>,
  "dataKey" | "stroke" | "fill" | "hide"
> {
  /** The key in each data item that holds this series' value. Also names it in the legend. */
  dataKey: string;
  /** Defaults to the first series color. */
  color?: string;
  /** What fills the shape: a flat tint by default, or `hatch` or `dots` to tell series apart without color. */
  pattern?: ChartPattern;
}

/** One series, drawn as a filled shape. */
export function Radar({
  dataKey,
  color = seriesColors[0],
  pattern = "solid",
  ...props
}: RadarProps) {
  const { hiddenSeries } = useChart();
  const id = useId();

  return (
    <>
      <SeriesPattern id={id} color={color} pattern={pattern} />
      <RechartsRadar
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        fill={patternFill(pattern, id, color)}
        fillOpacity={pattern === "solid" ? 0.18 : 1}
        hide={hiddenSeries.includes(dataKey)}
        dot={{ r: 3, fill: color, fillOpacity: 1, stroke: colors.background, strokeWidth: 1 }}
        {...props}
      />
    </>
  );
}
