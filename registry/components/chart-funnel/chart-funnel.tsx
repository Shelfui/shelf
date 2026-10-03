"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps } from "react";
import {
  Cell,
  Funnel as RechartsFunnel,
  FunnelChart as RechartsFunnelChart,
  LabelList,
} from "recharts";
import { colors, typography } from "../../foundations/tokens.stylex";
import {
  type ChartProps,
  Root,
  frameProps,
  seriesColors,
  splitFrameProps,
  useChart,
} from "../chart/chart";

export type FunnelChartProps = ChartProps<ComponentProps<typeof RechartsFunnelChart>>;

/**
 * Drop-off through ordered steps, such as visit, signup, purchase. Compose the parts:
 *
 *   <FunnelChart aria-label="Checkout funnel">
 *     <Chart.Tooltip />
 *     <Funnel data={data} dataKey="count" nameKey="step" />
 *   </FunnelChart>
 *
 * Data goes from the widest step to the narrowest.
 */
export function FunnelChart({ children, aspect = 1.6, ...props }: FunnelChartProps) {
  const { frame, chart } = splitFrameProps({ aspect, ...props });
  return (
    <Root {...frame}>
      <RechartsFunnelChart responsive {...frameProps} {...chart}>
        {children}
      </RechartsFunnelChart>
    </Root>
  );
}

export interface FunnelProps extends Omit<
  ComponentProps<typeof RechartsFunnel>,
  "data" | "dataKey" | "nameKey" | "fill" | "children"
> {
  data: ReadonlyArray<Record<string, unknown>>;
  /** The key in each data item that holds its count. */
  dataKey: string;
  /** The key in each data item that holds the step's name. */
  nameKey: string;
  /** Defaults to the first series color, fading toward the narrow end. */
  color?: string;
}

/** The steps, each labelled with its name. */
export function Funnel({ data, dataKey, nameKey, color = seriesColors[0], ...props }: FunnelProps) {
  const { hiddenSeries } = useChart();
  const visible = data.map((item) =>
    hiddenSeries.includes(String(item[nameKey])) ? { ...item, [dataKey]: 0 } : item,
  );

  return (
    <RechartsFunnel
      data={visible}
      dataKey={dataKey}
      nameKey={nameKey}
      isAnimationActive
      stroke={colors.background}
      strokeWidth={2}
      {...props}
    >
      {data.map((item, index) => (
        <Cell
          key={String(item[nameKey])}
          fill={color}
          fillOpacity={Math.max(1 - index * (0.6 / Math.max(data.length, 1)), 0.4)}
        />
      ))}
      <LabelList dataKey={nameKey} position="center" {...stylex.props(styles.label)} />
    </RechartsFunnel>
  );
}

const styles = stylex.create({
  label: {
    fill: colors.background,
    stroke: "none",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
  },
});
