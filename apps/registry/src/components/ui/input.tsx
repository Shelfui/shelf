"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "@/styles/shelf/tokens.stylex";
import { type Styled, isAriaTrue } from "@/lib/shelf/utils";

export type InputProps = Styled<ComponentProps<typeof BaseInput>>;

/**
 * A text input. Inside a `Field`, it picks up the field's label, description, and
 * validation. Outside one, set `aria-invalid` to show the invalid state.
 */
export function Input({ style, ...props }: InputProps) {
  const invalid = isAriaTrue(props["aria-invalid"]);

  return (
    <BaseInput
      data-slot="input"
      {...props}
      className={(state) =>
        stylex.props(
          styles.input,
          (invalid || state.valid === false) && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

const styles = stylex.create({
  input: {
    fontSynthesis: "none",
    margin: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    paddingInline: spacing["2.5"],
    backgroundColor: "transparent",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: sizes.controlDefault,
    minWidth: 0,
    width: "100%",
    "::placeholder": {
      color: colors.mutedForeground,
    },
  },
  invalid: {
    borderColor: colors.destructive,
    boxShadow: `0 0 0 3px color-mix(in oklab, ${colors.destructive} 20%, transparent)`,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
});
