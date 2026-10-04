import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * Events in order, joined by a line.
 *
 *   <Timeline.Root>
 *     <Timeline.Item>
 *       <Timeline.Title>Deployed to production</Timeline.Title>
 *       <Timeline.Time dateTime="2026-10-03T09:00">9:00</Timeline.Time>
 *       <Timeline.Description>Build 412 passed all checks.</Timeline.Description>
 *     </Timeline.Item>
 *   </Timeline.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<"ol">>) {
  return <ol data-slot="timeline" {...props} {...stylex.props(styles.root, style)} />;
}

export function Item({ style, children, ...props }: Styled<ComponentProps<"li">>) {
  return (
    <li data-slot="timeline-item" {...props} {...stylex.props(styles.item, style)}>
      <span aria-hidden {...stylex.props(styles.dot)} />
      {children}
    </li>
  );
}

export function Title({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="timeline-title" {...props} {...stylex.props(styles.title, style)} />;
}

export function Time({ style, ...props }: Styled<ComponentProps<"time">>) {
  return <time data-slot="timeline-time" {...props} {...stylex.props(styles.time, style)} />;
}

export function Description({ style, ...props }: Styled<ComponentProps<"p">>) {
  return (
    <p data-slot="timeline-description" {...props} {...stylex.props(styles.description, style)} />
  );
}

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  item: {
    borderInlineStartColor: {
      default: colors.border,
      ":last-child": "transparent",
    },
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    marginInlineStart: spacing["1.5"],
    paddingInlineStart: spacing["4"],
    position: "relative",
    paddingBottom: {
      default: spacing["6"],
      ":last-child": 0,
    },
  },
  dot: {
    borderColor: colors.background,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: 2,
    backgroundColor: colors.foreground,
    boxSizing: "border-box",
    insetInlineStart: "-0.4375rem",
    position: "absolute",
    height: "0.875rem",
    top: "0.1875rem",
    width: "0.875rem",
  },
  title: {
    fontWeight: typography.fontWeightMedium,
  },
  time: {
    color: colors.mutedForeground,
    display: "block",
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    marginTop: spacing["1"],
  },
});
