"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

/**
 * Groups related fields under a legend. Disabling the root disables every field in it.
 *
 *   <Fieldset.Root>
 *     <Fieldset.Legend>Billing details</Fieldset.Legend>
 *     <Field.Root>…</Field.Root>
 *   </Fieldset.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseFieldset.Root>>) {
  return (
    <BaseFieldset.Root data-slot="fieldset" {...props} {...stylex.props(styles.root, style)} />
  );
}

export function Legend({ style, ...props }: Styled<ComponentProps<typeof BaseFieldset.Legend>>) {
  return (
    <BaseFieldset.Legend
      data-slot="fieldset-legend"
      {...props}
      {...stylex.props(styles.legend, style)}
    />
  );
}

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  legend: {
    fontSynthesis: "none",
    padding: 0,
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightBase,
  },
});
