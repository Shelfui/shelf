import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { ArrowDownIcon, ArrowUpIcon } from "./icons";

/**
 * One key figure with its label and change.
 *
 *   <Stat.Root>
 *     <Stat.Label>Revenue</Stat.Label>
 *     <Stat.Value>$48,200</Stat.Value>
 *     <Stat.Delta trend="up">12% from last month</Stat.Delta>
 *   </Stat.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="stat" {...props} {...stylex.props(styles.root, style)} />;
}

export function Label({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="stat-label" {...props} {...stylex.props(styles.label, style)} />;
}

export function Value({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="stat-value" {...props} {...stylex.props(styles.value, style)} />;
}

export type Trend = "up" | "down" | "flat";

export interface DeltaProps extends Styled<ComponentProps<"div">> {
  /** Which way the figure moved. Flat shows no arrow. */
  trend?: Trend;
}

const TREND_WORD: Record<Trend, string> = { up: "Up", down: "Down", flat: "No change" };

/** The change since the last period. The direction is written out for screen readers. */
export function Delta({ trend = "flat", style, children, ...props }: DeltaProps) {
  return (
    <div
      data-slot="stat-delta"
      data-trend={trend}
      {...props}
      {...stylex.props(styles.delta, trend === "down" && styles.down, style)}
    >
      {trend === "up" ? <ArrowUpIcon /> : null}
      {trend === "down" ? <ArrowDownIcon /> : null}
      <span {...stylex.props(styles.hidden)}>{TREND_WORD[trend]}: </span>
      {children}
    </div>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  value: {
    color: colors.foreground,
    fontSize: "1.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightSemibold,
    lineHeight: "2.25rem",
  },
  delta: {
    gap: spacing["1"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
  down: { color: colors.destructiveText },
  hidden: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
});
