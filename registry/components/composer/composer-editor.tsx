"use client";

import { type Editor, type Extensions, Extension, Node, mergeAttributes } from "@tiptap/core";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect } from "react";
import { colors, radius, spacing } from "../../foundations/tokens.stylex";
import { type Chip, EditorContext, type InputHandle } from "./composer";

/**
 * The rich input behind `Composer.Input`. It is a separate module so Tiptap and ProseMirror
 * load only when someone reaches for the input, never with the first paint.
 */
export interface ComposerEditorProps {
  /** Text to start with; the editor owns it afterwards. */
  initialText: string;
  placeholder: string;
  label: string;
  disabled: boolean;
  autoFocus: boolean;
  extensions: Extensions;
  className: string;
  onChange: (text: string, chips: Chip[]) => void;
  /** Enter on its own. */
  onEnter: () => void;
  onFiles: (files: File[]) => void;
  onHandle: (handle: InputHandle | null) => void;
  /** Mounted beside the editor with it in context, such as `Composer.Mention`. */
  children?: ReactNode;
}

const cls = (...list: stylex.StaticStyles[]) => stylex.props(...list).className ?? "";

const toDocument = (text: string) =>
  text
    ? {
        type: "doc",
        content: text
          .split("\n")
          .map((line) =>
            line
              ? { type: "paragraph", content: [{ type: "text", text: line }] }
              : { type: "paragraph" },
          ),
      }
    : undefined;

/** A mention, tag, or any inline reference: one atom in the text, with an identity. */
const ChipNode = Node.create({
  name: "chip",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      kind: { default: "mention" },
      id: { default: "" },
      label: { default: "" },
      trigger: { default: "@" },
    };
  },
  parseHTML: () => [{ tag: "span[data-chip]" }],
  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-chip": "",
        "data-kind": node.attrs.kind,
        "data-id": node.attrs.id,
        class: cls(styles.chip),
      }),
      `${node.attrs.trigger}${node.attrs.label}`,
    ];
  },
  renderText: ({ node }) => `${node.attrs.trigger}${node.attrs.label}`,
});

const chipsOf = (editor: Editor): Chip[] => {
  const chips: Chip[] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === "chip") {
      chips.push({ kind: node.attrs.kind, id: node.attrs.id, label: node.attrs.label });
    }
  });
  return chips;
};

export default function ComposerEditor({
  initialText,
  placeholder,
  label,
  disabled,
  autoFocus,
  extensions,
  className,
  onChange,
  onEnter,
  onFiles,
  onHandle,
  children,
}: ComposerEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    content: toDocument(initialText),
    editable: !disabled,
    autofocus: autoFocus ? "end" : false,
    extensions: [
      Document,
      Paragraph.configure({ HTMLAttributes: { class: cls(styles.paragraph) } }),
      Text,
      HardBreak,
      UndoRedo,
      ChipNode,
      // A keymap, not an editor prop, so a suggestion menu that is open gets Enter first.
      Extension.create({
        name: "submitOnEnter",
        addKeyboardShortcuts: () => ({
          Enter: ({ editor: current }) => {
            if (current.view.composing) return false;
            onEnter();
            return true;
          },
        }),
      }),
      Placeholder.configure({ placeholder, emptyNodeClass: cls(styles.empty) }),
      ...extensions,
    ],
    editorProps: {
      attributes: {
        class: className,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.length === 0) return false;
        onFiles(files);
        return true;
      },
    },
    onUpdate: ({ editor: updated }) =>
      onChange(updated.getText({ blockSeparator: "\n" }), chipsOf(updated)),
  });

  if (editor && editor.isEditable === disabled) editor.setEditable(!disabled);

  // Hand the root a way to clear and focus the editor.
  useEffect(() => {
    if (!editor) return undefined;
    onHandle({
      clear: () => editor.commands.clearContent(true),
      focus: () => editor.commands.focus("end"),
    });
    return () => onHandle(null);
  }, [editor, onHandle]);

  return (
    <EditorContext value={editor}>
      <EditorContent editor={editor} data-slot="composer-input" />
      {children}
    </EditorContext>
  );
}

const styles = stylex.create({
  paragraph: {
    margin: 0,
  },
  empty: {
    "::before": {
      color: colors.mutedForeground,
      content: "attr(data-placeholder)",
      float: "left",
      pointerEvents: "none",
      height: 0,
    },
  },
  chip: {
    borderRadius: radius.sm,
    paddingInline: spacing["1"],
    backgroundColor: colors.accent,
    color: colors.accentForeground,
  },
});
