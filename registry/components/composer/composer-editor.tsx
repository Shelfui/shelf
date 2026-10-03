"use client";

import type { Editor, Extensions } from "@tiptap/core";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";
import { colors } from "../../foundations/tokens.stylex";
import type { InputHandle } from "./composer";

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
  onTextChange: (text: string) => void;
  /** Enter on its own. Return `true` if it submitted. */
  onEnter: () => boolean;
  onFiles: (files: File[]) => void;
  onHandle: (handle: InputHandle | null) => void;
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

const textOf = (editor: Editor) => editor.getText({ blockSeparator: "\n" });

export default function ComposerEditor({
  initialText,
  placeholder,
  label,
  disabled,
  autoFocus,
  extensions,
  className,
  onTextChange,
  onEnter,
  onFiles,
  onHandle,
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
      handleKeyDown: (view, event) => {
        if (event.key !== "Enter" || event.shiftKey || view.composing || event.isComposing) {
          return false;
        }
        // Another plugin, such as an open mention menu, may have claimed Enter first.
        return event.defaultPrevented ? false : onEnter();
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.length === 0) return false;
        onFiles(files);
        return true;
      },
    },
    onUpdate: ({ editor: updated }) => onTextChange(textOf(updated)),
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

  return <EditorContent editor={editor} data-slot="composer-input" />;
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
});
