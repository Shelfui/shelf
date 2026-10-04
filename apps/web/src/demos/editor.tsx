"use client";

import * as Editor from "@/components/ui/editor";

export default function EditorDemo() {
  return (
    <div style={{ width: "min(100%, 36rem)", minHeight: 160 }}>
      <Editor.Root
        aria-label="Document"
        defaultValue="<h2>Notes</h2><p>A block editor with headings, lists, quotes, code, and links.</p><ul><li>Plain HTML in, normal Tiptap underneath</li></ul>"
      >
        <Editor.Content />
      </Editor.Root>
    </div>
  );
}
