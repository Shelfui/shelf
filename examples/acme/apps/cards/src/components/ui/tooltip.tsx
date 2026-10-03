"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "../../styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "../../styles/shelf/tokens.stylex";
import { type Styled, type Placement, isTransitioning } from "../../lib/shelf/utils";

/**
 * A short label shown on hover and keyboard focus. Compose the parts:
 *
 *   <Tooltip.Root>
 *     <Tooltip.Trigger render={<Button size="icon" aria-label="Add" />}><PlusIcon /></Tooltip.Trigger>
 *     <Tooltip.Content>Add to library</Tooltip.Content>
 *   </Tooltip.Root>
 *
 * Put one `Tooltip.Provider` near the root so moving between tooltips skips the delay.
 * A tooltip supplements a name; it is not the name, so icon buttons still need `aria-label`.
 */
export const Provider = BaseTooltip.Provider;
export const Root = BaseTooltip.Root;
export const Trigger = BaseTooltip.Trigger;

type PositionerProps = Placement<ComponentProps<typeof BaseTooltip.Positioner>>;

export type ContentProps = Styled<ComponentProps<typeof BaseTooltip.Popup>> & PositionerProps;

export function Content({
  align,
  alignOffset,
  side = "top",
  sideOffset = 6,
  style,
  ...props
}: ContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}

const styles = stylex.create({
  positioner: {
    zIndex: layers.tooltip,
  },
  popup: {
    fontSynthesis: "none",
    borderRadius: radius.md,
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["3"],
    backgroundColor: colors.primary,
    boxSizing: "border-box",
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    transformOrigin: "var(--transform-origin)",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity, transform",
    transitionTimingFunction: motion.easingStandard,
    maxWidth: "20rem",
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.97)",
  },
});
