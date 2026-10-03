"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "@/styles/shelf/conditions.stylex";
import {
  colors,
  elevation,
  motion,
  radius,
  spacing,
  typography,
} from "@/styles/shelf/tokens.stylex";
import { CheckIcon, ChevronRightIcon } from "./icons";
import { type Placement, type Styled, isTransitioning } from "@/lib/shelf/utils";

/**
 * A menu of actions opened from a button. Compose the parts:
 *
 *   <DropdownMenu.Root>
 *     <DropdownMenu.Trigger render={<Button variant="outline" />}>Options</DropdownMenu.Trigger>
 *     <DropdownMenu.Content>
 *       <DropdownMenu.Item onClick={rename}>Rename</DropdownMenu.Item>
 *       <DropdownMenu.Separator />
 *       <DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
 *     </DropdownMenu.Content>
 *   </DropdownMenu.Root>
 *
 * Base UI handles keyboard navigation, typeahead, focus, and dismissal.
 */
export const Root = BaseMenu.Root;
export const Trigger = BaseMenu.Trigger;
export const Group = BaseMenu.Group;
export const RadioGroup = BaseMenu.RadioGroup;
export const Sub = BaseMenu.SubmenuRoot;

type PositionerProps = Placement<ComponentProps<typeof BaseMenu.Positioner>>;

export type ContentProps = Styled<ComponentProps<typeof BaseMenu.Popup>> & PositionerProps;

/** The menu surface. Positioning props go to Base UI's positioner. */
export function Content({
  align,
  alignOffset,
  side,
  sideOffset = 4,
  style,
  ...props
}: ContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <BaseMenu.Popup
          data-slot="dropdown-menu-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function SubContent(props: ContentProps) {
  return <Content side="inline-end" align="start" sideOffset={0} alignOffset={-5} {...props} />;
}

export type ItemProps = Styled<ComponentProps<typeof BaseMenu.Item>> & {
  variant?: "default" | "destructive";
};

export function Item({ variant = "default", style, ...props }: ItemProps) {
  return (
    <BaseMenu.Item
      data-slot="dropdown-menu-item"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          state.highlighted && styles.highlighted,
          variant === "destructive" && styles.destructive,
          variant === "destructive" && state.highlighted && styles.destructiveHighlighted,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

export function LinkItem({ style, ...props }: Styled<ComponentProps<typeof BaseMenu.LinkItem>>) {
  return (
    <BaseMenu.LinkItem
      data-slot="dropdown-menu-link-item"
      {...props}
      className={(state) =>
        stylex.props(styles.item, state.highlighted && styles.highlighted, style).className
      }
    />
  );
}

export function CheckboxItem({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseMenu.CheckboxItem>>) {
  return (
    <BaseMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          styles.inset,
          state.highlighted && styles.highlighted,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseMenu.CheckboxItemIndicator {...stylex.props(styles.indicator)}>
        <CheckIcon />
      </BaseMenu.CheckboxItemIndicator>
      {children}
    </BaseMenu.CheckboxItem>
  );
}

export function RadioItem({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseMenu.RadioItem>>) {
  return (
    <BaseMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          styles.inset,
          state.highlighted && styles.highlighted,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseMenu.RadioItemIndicator {...stylex.props(styles.indicator)}>
        <span {...stylex.props(styles.dot)} />
      </BaseMenu.RadioItemIndicator>
      {children}
    </BaseMenu.RadioItem>
  );
}

export function SubTrigger({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseMenu.SubmenuTrigger>>) {
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          (state.highlighted || state.open) && styles.highlighted,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      {children}
      <ChevronRightIcon {...stylex.props(styles.end)} />
    </BaseMenu.SubmenuTrigger>
  );
}

/** A heading for a `Group` or `RadioGroup`. */
export function Label({ style, ...props }: Styled<ComponentProps<typeof BaseMenu.GroupLabel>>) {
  return (
    <BaseMenu.GroupLabel
      data-slot="dropdown-menu-label"
      {...props}
      {...stylex.props(styles.label, style)}
    />
  );
}

export function Separator({ style, ...props }: Styled<ComponentProps<typeof BaseMenu.Separator>>) {
  return (
    <BaseMenu.Separator
      data-slot="dropdown-menu-separator"
      {...props}
      {...stylex.props(styles.separator, style)}
    />
  );
}

/** A keyboard hint at the end of an item. Display only; bind the keys yourself. */
export function Shortcut({ style, ...props }: Styled<ComponentProps<"span">>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      aria-hidden
      {...props}
      {...stylex.props(styles.shortcut, style)}
    />
  );
}

const styles = stylex.create({
  positioner: {
    outline: "none",
    zIndex: layers.popover,
  },
  popup: {
    fontSynthesis: "none",
    padding: spacing["1"],
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    outline: "none",
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    transformOrigin: "var(--transform-origin)",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity, transform",
    transitionTimingFunction: motion.easingStandard,
    maxHeight: "var(--available-height)",
    minWidth: "8rem",
    overflowY: "auto",
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.97)",
  },
  item: {
    borderRadius: radius.sm,
    gap: spacing["2"],
    outline: "none",
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    alignItems: "center",
    cursor: "default",
    display: "flex",
    position: "relative",
    userSelect: "none",
  },
  inset: {
    paddingInlineStart: spacing["6"],
  },
  highlighted: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
  destructive: {
    color: colors.destructiveText,
  },
  destructiveHighlighted: {
    backgroundColor: `color-mix(in oklab, ${colors.destructive} 10%, transparent)`,
    color: colors.destructiveText,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: "none",
  },
  indicator: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    left: spacing["1.5"],
  },
  dot: {
    borderRadius: "50%",
    backgroundColor: "currentColor",
    height: "0.375rem",
    width: "0.375rem",
  },
  end: {
    marginInlineStart: "auto",
  },
  label: {
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
  separator: {
    marginBlock: spacing["1"],
    marginInline: `calc(-1 * ${spacing["1"]})`,
    backgroundColor: colors.border,
    height: "1px",
  },
  shortcut: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    letterSpacing: "0.1em",
    marginInlineStart: "auto",
    paddingInlineStart: spacing["4"],
  },
});
