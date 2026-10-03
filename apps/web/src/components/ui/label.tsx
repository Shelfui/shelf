import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

export type LabelProps = Styled<ComponentProps<"label">>;

/**
 * A text label for a form control. Point `htmlFor` at the control, or wrap it.
 * Inside a `Field`, use `Field.Label`, which is associated automatically.
 */
export function Label({ style, ...props }: LabelProps) {
  return <label data-slot="label" {...props} {...stylex.props(styles.label, style)} />;
}

const styles = stylex.create({
  label: {
    fontSynthesis: "none",
    gap: spacing["2"],
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
    userSelect: "none",
  },
});
