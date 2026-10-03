"use client";

import { PluginKey } from "@tiptap/pm/state";
import { Suggestion, type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { layers } from "../../foundations/conditions.stylex";
import { colors, elevation, radius, spacing, typography } from "../../foundations/tokens.stylex";
import { BLOCKS, type Block } from "../editor/blocks";
import { useEditorInstance } from "../editor/editor";
import type { Styled } from "../../lib/utils";

export interface EditorSlashMenuProps extends Styled<{ "aria-label"?: string }> {
  /** What the menu offers. Defaults to every block in `editor/blocks.ts`. */
  blocks?: Block[];
}

const GROUPS: Block["group"][] = ["Basic", "Lists", "Media"];

const words = (block: Block) => [block.label, ...block.keywords].map((word) => word.toLowerCase());

function search(blocks: Block[], query: string): Block[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") {
    return GROUPS.flatMap((group) => blocks.filter((block) => block.group === group));
  }
  const starts = blocks.filter((block) => words(block).some((word) => word.startsWith(needle)));
  const startSet = new Set(starts);
  const contains = blocks.filter(
    (block) => !startSet.has(block) && words(block).some((word) => word.includes(needle)),
  );
  return [...starts, ...contains];
}

/**
 * The menu that opens when you type `/` in a block. Typing filters it, the arrow keys move,
 * Enter inserts, and Escape closes. Put it inside `Editor.Root`:
 *
 *   <Editor.Root>
 *     <Editor.Content />
 *     <EditorSlashMenu />
 *   </Editor.Root>
 *
 * Focus stays in the document the whole time; the menu is a listbox the document points at
 * with `aria-activedescendant`.
 */
export function EditorSlashMenu({
  blocks = BLOCKS,
  "aria-label": label = "Insert block",
  style,
}: EditorSlashMenuProps) {
  const editor = useEditorInstance();
  const listId = useId();
  const [open, setOpen] = useState<SuggestionProps<Block, Block> | null>(null);
  const [index, setIndex] = useState(0);
  // The plugin's key handler runs outside React, so it reads the latest values from refs.
  const latest = useRef({ props: null as SuggestionProps<Block, Block> | null, index: 0 });
  const popup = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = new PluginKey("shelf-slash-menu");
    const select = (next: number) => {
      latest.current.index = next;
      setIndex(next);
    };

    editor.registerPlugin(
      Suggestion<Block, Block>({
        editor,
        pluginKey: key,
        char: "/",
        allow: ({ state, range }) => !state.doc.resolve(range.from).parent.type.spec.code,
        items: ({ query }) => search(blocks, query),
        command: ({ editor: current, range, props: block }) => {
          block.apply(current.chain().focus().deleteRange(range)).run();
        },
        render: () => ({
          onStart: (props) => {
            latest.current.props = props;
            select(0);
            setOpen(props);
          },
          onUpdate: (props) => {
            latest.current.props = props;
            select(0);
            setOpen(props);
          },
          onKeyDown: ({ event }: SuggestionKeyDownProps) => {
            const { props, index: current } = latest.current;
            const count = props?.items.length ?? 0;
            if (!props || count === 0) return false;
            if (event.key === "ArrowDown") select((current + 1) % count);
            else if (event.key === "ArrowUp") select((current - 1 + count) % count);
            else if (event.key === "Enter" || event.key === "Tab") {
              const block = props.items[current];
              if (block) props.command(block);
            } else return false;
            return true;
          },
          onExit: () => {
            latest.current.props = null;
            setOpen(null);
          },
        }),
      }),
      // First in line, so Enter and Tab reach the menu before the document's own keymaps.
      (plugin, plugins) => [plugin, ...plugins],
    );
    return () => {
      editor.unregisterPlugin(key);
    };
  }, [editor, blocks]);

  const items = open?.items ?? [];
  const activeId = open && items[index] ? `${listId}-${items[index].id}` : undefined;

  // The document is the combobox: point it at the listbox and the highlighted option.
  useEffect(() => {
    const dom = editor.view.dom;
    if (!open) return undefined;
    dom.setAttribute("aria-controls", listId);
    dom.setAttribute("aria-expanded", "true");
    dom.setAttribute("aria-haspopup", "listbox");
    if (activeId) dom.setAttribute("aria-activedescendant", activeId);
    return () => {
      for (const name of [
        "aria-controls",
        "aria-expanded",
        "aria-haspopup",
        "aria-activedescendant",
      ]) {
        dom.removeAttribute(name);
      }
    };
  }, [editor, open, listId, activeId]);

  // Place the menu under the "/" and keep it on screen.
  useLayoutEffect(() => {
    const element = popup.current;
    const rect = open?.clientRect?.();
    if (!element || !rect) return;
    void computePosition({ getBoundingClientRect: () => rect }, element, {
      placement: "bottom-start",
      strategy: "fixed",
      middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      Object.assign(element.style, { left: `${x}px`, top: `${y}px`, visibility: "visible" });
    });
  }, [open]);

  useLayoutEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  if (!open) return null;

  const grouped = open.query.trim() === "";

  return createPortal(
    <div
      ref={popup}
      id={listId}
      role="listbox"
      aria-label={label}
      data-slot="editor-slash-menu"
      // Pressing an option must not move focus out of the document.
      onMouseDown={(event) => event.preventDefault()}
      {...stylex.props(styles.popup, style)}
    >
      {items.length === 0 ? (
        <div {...stylex.props(styles.empty)}>No results</div>
      ) : (
        items.map((block, position) => (
          <Fragment key={block.id}>
            {grouped && block.group !== items[position - 1]?.group ? (
              <div role="presentation" {...stylex.props(styles.heading)}>
                {block.group}
              </div>
            ) : null}
            <SlashOption
              id={`${listId}-${block.id}`}
              block={block}
              selected={position === index}
              onHover={() => {
                latest.current.index = position;
                setIndex(position);
              }}
              onPick={() => open.command(block)}
            />
          </Fragment>
        ))
      )}
    </div>,
    document.body,
  );
}

function SlashOption({
  id,
  block,
  selected,
  onHover,
  onPick,
}: {
  id: string;
  block: Block;
  selected: boolean;
  onHover: () => void;
  onPick: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      data-slot="editor-slash-option"
      onMouseMove={onHover}
      onClick={onPick}
      {...stylex.props(styles.option, selected && styles.selected)}
    >
      <span {...stylex.props(styles.tile)}>
        <block.icon />
      </span>
      <span {...stylex.props(styles.text)}>
        <span {...stylex.props(styles.title)}>{block.label}</span>
        <span {...stylex.props(styles.description)}>{block.description}</span>
      </span>
    </div>
  );
}

const styles = stylex.create({
  popup: {
    padding: spacing["1"],
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.popover,
    boxShadow: elevation.lg,
    boxSizing: "border-box",
    color: colors.popoverForeground,
    fontFamily: typography.fontFamily,
    position: "fixed",
    visibility: "hidden",
    zIndex: layers.popover,
    left: 0,
    maxHeight: "20rem",
    overflowY: "auto",
    top: 0,
    width: "18rem",
  },
  heading: {
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightXs,
  },
  empty: {
    padding: spacing["2"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  option: {
    borderRadius: radius.md,
    gap: spacing["2.5"],
    paddingBlock: spacing["1"],
    paddingInline: spacing["2"],
    alignItems: "center",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
  },
  selected: { backgroundColor: colors.accent },
  tile: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    display: "flex",
    flexShrink: 0,
    fontSize: "1.25rem",
    justifyContent: "center",
    height: "2.5rem",
    width: "2.5rem",
  },
  text: { display: "flex", flexDirection: "column", minWidth: 0 },
  title: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
  },
});
