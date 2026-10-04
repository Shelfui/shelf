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

  /** Streams a scripted reply into a new assistant message after `history`. */
  const reply = (history: ChatMessage[]) => {
    const id = `a${history.length}`;
    setMessages([...history, { id, role: "assistant", parts: [{ type: "text", text: "" }] }]);
    setStatus("submitted");
    let length = 0;
    timer.current = setInterval(() => {
      length = Math.min(REPLY.length, length + 8);
      setStatus(length < REPLY.length ? "streaming" : "ready");
      setMessages((m) =>
        m.map((message) =>
          message.id === id
            ? { ...message, parts: [{ type: "text", text: REPLY.slice(0, length) }] }
            : message,
        ),
      );
      if (length >= REPLY.length) clearInterval(timer.current);
    }, 40);
  };

  return (
    // Chat fills its parent, so the parent is given the screen's height.
    <div style={{ height: "100dvh" }}>
      <Chat
        messages={messages}
        status={status}
        onStop={() => {
          clearInterval(timer.current);
          setStatus("ready");
        }}
        onSubmit={({ text }) =>
          reply([
            ...messages,
            { id: `u${messages.length}`, role: "user", parts: [{ type: "text", text }] },
          ])
        }
        onRegenerate={() => reply(messages.slice(0, -1))}
        onEdit={(messageId, text) => {
          const at = messages.findIndex((message) => message.id === messageId);
          reply([
            ...messages.slice(0, at),
            { id: messageId, role: "user", parts: [{ type: "text", text }] },
          ]);
        }}
      />
    </div>
  );
}
