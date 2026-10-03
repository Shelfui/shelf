"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A set of options where exactly one can be chosen. Arrow keys move between items.
 *
 *   <RadioGroup aria-labelledby="plan-label" defaultValue="monthly">
 *     <Label><RadioGroupItem value="monthly" /> Monthly</Label>
 *     <Label><RadioGroupItem value="yearly" /> Yearly</Label>
 *   </RadioGroup>
 */
export function RadioGroup({ style, ...props }: Styled<ComponentProps<typeof BaseRadioGroup>>) {
  return (
    <BaseRadioGroup data-slot="radio-group" {...props} {...stylex.props(styles.group, style)} />
  );
}

export function RadioGroupItem({ style, ...props }: Styled<ComponentProps<typeof BaseRadio.Root>>) {
  return (
    <BaseRadio.Root
      data-slot="radio-group-item"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          state.valid === false && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseRadio.Indicator data-slot="radio-group-indicator" {...stylex.props(styles.indicator)} />
    </BaseRadio.Root>
  );
}

const styles = stylex.create({
  group: {
    gap: spacing["3"],
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  item: {
    margin: 0,
    padding: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    alignItems: "center",
    backgroundColor: "transparent",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: "1rem",
    width: "1rem",
  },
  invalid: {
    borderColor: colors.destructive,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  indicator: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    height: "0.5rem",
    width: "0.5rem",
  },
});
