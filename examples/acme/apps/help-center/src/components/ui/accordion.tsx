"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "../../styles/shelf/tokens.stylex";
import { ChevronDownIcon } from "./icons";
import { type Styled, isTransitioning } from "../../lib/shelf/utils";

/**
 * Stacked sections that expand one at a time, or several with `multiple`:
 *
 *   <Accordion.Root defaultValue={["billing"]}>
 *     <Accordion.Item value="billing">
 *       <Accordion.Trigger>How does billing work?</Accordion.Trigger>
 *       <Accordion.Panel>…</Accordion.Panel>
 *     </Accordion.Item>
 *   </Accordion.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseAccordion.Root>>) {
  return (
    <BaseAccordion.Root data-slot="accordion" {...props} {...stylex.props(styles.root, style)} />
  );
}

export function Item({ style, ...props }: Styled<ComponentProps<typeof BaseAccordion.Item>>) {
  return (
    <BaseAccordion.Item
      data-slot="accordion-item"
      {...props}
      {...stylex.props(styles.item, style)}
    />
  );
}

export function Trigger({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseAccordion.Trigger>>) {
  return (
    <BaseAccordion.Header {...stylex.props(styles.header)}>
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        {...props}
        className={(state) =>
          stylex.props(
            stylex.defaultMarker(),
            styles.trigger,
            state.disabled && styles.disabled,
            style,
          ).className
        }
      >
        {children}
        <ChevronDownIcon {...stylex.props(styles.chevron)} />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export function Panel({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseAccordion.Panel>>) {
  return (
    <BaseAccordion.Panel
      data-slot="accordion-panel"
      {...props}
      className={(state) =>
        stylex.props(styles.panel, isTransitioning(state) && styles.panelClosed).className
      }
    >
      <div {...stylex.props(styles.content, style)}>{children}</div>
    </BaseAccordion.Panel>
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    width: "100%",
  },
  item: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  header: {
    margin: 0,
    display: "flex",
  },
  trigger: {
    margin: 0,
    borderRadius: radius.sm,
    borderWidth: 0,
    gap: spacing["4"],
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingBlock: spacing["4"],
    paddingInline: 0,
    textDecoration: {
      default: "none",
      ":hover": {
        default: null,
        [media.hover]: "underline",
      },
    },
    alignItems: "flex-start",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    flexGrow: 1,
    fontFamily: "inherit",
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    justifyContent: "space-between",
    lineHeight: typography.lineHeightSm,
    textAlign: "start",
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  chevron: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontSize: typography.fontSizeBase,
    transform: {
      default: null,
      [stylex.when.ancestor("[data-panel-open]")]: "rotate(180deg)",
    },
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "transform",
    transitionTimingFunction: motion.easingStandard,
  },
  panel: {
    overflow: "hidden",
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "height",
    transitionTimingFunction: motion.easingStandard,
    height: "var(--accordion-panel-height)",
  },
  panelClosed: {
    height: 0,
  },
  content: {
    paddingBottom: spacing["4"],
  },
});
