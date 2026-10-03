"use client";

import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "../../foundations/conditions.stylex";
import {
  colors,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

/**
 * A one-time code input with one slot per character. Typing moves forward, Backspace
 * moves back, and pasting fills every slot.
 *
 *   <Label htmlFor="code">Verification code</Label>
 *   <InputOTP.Root id="code" length={6}>
 *     {Array.from({ length: 6 }, (_, index) => (
 *       <InputOTP.Slot key={index} aria-label={index ? `Character ${index + 1} of 6` : undefined} />
 *     ))}
 *   </InputOTP.Root>
 *
 * The label (or a surrounding `Field`) names the first slot; name the others with
 * `aria-label`.
 */
export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseOTPField.Root>>) {
  return (
    <BaseOTPField.Root
      data-slot="input-otp"
      {...props}
      className={(state) =>
        stylex.props(styles.root, state.disabled && styles.disabled, style).className
      }
    />
  );
}

export function Slot({ style, ...props }: Styled<ComponentProps<typeof BaseOTPField.Input>>) {
  return (
    <BaseOTPField.Input
      data-slot="input-otp-slot"
      {...props}
      className={(state) =>
        stylex.props(styles.slot, state.valid === false && styles.invalid, style).className
      }
    />
  );
}

export function Separator({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseOTPField.Separator>>) {
  return (
    <BaseOTPField.Separator
      data-slot="input-otp-separator"
      {...props}
      {...stylex.props(styles.separator, style)}
    />
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
  disabled: {
    opacity: 0.5,
  },
  slot: {
    margin: 0,
    padding: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    backgroundColor: "transparent",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    textAlign: "center",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: sizes.controlLg,
    width: sizes.controlLg,
  },
  invalid: {
    borderColor: colors.destructive,
  },
  separator: {
    backgroundColor: colors.border,
    height: "1px",
    width: spacing["2"],
  },
});
