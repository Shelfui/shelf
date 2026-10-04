"use client";

import * as Editor from "@/components/ui/editor";
import { EditorSlashMenu } from "@/components/ui/editor-slash-menu";

export default function EditorSlashMenuDemo() {
  return (
    <div style={{ minHeight: 260 }}>
      <Editor.Root aria-label="Document" placeholder="Write, or press / for commands">
        <Editor.Content />
        <EditorSlashMenu />
      </Editor.Root>
    </div>
  );
}
