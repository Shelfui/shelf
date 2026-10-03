import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A message that stays on the page, such as a warning above a form:
 *
 *   <Alert.Root variant="destructive">
 *     <AlertIcon />
 *     <Alert.Title>Payment failed</Alert.Title>
 *     <Alert.Description>Update your card to keep your plan.</Alert.Description>
 *   </Alert.Root>
 *
 * An icon placed first sits beside the text. The root has `role="alert"`, so a
 * screen reader announces it when it appears; pass `role="status"` for news that can wait.
 */
export type AlertVariant = "default" | "destructive";

export function Root({
  variant = "default",
  style,
  ...props
}: Styled<ComponentProps<"div">> & { variant?: AlertVariant }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      {...props}
      {...stylex.props(styles.root, variantStyles[variant], style)}
    />
  );
}

export function Title({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="alert-title" {...props} {...stylex.props(styles.title, style)} />;
}

export function Description({ style, ...props }: Styled<ComponentProps<"div">>) {
  return (
    <div data-slot="alert-description" {...props} {...stylex.props(styles.description, style)} />
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: spacing["3"],
    paddingInline: spacing["4"],
    alignItems: "start",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    columnGap: spacing["3"],
    display: "grid",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    gridTemplateColumns: "auto 1fr",
    lineHeight: typography.lineHeightSm,
    rowGap: spacing["1"],
    width: "100%",
  },
  title: {
    fontWeight: typography.fontWeightMedium,
    gridColumnStart: 2,
  },
  description: {
    color: colors.mutedForeground,
    gridColumnStart: 2,
  },
});

const variantStyles = stylex.create({
  default: {
    color: colors.foreground,
  },
  destructive: {
    color: colors.destructiveText,
  },
});
