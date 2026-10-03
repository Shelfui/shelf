import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { SpinnerIcon } from "./icons";
import type { Styled } from "@/lib/shelf/utils";

export type SpinnerProps = Styled<Omit<ComponentProps<"svg">, "ref">>;

/**
 * A spinning loading indicator, announced as "Loading" unless you pass another
 * `aria-label`. It sizes with `fontSize`, like the icons. Inside a Button, pass
 * `aria-hidden` and keep the button's own label.
 */
export function Spinner({ style, ...props }: SpinnerProps) {
  return (
    <SpinnerIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      aria-hidden={undefined}
      {...props}
      {...stylex.props(styles.spin, style)}
    />
  );
}

const spin = stylex.keyframes({
  to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
  spin: {
    animationDuration: {
      default: "1s",
      [media.reducedMotion]: "2.5s",
    },
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
    flexShrink: 0,
  },
});
