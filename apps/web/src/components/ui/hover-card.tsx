"use client";

import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "@/styles/shelf/conditions.stylex";
import {
  colors,
  elevation,
  motion,
  radius,
  spacing,
  typography,
} from "@/styles/shelf/tokens.stylex";
import { type Styled, type Placement, isTransitioning } from "@/lib/shelf/utils";

/**
 * A preview of a link's destination, shown when a pointer rests on the link:
 *
 *   <HoverCard.Root>
 *     <HoverCard.Trigger href="/customers/acme">Acme Inc.</HoverCard.Trigger>
 *     <HoverCard.Content>…</HoverCard.Content>
 *   </HoverCard.Root>
 *
 * The trigger is a link, so the destination stays reachable by keyboard and touch; the
 * card only adds a sighted-pointer shortcut.
 */
export const Root = BasePreviewCard.Root;

/**
 * Lets several triggers share one card. Pass the handle to `Root` and to each `Trigger`, with a
 * `payload` per trigger; moving between triggers slides the open card instead of reopening it.
 */
export const createHandle = BasePreviewCard.createHandle;
export type TriggerProps = Styled<ComponentProps<typeof BasePreviewCard.Trigger>>;

/** The link that opens the card, underlined so it reads as a link. */
export function Trigger({ style, ...props }: TriggerProps) {
  return (
    <BasePreviewCard.Trigger
      data-slot="hover-card-trigger"
      {...props}
      {...stylex.props(styles.trigger, style)}
    />
  );
}

type PositionerProps = Placement<ComponentProps<typeof BasePreviewCard.Positioner>>;

export type ContentProps = Styled<ComponentProps<typeof BasePreviewCard.Popup>> & PositionerProps;

export function Content({
  align,
  alignOffset,
  side,
  sideOffset = 4,
  style,
  ...props
}: ContentProps) {
  return (
    <BasePreviewCard.Portal>
      <BasePreviewCard.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className={(state) =>
          stylex.props(styles.positioner, state.instant && styles.instant).className
        }
      >
        <BasePreviewCard.Popup
          data-slot="hover-card-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        />
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  );
}

const styles = stylex.create({
  trigger: {
    borderRadius: radius.sm,
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    color: colors.foreground,
    fontWeight: typography.fontWeightMedium,
    outlineOffset: "2px",
    textDecorationColor: {
      default: colors.mutedForeground,
      [media.hover]: {
        default: colors.mutedForeground,
        ":hover": colors.foreground,
      },
    },
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "4px",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "text-decoration-color",
  },
  positioner: {
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "top, left, right, bottom",
    transitionTimingFunction: motion.easingStandard,
    zIndex: layers.popover,
  },
  instant: {
    transitionDuration: "0s",
  },
  popup: {
    fontSynthesis: "none",
    padding: spacing["4"],
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
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
    width: "16rem",
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.97)",
  },
});
