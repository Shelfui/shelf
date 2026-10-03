"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { layers } from "../../foundations/conditions.stylex";
import { colors, elevation, radius, spacing, typography } from "../../foundations/tokens.stylex";

export interface Tip {
  anchor: Element;
  content: ReactNode;
}

/**
 * One tooltip for a whole chart, positioned against whichever mark is hovered or focused.
 * Marks carry their own accessible names; this only adds detail for pointer users.
 */
export function ChartTooltip({ tip }: { tip: Tip | null }) {
  return (
    <BaseTooltip.Root open={tip !== null}>
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          anchor={tip?.anchor}
          side="top"
          sideOffset={8}
          {...stylex.props(styles.positioner)}
        >
          <BaseTooltip.Popup {...stylex.props(styles.popup)}>{tip?.content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

const styles = stylex.create({
  positioner: {
    pointerEvents: "none",
    zIndex: layers.tooltip,
  },
  popup: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1"],
    paddingBlock: spacing["2"],
    paddingInline: spacing["3"],
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    color: colors.popoverForeground,
    display: "grid",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    maxWidth: "18rem",
  },
});
