"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import * as stylex from "@stylexjs/stylex";
import type * as React from "react";
import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "../../styles/shelf/tokens.stylex";
import { media } from "../../styles/shelf/conditions.stylex";
import { type Styled, isAriaTrue } from "../../lib/shelf/utils";

export type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
export type ButtonSize =
  | "xs"
  | "sm"
  | "default"
  | "lg"
  | "icon-xs"
  | "icon-sm"
  | "icon"
  | "icon-lg"
  | "xl";

export interface ButtonProps extends Styled<React.ComponentProps<typeof BaseButton>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * An action trigger. Renders a native `<button type="button">` by default.
 * Use `type="submit"` explicitly inside forms. Icon-only sizes need an
 * `aria-label`.
 */
export function Button({
  variant = "default",
  size = "default",
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const invalid = isAriaTrue(props["aria-invalid"]);
  const expanded = isAriaTrue(props["aria-expanded"]);
  const opensPopup = props["aria-haspopup"] !== undefined && props["aria-haspopup"] !== false;

  return (
    <BaseButton
      data-slot="button"
      {...props}
      disabled={disabled}
      {...stylex.props(
        buttonStyles(variant, size),
        !opensPopup && styles.pressable,
        expanded && expandedStyles[variant],
        invalid && styles.invalid,
        disabled && styles.disabled,
        style,
      )}
    />
  );
}

/**
 * Button's look for an element that is not a button, such as a link:
 * `<a {...stylex.props(buttonStyles("ghost"), style)} />`.
 */
export function buttonStyles(variant: ButtonVariant = "default", size: ButtonSize = "default") {
  return [styles.base, variantStyles[variant], sizeStyles[size]] as const;
}

const styles = stylex.create({
  base: {
    // Set by position and read only by the ButtonGroup values below, so a group's outer corners stay round.
    "--button-group-divider": { default: null, ":first-child": "transparent" },
    "--button-group-end-radius": { default: null, ":last-child": radius.md },
    "--button-group-overlap": { default: null, ":last-child": 0 },
    "--button-group-start-radius": { default: null, ":first-child": radius.md },
    fontSynthesis: "none",
    margin: 0,
    borderColor: {
      default: "transparent",
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    textDecoration: "none",
    alignItems: "center",
    backgroundClip: "padding-box",
    backgroundColor: "transparent",
    borderEndEndRadius: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]: "var(--button-group-end-radius, 0)",
    },
    borderEndStartRadius: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]: "var(--button-group-start-radius, 0)",
    },
    borderStartEndRadius: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]: "var(--button-group-end-radius, 0)",
    },
    borderStartStartRadius: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]: "var(--button-group-start-radius, 0)",
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
    marginInlineEnd: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]: "var(--button-group-overlap, -1px)",
    },
    // Invisible normally; forced-colors mode paints it, so focus stays visible there.
    outlineColor: "transparent",
    outlineOffset: 2,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    position: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]: "relative",
    },
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "color, background-color, border-color, box-shadow, transform",
    transitionTimingFunction: motion.easingStandard,
    userSelect: "none",
    whiteSpace: "nowrap",
    zIndex: {
      default: null,
      ":focus-visible": 1,
    },
  },
  pressable: {
    transform: {
      default: null,
      ":active": "translateY(1px)",
    },
  },
  invalid: {
    borderColor: colors.destructive,
    boxShadow: `0 0 0 3px color-mix(in oklab, ${colors.destructive} 20%, transparent)`,
  },
  disabled: {
    cursor: "default",
    opacity: 0.5,
    pointerEvents: "none",
  },
});

const variantStyles = stylex.create({
  default: {
    backgroundColor: {
      default: colors.primary,
      ":hover": {
        default: null,
        [media.hover]: `color-mix(in oklab, ${colors.primary} 90%, transparent)`,
      },
    },
    borderInlineStartColor: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]:
        `var(--button-group-divider, color-mix(in oklab, ${colors.primaryForeground} 24%, ${colors.primary}))`,
    },
    color: colors.primaryForeground,
  },
  outline: {
    borderColor: {
      default: colors.border,
      ":focus-visible": colors.ring,
    },
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    color: {
      default: colors.foreground,
      ":hover": {
        default: null,
        [media.hover]: colors.accentForeground,
      },
    },
  },
  secondary: {
    backgroundColor: {
      default: colors.secondary,
      ":hover": {
        default: null,
        [media.hover]: `color-mix(in oklab, ${colors.secondary} 80%, transparent)`,
      },
    },
    borderInlineStartColor: {
      default: null,
      [stylex.when.ancestor("[data-slot=button-group]")]:
        `var(--button-group-divider, ${colors.border})`,
    },
    color: colors.secondaryForeground,
  },
  ghost: {
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    color: {
      default: colors.foreground,
      ":hover": {
        default: null,
        [media.hover]: colors.accentForeground,
      },
    },
  },
  destructive: {
    backgroundColor: {
      default: colors.destructiveSurface,
      ":hover": {
        default: null,
        [media.hover]: `color-mix(in oklab, ${colors.destructiveSurface} 90%, transparent)`,
      },
    },
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.destructive} 40%, transparent)`,
    },
    color: colors.destructiveForeground,
  },
  link: {
    textDecoration: {
      default: "none",
      ":hover": {
        default: null,
        [media.hover]: "underline",
      },
    },
    // Toward the foreground, so a mid-tone primary still reads as text on any background.
    color: `color-mix(in oklab, ${colors.primary} 75%, ${colors.foreground})`,
    textUnderlineOffset: 4,
  },
});

const expandedStyles = stylex.create({
  default: {},
  outline: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.secondary },
  ghost: { backgroundColor: colors.accent },
  destructive: {},
  link: {},
});

const sizeStyles = stylex.create({
  xs: {
    gap: spacing["1"],
    paddingInline: spacing["2"],
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    height: sizes.controlXs,
  },
  sm: {
    gap: spacing["1"],
    paddingInline: spacing["2.5"],
    fontSize: "0.8rem",
    height: sizes.controlSm,
  },
  default: {
    gap: spacing["1.5"],
    paddingInline: spacing["2.5"],
    height: sizes.controlDefault,
  },
  lg: {
    gap: spacing["1.5"],
    paddingInline: spacing["2.5"],
    height: sizes.controlLg,
  },
  xl: {
    fontSize: typography.fontSizeBase,
    gap: spacing["2"],
    height: "2.5rem",
    lineHeight: typography.lineHeightBase,
    paddingInline: spacing["4"],
  },
  "icon-xs": {
    padding: 0,
    fontSize: typography.fontSizeXs,
    height: sizes.controlXs,
    width: sizes.controlXs,
  },
  "icon-sm": {
    padding: 0,
    fontSize: typography.fontSizeBase,
    height: sizes.controlSm,
    width: sizes.controlSm,
  },
  icon: {
    padding: 0,
    fontSize: typography.fontSizeBase,
    height: sizes.controlDefault,
    width: sizes.controlDefault,
  },
  "icon-lg": {
    padding: 0,
    fontSize: typography.fontSizeBase,
    height: sizes.controlLg,
    width: sizes.controlLg,
  },
});
