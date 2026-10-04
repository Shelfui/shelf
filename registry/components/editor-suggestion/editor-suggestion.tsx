"use client";

import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { Editor, Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion, type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { layers } from "../../foundations/conditions.stylex";
import { colors, elevation, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";

/** What a suggestion needs: an identity and a name. Add whatever else your `onSelect` uses. */
export interface SuggestionItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface EditorSuggestionProps<T extends SuggestionItem> extends Styled<{
  "aria-label"?: string;
}> {
  /** The Tiptap editor to attach to. */
  editor: Editor;
  /** The character that opens the menu, such as `@`, `/`, or `#`. */
  char: string;
  /** Unique per menu, so several can live in one editor. */
  name: string;
  /**
   * The choices for what has been typed after `char`. May be async, such as a search request;
   * when the person types on, the earlier request's `signal` aborts and its answer is dropped.
   */
  items: (query: string, signal: AbortSignal) => readonly T[] | Promise<readonly T[]>;
  /** Called when one is chosen. `range` covers `char` and the query; replace or delete it. */
  onSelect: (item: T, context: { editor: Editor; range: Range }) => void;
  /** Allow the menu to open in the middle of a word. By default `char` must follow a space. */
  allowInWord?: boolean;
}

/**
 * A menu that opens when you type a trigger character in a Tiptap editor, such as `@` for
 * mentions or `/` for commands. Typing filters, arrows move, Enter or Tab chooses, Escape closes.
 * Focus stays in the document; the menu is a listbox the document points at with
 * `aria-activedescendant`.
 *
 *   <EditorSuggestion
 *     editor={editor}
 *     name="mention"
 *     char="@"
 *     items={(query) => people.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))}
 *     onSelect={(person, { editor, range }) => insertMention(editor, range, person)}
 *   />
 *
 * Several can share an editor; give each its own `name`.
 */
export function EditorSuggestion<T extends SuggestionItem>({
  editor,
  char,
  name,
  items,
  onSelect,
  allowInWord = false,
  "aria-label": label = "Suggestions",
  style,
}: EditorSuggestionProps<T>) {
  const listId = useId();
  const [open, setOpen] = useState<SuggestionProps<T, T> | null>(null);
  const [index, setIndex] = useState(0);
  // The plugin's callbacks run outside React, so they read the latest values from a ref.
  const latest = useRef({
    props: null as SuggestionProps<T, T> | null,
    index: 0,
    items,
    onSelect,
  });
  useEffect(() => {
    latest.current.items = items;
    latest.current.onSelect = onSelect;
  });
  const popup = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = new PluginKey(`shelf-suggestion-${name}`);
    const select = (next: number) => {
      latest.current.index = next;
      setIndex(next);
    };
    let pending: AbortController | undefined;
    let accepted: readonly T[] = [];

    editor.registerPlugin(
      Suggestion<T, T>({
        editor,
        pluginKey: key,
        char,
        allowSpaces: false,
        allowedPrefixes: allowInWord ? null : [" "],
        allow: ({ state, range }) => !state.doc.resolve(range.from).parent.type.spec.code,
        items: ({ query }) => {
          pending?.abort();
          const controller = new AbortController();
          pending = controller;
          const result = latest.current.items(query, controller.signal);
          if (!(result instanceof Promise)) {
            accepted = result;
            return [...result];
          }
          // A newer query aborts this one; its late answer must not replace the newer list.
          return result.then(
            (list) => {
              if (controller.signal.aborted) return [...accepted];
              accepted = list;
              return [...list];
            },
            () => [...accepted],
          );
        },
        command: ({ editor: current, range, props: item }) => {
          latest.current.onSelect(item, { editor: current, range });
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
              const item = props.items[current];
              if (item) props.command(item);
            } else return false;
            return true;
          },
          onExit: () => {
            pending?.abort();
            latest.current.props = null;
            setOpen(null);
          },
        }),
      }),
      // First in line, so Enter and Tab reach the menu before the document's own keymaps.
      (plugin, plugins) => [plugin, ...plugins],
    );
    return () => {
      pending?.abort();
      editor.unregisterPlugin(key);
    };
  }, [editor, char, name, allowInWord]);

  const choices = open?.items ?? [];
  const activeId = open && choices[index] ? `${listId}-${choices[index].id}` : undefined;

  // The document stays a textbox (it is multi-line); point it at the listbox and the highlighted
  // option. `aria-expanded` is not allowed on a textbox, so it is left off.
  useEffect(() => {
    const dom = editor.view.dom;
    if (!open) return undefined;
    dom.setAttribute("aria-controls", listId);
    if (activeId) dom.setAttribute("aria-activedescendant", activeId);
    return () => {
      for (const attribute of ["aria-controls", "aria-activedescendant"]) {
        dom.removeAttribute(attribute);
      }
    };
  }, [editor, open, listId, activeId]);

  // Place the menu under the trigger and keep it on screen.
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

  return createPortal(
    <div
      ref={popup}
      id={listId}
      role="listbox"
      aria-label={label}
      data-slot="editor-suggestion"
      // Pressing an option must not move focus out of the document.
      onMouseDown={(event) => event.preventDefault()}
      {...stylex.props(styles.popup, style)}
    >
      {choices.length === 0 ? (
        <div {...stylex.props(styles.empty)}>No results</div>
      ) : (
        choices.map((item, position) => (
          <div
            key={item.id}
            id={`${listId}-${item.id}`}
            role="option"
            aria-selected={position === index}
            data-slot="editor-suggestion-option"
            onMouseMove={() => {
              latest.current.index = position;
              setIndex(position);
            }}
            onClick={() => open.command(item)}
            {...stylex.props(styles.option, position === index && styles.selected)}
          >
            {item.icon ? <span {...stylex.props(styles.icon)}>{item.icon}</span> : null}
            <span {...stylex.props(styles.text)}>
              <span {...stylex.props(styles.title)}>{item.label}</span>
              {item.description ? (
                <span {...stylex.props(styles.description)}>{item.description}</span>
              ) : null}
            </span>
          </div>
        ))
      )}
    </div>,
    document.body,
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
    maxHeight: "16rem",
    overflowY: "auto",
    top: 0,
    width: "16rem",
  },
  empty: {
    padding: spacing["2"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  option: {
    borderRadius: radius.md,
    gap: spacing["2"],
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["2"],
    alignItems: "center",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
  },
  selected: { backgroundColor: colors.accent },
  icon: { alignItems: "center", display: "flex", flexShrink: 0 },
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
