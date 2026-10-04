"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { ChevronRightIcon } from "./icons";

export interface TreeNode {
  id: string;
  label: ReactNode;
  /** Shown before the label. */
  icon?: ReactNode;
  children?: TreeNode[];
}

export interface TreeViewProps extends Styled<
  Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange" | "role">
> {
  items: TreeNode[];
  /** The selected item's id. */
  selected?: string;
  defaultSelected?: string;
  onSelectedChange?: (id: string) => void;
  /** Ids of the open branches. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  "aria-label": string;
}

interface Row {
  node: TreeNode;
  level: number;
  parent?: string;
  index: number;
  size: number;
}

/**
 * A hierarchy such as a file list. Arrow keys move and open or close branches, Home and End
 * jump, Enter selects. Only one row is in the tab order.
 *
 *   <TreeView aria-label="Files" items={files} onSelectedChange={open} />
 */
export function TreeView({
  items,
  selected,
  defaultSelected,
  onSelectedChange,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  style,
  ...props
}: TreeViewProps) {
  const [innerSelected, setInnerSelected] = useState(defaultSelected);
  const [innerExpanded, setInnerExpanded] = useState(defaultExpanded);
  const [focusId, setFocusId] = useState<string>();
  const rows = useRef(new Map<string, HTMLElement>());

  const selectedId = selected ?? innerSelected;
  const open = expanded ?? innerExpanded;
  const openSet = new Set(open);

  const visible: Row[] = [];
  const walk = (nodes: TreeNode[], level: number, parent?: string) => {
    nodes.forEach((node, index) => {
      visible.push({ node, level, parent, index, size: nodes.length });
      if (node.children && openSet.has(node.id)) walk(node.children, level + 1, node.id);
    });
  };
  walk(items, 1);

  // The row that holds the tab stop: the last one focused, else the selection, else the first.
  const tabId =
    visible.find((row) => row.node.id === (focusId ?? selectedId))?.node.id ?? visible[0]?.node.id;

  const setOpen = (id: string, next: boolean) => {
    const ids = next ? [...open, id] : open.filter((existing) => existing !== id);
    setInnerExpanded(ids);
    onExpandedChange?.(ids);
  };
  const select = (id: string) => {
    setInnerSelected(id);
    onSelectedChange?.(id);
  };
  const moveTo = (id: string | undefined) => {
    if (!id) return;
    setFocusId(id);
    rows.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, position: number) => {
    const row = visible[position]!;
    const { node } = row;
    const isOpen = openSet.has(node.id);
    const hasChildren = Boolean(node.children?.length);

    switch (event.key) {
      case "ArrowDown":
        moveTo(visible[position + 1]?.node.id);
        break;
      case "ArrowUp":
        moveTo(visible[position - 1]?.node.id);
        break;
      case "Home":
        moveTo(visible[0]?.node.id);
        break;
      case "End":
        moveTo(visible.at(-1)?.node.id);
        break;
      case "ArrowRight":
        if (!hasChildren) break;
        if (isOpen) moveTo(visible[position + 1]?.node.id);
        else setOpen(node.id, true);
        break;
      case "ArrowLeft":
        if (hasChildren && isOpen) setOpen(node.id, false);
        else moveTo(row.parent);
        break;
      case "Enter":
      case " ":
        select(node.id);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div data-slot="tree-view" role="tree" {...props} {...stylex.props(styles.root, style)}>
      {visible.map((row, position) => {
        const { node } = row;
        const hasChildren = Boolean(node.children?.length);
        const isOpen = openSet.has(node.id);

        return (
          <div
            key={node.id}
            ref={(element) => {
              if (element) rows.current.set(node.id, element);
              else rows.current.delete(node.id);
            }}
            role="treeitem"
            data-slot="tree-view-item"
            aria-level={row.level}
            aria-posinset={row.index + 1}
            aria-setsize={row.size}
            aria-expanded={hasChildren ? isOpen : undefined}
            aria-selected={node.id === selectedId}
            tabIndex={node.id === tabId ? 0 : -1}
            onFocus={() => setFocusId(node.id)}
            onClick={() => {
              select(node.id);
              if (hasChildren) setOpen(node.id, !isOpen);
            }}
            onKeyDown={(event) => onKeyDown(event, position)}
            {...stylex.props(
              styles.row,
              styles.indent(row.level),
              node.id === selectedId && styles.selected,
            )}
          >
            <span aria-hidden {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}>
              {hasChildren ? <ChevronRightIcon /> : null}
            </span>
            {node.icon}
            {node.label}
          </div>
        );
      })}
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  row: {
    borderRadius: radius.md,
    gap: spacing["1.5"],
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.ring}`,
    },
    paddingBlock: spacing["1"],
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "default",
    display: "flex",
    outlineOffset: -2,
    paddingInlineEnd: spacing["2"],
    userSelect: "none",
  },
  indent: (level: number) => ({
    paddingInlineStart: `calc(${spacing["1.5"]} + ${level - 1} * ${spacing["4"]})`,
  }),
  selected: {
    backgroundColor: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
  chevron: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    transform: "rotate(0deg)",
    transitionDuration: { default: "150ms", [media.reducedMotion]: "0s" },
    transitionProperty: "transform",
    height: "1rem",
    width: "1rem",
  },
  chevronOpen: {
    transform: "rotate(90deg)",
  },
});
