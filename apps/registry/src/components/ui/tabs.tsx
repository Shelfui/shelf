"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import {
  colors,
  elevation,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * Switches between panels of related content. Arrow keys move between tabs:
 *
 *   <Tabs.Root defaultValue="overview">
 *     <Tabs.List>
 *       <Tabs.Tab value="overview">Overview</Tabs.Tab>
 *       <Tabs.Tab value="activity">Activity</Tabs.Tab>
 *     </Tabs.List>
 *     <Tabs.Panel value="overview">…</Tabs.Panel>
 *     <Tabs.Panel value="activity">…</Tabs.Panel>
 *   </Tabs.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseTabs.Root>>) {
  return (
    <BaseTabs.Root
      data-slot="tabs"
      {...props}
      className={(state) =>
        stylex.props(styles.root, state.orientation === "vertical" && styles.rootVertical, style)
          .className
      }
    />
  );
}

export function List({ style, ...props }: Styled<ComponentProps<typeof BaseTabs.List>>) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      {...props}
      className={(state) =>
        stylex.props(styles.list, state.orientation === "vertical" && styles.listVertical, style)
          .className
      }
    />
  );
}

export function Tab({ style, ...props }: Styled<ComponentProps<typeof BaseTabs.Tab>>) {
  return (
    <BaseTabs.Tab
      data-slot="tabs-tab"
      {...props}
      className={(state) =>
        stylex.props(
          styles.tab,
          state.orientation === "vertical" && styles.tabVertical,
          state.active && styles.active,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

export function Panel({ style, ...props }: Styled<ComponentProps<typeof BaseTabs.Panel>>) {
  return (
    <BaseTabs.Panel data-slot="tabs-panel" {...props} {...stylex.props(styles.panel, style)} />
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    gap: spacing["2"],
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
  },
  rootVertical: {
    flexDirection: "row",
  },
  list: {
    padding: "3px",
    borderRadius: radius.lg,
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.muted,
    boxSizing: "border-box",
    color: colors.mutedForeground,
    display: "inline-flex",
    height: sizes.controlDefault,
  },
  listVertical: {
    alignItems: "stretch",
    flexDirection: "column",
    height: "auto",
  },
  tab: {
    margin: 0,
    borderRadius: radius.md,
    borderWidth: 0,
    gap: spacing["1.5"],
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingInline: spacing["2"],
    alignItems: "center",
    backgroundColor: "transparent",
    color: {
      default: "inherit",
      ":hover": {
        default: null,
        [media.hover]: colors.foreground,
      },
    },
    cursor: "pointer",
    display: "inline-flex",
    flexGrow: 1,
    fontFamily: "inherit",
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "center",
    lineHeight: typography.lineHeightSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "background-color, color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    whiteSpace: "nowrap",
    height: "100%",
  },
  tabVertical: {
    paddingInline: spacing["3"],
    justifyContent: "flex-start",
    height: `calc(${sizes.controlDefault} - 6px)`,
  },
  active: {
    backgroundColor: colors.background,
    boxShadow: elevation.xs,
    color: colors.foreground,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  panel: {
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    flexGrow: 1,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
