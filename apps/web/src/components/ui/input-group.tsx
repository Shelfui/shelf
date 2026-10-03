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
import type { Styled } from "@/lib/shelf/utils";

/**
 * An input with text, icons, or buttons attached inside its border:
 *
 *   <InputGroup.Root>
 *     <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
 *     <InputGroup.Input aria-label="Search" placeholder="Search invoices" />
 *     <InputGroup.Addon>⌘K</InputGroup.Addon>
 *   </InputGroup.Root>
 *
 * `InputGroup.Input` takes part in a `Field` like Input does.
 */
export function Root({ style, ...props }: Styled<ComponentProps<"div">>) {
  return (
    <div data-slot="input-group" role="group" {...props} {...stylex.props(styles.root, style)} />
  );
}

export function Input({ style, ...props }: Styled<ComponentProps<typeof BaseInput>>) {
  return (
    <BaseInput data-slot="input-group-input" {...props} {...stylex.props(styles.input, style)} />
  );
}

/** Text or icons beside the input. Buttons can go here too. */
export function Addon({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="input-group-addon" {...props} {...stylex.props(styles.addon, style)} />;
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: sizes.controlDefault,
    width: "100%",
  },
  input: {
    margin: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: {
      default: colors.foreground,
      "::placeholder": colors.mutedForeground,
    },
    flexGrow: 1,
    fontFamily: "inherit",
    fontSize: "inherit",
    paddingInlineEnd: {
      default: spacing["3"],
      ":not(:last-child)": spacing["2"],
    },
    paddingInlineStart: {
      default: spacing["3"],
      ":not(:first-child)": spacing["2"],
    },
    height: "100%",
    minWidth: 0,
  },
  addon: {
    gap: spacing["2"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    paddingInlineEnd: {
      default: spacing["3"],
      ":first-child": 0,
    },
    paddingInlineStart: {
      default: spacing["3"],
      ":last-child": 0,
    },
    userSelect: "none",
  },
});
