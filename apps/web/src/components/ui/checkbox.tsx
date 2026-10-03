"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, typography } from "@/styles/shelf/tokens.stylex";
import { CheckIcon, MinusIcon } from "./icons";
import type { Styled } from "@/lib/shelf/utils";

export type CheckboxProps = Styled<ComponentProps<typeof BaseCheckbox.Root>>;

/**
 * A checkbox. Label it with a wrapping `<Label>`, `aria-label`, or a `Field.Label`.
 * Inside a `CheckboxGroup`, give it a `value`.
 */
export function Checkbox({ style, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      {...props}
      className={(state) =>
        stylex.props(
          styles.root,
          (state.checked || state.indeterminate) && styles.checked,
          state.valid === false && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        {...stylex.props(styles.indicator)}
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>{state.indeterminate ? <MinusIcon /> : <CheckIcon />}</span>
        )}
      />
    </BaseCheckbox.Root>
  );
}

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.sm,
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
    color: colors.primaryForeground,
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: typography.fontSizeSm,
    justifyContent: "center",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "background-color, border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: "1rem",
    width: "1rem",
  },
  checked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  invalid: {
    borderColor: colors.destructive,
    boxShadow: `0 0 0 3px color-mix(in oklab, ${colors.destructive} 20%, transparent)`,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  indicator: {
    display: "flex",
  },
});
