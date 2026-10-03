"use client";

import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A row of controls that is one Tab stop; arrow keys move between them. Render Shelf
 * controls through the parts so they join the roving focus:
 *
 *   <Toolbar.Root aria-label="Formatting">
 *     <Toolbar.Button render={<Toggle aria-label="Bold" />}>B</Toolbar.Button>
 *     <Toolbar.Separator />
 *     <Toolbar.Button render={<Button variant="ghost" />}>Share</Toolbar.Button>
 *   </Toolbar.Root>
 */
export const Button = BaseToolbar.Button;
export const Link = BaseToolbar.Link;
export const Input = BaseToolbar.Input;

export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseToolbar.Root>>) {
  return (
    <BaseToolbar.Root
      data-slot="toolbar"
      {...props}
      className={(state) =>
        stylex.props(styles.root, state.orientation === "vertical" && styles.vertical, style)
          .className
      }
    />
  );
}

export function Group({ style, ...props }: Styled<ComponentProps<typeof BaseToolbar.Group>>) {
  return (
    <BaseToolbar.Group
      data-slot="toolbar-group"
      {...props}
      {...stylex.props(styles.group, style)}
    />
  );
}

export function Separator({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseToolbar.Separator>>) {
  return (
    <BaseToolbar.Separator
      data-slot="toolbar-separator"
      {...props}
      className={(state) =>
        stylex.props(
          styles.separator,
          state.orientation === "vertical" ? styles.separatorVertical : styles.separatorHorizontal,
          style,
        ).className
      }
    />
  );
}

const styles = stylex.create({
  root: {
    padding: spacing["1"],
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["1"],
    alignItems: "center",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    display: "flex",
  },
  vertical: {
    flexDirection: "column",
  },
  group: {
    gap: spacing["1"],
    alignItems: "center",
    display: "flex",
  },
  separator: {
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  // A toolbar's separators run across it: vertical in a horizontal toolbar.
  separatorVertical: {
    marginInline: spacing["1"],
    alignSelf: "stretch",
    width: "1px",
  },
  separatorHorizontal: {
    marginBlock: spacing["1"],
    height: "1px",
    width: "100%",
  },
});
