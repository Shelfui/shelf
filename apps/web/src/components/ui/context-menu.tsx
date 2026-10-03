"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { type ContentProps, Content as MenuContent } from "./dropdown-menu";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A menu opened by right-clicking (or long-pressing) an area. It uses Dropdown Menu's
 * items, so everything inside `Content` is the same:
 *
 *   <ContextMenu.Root>
 *     <ContextMenu.Trigger>Right-click here</ContextMenu.Trigger>
 *     <ContextMenu.Content>
 *       <ContextMenu.Item>Copy</ContextMenu.Item>
 *     </ContextMenu.Content>
 *   </ContextMenu.Root>
 */
export const Root = BaseContextMenu.Root;
export type TriggerProps = Styled<ComponentProps<typeof BaseContextMenu.Trigger>>;

/** The area that opens the menu. It renders a `<div>`; use `render` to change the element. */
export function Trigger({ style, ...props }: TriggerProps) {
  return (
    <BaseContextMenu.Trigger
      data-slot="context-menu-trigger"
      {...props}
      {...stylex.props(styles.trigger, style)}
    />
  );
}

export {
  CheckboxItem,
  Group,
  Item,
  Label,
  LinkItem,
  RadioGroup,
  RadioItem,
  Separator,
  Shortcut,
  Sub,
  SubContent,
  SubTrigger,
} from "./dropdown-menu";

/** Opens at the pointer. */
export function Content({ sideOffset = 0, ...props }: ContentProps) {
  return <MenuContent sideOffset={sideOffset} {...props} />;
}

const styles = stylex.create({
  // Long-press opens the menu on touch; don't select text instead.
  trigger: {
    userSelect: "none",
  },
});
