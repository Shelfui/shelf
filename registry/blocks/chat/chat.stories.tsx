import { useEffect, useRef, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
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
    await expect(canvas.getByRole("button", { name: "Send message" })).toBeDisabled();
  },
});
