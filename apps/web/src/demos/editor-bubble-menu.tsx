"use client";

import * as Editor from "@/components/ui/editor";
import { EditorBubbleMenu } from "@/components/ui/editor-bubble-menu";

export default function EditorBubbleMenuDemo() {
  return (
    <div style={{ width: "min(100%, 36rem)", minHeight: 200 }}>
      <Editor.Root
        aria-label="Document"
        defaultValue="<p>Select any word to format it.</p><p>A second paragraph.</p>"
      >
        <Editor.Content />
        <EditorBubbleMenu />
      </Editor.Root>
    </div>
  );
}
