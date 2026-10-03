import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export interface BadgeProps extends Styled<ComponentProps<"span">> {
  variant?: BadgeVariant;
}

/** A short status or count label. It is text, not a control. */
export function Badge({ variant = "default", style, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      {...props}
      {...stylex.props(styles.base, variantStyles[variant], style)}
    />
  );
}

const styles = stylex.create({
  base: {
    fontSynthesis: "none",
    borderColor: "transparent",
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1"],
    paddingBlock: "0.125rem",
    paddingInline: spacing["2"],
    alignItems: "center",
    boxSizing: "border-box",
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightXs,
    whiteSpace: "nowrap",
  },
});

const variantStyles = stylex.create({
  default: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
  },
  outline: {
    borderColor: colors.border,
    color: colors.foreground,
  },
  destructive: {
    backgroundColor: colors.destructiveSurface,
    color: colors.destructiveForeground,
  },
});
