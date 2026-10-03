import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../foundations/conditions.stylex";
import { colors } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export type ShimmerProps = Styled<ComponentProps<"span">>;

/**
 * Text with a soft highlight sweeping across it, for a label that stands for work in progress:
 * "Thinking", "Reading file". Pair it with a real status for assistive tech; the text itself is
 * read as normal. Under reduced motion it stays still in the muted color.
 */
export function Shimmer({ style, ...props }: ShimmerProps) {
  return <span data-slot="shimmer" {...props} {...stylex.props(styles.shimmer, style)} />;
}

const sweep = stylex.keyframes({
  from: { backgroundPosition: "100% 0" },
  to: { backgroundPosition: "-100% 0" },
});

const styles = stylex.create({
  shimmer: {
    animationDuration: "2s",
    animationIterationCount: "infinite",
    animationName: {
      default: sweep,
      [media.reducedMotion]: "none",
    },
    animationTimingFunction: "linear",
    backgroundClip: {
      default: "text",
      [media.reducedMotion]: null,
    },
    backgroundColor: "transparent",
    backgroundImage: {
      default: `linear-gradient(100deg, ${colors.mutedForeground} 35%, ${colors.foreground} 50%, ${colors.mutedForeground} 65%)`,
      [media.reducedMotion]: "none",
    },
    backgroundSize: "250% 100%",
    color: {
      default: "transparent",
      [media.reducedMotion]: colors.mutedForeground,
    },
  },
});
