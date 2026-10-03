"use client";

import { type ComponentProps } from "react";
import {
  ResponsiveContainer,
  Sankey as RechartsSankey,
  type SankeyLinkProps,
  type SankeyNodeProps,
} from "recharts";
import { colors } from "../../foundations/tokens.stylex";
import { type ChartFrameProps, Root, seriesColors, splitFrameProps } from "../chart/chart";

export interface SankeyChartProps extends ChartFrameProps {
  data: {
    nodes: ReadonlyArray<{ name: string }>;
    /** `source` and `target` are indexes into `nodes`. */
    links: ReadonlyArray<{ source: number; target: number; value: number }>;
  };
  /** Node colors, in node order. Defaults to the series colors. */
  nodeColors?: readonly string[];
  children?: ComponentProps<typeof RechartsSankey>["children"];
}

/**
 * Flow between stages, such as visitors to signups to paid. Links take their source's color.
 * Put `Chart.Tooltip` inside as a child.
 *
 *   <SankeyChart aria-label="Visitor flow" data={{ nodes, links }}>
 *     <Chart.Tooltip />
 *   </SankeyChart>
 */
export function SankeyChart({
  data,
  nodeColors = seriesColors,
  children,
  aspect = 1.8,
  ...props
}: SankeyChartProps) {
  const { frame } = splitFrameProps({ aspect, ...props });
  return (
    <Root {...frame} empty={data.links.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsSankey
          data={{
            nodes: data.nodes.map((n) => ({ ...n })),
            links: data.links.map((l) => ({ ...l })),
          }}
          nodePadding={24}
          nodeWidth={10}
          margin={{ top: 4, right: 96, bottom: 4, left: 4 }}
          node={<SankeyNode nodeColors={nodeColors} />}
          link={<SankeyLink nodeColors={nodeColors} names={data.nodes.map((n) => n.name)} />}
        >
          {children}
        </RechartsSankey>
      </ResponsiveContainer>
    </Root>
  );
}

interface ColorProps {
  nodeColors: readonly string[];
}

function SankeyNode({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  payload,
  nodeColors,
}: Partial<SankeyNodeProps> & ColorProps) {
  const fill = nodeColors[index % nodeColors.length] ?? seriesColors[0];
  return (
    <g data-slot="chart-sankey-node">
      <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} />
      <text
        x={x + width + 6}
        y={y + height / 2}
        dominantBaseline="middle"
        fontSize={12}
        fill={colors.foreground}
      >
        {payload?.name}
      </text>
    </g>
  );
}

function SankeyLink({
  sourceX = 0,
  sourceY = 0,
  sourceControlX = 0,
  targetX = 0,
  targetY = 0,
  targetControlX = 0,
  linkWidth = 0,
  payload,
  nodeColors,
  names,
}: Partial<SankeyLinkProps> & ColorProps & { names: readonly string[] }) {
  const sourceIndex = Math.max(names.indexOf(payload?.source.name ?? ""), 0);
  const stroke = nodeColors[sourceIndex % nodeColors.length] ?? seriesColors[0];
  return (
    <path
      data-slot="chart-sankey-link"
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={stroke}
      strokeOpacity={0.28}
      strokeWidth={linkWidth}
    />
  );
}
