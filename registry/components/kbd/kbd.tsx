import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export type KbdProps = Styled<ComponentProps<"kbd">>;

/** A keyboard key, as in "Press <Kbd>⌘</Kbd> <Kbd>K</Kbd>". */
export function Kbd({ style, ...props }: KbdProps) {
  return <kbd data-slot="kbd" {...props} {...stylex.props(styles.base, style)} />;
}

const styles = stylex.create({
  base: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1"],
    paddingInline: spacing["1"],
    alignItems: "center",
    backgroundColor: colors.muted,
    boxSizing: "border-box",
    color: colors.mutedForeground,
    display: "inline-flex",
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "center",
    lineHeight: 1,
    userSelect: "none",
    height: "1.25rem",
    minWidth: "1.25rem",
  },
});
