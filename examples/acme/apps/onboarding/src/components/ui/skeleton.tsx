import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../styles/shelf/conditions.stylex";
import { colors, radius } from "../../styles/shelf/tokens.stylex";
import type { Styled } from "../../lib/shelf/utils";

export type SkeletonProps = Styled<ComponentProps<"div">>;

/**
 * A placeholder shape while content loads. Give it the size of the content it stands in
 * for with `style`. It is hidden from assistive tech; mark the loading region itself, for
 * example with `aria-busy`.
 */
export function Skeleton({ style, ...props }: SkeletonProps) {
  return <div data-slot="skeleton" aria-hidden {...props} {...stylex.props(styles.base, style)} />;
}

const pulse = stylex.keyframes({
  "50%": { opacity: 0.5 },
});

const styles = stylex.create({
  base: {
    borderRadius: radius.md,
    animationDuration: "2s",
    animationIterationCount: "infinite",
    animationName: {
      default: pulse,
      [media.reducedMotion]: "none",
    },
    animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
    backgroundColor: colors.muted,
  },
});
