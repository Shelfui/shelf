"use client";

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { spacing } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export type CheckboxGroupProps = Styled<ComponentProps<typeof BaseCheckboxGroup>>;

/**
 * Shares one array `value` between the `Checkbox`es inside it; each checkbox needs a
 * `value`. Pass `allValues` to let a parent checkbox (with `parent`) check them all.
 * Label the group with `aria-labelledby`, or put it in a `Fieldset`.
 */
export function CheckboxGroup({ style, ...props }: CheckboxGroupProps) {
  return (
    <BaseCheckboxGroup
      data-slot="checkbox-group"
      {...props}
      {...stylex.props(styles.group, style)}
    />
  );
}

const styles = stylex.create({
  group: {
    gap: spacing["3"],
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
});
