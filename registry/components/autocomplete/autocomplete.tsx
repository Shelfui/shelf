"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
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
import { CloseIcon } from "../icons/icons";
import { type Placement, type Styled, isTransitioning } from "../../lib/utils";

/**
 * A text input with suggestions. The value is whatever the user types; picking a
 * suggestion fills it in.
 *
 *   <Autocomplete.Root items={tags}>
 *     <Autocomplete.Input aria-label="Tag" placeholder="Add a tag" />
 *     <Autocomplete.Content>
 *       <Autocomplete.Empty>No matching tags.</Autocomplete.Empty>
 *       <Autocomplete.List>
 *         {(tag) => <Autocomplete.Item key={tag} value={tag}>{tag}</Autocomplete.Item>}
 *       </Autocomplete.List>
 *     </Autocomplete.Content>
 *   </Autocomplete.Root>
 *
 * To restrict the value to the list, use Combobox instead.
 */
export const Root = BaseAutocomplete.Root;
export const Group = BaseAutocomplete.Group;

/** The text input, with a clear button. `style` applies to the surrounding group. */
export function Input({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Input>>) {
  return (
    <BaseAutocomplete.InputGroup
      data-slot="autocomplete-input-group"
      className={(state) =>
        stylex.props(
          styles.group,
          state.valid === false && styles.invalid,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    >
      <BaseAutocomplete.Input
        data-slot="autocomplete-input"
        {...props}
        {...stylex.props(styles.input)}
      />
      <BaseAutocomplete.Clear aria-label="Clear" {...stylex.props(styles.button)}>
        <CloseIcon />
      </BaseAutocomplete.Clear>
    </BaseAutocomplete.InputGroup>
  );
}

type PositionerProps = Placement<ComponentProps<typeof BaseAutocomplete.Positioner>>;

export type ContentProps = Styled<ComponentProps<typeof BaseAutocomplete.Popup>> & PositionerProps;

export function Content({
  align,
  alignOffset,
  side,
  sideOffset = 4,
  style,
  ...props
}: ContentProps) {
  return (
    <BaseAutocomplete.Portal>
      <BaseAutocomplete.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...stylex.props(styles.positioner)}
      >
        <BaseAutocomplete.Popup
          data-slot="autocomplete-content"
          {...props}
          className={(state) =>
            stylex.props(styles.popup, isTransitioning(state) && styles.popupHidden, style)
              .className
          }
        />
      </BaseAutocomplete.Positioner>
    </BaseAutocomplete.Portal>
  );
}

export function List({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.List>>) {
  return (
    <BaseAutocomplete.List
      data-slot="autocomplete-list"
      {...props}
      {...stylex.props(styles.list, style)}
    />
  );
}

export function Empty({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Empty>>) {
  return (
    <BaseAutocomplete.Empty
      data-slot="autocomplete-empty"
      {...props}
      {...stylex.props(styles.empty, style)}
    />
  );
}

export function Item({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Item>>) {
  return (
    <BaseAutocomplete.Item
      data-slot="autocomplete-item"
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          state.highlighted && styles.highlighted,
          state.disabled && styles.disabled,
          style,
        ).className
      }
    />
  );
}

/** A heading for a `Group`. */
export function Label({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseAutocomplete.GroupLabel>>) {
  return (
    <BaseAutocomplete.GroupLabel
      data-slot="autocomplete-label"
      {...props}
      {...stylex.props(styles.label, style)}
    />
  );
}

export function Separator({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseAutocomplete.Separator>>) {
  return (
    <BaseAutocomplete.Separator
      data-slot="autocomplete-separator"
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
    outline: "none",
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    cursor: "default",
    display: "flex",
    userSelect: "none",
  },
  highlighted: {
    backgroundColor: colors.accent,
    color: colors.accentForeground,
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
