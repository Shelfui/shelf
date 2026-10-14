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
  /**
   * Where the step names go. `auto` puts each inside its step, or beside it when the step is too
   * narrow. `inside` always centres them in the steps. `side` puts every name beside its step,
   * next to the step's right edge, and narrows the funnel to make room.
   */
  labels?: FunnelLabels;
}

export type FunnelLabels = "auto" | "inside" | "side";

/** The steps, each labelled with its name. */
export function Funnel({
  data,
  dataKey,
  nameKey,
  color = seriesColors[0],
  labels = "auto",
  ...props
}: FunnelProps) {
  const { hiddenSeries } = useChart();
  const hidden = new Set(hiddenSeries);
  const visible = data.map((item) =>
    hidden.has(String(item[nameKey])) ? { ...item, [dataKey]: 0 } : item,
  );

  return (
    <RechartsFunnel
      data={visible}
      dataKey={dataKey}
      nameKey={nameKey}
      isAnimationActive
      stroke={colors.background}
      strokeWidth={2}
      {...(labels === "side" ? { width: "60%" } : {})}
      {...props}
    >
      {data.map((item, index) => (
        <Cell
          key={String(item[nameKey])}
          fill={color}
          fillOpacity={Math.max(1 - index * (0.6 / Math.max(data.length, 1)), 0.4)}
        />
      ))}
      <LabelList dataKey={nameKey} content={<FunnelLabel placement={labels} />} />
    </RechartsFunnel>
  );
}

interface Trapezoid {
  x: number;
  y: number;
  upperWidth: number;
  lowerWidth: number;
  height: number;
}

function isTrapezoid(viewBox: unknown): viewBox is Trapezoid {
  return typeof viewBox === "object" && viewBox !== null && "upperWidth" in viewBox;
}

/** Roughly how wide a label is at the extra-small size, to tell whether it fits in its step. */
const labelCharWidth = 7;

/** A step's name, placed as `placement` says. See `FunnelProps.labels`. */
function FunnelLabel({
  viewBox,
  value,
  placement,
}: {
  viewBox?: unknown;
  value?: string | number;
  placement: FunnelLabels;
}) {
  if (!isTrapezoid(viewBox)) return null;
  const { x, y, upperWidth, lowerWidth, height } = viewBox;
  const text = String(value ?? "");
  const centre = x + upperWidth / 2;
  const middle = y + height / 2;
  const widthAtMiddle = (upperWidth + lowerWidth) / 2;
  const inside =
    placement === "inside" ||
    (placement === "auto" && text.length * labelCharWidth + 16 <= widthAtMiddle);
  return (
    <text
      data-slot="chart-funnel-label"
      x={inside ? centre : centre + widthAtMiddle / 2 + 8}
      y={middle}
      textAnchor={inside ? "middle" : "start"}
      dominantBaseline="middle"
      {...stylex.props(styles.label, !inside && styles.labelOutside)}
    >
      {text}
    </text>
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
  labelOutside: {
    fill: colors.foreground,
  },
});
