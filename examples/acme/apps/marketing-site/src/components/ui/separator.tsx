"use client";

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors } from "../../styles/shelf/tokens.stylex";
import type { Styled } from "../../lib/shelf/utils";

export type SeparatorProps = Styled<ComponentProps<typeof BaseSeparator>>;

/** A dividing line, horizontal by default. Set `orientation="vertical"` inside a row. */
export function Separator({ style, ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      data-slot="separator"
      {...props}
      className={(state) =>
        stylex.props(
          styles.base,
          state.orientation === "vertical" ? styles.vertical : styles.horizontal,
          style,
        ).className
      }
    />
  );
}

const styles = stylex.create({
  base: {
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  horizontal: {
    height: "1px",
    width: "100%",
  },
  vertical: {
    alignSelf: "stretch",
    width: "1px",
  },
});
