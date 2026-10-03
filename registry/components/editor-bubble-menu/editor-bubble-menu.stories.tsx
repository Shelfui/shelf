import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Editor from "../editor/editor";
import { EditorBubbleMenu } from "./editor-bubble-menu";

const meta = preview.meta({
  title: "Components/Editor/Bubble menu",
  component: EditorBubbleMenu,
  parameters: { layout: "padded", a11y: { context: "body" } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem", paddingTop: "4rem" }}>
        <Story />
      </div>
    ),
  ],
});

function Document() {
  return (
    <Editor.Root
      aria-label="Document"
      defaultValue="<p>Select any word to format it.</p><p>A second paragraph.</p>"
    >
      <Editor.Content />
      <EditorBubbleMenu />
    </Editor.Root>
  );
}

/** Selecting text shows the toolbar; its controls change the selection. */
export const Default = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });
    await expect(screen.queryByRole("toolbar", { name: "Formatting" })).toBeNull();

    await userEvent.dblClick(editor.querySelector("p")!.firstChild!.parentElement!);
    const toolbar = await screen.findByRole("toolbar", { name: "Formatting" });
    await waitFor(() => expect(toolbar).toBeVisible());

    await userEvent.click(screen.getByRole("button", { name: "Bold" }));

    await expect(editor.querySelector("strong")).toBeInTheDocument();
    await expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
});

/** The first control turns the current block into another kind. */
export const TurnInto = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.dblClick(editor.querySelector("p")!);
    await userEvent.click(await screen.findByRole("button", { name: /Turn into, Text/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Heading 2" }));

    await waitFor(() => expect(editor.querySelector("h2")).toHaveTextContent("Select any word"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
});

/** The link control opens a form; Enter applies the address. */
export const Link = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.dblClick(editor.querySelector("p")!);
    await userEvent.click(await screen.findByRole("button", { name: "Link" }));
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Link address" }),
      "example.com{Enter}",
    );

    await waitFor(() =>
      expect(editor.querySelector("a")).toHaveAttribute(
        "href",
        expect.stringContaining("example.com"),
      ),
    );
  },
});
