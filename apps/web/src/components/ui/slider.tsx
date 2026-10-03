"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, radius } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

export interface SliderProps extends Styled<ComponentProps<typeof BaseSlider.Root>> {
  /** The accessible name of each thumb, e.g. `(index) => ["Minimum", "Maximum"][index]`. */
  getAriaLabel?: (index: number) => string;
}

/**
 * A draggable range input. Pass an array `value`/`defaultValue` for a range with one
 * thumb per value. Name it with `aria-label`/`getAriaLabel`, or a surrounding `Field`.
 */
export function Slider({ style, getAriaLabel, ...props }: SliderProps) {
  const values = props.value ?? props.defaultValue;
  const count = Array.isArray(values) ? values.length : 1;
  const label = props["aria-label"];

  return (
    <BaseSlider.Root
      data-slot="slider"
      {...props}
      className={(state) =>
        stylex.props(styles.root, state.disabled && styles.disabled, style).className
      }
    >
      <BaseSlider.Control data-slot="slider-control" {...stylex.props(styles.control)}>
        <BaseSlider.Track data-slot="slider-track" {...stylex.props(styles.track)}>
          <BaseSlider.Indicator data-slot="slider-range" {...stylex.props(styles.range)} />
          {Array.from({ length: count }, (_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={count > 1 ? index : undefined}
              getAriaLabel={getAriaLabel ?? (label ? () => label : undefined)}
              data-slot="slider-thumb"
              className={(state) =>
                stylex.props(styles.thumb, state.disabled && styles.thumbDisabled).className
              }
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

const styles = stylex.create({
  root: {
    touchAction: "none",
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  control: {
    alignItems: "center",
    display: "flex",
    position: "relative",
    userSelect: "none",
    height: "1rem",
    width: "100%",
  },
  track: {
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    position: "relative",
    height: "0.25rem",
    width: "100%",
  },
  range: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  thumb: {
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    backgroundColor: colors.background,
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
      ":hover": {
        default: null,
        [media.hover]: `0 0 0 3px color-mix(in oklab, ${colors.ring} 30%, transparent)`,
      },
    },
    boxSizing: "border-box",
    cursor: "grab",
    height: "1rem",
    width: "1rem",
  },
  thumbDisabled: {
    cursor: "not-allowed",
  },
});
