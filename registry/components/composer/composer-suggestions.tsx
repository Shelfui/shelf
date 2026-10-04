"use client";

// `items` and `onCommand` are plain callbacks that never use `this`; they are declared as methods
// so a menu of `Person` is accepted where a menu of any `SuggestionItem` is expected.
/* oxlint-disable typescript/unbound-method */

import { EditorSuggestion, type SuggestionItem } from "../editor-suggestion/editor-suggestion";
import { type CommandProps, type MentionProps, useComposerEditor } from "./composer";

/** Loaded on demand with the editor, so the menu code never ships with the first paint. */
export function Mention<T extends SuggestionItem>({
  items,
  char = "@",
  kind = "mention",
  "aria-label": label = "Mentions",
}: MentionProps<T>) {
  const editor = useComposerEditor();
  if (!editor) return null;
  return (
    <EditorSuggestion
      editor={editor}
      name={`mention-${char}-${kind}`}
      char={char}
      items={items}
      aria-label={label}
      onSelect={(item, { editor: current, range }) => {
        current
          .chain()
          .focus()
          .insertContentAt(range, [
            { type: "chip", attrs: { kind, id: item.id, label: item.label, trigger: char } },
            { type: "text", text: " " },
          ])
          .run();
      }}
    />
  );
}

export function Command<T extends SuggestionItem>({
  items,
  onCommand,
  char = "/",
  "aria-label": label = "Commands",
}: CommandProps<T>) {
  const editor = useComposerEditor();
  if (!editor) return null;
  return (
    <EditorSuggestion
      editor={editor}
      name={`command-${char}`}
      char={char}
      items={items}
      aria-label={label}
      onSelect={(item, { editor: current, range }) => {
        current.chain().focus().deleteRange(range).run();
        onCommand(item);
      }}
    />
  );
}
