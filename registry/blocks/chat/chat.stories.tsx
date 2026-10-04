import { useEffect, useRef, useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import type { ChatMessage, ChatStatus } from "../../components/message/message-types";
import { Chat } from "./chat";

const meta = preview.meta({
  title: "Blocks/Chat",
  component: Chat,
  parameters: { layout: "fullscreen" },
});

const REPLY = `Here is a short answer.

- It **streams** one block at a time
- Settled blocks never re-render

\`\`\`ts
export const answer = 42;
\`\`\`

Done.`;

/** A scripted stream, so the story is the same every run. */
function Scripted() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const stop = () => {
    clearInterval(timer.current);
    setStatus("ready");
  };

  return (
    <div style={{ height: "100vh" }}>
      <Chat
        messages={messages}
        status={status}
        onStop={stop}
        onSubmit={({ text }) => {
          const id = String(messages.length);
          setMessages((m) => [
            ...m,
            { id: `u${id}`, role: "user", parts: [{ type: "text", text }] },
            { id: `a${id}`, role: "assistant", parts: [{ type: "text", text: "" }] },
          ]);
          setStatus("submitted");
          let length = 0;
          timer.current = setInterval(() => {
            length = Math.min(REPLY.length, length + 12);
            setStatus(length < REPLY.length ? "streaming" : "ready");
            setMessages((m) =>
              m.map((message) =>
                message.id === `a${id}`
                  ? { ...message, parts: [{ type: "text", text: REPLY.slice(0, length) }] }
                  : message,
              ),
            );
            if (length >= REPLY.length) clearInterval(timer.current);
          }, 30);
        }}
      />
    </div>
  );
}

export const Default = meta.story({
  args: { messages: [], status: "ready", onSubmit: () => {} },
  render: () => <Scripted />,
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(input, "Tell me something");
    await userEvent.keyboard("{Enter}");
    await expect(await canvas.findByRole("article", { name: "You" })).toHaveTextContent(
      "Tell me something",
    );
    await waitFor(() => expect(canvas.getByText("Done.")).toBeVisible(), { timeout: 10_000 });
    // Sending put the message near the top of the conversation, with the reply beneath it.
    const viewport = canvas
      .getByRole("region", { name: "Conversation" })
      .querySelector("[data-slot=thread-viewport]")!;
    const gap =
      canvas.getByRole("article", { name: "You" }).getBoundingClientRect().top -
      viewport.getBoundingClientRect().top;
    await expect(gap).toBeLessThan(80);
    await expect(canvas.getByRole("button", { name: "Send message" })).toBeDisabled();
  },
});

const withParts: ChatMessage[] = [
  {
    id: "u1",
    role: "user",
    parts: [{ type: "text", text: "Delete report.pdf and tell me the weather" }],
  },
  {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "Two things to do; deleting needs approval.", state: "done" },
      {
        type: "tool-getWeather",
        toolCallId: "t1",
        state: "output-available",
        input: { city: "Stockholm" },
        output: { tempC: 7 },
      },
      {
        type: "tool-deleteFile",
        toolCallId: "t2",
        state: "approval-requested",
        input: { path: "report.pdf" },
        approval: { id: "ap1" },
      },
      { type: "text", text: "It is **7 degrees** in Stockholm. Waiting on you for the delete." },
      {
        type: "source-url",
        sourceId: "s1",
        url: "https://example.com/weather",
        title: "Weather service",
      },
    ],
  },
];

/** Reasoning, tool calls, an approval request, and sources render from message parts. */
export const WithParts = meta.story({
  args: { messages: withParts, status: "ready", onSubmit: () => {}, onToolApproval: fn() },
  render: (args) => (
    <div style={{ height: "100vh" }}>
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("button", { name: /Thought/ })).toBeVisible();
    await expect(canvas.getByText("getWeather")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }));
    await expect(args.onToolApproval).toHaveBeenCalledWith("ap1", true);
    await expect(canvas.getByRole("button", { name: "Used 1 source" })).toBeVisible();
  },
});

const exchange: ChatMessage[] = [
  { id: "u1", role: "user", parts: [{ type: "text", text: "Name a color" }] },
  { id: "a1", role: "assistant", parts: [{ type: "text", text: "Teal." }] },
];

/** The last reply can be regenerated; the button is hidden while a reply is arriving. */
export const Regenerate = meta.story({
  args: { messages: exchange, status: "ready", onSubmit: () => {}, onRegenerate: fn() },
  render: (args) => (
    <div style={{ height: "100vh" }}>
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Regenerate" }));
    await expect(args.onRegenerate).toHaveBeenCalledOnce();
  },
});

/** Editing the last message you sent: Save sends the new text, Escape leaves it as it was. */
export const EditLastMessage = meta.story({
  args: { messages: exchange, status: "ready", onSubmit: () => {}, onEdit: fn() },
  render: (args) => (
    <div style={{ height: "100vh" }}>
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvas, args }) => {
    const edit = canvas.getByRole("button", { name: "Edit" });
    await userEvent.click(edit);
    const box = await canvas.findByRole("textbox", { name: "Edit message" });
    await expect(box).toHaveTextContent("Name a color");

    // Escape puts the message back and returns focus to the button.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus());
    await expect(canvas.queryByRole("textbox", { name: "Edit message" })).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    const again = await canvas.findByRole("textbox", { name: "Edit message" });
    await userEvent.type(again, " and a shape");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(args.onEdit).toHaveBeenCalledWith("u1", "Name a color and a shape");
  },
});

/** Nothing can be edited or regenerated while a reply is on its way. */
export const NoActionsWhileStreaming = meta.story({
  args: {
    messages: exchange,
    status: "streaming",
    onSubmit: () => {},
    onRegenerate: fn(),
    onEdit: fn(),
  },
  render: (args) => (
    <div style={{ height: "100vh" }}>
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: "Regenerate" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Edit" })).toBeNull();
  },
});
