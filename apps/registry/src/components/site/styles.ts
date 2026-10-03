import * as stylex from "@stylexjs/stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

/** Text styles the views share. */
export const text = stylex.create({
  link: {
    color: colors.foreground,
    textDecorationColor: {
      default: colors.border,
      ":hover": colors.foreground,
    },
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
  },
  mono: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
});

export const layout = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["6"],
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["3"],
  },
  row: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: spacing["2"],
  },
});
