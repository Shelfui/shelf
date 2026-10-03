"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/blocks/chat";
import type { ChatMessage, ChatStatus } from "@/components/ui/message-types";

const REPLY = `Here is a short answer.

- It **streams** one block at a time
- Settled blocks never re-render

\`\`\`ts
export const answer = 42;
\`\`\`

Done.`;

export default function ChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <Chat
      messages={messages}
      status={status}
      onStop={() => {
        clearInterval(timer.current);
        setStatus("ready");
      }}
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
          length = Math.min(REPLY.length, length + 8);
          setStatus(length < REPLY.length ? "streaming" : "ready");
          setMessages((m) =>
            m.map((message) =>
              message.id === `a${id}`
                ? { ...message, parts: [{ type: "text", text: REPLY.slice(0, length) }] }
                : message,
            ),
          );
          if (length >= REPLY.length) clearInterval(timer.current);
        }, 40);
      }}
    />
  );
}
