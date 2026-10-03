"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import * as Composer from "@/components/ui/composer";
import { RetryIcon } from "@/components/ui/icons";
import { Markdown } from "@/components/ui/markdown";
import * as Message from "@/components/ui/message";
import { Shimmer } from "@/components/ui/shimmer";
import * as Thread from "@/components/ui/thread";

export interface ChatProps extends Styled<Omit<ComponentProps<"div">, "onSubmit">> {
  messages: readonly Message.ChatMessage[];
  status: Message.ChatStatus;
  onSubmit: (submission: Composer.Submission) => void;
  onStop?: () => void;
  /** Shown above the composer when `status` is `error`. */
  error?: string;
  onRetry?: () => void;
  placeholder?: string;
}

/**
 * A complete chat: the conversation, the message box under it, and the states between them.
 * Copy it and take out what you do not need; every part is a Shelf component you can use alone.
 *
 * `messages`, `status`, `onSubmit`, and `onStop` line up with the AI SDK's `useChat`, but
 * nothing here imports it.
 */
export function Chat({
  messages,
  status,
  onSubmit,
  onStop,
  error,
  onRetry,
  placeholder = "Ask anything",
  style,
  ...props
}: ChatProps) {
  const last = messages.at(-1);
  const waiting = status === "submitted" && last?.role === "user";

  return (
    <div data-slot="chat" {...props} {...stylex.props(styles.root, style)}>
      <Thread.Root status={status}>
        <Thread.Viewport>
          <Thread.Content>
            {messages.map((message) => (
              <ChatMessageView
                key={message.id}
                message={message}
                streaming={status === "streaming" && message === last}
              />
            ))}
            {waiting ? <Shimmer>Thinking</Shimmer> : null}
          </Thread.Content>
        </Thread.Viewport>
        <Thread.ScrollToLatest />
      </Thread.Root>
      <div {...stylex.props(styles.footer)}>
        {status === "error" ? (
          <div role="alert" {...stylex.props(styles.error)}>
            {error ?? "Something went wrong."}
            {onRetry ? (
              <button type="button" onClick={onRetry} {...stylex.props(styles.retry)}>
                <RetryIcon /> Retry
              </button>
            ) : null}
          </div>
        ) : null}
        <Composer.Root status={status} onSubmit={onSubmit} onStop={onStop}>
          <Composer.Files />
          <Composer.Input placeholder={placeholder} />
          <Composer.Footer>
            <Composer.Attach />
            <Composer.Submit />
          </Composer.Footer>
        </Composer.Root>
      </div>
    </div>
  );
}

function ChatMessageView({
  message,
  streaming,
}: {
  message: Message.ChatMessage;
  streaming: boolean;
}) {
  const text = Message.textOf(message);
  return (
    <Message.Root from={message.role}>
      <Message.Content>
        {message.role === "user" ? (
          text
        ) : (
          <MessageParts parts={message.parts} streaming={streaming} />
        )}
      </Message.Content>
      {message.role === "assistant" && !streaming && text ? (
        <Message.Actions>
          <Message.CopyAction text={text} />
        </Message.Actions>
      ) : null}
    </Message.Root>
  );
}

/** Renders a message's parts. Add a case here for each part type your app shows. */
export function MessageParts({
  parts,
  streaming = false,
}: {
  parts: readonly Message.ChatPart[];
  streaming?: boolean;
}) {
  const lastText = parts.findLastIndex((part) => part.type === "text");
  return parts.map((part, index) => {
    if (part.type !== "text") return null;
    return (
      // Parts only append, so the position is their identity.
      // oxlint-disable-next-line react/no-array-index-key
      // react-doctor-disable-next-line react-doctor/no-array-index-as-key
      <Markdown key={index} streaming={streaming && index === lastText}>
        {part.text}
      </Markdown>
    );
  });
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
  },
  footer: {
    gap: spacing["2"],
    marginInline: "auto",
    paddingInline: spacing["4"],
    display: "flex",
    flexDirection: "column",
    paddingBlockEnd: spacing["4"],
    maxWidth: "48rem",
    width: "100%",
  },
  error: {
    gap: spacing["2"],
    alignItems: "center",
    color: colors.destructiveText,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  retry: {
    background: "none",
    font: "inherit",
    borderStyle: "none",
    borderWidth: 0,
    gap: spacing["1"],
    textDecoration: "underline",
    alignItems: "center",
    color: "inherit",
    cursor: "pointer",
    display: "inline-flex",
  },
});
