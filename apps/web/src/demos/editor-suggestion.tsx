"use client";

import * as Editor from "@/components/ui/editor";
import { EditorSuggestion } from "@/components/ui/editor-suggestion";

const PEOPLE = [
  { id: "ada", label: "Ada Lovelace", description: "Engineering" },
  { id: "grace", label: "Grace Hopper", description: "Compilers" },
  { id: "alan", label: "Alan Turing", description: "Research" },
];

function Menu() {
  const editor = Editor.useEditorInstance();
  return (
    <EditorSuggestion
      editor={editor}
      name="mention"
      char="@"
      aria-label="People"
      items={(query) => PEOPLE.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))}
      onSelect={(person, { editor: current, range }) =>
        current.chain().focus().insertContentAt(range, `@${person.label} `).run()
      }
    />
  );
}

export default function EditorSuggestionDemo() {
  return (
    <div style={{ minHeight: 200 }}>
      <Editor.Root aria-label="Document" placeholder="Type @ to mention someone">
        <Editor.Content />
        <Menu />
      </Editor.Root>
    </div>
  );
}
