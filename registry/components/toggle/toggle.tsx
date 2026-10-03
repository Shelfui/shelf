"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../foundations/conditions.stylex";
import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "default" | "lg";

export interface ToggleProps extends Styled<ComponentProps<typeof BaseToggle>> {
  variant?: ToggleVariant;
  size?: ToggleSize;
}

/**
 * A two-state button (`aria-pressed`). Icon-only toggles need an `aria-label`.
 * Inside a `ToggleGroup`, give it a `value`.
 */
export function Toggle({ variant = "default", size = "default", style, ...props }: ToggleProps) {
  return (
    <BaseToggle
      data-slot="toggle"
      {...props}
      className={(state) =>
        stylex.props(
          styles.base,
          variantStyles[variant],
          sizeStyles[size],
          state.pressed && styles.pressed,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

const styles = stylex.create({
  base: {
    fontSynthesis: "none",
    margin: 0,
    borderColor: {
      default: "transparent",
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["2"],
    outline: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.muted,
      },
    },
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "center",
    lineHeight: typography.lineHeightSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "background-color, border-color, box-shadow, color",
    transitionTimingFunction: motion.easingStandard,
    whiteSpace: "nowrap",
  },
  pressed: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
});

const variantStyles = stylex.create({
  default: {},
  outline: {
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
  },
});

const sizeStyles = stylex.create({
  sm: {
    paddingInline: spacing["1.5"],
    height: sizes.controlSm,
    minWidth: sizes.controlSm,
  },
  default: {
    paddingInline: spacing["2"],
    height: sizes.controlDefault,
    minWidth: sizes.controlDefault,
  },
  lg: {
    paddingInline: spacing["2.5"],
    height: sizes.controlLg,
    minWidth: sizes.controlLg,
  },
});
