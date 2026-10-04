"use client";

import * as stylex from "@stylexjs/stylex";
import {
  type ComponentProps,
  Fragment,
  memo,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import * as Composer from "@/components/ui/composer";
import { EditIcon, RetryIcon } from "@/components/ui/icons";
import { Approval } from "@/components/ui/approval";
import { Attachment } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import * as Reasoning from "@/components/ui/reasoning";
import { Sources } from "@/components/ui/sources";
import { Stream } from "@/components/ui/stream";
import { ToolCall } from "@/components/ui/tool-call";
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
  /** Adds "Regenerate" under the last reply. Line this up with `useChat().regenerate`. */
  onRegenerate?: () => void;
  /**
   * Adds "Edit" to the last message you sent. Called with the new text; the app drops what came
   * after that message and sends it again, as `useChat().sendMessage({ messageId })` does.
   */
  onEdit?: (messageId: string, text: string) => void;
  /** Answers a tool call waiting for approval. Without it, no approval buttons show. */
  onToolApproval?: (approvalId: string, approved: boolean) => void;
  placeholder?: string;
}

/**
 * A complete chat: the conversation, the message box under it, and the states between them.
 * Copy it and take out what you do not need; every part is a Shelf component you can use alone.
 *
 * It fills its parent, so the parent needs a height. The messages scroll inside it and the
 * message box stays at the bottom. Sending scrolls your message near the top and the reply
 * grows beneath it.
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
  onRegenerate,
  onEdit,
  onToolApproval,
  placeholder = "Ask anything",
  style,
  ...props
}: ChatProps) {
  const last = messages.at(-1);
  const lastUser = messages.findLast((message) => message.role === "user");
  const busy = status === "submitted" || status === "streaming";
  const waiting = Message.isAwaitingReply(last, status);

  return (
    <div data-slot="chat" {...props} {...stylex.props(styles.root, style)}>
      <Thread.Root status={status}>
        <Thread.Viewport>
          <Thread.Content>
            {messages.map((message) =>
              // An empty reply is represented by the "thinking" row below.
              message === last && waiting && message.role === "assistant" ? null : (
                <ChatMessageView
                  key={message.id}
                  message={message}
                  streaming={status === "streaming" && message === last}
                  busy={busy}
                  // Only the newest message can have a waiting tool call or be regenerated, so
                  // the settled ones receive the same props every render and are skipped.
                  onToolApproval={message === last ? onToolApproval : undefined}
                  onRegenerate={message === last ? onRegenerate : undefined}
                  onEdit={message === lastUser ? onEdit : undefined}
                />
              ),
            )}
            {waiting ? <Shimmer>Thinking</Shimmer> : null}
          </Thread.Content>
        </Thread.Viewport>
        <PinSent id={lastUser?.id} />
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

/** When you send, your message moves near the top and the reply grows beneath it. */
function PinSent({ id }: { id: string | undefined }) {
  const { pinToStart } = Thread.useThreadActions();
  const pinned = useRef(id);
  // Before paint, so the message is never seen at the bottom first. Existing history is left alone.
  useLayoutEffect(() => {
    if (id && id !== pinned.current) pinToStart(id);
    pinned.current = id;
  }, [id, pinToStart]);
  return null;
}

interface MessageViewProps {
  message: Message.ChatMessage;
  /** The reply is arriving in this message. */
  streaming: boolean;
  /** A reply is on its way; actions that would interrupt it are hidden. */
  busy: boolean;
  onToolApproval?: (approvalId: string, approved: boolean) => void;
  onRegenerate?: () => void;
  onEdit?: (messageId: string, text: string) => void;
}

// Settled messages receive the same props between tokens, so only the one that grows re-renders.
const ChatMessageView = memo(function ChatMessageView({
  message,
  streaming,
  busy,
  onToolApproval,
  onRegenerate,
  onEdit,
}: MessageViewProps) {
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const text = Message.textOf(message);

  const finishEditing = () => {
    setEditing(false);
    // Back to where the person was, once the message has its bubble again.
    requestAnimationFrame(() => editButton.current?.focus());
  };

  return (
    <Message.Root from={message.role} data-thread-item={message.id}>
      {editing && onEdit ? (
        <EditMessage
          text={text}
          onSave={(next) => {
            finishEditing();
            onEdit(message.id, next);
          }}
          onCancel={finishEditing}
        />
      ) : (
        <Message.Content>
          {message.role === "user" ? (
            text
          ) : (
            <MessageParts
              parts={message.parts}
              streaming={streaming}
              onToolApproval={onToolApproval}
            />
          )}
        </Message.Content>
      )}
      {text && !editing ? (
        // Always in the layout, so the message does not grow when the reply finishes.
        <Message.Actions inert={busy || undefined} style={busy ? styles.actionsHidden : undefined}>
          <Message.CopyAction text={text} />
          {onEdit ? (
            <Message.Action
              ref={editButton}
              label="Edit"
              icon={<EditIcon />}
              onClick={() => setEditing(true)}
            />
          ) : null}
          {onRegenerate && message.role === "assistant" ? (
            <Message.Action label="Regenerate" icon={<RetryIcon />} onClick={onRegenerate} />
          ) : null}
        </Message.Actions>
      ) : null}
    </Message.Root>
  );
});

/** Edits a sent message in place: Enter or Save sends it again, Escape or Cancel leaves it as it was. */
function EditMessage({
  text,
  onSave,
  onCancel,
}: {
  text: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  return (
    <Composer.Root
      defaultText={text}
      onSubmit={(submission) => onSave(submission.text)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) onCancel();
      }}
      style={styles.edit}
    >
      <EditFields onCancel={onCancel} />
    </Composer.Root>
  );
}

function EditFields({ onCancel }: { onCancel: () => void }) {
  const { submit, focus } = Composer.useComposerActions();
  const canSubmit = Composer.useComposerState((state) => state.canSubmit);
  // The edit button that opened this is gone, so focus would be lost without this.
  useEffect(() => focus(), [focus]);
  return (
    <>
      <Composer.Input label="Edit message" />
      <Composer.Footer style={styles.editFooter}>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" disabled={!canSubmit} onClick={() => submit()}>
          Save
        </Button>
      </Composer.Footer>
    </>
  );
}

/**
 * Renders a message's parts. Add a case here for each part type your app shows; parts it does
 * not know are skipped.
 */
export function MessageParts({
  parts,
  streaming = false,
  onToolApproval,
}: {
  parts: readonly Message.ChatPart[];
  streaming?: boolean;
  /** Answers a tool call that is waiting for approval. */
  onToolApproval?: (approvalId: string, approved: boolean) => void;
}) {
  const lastText = parts.findLastIndex((part) => part.type === "text");
  const sources = parts.filter((part) => part.type === "source-url");

  const render = (part: Message.ChatPart, index: number): ReactNode => {
    if (part.type === "text") {
      return <Stream streaming={streaming && index === lastText}>{part.text}</Stream>;
    }
    if (part.type === "reasoning") {
      return (
        <Reasoning.Root streaming={part.state === "streaming"}>
          <Reasoning.Trigger />
          <Reasoning.Content>{part.text}</Reasoning.Content>
        </Reasoning.Root>
      );
    }
    if (part.type === "file") {
      return (
        <Attachment
          name={part.filename ?? "File"}
          previewUrl={part.mediaType.startsWith("image/") ? part.url : undefined}
        />
      );
    }
    if (Message.isToolPart(part)) {
      const approval = part.approval;
      return (
        <ToolCall part={part}>
          {part.state === "approval-requested" && approval && onToolApproval ? (
            <Approval onRespond={(approved) => onToolApproval(approval.id, approved)} />
          ) : null}
        </ToolCall>
      );
    }
    return null;
  };

  return (
    <>
      {parts.map((part, index) => (
        // Parts only append, so the position is their identity.
        // oxlint-disable-next-line react/no-array-index-key
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <Fragment key={index}>{render(part, index)}</Fragment>
      ))}
      <Sources sources={sources} />
    </>
  );
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
    flexShrink: 0,
    paddingBlockEnd: `max(${spacing["4"]}, env(safe-area-inset-bottom))`,
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
  actionsHidden: {
    visibility: "hidden",
  },
  edit: {
    width: "100%",
  },
  editFooter: {
    justifyContent: "flex-end",
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
