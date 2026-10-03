"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps } from "react";
import { Line, LineChart } from "recharts";
import type { Styled } from "@/lib/shelf/utils";
import { frameProps, seriesColors } from "./chart";
import { type ChartCurve, curveType } from "./chart-format";

export interface SparklineProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  /** Says what the line shows, such as "Revenue, last 12 weeks". */
  "aria-label": string;
  data: ReadonlyArray<Record<string, unknown>>;
  /** The key in each data item that holds its value. */
  dataKey: string;
  /** Defaults to the first series color. */
  color?: string;
  curve?: ChartCurve;
}

/**
 * A line with no axes, small enough for a table cell or a stat. It shows a shape, not values:
 * put the numbers next to it. It fills 6rem by 2rem; set `width` and `height` in `style` to change that.
 */
export function Sparkline({
  data,
  dataKey,
  color = seriesColors[0],
  curve = "smooth",
  style,
  ...props
}: SparklineProps) {
  return (
    <div data-slot="sparkline" role="img" {...props} {...stylex.props(styles.root, style)}>
      <LineChart
        responsive
        data={[...data]}
        accessibilityLayer={false}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        {...frameProps}
      >
        <Line
          dataKey={dataKey}
          type={curveType(curve)}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
}

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    display: "inline-block",
    flexShrink: 0,
    height: "2rem",
    width: "6rem",
  },
});
