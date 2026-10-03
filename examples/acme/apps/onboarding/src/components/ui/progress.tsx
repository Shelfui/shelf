"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { media } from "../../styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "../../styles/shelf/tokens.stylex";
import type { Styled } from "../../lib/shelf/utils";

export interface ProgressProps extends Styled<
  Omit<ComponentProps<typeof BaseProgress.Root>, "children">
> {
  /** A visible label. Without one, name the bar with `aria-label`. */
  label?: ReactNode;
  /** Shows the formatted value, such as "40%", beside the label. */
  showValue?: boolean;
}

/**
 * How far along a task is. Pass `value={null}` while the amount is unknown. For a
 * measurement within a range, such as storage used, use Meter instead.
 */
export function Progress({ label, showValue = false, style, ...props }: ProgressProps) {
  return (
    <BaseProgress.Root data-slot="progress" {...props} {...stylex.props(styles.root, style)}>
      {(label || showValue) && (
        <div {...stylex.props(styles.header)}>
          {label && <BaseProgress.Label>{label}</BaseProgress.Label>}
          {showValue && <BaseProgress.Value {...stylex.props(styles.value)} />}
        </div>
      )}
      <BaseProgress.Track {...stylex.props(styles.track)}>
        <BaseProgress.Indicator
          className={(state) =>
            stylex.props(styles.indicator, state.status === "indeterminate" && styles.indeterminate)
              .className
          }
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

const slide = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(250%)" },
});

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
    position: "relative",
    height: "0.375rem",
  },
  indicator: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    transitionDuration: {
      default: motion.durationSlow,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "width",
    transitionTimingFunction: motion.easingStandard,
    height: "100%",
  },
  indeterminate: {
    animationDuration: {
      default: "1.5s",
      [media.reducedMotion]: "0s",
    },
    animationIterationCount: "infinite",
    animationName: slide,
    animationTimingFunction: motion.easingStandard,
    width: "40%",
  },
});
