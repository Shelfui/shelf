"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, createContext, useContext } from "react";
import {
  Group as BaseGroup,
  Panel as BasePanel,
  Separator as BaseSeparator,
} from "react-resizable-panels";
import { colors, radius } from "../../foundations/tokens.stylex";
import { GripIcon } from "../icons/icons";
import type { Styled } from "../../lib/utils";

type Orientation = "horizontal" | "vertical";

const OrientationContext = createContext<Orientation>("horizontal");

/**
 * Panels that people resize by dragging or with the keyboard, built on
 * react-resizable-panels. Compose the parts:
 *
 *   <Resizable.Group orientation="horizontal">
 *     <Resizable.Panel defaultSize="25%" minSize="15%">Sidebar</Resizable.Panel>
 *     <Resizable.Handle withHandle aria-label="Resize sidebar" />
 *     <Resizable.Panel>Content</Resizable.Panel>
 *   </Resizable.Group>
 *
 * The group fills its container, so give the container a size. Panels and handles must
 * be direct children of their group; nest a `Group` inside a `Panel` for mixed layouts.
 * Sizes without a unit are percentages, numbers are pixels.
 */
export function Group({
  orientation = "horizontal",
  style,
  ...props
}: Styled<ComponentProps<typeof BaseGroup>>) {
  return (
    <OrientationContext.Provider value={orientation}>
      <BaseGroup
        data-slot="resizable-group"
        orientation={orientation}
        {...props}
        {...stylex.props(style)}
      />
    </OrientationContext.Provider>
  );
}

export function Panel({ style, ...props }: Styled<ComponentProps<typeof BasePanel>>) {
  return <BasePanel data-slot="resizable-panel" {...props} {...stylex.props(style)} />;
}

export type HandleProps = Styled<ComponentProps<typeof BaseSeparator>> & {
  /** Shows a grip on the line, so the handle is easy to find. */
  withHandle?: boolean;
};

/**
 * The divider between two panels: a focusable `separator` whose value is the size of
 * the panel before it. Arrow keys resize, Home and End jump to the limits, and Enter
 * collapses a collapsible panel. The pointer hit area extends past the 1px line.
 * Name it with `aria-label` when the layout has several handles.
 */
export function Handle({ withHandle = false, style, ...props }: HandleProps) {
  const orientation = useContext(OrientationContext);
  return (
    <BaseSeparator
      data-slot="resizable-handle"
      {...props}
      {...stylex.props(styles.handle, handleStyles[orientation], style)}
    >
      {withHandle && (
        <div data-slot="resizable-grip" {...stylex.props(styles.grip, gripStyles[orientation])}>
          <GripIcon />
        </div>
      )}
    </BaseSeparator>
  );
}

const styles = stylex.create({
  handle: {
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    alignItems: "center",
    backgroundColor: {
      default: colors.border,
      ":focus-visible": colors.ring,
    },
    display: "flex",
    justifyContent: "center",
    outlineOffset: 1,
    position: "relative",
    zIndex: {
      default: null,
      ":focus-visible": 1,
    },
  },
  grip: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    fontSize: "0.625rem",
    justifyContent: "center",
    zIndex: 1,
    height: "1rem",
    width: "0.75rem",
  },
});

// A horizontal group lays panels side by side, so its handle is a vertical line.
const handleStyles = stylex.create({
  horizontal: {
    cursor: "col-resize",
    width: 1,
  },
  vertical: {
    cursor: "row-resize",
    height: 1,
  },
});

const gripStyles = stylex.create({
  horizontal: {},
  vertical: {
    transform: "rotate(90deg)",
  },
});
