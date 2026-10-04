import { expect, screen, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Editor from "../editor/editor";
import { EditorSlashMenu } from "../editor-slash-menu/editor-slash-menu";
import { EditorBlockHandle } from "./editor-block-handle";

const meta = preview.meta({
  title: "Components/Editor/Block handle",
  component: EditorBlockHandle,
  parameters: { layout: "padded", a11y: { context: "body" } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem", paddingLeft: "4rem" }}>
        <Story />
      </div>
    ),
  ],
});

function Document() {
  return (
    <Editor.Root
      aria-label="Document"
      defaultValue="<h2>Plan</h2><p>First paragraph.</p><p>Second paragraph.</p>"
    >
      <Editor.Content />
      <EditorBlockHandle />
      <EditorSlashMenu />
    </Editor.Root>
  );
}

async function openMenuFor(paragraph: Element) {
  // The handle follows the pointer's coordinates, so say where the pointer is.
  const rect = paragraph.getBoundingClientRect();
  await userEvent.pointer({
    target: paragraph,
    coords: { clientX: rect.left + 20, clientY: rect.top + rect.height / 2 },
  });
  await userEvent.click(await screen.findByRole("button", { name: "Block options" }));
}

/** Hovering a block shows its handle; the menu can duplicate the block. */
export const Duplicate = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await openMenuFor(editor.querySelectorAll("p")[0]!);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));

    await waitFor(() => expect(editor.querySelectorAll("p")).toHaveLength(3));
    await expect(editor.querySelectorAll("p")[1]).toHaveTextContent("First paragraph.");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
});

/** Delete removes only the block beside the handle. */
export const Delete = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await openMenuFor(editor.querySelectorAll("p")[1]!);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));

    await waitFor(() => expect(editor.querySelectorAll("p")).toHaveLength(1));
    await expect(editor).not.toHaveTextContent("Second paragraph.");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
});

/** Turn into changes the block's kind in place. */
export const TurnInto = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await openMenuFor(editor.querySelectorAll("p")[0]!);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Turn into" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Quote" }));

    await waitFor(() =>
      expect(editor.querySelector("blockquote")).toHaveTextContent("First paragraph."),
    );
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
});

const texts = (editor: HTMLElement) => [...editor.querySelectorAll("p")].map((p) => p.textContent);

/** Move up and down swap the block with its neighbour; the ends are disabled. */
export const Move = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await openMenuFor(editor.querySelectorAll("p")[1]!);
    await userEvent.click(await screen.findByRole("menuitem", { name: /Move up/ }));
    await waitFor(() => expect(texts(editor)).toEqual(["Second paragraph.", "First paragraph."]));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());

    // The heading is first. Moving it up does nothing; moving it down swaps it with the paragraph.
    // The keyboard shortcut is used here: it does not depend on where the pointer is.
    const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? "Meta" : "Control";
    await userEvent.click(editor.querySelector("h2")!);
    await userEvent.keyboard(`{${mod}>}{Shift>}{ArrowUp}{/Shift}{/${mod}}`);
    await expect(editor.children[0]!.tagName).toBe("H2");
    await userEvent.keyboard(`{${mod}>}{Shift>}{ArrowDown}{/Shift}{/${mod}}`);
    await waitFor(() => expect(editor.children[0]!.tagName).toBe("P"));
  },
});

/** Mod-Shift-Up and Mod-Shift-Down move the block that holds the cursor, no pointer needed. */
export const KeyboardMove = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor.querySelectorAll("p")[1]!);
    const mod = navigator.platform.includes("Mac") ? "Meta" : "Control";
    await userEvent.keyboard(`{${mod}>}{Shift>}{ArrowUp}{/Shift}{/${mod}}`);

    await waitFor(() => expect(texts(editor)).toEqual(["Second paragraph.", "First paragraph."]));
    await expect(editor).toHaveFocus();
  },
});

/** The plus button adds an empty block below and opens the slash menu in it. */
export const AddBelow = meta.story({
  render: () => <Document />,
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    const first = editor.querySelectorAll("p")[0]!;
    const rect = first.getBoundingClientRect();
    await userEvent.pointer({
      target: first,
      coords: { clientX: rect.left + 20, clientY: rect.top + rect.height / 2 },
    });
    await userEvent.click(await screen.findByRole("button", { name: "Add block below" }));

    await expect(await screen.findByRole("listbox", { name: "Insert block" })).toBeVisible();
    await expect(texts(editor)).toEqual(["First paragraph.", "/", "Second paragraph."]);

    await userEvent.keyboard("quote{Enter}");

    await waitFor(() => expect(editor.querySelector("blockquote")).toBeInTheDocument());
    await expect(editor).toHaveFocus();
  },
});

/** In a list the handle belongs to one item, and Add below adds an item, not a paragraph. */
export const ListItems = meta.story({
  render: () => (
    <Editor.Root
      aria-label="Document"
      defaultValue="<ul><li><p>One</p></li><li><p>Two</p></li></ul>"
    >
      <Editor.Content />
      <EditorBlockHandle />
    </Editor.Root>
  ),
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    const first = editor.querySelectorAll("li")[0]!;
    const rect = first.getBoundingClientRect();
    await userEvent.pointer({
      target: first,
      coords: { clientX: rect.left + 30, clientY: rect.top + rect.height / 2 },
    });
    await userEvent.click(await screen.findByRole("button", { name: "Add block below" }));

    await waitFor(() => expect(editor.querySelectorAll("li")).toHaveLength(3));
    await expect(editor.querySelectorAll("ul")).toHaveLength(1);
  },
});
