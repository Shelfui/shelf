"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
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
import { CheckIcon, ChevronDownIcon, CloseIcon } from "../icons/icons";
import { type Placement, type Styled, isTransitioning } from "../../lib/utils";

/**
 * Picks a value from a list you can filter by typing. Base UI filters `items` as the
 * user types and passes each match to the `List` render function:
 *
 *   <Combobox.Root items={countries}>
 *     <Combobox.Input aria-label="Country" placeholder="Search countries" />
 *     <Combobox.Content>
 *       <Combobox.Empty>No countries found.</Combobox.Empty>
 *       <Combobox.List>
 *         {(country) => <Combobox.Item key={country} value={country}>{country}</Combobox.Item>}
 *       </Combobox.List>
 *     </Combobox.Content>
 *   </Combobox.Root>
 *
 * For free text with suggestions, use Autocomplete instead.
 */
export const Root = BaseCombobox.Root;
export const Group = BaseCombobox.Group;

/** The text input, with clear and open buttons. `style` applies to the surrounding group. */
export function Input({ style, ...props }: Styled<ComponentProps<typeof BaseCombobox.Input>>) {
  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-input-group"
      className={(state) =>
        stylex.props(
          styles.group,
          state.valid === false && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseCombobox.Input data-slot="combobox-input" {...props} {...stylex.props(styles.input)} />
      <BaseCombobox.Clear aria-label="Clear" {...stylex.props(styles.button)}>
        <CloseIcon />
      </BaseCombobox.Clear>
      <BaseCombobox.Trigger aria-label="Show options" {...stylex.props(styles.button)}>
        <ChevronDownIcon />
      </BaseCombobox.Trigger>
    </BaseCombobox.InputGroup>
  );
}

type PositionerProps = Placement<ComponentProps<typeof BaseCombobox.Positioner>>;

export type ContentProps = Styled<ComponentProps<typeof BaseCombobox.Popup>> & PositionerProps;

export function Content({
  align,
  alignOffset,
  side,
  sideOffset = 4,
  style,
  ...props
}: ContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <BaseCombobox.Popup
          data-slot="combobox-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export function List({ style, ...props }: Styled<ComponentProps<typeof BaseCombobox.List>>) {
  return (
    <BaseCombobox.List data-slot="combobox-list" {...props} {...stylex.props(styles.list, style)} />
  );
}

export function Empty({ style, ...props }: Styled<ComponentProps<typeof BaseCombobox.Empty>>) {
  return (
    <BaseCombobox.Empty
      data-slot="combobox-empty"
      {...props}
      {...stylex.props(styles.empty, style)}
    />
  );
}

export function Item({
  style,
  children,
  ...props
}: Styled<ComponentProps<typeof BaseCombobox.Item>>) {
  return (
    <BaseCombobox.Item
      data-slot="combobox-item"
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
      <span {...stylex.props(styles.itemText)}>{children}</span>
      <BaseCombobox.ItemIndicator {...stylex.props(styles.indicator)}>
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

/** A heading for a `Group`. */
export function Label({ style, ...props }: Styled<ComponentProps<typeof BaseCombobox.GroupLabel>>) {
  return (
    <BaseCombobox.GroupLabel
      data-slot="combobox-label"
      {...props}
      {...stylex.props(styles.label, style)}
    />
  );
}

export function Separator({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseCombobox.Separator>>) {
  return (
    <BaseCombobox.Separator
      data-slot="combobox-separator"
      {...props}
      {...stylex.props(styles.separator, style)}
    />
  );
}

const styles = stylex.create({
  group: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    boxShadow: {
      default: null,
      ":focus-within": `0 0 0 3px color-mix(in oklab, ${colors.ring} 50%, transparent)`,
    },
    boxSizing: "border-box",
    display: "flex",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "border-color, box-shadow",
    transitionTimingFunction: motion.easingStandard,
    height: sizes.controlDefault,
  },
  invalid: {
    borderColor: colors.destructive,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: "none",
  },
  input: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: {
      default: colors.foreground,
      "::placeholder": colors.mutedForeground,
    },
    flexGrow: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    paddingInlineStart: spacing["3"],
    height: "100%",
    minWidth: 0,
  },
  button: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    alignItems: "center",
    backgroundColor: "transparent",
    color: colors.mutedForeground,
    cursor: "default",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "100%",
    width: sizes.controlXs,
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
    maxWidth: "var(--available-width)",
    width: "var(--anchor-width)",
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
    maxHeight: "min(22rem, var(--available-height))",
    overflowY: "auto",
  },
  empty: {
    paddingBlock: spacing["6"],
    color: colors.mutedForeground,
    display: {
      default: "block",
      ":empty": "none",
    },
    textAlign: "center",
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
