"use client";

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

export type ScrollAreaProps = Styled<ComponentProps<typeof BaseScrollArea.Root>>;

/**
 * A scrolling region with thin, themed scrollbars that appear while scrolling or
 * hovering. Scrolling itself stays native, including keyboard and touch. Give it a height
 * or max height with `style` so it can scroll.
 *
 *   <ScrollArea style={styles.list}>…long content…</ScrollArea>
 */
export function ScrollArea({ style, children, ...props }: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root data-slot="scroll-area" {...props} {...stylex.props(styles.root, style)}>
      <BaseScrollArea.Viewport data-slot="scroll-area-viewport" {...stylex.props(styles.viewport)}>
        {children}
      </BaseScrollArea.Viewport>
      <Scrollbar orientation="vertical" />
      <Scrollbar orientation="horizontal" />
      <BaseScrollArea.Corner />
    </BaseScrollArea.Root>
  );
}

function Scrollbar({ orientation }: { orientation: "vertical" | "horizontal" }) {
  return (
    <BaseScrollArea.Scrollbar
      orientation={orientation}
      data-slot="scroll-area-scrollbar"
      className={(state) =>
        stylex.props(
          styles.scrollbar,
          orientation === "vertical" ? styles.vertical : styles.horizontal,
          (state.hovering || state.scrolling) && styles.visible,
        ).className
      }
    >
      <BaseScrollArea.Thumb {...stylex.props(styles.thumb)} />
    </BaseScrollArea.Scrollbar>
  );
}

const styles = stylex.create({
  root: {
    position: "relative",
  },
  viewport: {
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    overscrollBehavior: "contain",
    height: "100%",
    maxHeight: "inherit",
  },
  scrollbar: {
    padding: "1px",
    display: "flex",
    opacity: 0,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easingStandard,
    userSelect: "none",
  },
  visible: {
    opacity: 1,
  },
  vertical: {
    width: "0.5rem",
  },
  horizontal: {
    flexDirection: "column",
    height: "0.5rem",
  },
  thumb: {
    borderRadius: radius.full,
    backgroundColor: colors.border,
    flexGrow: 1,
  },
});
