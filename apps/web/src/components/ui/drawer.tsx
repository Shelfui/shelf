"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { type Styled, isTransitioning } from "@/lib/shelf/utils";

/**
 * A modal panel that slides in from an edge of the screen and can be swiped away.
 * `swipeDirection` on the root picks the edge: "down" (a bottom sheet, the default),
 * "up", "left", or "right".
 *
 *   <Drawer.Root swipeDirection="right">
 *     <Drawer.Trigger render={<Button variant="outline" />}>Edit profile</Drawer.Trigger>
 *     <Drawer.Content>
 *       <Drawer.Header>
 *         <Drawer.Title>Edit profile</Drawer.Title>
 *       </Drawer.Header>
 *       …
 *       <Drawer.Footer>
 *         <Drawer.Close render={<Button />}>Save</Drawer.Close>
 *       </Drawer.Footer>
 *     </Drawer.Content>
 *   </Drawer.Root>
 */
export const Root = BaseDrawer.Root;
export const Trigger = BaseDrawer.Trigger;
export const Close = BaseDrawer.Close;

export function Content({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseDrawer.Popup>>) {
  return (
    <BaseDrawer.Portal>
      <BaseDrawer.Backdrop
        data-slot="drawer-backdrop"
        className={(state) =>
          stylex.props(styles.backdrop, isTransitioning(state) && styles.backdropHidden).className
        }
      />
      <BaseDrawer.Viewport data-slot="drawer-viewport" {...stylex.props(styles.viewport)}>
        <BaseDrawer.Popup
          data-slot="drawer-content"
          {...props}
          className={(state) =>
            stylex.props(
              stylex.defaultMarker(),
              styles.popup,
              sideStyles[state.swipeDirection],
              isTransitioning(state) && hiddenStyles[state.swipeDirection],
              state.swiping && styles.swiping,
              style,
            ).className
          }
        >
          <div aria-hidden data-slot="drawer-handle" {...stylex.props(styles.handle)} />
          <BaseDrawer.Content {...stylex.props(styles.content)}>{children}</BaseDrawer.Content>
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}

export function Header({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="drawer-header" {...props} {...stylex.props(styles.header, style)} />;
}

export function Footer({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="drawer-footer" {...props} {...stylex.props(styles.footer, style)} />;
}

export function Title({ style, ...props }: Styled<ComponentProps<typeof BaseDrawer.Title>>) {
  return (
    <BaseDrawer.Title data-slot="drawer-title" {...props} {...stylex.props(styles.title, style)} />
  );
}

export function Description({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseDrawer.Description>>) {
  return (
    <BaseDrawer.Description
      data-slot="drawer-description"
      {...props}
      {...stylex.props(styles.description, style)}
    />
  );
}

const BOTTOM_SHEET = "[data-swipe-direction=down]";
const TOP_SHEET = "[data-swipe-direction=up]";

const styles = stylex.create({
  backdrop: {
    inset: 0,
    backgroundColor: colors.overlay,
    opacity: "calc(1 - var(--drawer-swipe-progress, 0))",
    position: "fixed",
    transitionDuration: {
      default: motion.durationSlow,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easingStandard,
    zIndex: layers.overlay,
  },
  backdropHidden: {
    opacity: 0,
  },
  viewport: {
    inset: 0,
    position: "fixed",
    zIndex: layers.overlay,
  },
  popup: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderStyle: "solid",
    borderWidth: 0,
    outline: "none",
    overscrollBehavior: "contain",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    position: "fixed",
    transitionDuration: {
      default: motion.durationSlow,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "transform",
    transitionTimingFunction: motion.easingStandard,
    zIndex: layers.overlay,
    overflowY: "auto",
  },
  swiping: {
    transitionDuration: "0s",
    userSelect: "none",
  },
  handle: {
    borderRadius: radius.full,
    marginInline: "auto",
    backgroundColor: colors.muted,
    display: {
      default: "none",
      [stylex.when.ancestor(BOTTOM_SHEET)]: "block",
      [stylex.when.ancestor(TOP_SHEET)]: "block",
    },
    flexShrink: 0,
    order: {
      default: 0,
      [stylex.when.ancestor(TOP_SHEET)]: 1,
    },
    height: "0.3125rem",
    marginBottom: {
      default: 0,
      [stylex.when.ancestor(TOP_SHEET)]: spacing["3"],
    },
    marginTop: {
      default: spacing["3"],
      [stylex.when.ancestor(TOP_SHEET)]: 0,
    },
    width: "2.5rem",
  },
  content: {
    padding: spacing["6"],
    gap: spacing["4"],
    marginInline: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: {
      default: "none",
      [stylex.when.ancestor(BOTTOM_SHEET)]: "36rem",
      [stylex.when.ancestor(TOP_SHEET)]: "36rem",
    },
    width: "100%",
  },
  header: {
    gap: spacing["1.5"],
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
    marginTop: "auto",
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeightLg,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});

const sideStyles = stylex.create({
  down: {
    transform: "translateY(var(--drawer-swipe-movement-y, 0px))",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    maxHeight: "80dvh",
    right: 0,
  },
  up: {
    transform: "translateY(var(--drawer-swipe-movement-y, 0px))",
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomWidth: 1,
    left: 0,
    maxHeight: "80dvh",
    right: 0,
    top: 0,
  },
  right: {
    transform: "translateX(var(--drawer-swipe-movement-x, 0px))",
    borderLeftWidth: 1,
    bottom: 0,
    maxWidth: "calc(100% - 3rem)",
    right: 0,
    top: 0,
    width: "24rem",
  },
  left: {
    transform: "translateX(var(--drawer-swipe-movement-x, 0px))",
    borderRightWidth: 1,
    bottom: 0,
    left: 0,
    maxWidth: "calc(100% - 3rem)",
    top: 0,
    width: "24rem",
  },
});

const hiddenStyles = stylex.create({
  down: { transform: "translateY(100%)" },
  up: { transform: "translateY(-100%)" },
  right: { transform: "translateX(100%)" },
  left: { transform: "translateX(-100%)" },
});
