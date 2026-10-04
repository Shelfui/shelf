import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Editor from "../editor/editor";
import { EditorSuggestion, type SuggestionItem } from "./editor-suggestion";

const meta = preview.meta({
  title: "Components/Editor/Suggestion",
  component: EditorSuggestion,
  parameters: { layout: "padded", a11y: { context: "body" } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem", minHeight: "16rem" }}>
        <Story />
      </div>
    ),
  ],
});

const PEOPLE: SuggestionItem[] = [
  { id: "ada", label: "Ada Lovelace", description: "Engineering" },
  { id: "grace", label: "Grace Hopper", description: "Compilers" },
  { id: "alan", label: "Alan Turing", description: "Research" },
];

const find = (query: string) =>
  PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()));

function Menu({ slow = false }: { slow?: boolean }) {
  const editor = Editor.useEditorInstance();
  return (
    <EditorSuggestion
      editor={editor}
      name="mention"
      char="@"
      aria-label="People"
      items={async (query) => {
        // The empty query is slow, to prove an old answer cannot replace a newer one.
        if (slow && query === "") await new Promise((resolve) => setTimeout(resolve, 300));
        return find(query);
      }}
      onSelect={(person, { editor: current, range }) =>
        current.chain().focus().insertContentAt(range, `@${person.label} `).run()
      }
    />
  );
}

function Document({ slow }: { slow?: boolean }) {
  return (
    <Editor.Root aria-label="Document">
      <Editor.Content />
      <Menu slow={slow} />
    </Editor.Root>
  );
}

/** The trigger opens the list, typing filters it, and Enter replaces the trigger with the pick. */
export const Default = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("Hi @gra");
    const list = await screen.findByRole("listbox", { name: "People" });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    await expect(list).toBeVisible();
    await expect(editor).toHaveAttribute("aria-controls", list.id);

    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(editor).toHaveTextContent("Hi @Grace Hopper"));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  },
});

/** Escape closes the menu and leaves the typed text alone; focus stays in the document. */
export const Escape = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("@a");
    await screen.findByRole("listbox", { name: "People" });
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(editor).toHaveFocus();
    await expect(editor).toHaveTextContent("@a");
  },
});

/** A slow answer for an earlier query never replaces the answer for what was typed since. */
export const SlowAnswerIsDropped = meta.story({
  render: () => <Document slow />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("@tur");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(screen.getAllByRole("option")).toHaveLength(1);
    await expect(screen.getByRole("option")).toHaveTextContent("Alan Turing");
  },
});
