"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { colors, radius, sizes, spacing, typography } from "@/styles/shelf/tokens.stylex";
import * as ShelfDialog from "./dialog";
import { SearchIcon } from "./icons";
import { Kbd, type KbdProps } from "./kbd";
import type { Styled } from "@/lib/shelf/utils";

export type RootProps<Value> = Omit<
  BaseAutocomplete.Root.Props<Value>,
  | "items"
  | "filteredItems"
  | "inline"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "openOnInputClick"
> & {
  /** Items, or groups of items shaped `{ value, items }`. */
  items?: readonly Value[];
  filteredItems?: readonly Value[];
  style?: stylex.StaticStyles;
  children?: ReactNode;
};

/**
 * A searchable list of commands. Typing filters `items`; the arrow keys move the
 * highlight, and Enter runs the highlighted item's `onClick`.
 *
 *   <Command.Root items={groups}>
 *     <Command.Input aria-label="Search commands" placeholder="Type a command…" />
 *     <Command.List aria-label="Commands">
 *       {(group) => (
 *         <Command.Group key={group.value} items={group.items}>
 *           <Command.GroupLabel>{group.value}</Command.GroupLabel>
 *           <Command.Collection>
 *             {(item) => <Command.Item key={item.value} value={item} onClick={…}>{item.label}</Command.Item>}
 *           </Command.Collection>
 *         </Command.Group>
 *       )}
 *     </Command.List>
 *     <Command.Empty>No results.</Command.Empty>
 *   </Command.Root>
 *
 * Items are filtered by their label, so pass `{ value, label }` objects or strings.
 * `onValueChange` reports the search text; choosing an item leaves it as typed.
 * For a palette over the page, wrap it in `Command.Dialog`.
 */
export function Root<Value>({
  autoHighlight = "always",
  style,
  children,
  ...props
}: RootProps<Value>) {
  return (
    <BaseAutocomplete.Root {...props} autoHighlight={autoHighlight} inline open>
      <div data-slot="command" {...stylex.props(styles.root, style)}>
        {children}
      </div>
    </BaseAutocomplete.Root>
  );
}

export const Collection = BaseAutocomplete.Collection;

/** The search field, with a search icon. `style` applies to the surrounding row. */
export function Input({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Input>>) {
  return (
    <div data-slot="command-input-wrapper" {...stylex.props(styles.inputWrapper, style)}>
      <SearchIcon {...stylex.props(styles.searchIcon)} />
      <BaseAutocomplete.Input
        data-slot="command-input"
        {...props}
        {...stylex.props(styles.input)}
      />
    </div>
  );
}

export function List({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.List>>) {
  return (
    <BaseAutocomplete.List
      data-slot="command-list"
      {...props}
      {...stylex.props(styles.list, style)}
    />
  );
}

/** Shown only when nothing matches the search. */
export function Empty({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Empty>>) {
  return (
    <BaseAutocomplete.Empty
      data-slot="command-empty"
      {...props}
      {...stylex.props(styles.empty, style)}
    />
  );
}

export function Group({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Group>>) {
  return (
    <BaseAutocomplete.Group
      data-slot="command-group"
      {...props}
      {...stylex.props(styles.group, style)}
    />
  );
}

/** A heading for a `Group`. */
export function GroupLabel({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseAutocomplete.GroupLabel>>) {
  return (
    <BaseAutocomplete.GroupLabel
      data-slot="command-group-label"
      {...props}
      {...stylex.props(styles.groupLabel, style)}
    />
  );
}

/** A command. `onClick` runs on click and on Enter while it is highlighted. */
export function Item({ style, ...props }: Styled<ComponentProps<typeof BaseAutocomplete.Item>>) {
  return (
    <BaseAutocomplete.Item
      data-slot="command-item"
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

/** A keyboard shortcut at the end of an `Item`. Hidden from assistive technology. */
export function Shortcut({ style, ...props }: KbdProps) {
  return (
    <Kbd data-slot="command-shortcut" aria-hidden {...props} style={[styles.shortcut, style]} />
  );
}

export function Separator({
  style,
  ...props
}: Styled<ComponentProps<typeof BaseAutocomplete.Separator>>) {
  return (
    <BaseAutocomplete.Separator
      data-slot="command-separator"
      {...props}
      {...stylex.props(styles.separator, style)}
    />
  );
}

export type DialogProps = Omit<ComponentProps<typeof ShelfDialog.Root>, "children"> & {
  /** Names the dialog for assistive technology; not shown. */
  title?: string;
  /** Describes the dialog for assistive technology; not shown. */
  description?: string;
  style?: stylex.StaticStyles;
  children?: ReactNode;
};

/**
 * A `Command.Root` in a Shelf Dialog, for a palette over the page. Control it with
 * `open` and `onOpenChange`, and close it from an item's `onClick`.
 */
export function Dialog({
  title = "Command palette",
  description = "Search for a command to run.",
  style,
  children,
  ...props
}: DialogProps) {
  return (
    <ShelfDialog.Root {...props}>
      <ShelfDialog.Content
        showCloseButton={false}
        style={[stylex.defaultMarker(), styles.dialog, style]}
      >
        <ShelfDialog.Title style={styles.visuallyHidden}>{title}</ShelfDialog.Title>
        <ShelfDialog.Description style={styles.visuallyHidden}>
          {description}
        </ShelfDialog.Description>
        {children}
      </ShelfDialog.Content>
    </ShelfDialog.Root>
  );
}

const styles = stylex.create({
  root: {
    fontSynthesis: "none",
    borderColor: colors.border,
    borderRadius: {
      default: radius.lg,
      [stylex.when.ancestor("[data-slot=dialog-content]")]: 0,
    },
    borderStyle: "solid",
    borderWidth: {
      default: 1,
      [stylex.when.ancestor("[data-slot=dialog-content]")]: 0,
    },
    overflow: "hidden",
    backgroundColor: colors.popover,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "100%",
  },
  inputWrapper: {
    gap: spacing["2"],
    paddingInline: spacing["3"],
    alignItems: "center",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: `calc(${sizes.controlLg} + ${spacing["2"]})`,
  },
  searchIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    opacity: 0.8,
  },
  input: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: {
      default: colors.popoverForeground,
      "::placeholder": colors.mutedForeground,
    },
    flexGrow: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    height: "100%",
    minWidth: 0,
  },
  list: {
    padding: spacing["1"],
    outline: "none",
    scrollPaddingBlock: spacing["1"],
    boxSizing: "border-box",
    maxHeight: "20rem",
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
  group: {
    paddingBlock: spacing["1"],
  },
  groupLabel: {
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightXs,
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
  disabled: {
    opacity: 0.5,
    pointerEvents: "none",
  },
  shortcut: {
    marginInlineStart: "auto",
  },
  separator: {
    marginBlock: spacing["1"],
    marginInline: `calc(-1 * ${spacing["1"]})`,
    backgroundColor: colors.border,
    height: "1px",
  },
  dialog: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
    maxWidth: "32rem",
  },
  visuallyHidden: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
});
