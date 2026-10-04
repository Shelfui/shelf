"use client";

import * as Editor from "@/components/ui/editor";
import { EditorLinkPopover } from "@/components/ui/editor-link-popover";

export default function EditorLinkPopoverDemo() {
  return (
    <div style={{ width: "min(100%, 36rem)", minHeight: 140 }}>
      <Editor.Root aria-label="Document" defaultValue="<p>Read the docs today.</p>">
        <EditorLinkPopover />
        <Editor.Content />
      </Editor.Root>
    </div>
  );
}
