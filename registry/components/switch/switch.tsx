"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../foundations/conditions.stylex";
import { colors, motion, radius } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export type SwitchProps = Styled<ComponentProps<typeof BaseSwitch.Root>>;

/** An on/off control that takes effect immediately. Label it like a checkbox. */
export function Switch({ style, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      {...props}
      className={(state) =>
        stylex.props(
          styles.root,
          state.checked && styles.rootChecked,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={(state) =>
          stylex.props(styles.thumb, state.checked && styles.thumbChecked).className
        }
      />
    </BaseSwitch.Root>
  );
}

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    borderColor: "transparent",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    alignItems: "center",
    backgroundColor: colors.input,
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "background-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: "1.15rem",
    width: "2rem",
  },
  rootChecked: {
    backgroundColor: colors.primary,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  thumb: {
    borderRadius: radius.full,
    backgroundColor: colors.background,
    display: "block",
    pointerEvents: "none",
    transform: "translateX(0)",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "transform",
    transitionTimingFunction: motion.easingStandard,
    height: "1rem",
    width: "1rem",
  },
  thumbChecked: {
    transform: "translateX(calc(100% - 2px))",
  },
});
