"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { spacing } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

export type ToggleGroupProps = Styled<ComponentProps<typeof BaseToggleGroup>>;

/**
 * A set of `Toggle`s sharing one array `value`. Arrow keys move between them. One can
 * be pressed at a time unless you pass `multiple`. Label the group with `aria-label`.
 *
 *   <ToggleGroup aria-label="Alignment" defaultValue={["left"]}>
 *     <Toggle value="left" aria-label="Align left"><AlignLeftIcon /></Toggle>
 *     <Toggle value="center" aria-label="Align center"><AlignCenterIcon /></Toggle>
 *   </ToggleGroup>
 */
export function ToggleGroup({ style, ...props }: ToggleGroupProps) {
  return (
    <BaseToggleGroup
      data-slot="toggle-group"
      {...props}
      className={(state) =>
        stylex.props(styles.group, state.orientation === "vertical" && styles.vertical, style)
          .className
      }
    />
  );
}

const styles = stylex.create({
  group: {
    gap: spacing["1"],
    alignItems: "center",
    display: "inline-flex",
  },
  vertical: {
    flexDirection: "column",
  },
});
