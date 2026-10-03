"use client";

import { Field as BaseField } from "@base-ui/react/field";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../foundations/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "../../foundations/tokens.stylex";
import { type Styled, isAriaTrue } from "../../lib/utils";

export type TextareaProps = Styled<ComponentProps<"textarea">>;

/**
 * A multi-line text input. Like `Input`, it takes part in a surrounding `Field`:
 * label, description, and validation.
 */
export function Textarea({ style, ...props }: TextareaProps) {
  const invalid = isAriaTrue(props["aria-invalid"]);

  return (
    <BaseField.Control
      data-slot="textarea"
      render={<textarea {...props} />}
      className={(state) =>
        stylex.props(
          styles.textarea,
          (invalid || state.valid === false) && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

const styles = stylex.create({
  textarea: {
    fieldSizing: "content",
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
    paddingBlock: spacing["2"],
    paddingInline: spacing["2.5"],
    backgroundColor: "transparent",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    display: "block",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    resize: "vertical",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    minHeight: "4rem",
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
