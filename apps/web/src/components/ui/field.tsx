"use client";

import { Field as BaseField } from "@base-ui/react/field";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * Groups a control with its label, description, and error, and wires up their
 * accessibility and validation. The control is any Shelf form control:
 *
 *   <Field.Root name="email">
 *     <Field.Label>Email</Field.Label>
 *     <Input type="email" required />
 *     <Field.Description>We never share it.</Field.Description>
 *     <Field.Error match="valueMissing">Enter your email.</Field.Error>
 *   </Field.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseField.Root>>) {
  return <BaseField.Root data-slot="field" {...props} {...stylex.props(styles.root, style)} />;
}

export function Label({ style, ...props }: Styled<ComponentProps<typeof BaseField.Label>>) {
  return (
    <BaseField.Label
      data-slot="field-label"
      {...props}
      className={(state) =>
        stylex.props(
          styles.label,
          state.valid === false && styles.labelInvalid,
          state.disabled && styles.labelDisabled,
          style,
        ).className
      }
    />
  );
}

export function Description({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseField.Description>>) {
  return (
    <BaseField.Description
      data-slot="field-description"
      {...props}
      {...stylex.props(styles.description, style)}
    />
  );
}

/** Shown when the control is invalid. Use `match` to show it for one validity state only. */
export function Error({ style, ...props }: Styled<ComponentProps<typeof BaseField.Error>>) {
  return (
    <BaseField.Error data-slot="field-error" {...props} {...stylex.props(styles.error, style)} />
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    fontSynthesis: "none",
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
    userSelect: "none",
  },
  labelInvalid: {
    color: colors.destructiveText,
  },
  labelDisabled: {
    opacity: 0.5,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  error: {
    color: colors.destructiveText,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
});
