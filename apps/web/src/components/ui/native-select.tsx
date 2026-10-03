import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "@/styles/shelf/tokens.stylex";
import { ChevronDownIcon } from "./icons";
import { type Styled, isAriaTrue } from "@/lib/shelf/utils";

export type NativeSelectSize = "sm" | "default";

export type RootProps = Styled<Omit<ComponentProps<"select">, "size" | "multiple">> & {
  size?: NativeSelectSize;
};

/**
 * The browser's own `<select>`, styled to match Input and Select. It works without
 * JavaScript and opens the platform picker on phones.
 *
 *   <NativeSelect.Root aria-label="Status" defaultValue="paid">
 *     <NativeSelect.Option value="draft">Draft</NativeSelect.Option>
 *     <NativeSelect.Option value="paid">Paid</NativeSelect.Option>
 *   </NativeSelect.Root>
 *
 * Name it with a `<label htmlFor>` or `aria-label`, and set `aria-invalid` to show the
 * invalid state. `style` applies to the surrounding box, so use it for width.
 * For custom item content or styled options, use Select.
 */
export function Root({ size = "default", disabled, style, ...props }: RootProps) {
  const invalid = isAriaTrue(props["aria-invalid"]);

  return (
    <div
      data-slot="native-select-wrapper"
      {...stylex.props(styles.wrapper, disabled && styles.disabled, style)}
    >
      <select
        data-slot="native-select"
        data-size={size}
        disabled={disabled}
        {...props}
        {...stylex.props(styles.select, sizeStyles[size], invalid && styles.invalid)}
      />
      <ChevronDownIcon {...stylex.props(styles.icon)} />
    </div>
  );
}

export function Option({ style, ...props }: Styled<ComponentProps<"option">>) {
  return (
    <option data-slot="native-select-option" {...props} {...stylex.props(styles.option, style)} />
  );
}

export function OptGroup({ style, ...props }: Styled<ComponentProps<"optgroup">>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      {...props}
      {...stylex.props(styles.option, style)}
    />
  );
}

const styles = stylex.create({
  wrapper: {
    display: "inline-flex",
    position: "relative",
    minWidth: 0,
    width: "fit-content",
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  select: {
    fontSynthesis: "none",
    margin: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    appearance: "none",
    backgroundColor: "transparent",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    cursor: {
      default: "default",
      ":disabled": "not-allowed",
    },
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    // Leaves room for the chevron.
    paddingInlineEnd: `calc(${spacing["6"]} + ${spacing["2"]})`,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    userSelect: "none",
    minWidth: 0,
    width: "100%",
  },
  invalid: {
    borderColor: colors.destructive,
    boxShadow: `0 0 0 3px color-mix(in oklab, ${colors.destructive} 20%, transparent)`,
  },
  icon: {
    color: colors.mutedForeground,
    pointerEvents: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    userSelect: "none",
    right: spacing["2.5"],
    top: "50%",
  },
  option: {
    backgroundColor: colors.popover,
    color: colors.popoverForeground,
  },
});

const sizeStyles = stylex.create({
  sm: {
    paddingInlineStart: spacing["2"],
    height: sizes.controlSm,
  },
  default: {
    paddingInlineStart: spacing["2.5"],
    height: sizes.controlDefault,
  },
});
