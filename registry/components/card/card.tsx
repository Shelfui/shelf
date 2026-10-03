import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

/**
 * A surface that groups related content:
 *
 *   <Card.Root>
 *     <Card.Header>
 *       <Card.Title>Revenue</Card.Title>
 *       <Card.Description>Last 30 days</Card.Description>
 *     </Card.Header>
 *     <Card.Content>…</Card.Content>
 *     <Card.Footer>…</Card.Footer>
 *   </Card.Root>
 *
 * `Title` renders an `<h3>`. If the page needs another heading level, change it here.
 */
export function Root({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="card" {...props} {...stylex.props(styles.root, style)} />;
}

export function Header({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="card-header" {...props} {...stylex.props(styles.header, style)} />;
}

export function Title({ style, ...props }: Styled<ComponentProps<"h3">>) {
  return <h3 data-slot="card-title" {...props} {...stylex.props(styles.title, style)} />;
}

export function Description({ style, ...props }: Styled<ComponentProps<"p">>) {
  return <p data-slot="card-description" {...props} {...stylex.props(styles.description, style)} />;
}

export function Content({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="card-content" {...props} {...stylex.props(styles.content, style)} />;
}

export function Footer({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="card-footer" {...props} {...stylex.props(styles.footer, style)} />;
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["6"],
    paddingBlock: spacing["6"],
    backgroundColor: colors.card,
    boxSizing: "border-box",
    color: colors.cardForeground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
  },
  header: {
    gap: spacing["1.5"],
    paddingInline: spacing["6"],
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightBase,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  content: {
    paddingInline: spacing["6"],
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  footer: {
    gap: spacing["2"],
    paddingInline: spacing["6"],
    alignItems: "center",
    display: "flex",
  },
});
