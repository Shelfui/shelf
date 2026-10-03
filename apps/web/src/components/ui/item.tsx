"use client";

import { useRender } from "@base-ui/react/use-render";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { Separator as ShelfSeparator, type SeparatorProps } from "./separator";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A row of media, text, and actions, for lists of people, files, or settings:
 *
 *   <Item.Group>
 *     <Item.Root variant="outline">
 *       <Item.Media variant="icon"><CalendarIcon /></Item.Media>
 *       <Item.Content>
 *         <Item.Title>Weekly sync</Item.Title>
 *         <Item.Description>Mondays at 10:00</Item.Description>
 *       </Item.Content>
 *       <Item.Actions><Button size="sm" variant="outline">Edit</Button></Item.Actions>
 *     </Item.Root>
 *     <Item.Separator />
 *     …
 *   </Item.Group>
 *
 * To make a whole row a link, render it as one: `<Item.Root render={<a href="…" />}>`.
 * A rendered row gets hover and focus styles.
 */
export function Group({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="item-group" {...props} {...stylex.props(styles.group, style)} />;
}

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm";

export type RootProps = Styled<useRender.ComponentProps<"div">> & {
  variant?: ItemVariant;
  size?: ItemSize;
};

export function Root({
  variant = "default",
  size = "default",
  render,
  style,
  ...props
}: RootProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      "data-slot": "item",
      "data-variant": variant,
      "data-size": size,
      ...props,
      ...stylex.props(
        styles.root,
        variantStyles[variant],
        sizeStyles[size],
        render !== undefined && interactiveStyles[variant],
        style,
      ),
    },
  });
}

export type MediaVariant = "default" | "icon" | "image";

/**
 * An icon, avatar, or thumbnail at the start of the row. `variant="icon"` sets an icon on a
 * muted tile; `variant="image"` crops a thumbnail, whose `<img>` needs `width` and `height`
 * of `100%` and an `objectFit`.
 */
export function Media({
  variant = "default",
  style,
  ...props
}: Styled<ComponentProps<"div">> & { variant?: MediaVariant }) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      {...props}
      {...stylex.props(styles.media, mediaStyles[variant], style)}
    />
  );
}

export function Content({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="item-content" {...props} {...stylex.props(styles.content, style)} />;
}

export function Title({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="item-title" {...props} {...stylex.props(styles.title, style)} />;
}

/** Secondary text, clamped to two lines. */
export function Description({ style, ...props }: Styled<ComponentProps<"p">>) {
  return <p data-slot="item-description" {...props} {...stylex.props(styles.description, style)} />;
}

export function Actions({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="item-actions" {...props} {...stylex.props(styles.actions, style)} />;
}

/** A horizontal Shelf Separator between rows of a `Group`. */
export function Separator({ style, ...props }: SeparatorProps) {
  return (
    <ShelfSeparator
      data-slot="item-separator"
      orientation="horizontal"
      {...props}
      style={[styles.separator, style]}
    />
  );
}

const styles = stylex.create({
  group: {
    display: "flex",
    flexDirection: "column",
  },
  root: {
    fontSynthesis: "none",
    borderColor: {
      default: "transparent",
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    textDecoration: "none",
    alignItems: "center",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "background-color, border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
  },
  media: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
  },
  content: {
    gap: spacing["1"],
    display: "flex",
    flexBasis: 0,
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1.375,
    width: "fit-content",
  },
  description: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    lineHeight: 1.5,
  },
  actions: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
  separator: {
    marginBlock: spacing["2"],
  },
});

const variantStyles = stylex.create({
  default: {
    backgroundColor: "transparent",
  },
  outline: {
    borderColor: {
      default: colors.border,
      ":focus-visible": colors.ring,
    },
  },
  muted: {
    backgroundColor: `color-mix(in oklab, ${colors.muted} 50%, transparent)`,
  },
});

const interactiveStyles = stylex.create({
  default: {
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: `color-mix(in oklab, ${colors.accent} 50%, transparent)`,
      },
    },
    cursor: "pointer",
  },
  outline: {
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: `color-mix(in oklab, ${colors.accent} 50%, transparent)`,
      },
    },
    cursor: "pointer",
  },
  muted: {
    backgroundColor: {
      default: `color-mix(in oklab, ${colors.muted} 50%, transparent)`,
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    cursor: "pointer",
  },
});

const sizeStyles = stylex.create({
  default: {
    padding: spacing["4"],
    gap: spacing["4"],
  },
  sm: {
    gap: spacing["2.5"],
    paddingBlock: spacing["3"],
    paddingInline: spacing["4"],
  },
});

const mediaStyles = stylex.create({
  default: {
    backgroundColor: "transparent",
  },
  icon: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.muted,
    boxSizing: "border-box",
    fontSize: typography.fontSizeBase,
    height: "2rem",
    width: "2rem",
  },
  image: {
    borderRadius: radius.sm,
    overflow: "hidden",
    height: "2.5rem",
    width: "2.5rem",
  },
});
