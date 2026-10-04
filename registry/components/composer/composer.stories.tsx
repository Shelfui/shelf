import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Composer from "./composer";

const meta = preview.meta({
  title: "Components/Composer",
  component: Composer.Root,
  parameters: { layout: "padded" },
  args: { children: null, onSubmit: fn(), onStop: fn() },
});

const PEOPLE = [
  { id: "ada", label: "Ada Lovelace", description: "Engineering" },
  { id: "grace", label: "Grace Hopper", description: "Compilers" },
  { id: "alan", label: "Alan Turing", description: "Research" },
];

function Example({
  mentions = false,
  ...props
}: Omit<Composer.RootProps, "children"> & { mentions?: boolean }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <Composer.Root {...props}>
        <Composer.Files />
        <Composer.Input placeholder="Ask anything">
          {mentions ? (
            <Composer.Mention
              kind="user"
              items={(query) =>
                PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()))
              }
            />
          ) : null}
        </Composer.Input>
        <Composer.Footer>
          <Composer.Attach />
          <Composer.Submit />
        </Composer.Footer>
      </Composer.Root>
    </div>
  );
}

/** Enter sends and clears; Shift+Enter would add a line. Send is off while empty. */
export const Default = meta.story({
  render: ({ children: _children, ...args }) => <Example {...args} />,
  play: async ({ canvas, args }) => {
    const send = canvas.getByRole("button", { name: "Send message" });
    await expect(send).toBeDisabled();
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Hello there");
    await expect(send).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({ text: "Hello there", chips: [], files: [] }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Message" })).toHaveTextContent(""),
    );
  },
});

/** While a reply is on its way, send becomes stop, and Escape stops too. */
export const Busy = meta.story({
  args: { status: "streaming" },
  render: ({ children: _children, ...args }) => <Example {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Stop generating" }));
    await expect(args.onStop).toHaveBeenCalledTimes(1);
    await userEvent.type(canvas.getByRole("textbox", { name: "Message" }), "{Escape}");
    await expect(args.onStop).toHaveBeenCalledTimes(2);
  },
});

export const Disabled = meta.story({
  args: { disabled: true },
  render: ({ children: _children, ...args }) => <Example {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Message" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Attach files" })).toBeDisabled();
  },
});

function WithFiles(props: Omit<Composer.RootProps, "children">) {
  return <Example {...props} />;
}

/** Chosen files wait in the box with a remove button, and travel with the message. */
export const Attachments = meta.story({
  render: ({ children: _children, ...args }) => <WithFiles {...args} />,
  play: async ({ canvas, canvasElement, args }) => {
    const picker = canvasElement.querySelector<HTMLInputElement>("input[type=file]")!;
    const file = new File(["x"], "notes.txt", { type: "text/plain" });
    await userEvent.upload(picker, file);
    await expect(await canvas.findByRole("list", { name: "Attachments" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove notes.txt" }));
    await expect(canvas.queryByRole("list", { name: "Attachments" })).toBeNull();
    await userEvent.upload(picker, new File(["x"], "notes.txt", { type: "text/plain" }));
    await canvas.findByRole("list", { name: "Attachments" });
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        text: "",
        chips: [],
        files: [expect.objectContaining({ name: "notes.txt" })],
      }),
    );
  },
});

function MentionExample(props: Omit<Composer.RootProps, "children">) {
  const [sent, setSent] = useState<Composer.Submission>();
  return (
    <>
      <Example {...props} mentions onSubmit={setSent} />
      <p>{sent ? `${sent.text} | ${sent.chips.map((chip) => chip.id).join(",")}` : null}</p>
    </>
  );
}

/** Typing `@` opens the menu; choosing makes a chip, and the message carries it. */
export const Mentions = meta.story({
  render: ({ children: _children, ...args }) => <MentionExample {...args} />,
  play: async ({ canvas, canvasElement }) => {
    // Mentions need the editor, which loads on idle; wait for it.
    await waitFor(() => expect(canvasElement.querySelector(".ProseMirror")).not.toBeNull(), {
      timeout: 10_000,
    });
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.click(input);
    await userEvent.type(input, "Ping ");
    // The menu attaches a moment after the editor appears; type the trigger until it takes.
    await waitFor(
      async () => {
        await userEvent.keyboard("@");
        const menu = await within(document.body)
          .findByRole("listbox", {}, { timeout: 500 })
          .catch(() => null);
        if (!menu) await userEvent.keyboard("{Backspace}");
        await expect(menu).not.toBeNull();
      },
      { timeout: 10_000 },
    );
    await userEvent.keyboard("gra");
    const option = await within(document.body).findByRole("option", { name: /Grace Hopper/ });
    await userEvent.click(option);
    await userEvent.keyboard("{Enter}");
    await expect(await canvas.findByText("Ping @Grace Hopper | grace")).toBeVisible();
  },
});

/** Enter that confirms an IME candidate (Japanese, Chinese, Korean input) must not send. */
export const IgnoresEnterWhileComposing = meta.story({
  render: ({ children: _children, ...args }) => <Example {...args} />,
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "こんにちは");
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
});

/** The plain box becomes the rich editor once it loads, without losing what was typed. */
export const KeepsTextWhenEditorLoads = meta.story({
  render: ({ children: _children, ...args }) => <Example {...args} mentions />,
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Draft in progress");
    // Leave the box so the swap may happen; it never replaces a focused field.
    await userEvent.tab();
    await waitFor(() => expect(canvasElement.querySelector(".ProseMirror")).not.toBeNull(), {
      timeout: 10_000,
    });
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveTextContent(
      "Draft in progress",
    );
  },
});
