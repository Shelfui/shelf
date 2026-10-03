"use client";

import { Meter as BaseMeter } from "@base-ui/react/meter";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export interface MeterProps extends Styled<
  Omit<ComponentProps<typeof BaseMeter.Root>, "children">
> {
  /** A visible label. Without one, name the meter with `aria-label`. */
  label?: ReactNode;
  /** Shows the formatted value beside the label. */
  showValue?: boolean;
}

/**
 * A measurement within a known range, such as storage used or a credit limit. For a
 * task that is getting done, use Progress instead.
 */
export function Meter({ label, showValue = false, style, ...props }: MeterProps) {
  return (
    <BaseMeter.Root data-slot="meter" {...props} {...stylex.props(styles.root, style)}>
      {(label || showValue) && (
        <div {...stylex.props(styles.header)}>
          {label && <BaseMeter.Label>{label}</BaseMeter.Label>}
          {showValue && <BaseMeter.Value {...stylex.props(styles.value)} />}
        </div>
      )}
      <BaseMeter.Track data-slot="meter-track" {...stylex.props(styles.track)}>
        <BaseMeter.Indicator data-slot="meter-indicator" {...stylex.props(styles.indicator)} />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    gap: spacing["2"],
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "100%",
  },
  header: {
    gap: spacing["2"],
    display: "flex",
    justifyContent: "space-between",
  },
  value: {
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.muted,
    height: "0.375rem",
  },
  indicator: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    height: "100%",
  },
});
