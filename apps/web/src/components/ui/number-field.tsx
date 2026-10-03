"use client";

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
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
import { MinusIcon, PlusIcon } from "./icons";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A number input with step buttons, keyboard stepping, and locale-aware formatting.
 *
 *   <NumberField.Root defaultValue={1} min={0}>
 *     <NumberField.Group>
 *       <NumberField.Decrement />
 *       <NumberField.Input aria-label="Quantity" />
 *       <NumberField.Increment />
 *     </NumberField.Group>
 *   </NumberField.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseNumberField.Root>>) {
  return (
    <BaseNumberField.Root
      data-slot="number-field"
      {...props}
      className={(state) =>
        stylex.props(styles.root, state.disabled && styles.disabled, style).className
      }
    />
  );
}

export function Group({ style, ...props }: Styled<ComponentProps<typeof BaseNumberField.Group>>) {
  return (
    <BaseNumberField.Group
      data-slot="number-field-group"
      {...props}
      className={(state) =>
        stylex.props(styles.group, state.valid === false && styles.invalid, style).className
      }
    />
  );
}

export function Input({ style, ...props }: Styled<ComponentProps<typeof BaseNumberField.Input>>) {
  return (
    <BaseNumberField.Input
      data-slot="number-field-input"
      {...props}
      {...stylex.props(styles.input, style)}
    />
  );
}

/** Steps down. Renders a minus icon unless you pass children. */
export function Decrement({
  style,
  children = <MinusIcon />,
  ...props
}: Styled<ComponentProps<typeof BaseNumberField.Decrement>>) {
  return (
    <BaseNumberField.Decrement
      data-slot="number-field-decrement"
      aria-label="Decrease"
      {...props}
      {...stylex.props(styles.step, style)}
    >
      {children}
    </BaseNumberField.Decrement>
  );
}

/** Steps up. Renders a plus icon unless you pass children. */
export function Increment({
  style,
  children = <PlusIcon />,
  ...props
}: Styled<ComponentProps<typeof BaseNumberField.Increment>>) {
  return (
    <BaseNumberField.Increment
      data-slot="number-field-increment"
      aria-label="Increase"
      {...props}
      {...stylex.props(styles.step, style)}
    >
      {children}
    </BaseNumberField.Increment>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
  },
  disabled: {
    opacity: 0.5,
  },
  group: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    display: "flex",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: sizes.controlDefault,
  },
  invalid: {
    borderColor: colors.destructive,
  },
  input: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: colors.foreground,
    flexGrow: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontVariantNumeric: "tabular-nums",
    textAlign: "center",
    minWidth: 0,
    width: "4rem",
  },
  step: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
    fontSize: typography.fontSizeBase,
    justifyContent: "center",
    width: sizes.controlDefault,
  },
});
