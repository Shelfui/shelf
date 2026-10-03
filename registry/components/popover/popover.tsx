"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
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
import { type Placement, type Styled, isTransitioning } from "../../lib/utils";

/**
 * Rich content in a floating panel, opened from a button. Compose the parts:
 *
 *   <Popover.Root>
 *     <Popover.Trigger render={<Button variant="outline" />}>Filters</Popover.Trigger>
 *     <Popover.Content>
 *       <Popover.Title>Filters</Popover.Title>
 *       …
 *     </Popover.Content>
 *   </Popover.Root>
 *
 * Unlike a Tooltip, it can hold interactive content; unlike a Dialog, it is not modal.
 */
export const Root = BasePopover.Root;
export const Trigger = BasePopover.Trigger;
export const Close = BasePopover.Close;

type PositionerProps = Placement<ComponentProps<typeof BasePopover.Positioner>>;

export type ContentProps = Styled<ComponentProps<typeof BasePopover.Popup>> & PositionerProps;

export function Content({
  align,
  alignOffset,
  side,
  sideOffset = 4,
  style,
  ...props
}: ContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <BasePopover.Popup
          data-slot="popover-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export function Header({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="popover-header" {...props} {...stylex.props(styles.header, style)} />;
}

export function Title({ style, ...props }: Styled<ComponentProps<typeof BasePopover.Title>>) {
  return (
    <BasePopover.Title
      data-slot="popover-title"
      {...props}
      {...stylex.props(styles.title, style)}
    />
  );
}

export function Description({
  style,
  ...props
}: Styled<ComponentProps<typeof BasePopover.Description>>) {
  return (
    <BasePopover.Description
      data-slot="popover-description"
      {...props}
      {...stylex.props(styles.description, style)}
    />
  );
}

const styles = stylex.create({
  positioner: {
    outline: "none",
    zIndex: layers.popover,
  },
  popup: {
    fontSynthesis: "none",
    padding: spacing["4"],
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["4"],
    outline: "none",
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    transformOrigin: "var(--transform-origin)",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity, transform",
    transitionTimingFunction: motion.easingStandard,
    maxWidth: "var(--available-width)",
    width: "18rem",
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.97)",
  },
  header: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
