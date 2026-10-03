"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { layers, media } from "../../foundations/conditions.stylex";
import {
  colors,
  elevation,
  motion,
  radius,
  sizes,
  spacing,
  typography,
} from "../../foundations/tokens.stylex";
import { CheckIcon, ChevronsUpDownIcon } from "../icons/icons";
import { type Styled, isTransitioning } from "../../lib/utils";

/**
 * Picks one value from a list. Pass `items` so the trigger can show the chosen label:
 *
 *   <Select.Root items={plans}>
 *     <Select.Trigger aria-label="Plan">
 *       <Select.Value placeholder="Choose a plan" />
 *     </Select.Trigger>
 *     <Select.Content>
 *       {plans.map((plan) => (
 *         <Select.Item key={plan.value} value={plan.value}>{plan.label}</Select.Item>
 *       ))}
 *     </Select.Content>
 *   </Select.Root>
 *
 * Inside a `Field`, the field's label names it.
 */
export const Root = BaseSelect.Root;
export const Group = BaseSelect.Group;

/** The button that opens the list. Renders a chevron after its children. */
export function Trigger({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseSelect.Trigger>>) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      {...props}
      className={(state) =>
        stylex.props(
          styles.trigger,
          state.valid === false && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      {children}
      <BaseSelect.Icon {...stylex.props(styles.icon)}>
        <ChevronsUpDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function Value({ style, ...props }: Styled<ComponentProps<typeof BaseSelect.Value>>) {
  return (
    <BaseSelect.Value
      data-slot="select-value"
      {...props}
      className={(state) =>
        stylex.props(styles.value, state.placeholder && styles.placeholder, style).className
      }
    />
  );
}

type PositionerProps = Pick<
  ComponentProps<typeof BaseSelect.Positioner>,
  "align" | "alignItemWithTrigger" | "alignOffset" | "side" | "sideOffset"
>;

export type ContentProps = Styled<ComponentProps<typeof BaseSelect.Popup>> & PositionerProps;

/**
 * The list surface. By default it opens over the trigger with the selected item lined
 * up; pass `alignItemWithTrigger={false}` to open below instead.
 */
export function Content({
  align,
  alignItemWithTrigger,
  alignOffset,
  side,
  sideOffset = 4,
  style,
  children,
  ...props
}: ContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <BaseSelect.Popup
          data-slot="select-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        >
          <BaseSelect.List {...stylex.props(styles.list)}>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function Item({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseSelect.Item>>) {
  return (
    <BaseSelect.Item
      data-slot="select-item"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          state.highlighted && styles.highlighted,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseSelect.ItemText {...stylex.props(styles.itemText)}>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator {...stylex.props(styles.indicator)}>
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

/** A heading for a `Group`. */
export function Label({ style, ...props }: Styled<ComponentProps<typeof BaseSelect.GroupLabel>>) {
  return (
    <BaseSelect.GroupLabel
      data-slot="select-label"
      {...props}
      {...stylex.props(styles.label, style)}
    />
  );
}

export function Separator({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseSelect.Separator>>) {
  return (
    <BaseSelect.Separator
      data-slot="select-separator"
      {...props}
      {...stylex.props(styles.separator, style)}
    />
  );
}

const styles = stylex.create({
  trigger: {
    fontSynthesis: "none",
    margin: 0,
    borderColor: {
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["2"],
    outline: "none",
    paddingInline: spacing["3"],
    alignItems: "center",
    backgroundColor: "transparent",
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    color: colors.foreground,
    cursor: "default",
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    justifyContent: "space-between",
    lineHeight: typography.lineHeightSm,
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    userSelect: "none",
    whiteSpace: "nowrap",
    height: sizes.controlDefault,
    minWidth: "8rem",
  },
  invalid: {
    borderColor: colors.destructive,
    boxShadow: `0 0 0 3px color-mix(in oklab, ${colors.destructive} 20%, transparent)`,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  icon: {
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
  },
  value: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  placeholder: {
    color: colors.mutedForeground,
  },
  positioner: {
    outline: "none",
    zIndex: layers.popover,
  },
  popup: {
    fontSynthesis: "none",
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
    minWidth: "var(--anchor-width)",
  },
  popupHidden: {
    opacity: 0,
    transform: "scale(0.97)",
  },
  list: {
    padding: spacing["1"],
    outline: "none",
    scrollPaddingBlock: spacing["1"],
    boxSizing: "border-box",
    maxHeight: "var(--available-height)",
    overflowY: "auto",
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
    userSelect: "none",
  },
  highlighted: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
  itemText: {
    flexGrow: 1,
  },
  indicator: {
    display: "flex",
    flexShrink: 0,
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
});
