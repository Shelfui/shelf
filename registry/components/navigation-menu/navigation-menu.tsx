"use client";

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "../../foundations/conditions.stylex";
import {
  colors,
  elevation,
  motion,
  radius,
  spacing,
  typography,
} from "../../foundations/tokens.stylex";
import { ChevronDownIcon } from "../icons/icons";
import { type Styled, isTransitioning } from "../../lib/utils";

/**
 * Site navigation where some items open a panel of links. Every panel shares one
 * floating surface that resizes between them:
 *
 *   <NavigationMenu.Root>
 *     <NavigationMenu.List>
 *       <NavigationMenu.Item>
 *         <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
 *         <NavigationMenu.Content>
 *           <NavigationMenu.Link href="/invoicing">Invoicing</NavigationMenu.Link>
 *         </NavigationMenu.Content>
 *       </NavigationMenu.Item>
 *       <NavigationMenu.Item>
 *         <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
 *       </NavigationMenu.Item>
 *     </NavigationMenu.List>
 *   </NavigationMenu.Root>
 */
export const Item = BaseNavigationMenu.Item;

export function Root({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseNavigationMenu.Root>>) {
  return (
    <BaseNavigationMenu.Root
      data-slot="navigation-menu"
      {...props}
      {...stylex.props(styles.root, style)}
    >
      {children}
      <BaseNavigationMenu.Portal>
        <BaseNavigationMenu.Positioner
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className={(state) =>
            stylex.props(styles.positioner, state.instant && styles.instant).className
          }
        >
          <BaseNavigationMenu.Popup
            data-slot="navigation-menu-popup"
            className={(state) =>
              stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden).className
            }
          >
            <BaseNavigationMenu.Viewport {...stylex.props(styles.viewport)} />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  );
}

export function List({ style, ...props }: Styled<ComponentProps<typeof BaseNavigationMenu.List>>) {
  return (
    <BaseNavigationMenu.List
      data-slot="navigation-menu-list"
      {...props}
      {...stylex.props(styles.list, style)}
    />
  );
}

/** Opens its item's `Content`. Renders a chevron after its children. */
export function Trigger({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseNavigationMenu.Trigger>>) {
  return (
    <BaseNavigationMenu.Trigger
      data-slot="navigation-menu-trigger"
      {...props}
      className={(state) =>
        stylex.props(styles.trigger, state.open && styles.triggerOpen, style).className
      }
    >
      {children}
      <BaseNavigationMenu.Icon
        className={(state) => stylex.props(styles.icon, state.open && styles.iconOpen).className}
      >
        <ChevronDownIcon />
      </BaseNavigationMenu.Icon>
    </BaseNavigationMenu.Trigger>
  );
}

export function Content({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseNavigationMenu.Content>>) {
  return (
    <BaseNavigationMenu.Content
      data-slot="navigation-menu-content"
      {...props}
      className={(state) =>
        stylex.props(styles.content, isTransitioning(state) && styles.contentHidden, style)
          .className
      }
    />
  );
}

export function Link({ style, ...props }: Styled<ComponentProps<typeof BaseNavigationMenu.Link>>) {
  return (
    <BaseNavigationMenu.Link
      data-slot="navigation-menu-link"
      {...props}
      className={(state) =>
        stylex.props(styles.link, state.active && styles.linkActive, style).className
      }
    />
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    minWidth: "max-content",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: spacing["1"],
    listStyle: "none",
    alignItems: "center",
    display: "flex",
  },
  trigger: {
    margin: 0,
    borderRadius: radius.md,
    borderWidth: 0,
    gap: spacing["1"],
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["3"],
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    fontFamily: "inherit",
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
  },
  triggerOpen: {
    backgroundColor: colors.accent,
  },
  icon: {
    display: "flex",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "transform",
    transitionTimingFunction: motion.easingStandard,
  },
  iconOpen: {
    transform: "rotate(180deg)",
  },
  positioner: {
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "top, left, right, bottom",
    transitionTimingFunction: motion.easingStandard,
    zIndex: layers.popover,
    height: "var(--positioner-height)",
    maxWidth: "var(--available-width)",
    width: "var(--positioner-width)",
  },
  instant: {
    transitionDuration: "0s",
  },
  popup: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    position: "relative",
    transformOrigin: "var(--transform-origin)",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity, transform, width, height",
    transitionTimingFunction: motion.easingStandard,
    height: "var(--popup-height)",
    width: "var(--popup-width)",
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.97)",
  },
  viewport: {
    overflow: "hidden",
    position: "relative",
    height: "100%",
    width: "100%",
  },
  content: {
    padding: spacing["2"],
    boxSizing: "border-box",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easingStandard,
    width: "max-content",
  },
  contentHidden: {
    opacity: 0,
  },
  link: {
    borderRadius: radius.sm,
    gap: spacing["1"],
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["3"],
    textDecoration: "none",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  linkActive: {
    fontWeight: typography.fontWeightMedium,
  },
});
