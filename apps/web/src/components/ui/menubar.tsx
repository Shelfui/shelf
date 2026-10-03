"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { type ContentProps, Content as MenuContent } from "./dropdown-menu";
import type { Styled } from "@/lib/shelf/utils";

/**
 * A row of menus, as in a desktop app. Arrow keys move between the menus, and each
 * menu uses Dropdown Menu's items:
 *
 *   <Menubar.Root>
 *     <Menubar.Menu>
 *       <Menubar.Trigger>File</Menubar.Trigger>
 *       <Menubar.Content>
 *         <Menubar.Item>New tab</Menubar.Item>
 *       </Menubar.Content>
 *     </Menubar.Menu>
 *   </Menubar.Root>
 */
export const Menu = BaseMenu.Root;

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

export function Root({ style, ...props }: Styled<ComponentProps<typeof BaseMenubar>>) {
  return <BaseMenubar data-slot="menubar" {...props} {...stylex.props(styles.root, style)} />;
}

export function Trigger({ style, ...props }: Styled<ComponentProps<typeof BaseMenu.Trigger>>) {
  return (
    <BaseMenu.Trigger
      data-slot="menubar-trigger"
      {...props}
      className={(state) =>
        stylex.props(
          styles.trigger,
          state.open && styles.triggerOpen,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

/** A menu's surface, aligned to the start of its trigger. */
export function Content({
  align = "start",
  sideOffset = 8,
  alignOffset = -5,
  ...props
}: ContentProps) {
  return <MenuContent align={align} sideOffset={sideOffset} alignOffset={alignOffset} {...props} />;
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
  trigger: {
    fontSynthesis: "none",
    margin: 0,
    borderRadius: radius.sm,
    borderWidth: 0,
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingBlock: spacing["1"],
    paddingInline: spacing["2"],
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": {
        default: null,
        [media.hover]: colors.accent,
      },
    },
    color: colors.foreground,
    cursor: "default",
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
    userSelect: "none",
  },
  triggerOpen: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
  disabled: {
    opacity: 0.5,
  },
});
