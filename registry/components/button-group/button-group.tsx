import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import type { Styled } from "../../lib/utils";

export type ButtonGroupProps = Styled<ComponentProps<"div">>;

/**
 * Joins related Buttons into one row that shares borders. Label it with `aria-label`.
 *
 *   <ButtonGroup aria-label="Invoice actions">
 *     <Button variant="outline">Archive</Button>
 *     <Button variant="outline">Report</Button>
 *   </ButtonGroup>
 *
 * Button overlaps its neighbour's border when it is inside a group; see its styles.
 */
export function ButtonGroup({ style, ...props }: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      role="group"
      {...props}
      {...stylex.props(stylex.defaultMarker(), styles.group, style)}
    />
  );
}

const styles = stylex.create({
  group: {
    alignItems: "stretch",
    display: "flex",
    width: "fit-content",
  },
});
