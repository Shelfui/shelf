"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, createContext, use, useEffect, useMemo, useState } from "react";
import { useStickToBottom } from "use-stick-to-bottom";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, elevation, spacing } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { Button } from "./button";
import { ArrowDownIcon } from "./icons";
import type { ChatStatus } from "./message-types";

interface ThreadActions {
  scrollRef: (element: HTMLElement | null) => void;
  contentRef: (element: HTMLElement | null) => void;
  scrollToLatest: () => void;
}

const ActionsContext = createContext<ThreadActions | null>(null);
const StateContext = createContext<{ atLatest: boolean } | null>(null);

function useActions() {
  const actions = use(ActionsContext);
  if (!actions) throw new Error("Thread parts must be used inside <Thread.Root>.");
  return actions;
}

/** Scrolls the thread to the newest message. Stable between renders. */
export function useThreadActions(): Pick<ThreadActions, "scrollToLatest"> {
  return useActions();
}

/** Whether the thread is scrolled to the newest message. Re-renders only when that changes. */
export function useThreadState<T>(select: (state: { atLatest: boolean }) => T): T {
  const state = use(StateContext);
  if (!state) throw new Error("Thread parts must be used inside <Thread.Root>.");
  return select(state);
}

export interface RootProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  /** Drives the screen reader announcement: "Generating response", then "Response ready". */
  status?: ChatStatus;
  children: React.ReactNode;
}

/**
 * A conversation's scroll area. It follows new content while you are at the bottom, stops the
 * moment you scroll up, and offers `Thread.ScrollToLatest` to come back.
 *
 *   <Thread.Root status={status}>
 *     <Thread.Viewport>
 *       <Thread.Content>{messages}</Thread.Content>
 *     </Thread.Viewport>
 *     <Thread.ScrollToLatest />
 *   </Thread.Root>
 *
 * Tokens are never announced. Only the start and end of a response are.
 */
export function Root({ status = "ready", style, children, ...props }: RootProps) {
  const { scrollRef, contentRef, scrollToBottom, isAtBottom } = useStickToBottom({
    initial: "instant",
    resize: "smooth",
  });

  const actions = useMemo<ThreadActions>(
    () => ({
      scrollRef,
      contentRef,
      scrollToLatest: () => void scrollToBottom(),
    }),
    [scrollRef, contentRef, scrollToBottom],
  );
  const state = useMemo(() => ({ atLatest: isAtBottom }), [isAtBottom]);

  return (
    <ActionsContext value={actions}>
      <StateContext value={state}>
        <div
          role="region"
          aria-label="Conversation"
          data-slot="thread"
          {...props}
          {...stylex.props(styles.root, style)}
        >
          {children}
          <Announcer status={status} />
        </div>
      </StateContext>
    </ActionsContext>
  );
}

function Announcer({ status }: { status: ChatStatus }) {
  const [message, setMessage] = useState("");
  const [previous, setPrevious] = useState(status);

  // Derive during render so the announcement lands with the status change.
  if (previous !== status) {
    setPrevious(status);
    if (status === "submitted" || status === "streaming") {
      if (previous === "ready" || previous === "error") setMessage("Generating response");
    } else if (status === "ready" && (previous === "submitted" || previous === "streaming")) {
      setMessage("Response ready");
    }
  }

  // Clear later so the same text announces again next time.
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div role="status" {...stylex.props(styles.hidden)}>
      {message}
    </div>
  );
}

export function Viewport({ style, ...props }: Styled<ComponentProps<"div">>) {
  const { scrollRef } = useActions();
  return (
    // A scroll area must be reachable by keyboard, even when the messages hold no controls.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div
      ref={scrollRef}
      tabIndex={0}
      aria-label="Messages"
      data-slot="thread-viewport"
      {...props}
      {...stylex.props(styles.viewport, style)}
    />
  );
}

export function Content({ style, ...props }: Styled<ComponentProps<"div">>) {
  const { contentRef } = useActions();
  return (
    <div
      ref={contentRef}
      data-slot="thread-content"
      {...props}
      {...stylex.props(styles.content, style)}
    />
  );
}

/** A floating button that appears when you have scrolled away from the newest message. */
export function ScrollToLatest({ style, ...props }: Styled<ComponentProps<typeof Button>>) {
  const { scrollToLatest } = useActions();
  const atLatest = useThreadState((s) => s.atLatest);
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Scroll to latest"
      onClick={scrollToLatest}
      tabIndex={atLatest ? -1 : 0}
      aria-hidden={atLatest || undefined}
      data-slot="thread-scroll-to-latest"
      {...props}
      style={[styles.scroll, atLatest && styles.scrollHidden, style]}
    >
      <ArrowDownIcon />
    </Button>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    position: "relative",
    minHeight: 0,
  },
  viewport: {
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    overscrollBehavior: "contain",
    flexGrow: 1,
    outlineOffset: -2,
    minHeight: 0,
    overflowY: "auto",
  },
  content: {
    gap: spacing["6"],
    marginInline: "auto",
    paddingBlock: spacing["6"],
    paddingInline: spacing["4"],
    display: "flex",
    flexDirection: "column",
    maxWidth: "48rem",
  },
  scroll: {
    boxShadow: elevation.sm,
    insetInlineStart: "50%",
    position: "absolute",
    transform: "translateX(-50%)",
    transitionDuration: { default: "150ms", [media.reducedMotion]: "0s" },
    transitionProperty: "opacity",
    bottom: spacing["4"],
  },
  scrollHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  hidden: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
});
