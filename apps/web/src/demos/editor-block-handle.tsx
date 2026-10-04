"use client";

import * as Editor from "@/components/ui/editor";
import { EditorBlockHandle } from "@/components/ui/editor-block-handle";
import { EditorSlashMenu } from "@/components/ui/editor-slash-menu";

export default function EditorBlockHandleDemo() {
  return (
    <div style={{ minHeight: 220 }}>
      <Editor.Root
        aria-label="Document"
        defaultValue="<h2>Plan</h2><p>First paragraph.</p><p>Second paragraph.</p>"
      >
        <Editor.Content />
        <EditorBlockHandle />
        <EditorSlashMenu />
      </Editor.Root>
    </div>
  );
}
