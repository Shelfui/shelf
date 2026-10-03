"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps } from "react";
import { ResponsiveContainer, Treemap as RechartsTreemap, type TreemapNode } from "recharts";
import { colors, radius, typography } from "@/styles/shelf/tokens.stylex";
import { type ChartFrameProps, Root, seriesColors, splitFrameProps } from "./chart";

export type TreemapItem = {
  name: string;
  value?: number;
  children?: ReadonlyArray<TreemapItem>;
};

export interface TreemapProps extends ChartFrameProps {
  /** Items with a `value`, or with `children` that each have one. */
  data: ReadonlyArray<TreemapItem>;
  /** The key in each data item that holds its size. */
  dataKey?: string;
  /** Group colors, in data order. Defaults to the series colors. */
  groupColors?: readonly string[];
  children?: ComponentProps<typeof RechartsTreemap>["children"];
}

/**
 * Sizes within a whole, as nested rectangles, such as disk use by folder. Groups share a color.
 * Put `Chart.Tooltip` inside as a child.
 *
 *   <Treemap aria-label="Storage by folder" data={data}>
 *     <Chart.Tooltip />
 *   </Treemap>
 */
export function Treemap({
  data,
  dataKey = "value",
  groupColors = seriesColors,
  children,
  aspect = 1.6,
  ...props
}: TreemapProps) {
  const { frame } = splitFrameProps({ aspect, ...props });
  return (
    <Root {...frame} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsTreemap
          data={[...data]}
          dataKey={dataKey}
          nameKey="name"
          isAnimationActive={false}
          content={<TreemapCell groupColors={groupColors} />}
        >
          {children}
        </RechartsTreemap>
      </ResponsiveContainer>
    </Root>
  );
}

interface TreemapCellProps extends Partial<TreemapNode> {
  groupColors: readonly string[];
}

function TreemapCell({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  name,
  root,
  groupColors,
  children,
}: TreemapCellProps) {
  // Cells with children are groups: the leaves inside them draw the color.
  if (children && children.length > 0) return null;

  const group = root?.index ?? index;
  const fill = groupColors[group % groupColors.length] ?? seriesColors[0];
  const showName = width > 56 && height > 24;

  return (
    <g data-slot="chart-treemap-cell">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={fill}
        stroke={colors.background}
        strokeWidth={2}
        {...stylex.props(styles.cell)}
      />
      {showName && (
        <text x={x + 8} y={y + 18} {...stylex.props(styles.name)}>
          {name}
        </text>
      )}
    </g>
  );
}

const styles = stylex.create({
  cell: {
    borderRadius: radius.sm,
  },
  name: {
    fill: colors.background,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
  },
});
