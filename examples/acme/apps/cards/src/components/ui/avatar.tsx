"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "../../styles/shelf/tokens.stylex";
import type { Styled } from "../../lib/shelf/utils";

/**
 * A person's picture, with a fallback while it loads or if it fails:
 *
 *   <Avatar.Root>
 *     <Avatar.Image src={user.photo} alt={user.name} />
 *     <Avatar.Fallback>AL</Avatar.Fallback>
 *   </Avatar.Root>
 *
 * Stack several with a Group, and summarize the rest with a GroupCount:
 *
 *   <Avatar.Group>
 *     <Avatar.Root>…</Avatar.Root>
 *     <Avatar.Root>…</Avatar.Root>
 *     <Avatar.GroupCount>+3</Avatar.GroupCount>
 *   </Avatar.Group>
 */
export type AvatarSize = "sm" | "default" | "lg";

export function Root({
  size = "default",
  style,
  ...props
}: Styled<ComponentProps<typeof BaseAvatar.Root>> & { size?: AvatarSize }) {
  return (
    <BaseAvatar.Root
      data-slot="avatar"
      {...props}
      {...stylex.props(styles.root, sizeStyles[size], style)}
    />
  );
}

export function Image({ style, ...props }: Styled<ComponentProps<typeof BaseAvatar.Image>>) {
  return (
    <BaseAvatar.Image data-slot="avatar-image" {...props} {...stylex.props(styles.image, style)} />
  );
}

export function Fallback({ style, ...props }: Styled<ComponentProps<typeof BaseAvatar.Fallback>>) {
  return (
    <BaseAvatar.Fallback
      data-slot="avatar-fallback"
      {...props}
      {...stylex.props(styles.fallback, style)}
    />
  );
}

/**
 * A status dot on the avatar's corner. It scales with the avatar's size. The dot is only visual,
 * so say what it means in text too, for example in the image's `alt`.
 */
export function Badge({ style, ...props }: Styled<ComponentProps<"span">>) {
  return <span data-slot="avatar-badge" {...props} {...stylex.props(styles.badge, style)} />;
}

/** Overlaps its avatars in a row, each ringed in the page background. */
export function Group({ style, ...props }: Styled<ComponentProps<"div">>) {
  return (
    <div
      data-slot="avatar-group"
      {...props}
      {...stylex.props(stylex.defaultMarker(), styles.group, style)}
    />
  );
}

/** The last item in a Group, for the avatars that don't fit, such as `+3`. */
export function GroupCount({
  size = "default",
  style,
  ...props
}: Styled<ComponentProps<"div">> & { size?: AvatarSize }) {
  return (
    <div
      data-slot="avatar-group-count"
      {...props}
      {...stylex.props(styles.root, sizeStyles[size], styles.fallback, style)}
    />
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: colors.muted,
    boxShadow: {
      default: null,
      [stylex.when.ancestor("[data-slot=avatar-group]")]: `0 0 0 2px ${colors.background}`,
    },
    color: colors.foreground,
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: typography.fontFamily,
    justifyContent: "center",
    marginInlineEnd: {
      default: null,
      [stylex.when.ancestor("[data-slot=avatar-group]")]: `calc(-1 * ${spacing["1.5"]})`,
    },
    position: "relative",
    userSelect: "none",
    verticalAlign: "middle",
  },
  image: {
    borderRadius: radius.full,
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  fallback: {
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1,
  },
  badge: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    boxShadow: `0 0 0 2px ${colors.background}`,
    insetInlineEnd: 0,
    position: "absolute",
    bottom: 0,
    height: "0.625em",
    width: "0.625em",
  },
  group: {
    alignItems: "center",
    display: "flex",
    paddingInlineEnd: spacing["1.5"],
    width: "fit-content",
  },
});

const sizeStyles = stylex.create({
  sm: {
    fontSize: "0.625rem",
    height: "1.5rem",
    width: "1.5rem",
  },
  default: {
    fontSize: typography.fontSizeXs,
    height: "2rem",
    width: "2rem",
  },
  lg: {
    fontSize: typography.fontSizeSm,
    height: "2.5rem",
    width: "2.5rem",
  },
});
