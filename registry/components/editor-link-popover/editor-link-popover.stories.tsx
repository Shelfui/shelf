import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Editor from "../editor/editor";
import { EditorLinkPopover } from "./editor-link-popover";

const meta = preview.meta({
  title: "Components/Editor/Link popover",
  component: EditorLinkPopover,
  parameters: { layout: "padded", a11y: { context: "body" } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem" }}>
        <Story />
      </div>
    ),
  ],
});

function Document({ html }: { html: string }) {
  return (
    <Editor.Root aria-label="Document" defaultValue={html}>
      <EditorLinkPopover />
      <Editor.Content />
    </Editor.Root>
  );
}

/** With a word selected, the button opens a form; Enter makes the word a link. */
export const AddLink = meta.story({
  render: () => <Document html="<p>Read the docs today.</p>" />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.dblClick(editor.querySelector("p")!);
    await userEvent.click(canvas.getByRole("button", { name: "Link" }));
    const address = await screen.findByRole("textbox", { name: "Link address" });

    await userEvent.type(address, "example.com{Enter}");

    await waitFor(() =>
      expect(editor.querySelector("a")).toHaveAttribute("href", "https://example.com"),
    );
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "Link address" })).toBeNull());
  },
});

/** Inside a link the button shows as pressed, and an empty address removes the link. */
export const RemoveLink = meta.story({
  render: () => <Document html='<p>Read the <a href="https://example.com">docs</a> today.</p>' />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor.querySelector("a")!);
    const button = canvas.getByRole("button", { name: "Link" });
    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));

    await userEvent.click(button);
    const address = await screen.findByRole("textbox", { name: "Link address" });
    await expect(address).toHaveValue("https://example.com");
    await userEvent.clear(address);
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(editor.querySelector("a")).toBeNull());
  },
});
