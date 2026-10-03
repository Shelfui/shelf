import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { EditorBlockHandle } from "../editor-block-handle/editor-block-handle";
import { EditorBubbleMenu } from "../editor-bubble-menu/editor-bubble-menu";
import { EditorSlashMenu } from "../editor-slash-menu/editor-slash-menu";
import * as Editor from "./editor";

const meta = preview.meta({
  title: "Components/Editor",
  component: Editor.Root,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "42rem" }}>
        <Story />
      </div>
    ),
  ],
});

const DOCUMENT = `
<h1>Launch plan</h1>
<p>We ship the <strong>editor</strong> next week. Read the <a href="https://example.com">brief</a> first, then <mark>review the open questions</mark>.</p>
<h2>Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Write the announcement</p></li>
  <li data-type="taskItem" data-checked="false"><p>Record a demo</p></li>
</ul>
<blockquote><p>Make it feel like a document, not a form.</p></blockquote>
<pre><code>bunx @shelfui/cli add editor</code></pre>
<hr>
<ol><li><p>Draft</p></li><li><p>Review</p></li></ol>
`;

/** Markdown shortcuts and keyboard formatting work as in any document editor. */
export const Default = meta.story({
  render: () => (
    <Editor.Root aria-label="Document" placeholder="Write, or press / for commands">
      <Editor.Content />
    </Editor.Root>
  ),
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await userEvent.click(editor);
    await userEvent.keyboard("# Title{Enter}Plain text, then **bold** more.{Enter}- one{Enter}two");

    await waitFor(() => expect(editor.querySelector("h1")).toHaveTextContent("Title"));
    await expect(editor.querySelector("strong")).toHaveTextContent("bold");
    await expect(editor.querySelectorAll("ul > li")).toHaveLength(2);
  },
});

/** Every block the editor ships with. */
export const Document = meta.story({
  render: () => (
    <Editor.Root aria-label="Document" defaultValue={DOCUMENT}>
      <Editor.Content />
    </Editor.Root>
  ),
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await expect(editor.querySelector("h1")).toHaveTextContent("Launch plan");
    await expect(editor.querySelector("a")).toHaveAttribute("href", "https://example.com");
    await expect(canvas.getAllByRole("checkbox", { name: "Done" })).toHaveLength(2);
  },
});

/** The editor with every menu: select text, type `/`, or hover a block. */
export const Notion = meta.story({
  decorators: [
    (Story) => (
      <div style={{ paddingLeft: "3.5rem" }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Editor.Root
      aria-label="Document"
      defaultValue={DOCUMENT}
      placeholder="Write, or press / for commands"
    >
      <Editor.Content />
      <EditorBubbleMenu />
      <EditorSlashMenu />
      <EditorBlockHandle />
    </Editor.Root>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("textbox", { name: "Document" })).toBeVisible();
  },
});

/** A task item toggles from its checkbox. */
export const Tasks = meta.story({
  render: () => (
    <Editor.Root aria-label="Tasks" defaultValue={DOCUMENT}>
      <Editor.Content />
    </Editor.Root>
  ),
  play: async ({ canvas }) => {
    const [done, todo] = await canvas.findAllByRole("checkbox", { name: "Done" });

    await expect(done).toBeChecked();
    await expect(todo).not.toBeChecked();

    await userEvent.click(todo!);

    await waitFor(() => expect(todo).toBeChecked());
  },
});

/** Not editable: the content reads like a page and takes no input. */
export const ReadOnly = meta.story({
  render: () => (
    <Editor.Root aria-label="Document" defaultValue={DOCUMENT} editable={false}>
      <Editor.Content />
    </Editor.Root>
  ),
  play: async ({ canvas }) => {
    const editor = await canvas.findByRole("textbox", { name: "Document" });

    await expect(editor).toHaveAttribute("contenteditable", "false");
  },
});
