import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Editor from "../editor/editor";
import { EditorSlashMenu } from "./editor-slash-menu";

const meta = preview.meta({
  title: "Components/Editor/Slash menu",
  component: EditorSlashMenu,
  parameters: { layout: "padded", a11y: { context: "body" } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem", minHeight: "26rem" }}>
        <Story />
      </div>
    ),
  ],
});

function Document() {
  return (
    <Editor.Root aria-label="Document" placeholder="Write, or press / for commands">
      <Editor.Content />
      <EditorSlashMenu />
    </Editor.Root>
  );
}

/** Typing `/` opens the menu; typing filters; Enter turns the line into the highlighted block. */
export const Default = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("/");
    const menu = await screen.findByRole("listbox", { name: "Insert block" });

    await expect(editor).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();

    await userEvent.keyboard("head");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));

    await userEvent.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(editor.innerHTML).toContain("<h2"));
    await userEvent.keyboard("Notes");
    await expect(editor.querySelector("h2")).toHaveTextContent("Notes");
    await expect(screen.queryByRole("listbox")).toBeNull();
    await expect(editor).not.toHaveAttribute("aria-expanded");
  },
});

/** A query with no match says so, and Escape closes the menu without changing the document. */
export const NoResults = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("/zzz");

    await expect(await screen.findByText("No results")).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await expect(editor).toHaveTextContent("/zzz");
  },
});

/** Options can be picked with the pointer too, without moving focus out of the document. */
export const Pointer = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("/");
    await userEvent.click(await screen.findByRole("option", { name: /To-do list/ }));

    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Done" })).toBeInTheDocument());
    await expect(editor).toHaveFocus();
  },
});
