import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

/**
 * What to show when there is nothing to show yet, and how to change that:
 *
 *   <Empty.Root>
 *     <Empty.Header>
 *       <Empty.Media variant="icon"><SearchIcon /></Empty.Media>
 *       <Empty.Title>No invoices yet</Empty.Title>
 *       <Empty.Description>Invoices you send appear here.</Empty.Description>
 *     </Empty.Header>
 *     <Empty.Content>
 *       <Button>Create invoice</Button>
 *     </Empty.Content>
 *   </Empty.Root>
 *
 * `Title` renders an `<h3>`. If the page needs another heading level, change it here.
 */
export function Root({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="empty" {...props} {...stylex.props(styles.root, style)} />;
}

export function Header({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="empty-header" {...props} {...stylex.props(styles.header, style)} />;
}

export type MediaVariant = "default" | "icon";

/** An illustration or avatar; `variant="icon"` sets an icon on a muted tile. */
export function Media({
  variant = "default",
  style,
  ...props
}: Styled<ComponentProps<"div">> & { variant?: MediaVariant }) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      {...props}
      {...stylex.props(styles.media, mediaStyles[variant], style)}
    />
  );
}

export function Title({ style, ...props }: Styled<ComponentProps<"h3">>) {
  return <h3 data-slot="empty-title" {...props} {...stylex.props(styles.title, style)} />;
}

export function Description({ style, ...props }: Styled<ComponentProps<"p">>) {
  return (
    <p data-slot="empty-description" {...props} {...stylex.props(styles.description, style)} />
  );
}

/** The actions that fill the empty state, such as a primary button and a secondary link. */
export function Content({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="empty-content" {...props} {...stylex.props(styles.content, style)} />;
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    padding: spacing["6"],
    borderRadius: radius.lg,
    gap: spacing["6"],
    alignItems: "center",
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    justifyContent: "center",
    textAlign: "center",
    textWrap: "balance",
    minWidth: 0,
    width: "100%",
  },
  header: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    maxWidth: "24rem",
  },
  media: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    marginBottom: spacing["2"],
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightMedium,
    letterSpacing: "-0.01em",
    lineHeight: typography.lineHeightLg,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: 1.625,
  },
  content: {
    gap: spacing["4"],
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    maxWidth: "24rem",
    width: "100%",
  },
});

const mediaStyles = stylex.create({
  default: {
    backgroundColor: "transparent",
  },
  icon: {
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontSize: "1.5rem",
    height: "2.5rem",
    width: "2.5rem",
  },
});
