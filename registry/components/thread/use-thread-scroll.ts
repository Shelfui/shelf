import { useEffect, useMemo, useRef, useState } from "react";

/** Within this many pixels of the end counts as being at the newest message. */
const AT_LATEST = 80;
/** Room kept above a message that is pinned to the top. */
const PIN_OFFSET = 16;
/** Longest a smooth scroll to the latest message is given before we trust scroll events again. */
const SMOOTH_MS = 800;

/** The CSS variable the content reads (in `thread.tsx`) to leave room below the last message. */
const SPACER = "--thread-spacer";

export interface ThreadActions {
  /** Ref for the element that scrolls. */
  scrollRef: (element: HTMLElement | null) => void;
  /** Ref for the element that holds the messages and grows as they do. */
  contentRef: (element: HTMLElement | null) => void;
  /** Scrolls to the end and follows new content again. */
  scrollToLatest: () => void;
  /**
   * Puts the item marked `data-thread-item="<id>"` near the top and follows from there: the
   * reply grows underneath it, and the view moves only once the reply fills the screen.
   */
  pinToStart: (id: string) => void;
}

/**
 * Scrolling for a conversation that streams.
 *
 * It follows the end while you are there and lets go the moment you scroll away (wheel, touch,
 * keys, or the scrollbar), and picks up again when you come back. It is the only thing that
 * writes `scrollTop`, and it does so after the content has resized, once per frame, so the
 * view never fights the browser's own scroll anchoring (which the viewport turns off).
 */
export function useThreadScroll(): {
  /** Never changes between renders. */
  actions: ThreadActions;
  /** Whether the end of the conversation is in view. */
  atLatest: boolean;
} {
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [atLatest, setAtLatest] = useState(true);
  const commands = useRef<Pick<ThreadActions, "scrollToLatest" | "pinToStart"> | null>(null);

  useEffect(() => {
    if (!viewport || !content) return undefined;

    let following = true;
    // The scroll position a pinned message should rest at, while the reply is still shorter
    // than the screen. The room below the content is sized to make that position reachable.
    let anchor: number | null = null;
    let spacer = 0;
    let written = 0;
    let smoothUntil = 0;
    let touchY = 0;

    const maxTop = () => viewport.scrollHeight - viewport.clientHeight;
    const report = () => setAtLatest(maxTop() - viewport.scrollTop <= AT_LATEST);

    const setSpacer = (pixels: number) => {
      if (pixels === spacer) return;
      spacer = pixels;
      content.style.setProperty(SPACER, `${pixels}px`);
    };
    const write = (top: number) => {
      viewport.scrollTop = top;
      written = viewport.scrollTop;
    };

    // Room below the messages so the pinned one can sit at the top; gone once the reply is taller.
    const holdAnchor = () => {
      if (anchor === null) return;
      const natural = content.offsetHeight - spacer;
      const room = anchor + viewport.clientHeight - natural;
      setSpacer(Math.max(0, room));
      if (room <= 0) anchor = null;
    };

    const follow = () => {
      holdAnchor();
      if (following) write(maxTop());
      report();
    };

    const onScroll = () => {
      // Ignore scrolls we caused: the ones we wrote, and the frames of a smooth scroll.
      if (performance.now() >= smoothUntil && Math.abs(viewport.scrollTop - written) > 1) {
        following = maxTop() - viewport.scrollTop <= AT_LATEST;
      }
      report();
    };
    const onScrollEnd = () => {
      smoothUntil = 0;
      written = viewport.scrollTop;
    };
    const release = () => {
      following = false;
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < 0) release();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0;
      // A finger moving down pulls earlier messages into view.
      if (y > touchY) release();
      touchY = y;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "PageUp", "Home"].includes(event.key)) release();
    };

    commands.current = {
      scrollToLatest: () => {
        following = true;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        smoothUntil = reduced ? 0 : performance.now() + SMOOTH_MS;
        viewport.scrollTo({ top: maxTop(), behavior: reduced ? "instant" : "smooth" });
        if (reduced) written = viewport.scrollTop;
      },
      pinToStart: (id) => {
        const item = content.querySelector(`[data-thread-item="${CSS.escape(id)}"]`);
        if (!item) return;
        const top = Math.max(
          0,
          item.getBoundingClientRect().top -
            viewport.getBoundingClientRect().top +
            viewport.scrollTop -
            PIN_OFFSET,
        );
        // A message taller than the screen shows its start and leaves the rest to the reader.
        const fits = content.offsetHeight - spacer <= top + viewport.clientHeight;
        anchor = fits ? top : null;
        following = fits;
        holdAnchor();
        write(Math.min(top, maxTop()));
        report();
      },
    };

    const observer = new ResizeObserver(follow);
    observer.observe(content);
    observer.observe(viewport);
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("scrollend", onScrollEnd, { passive: true });
    viewport.addEventListener("wheel", onWheel, { passive: true });
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: true });
    viewport.addEventListener("keydown", onKeyDown);
    follow();

    return () => {
      commands.current = null;
      observer.disconnect();
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", onScrollEnd);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("keydown", onKeyDown);
      content.style.removeProperty(SPACER);
    };
  }, [viewport, content]);

  const actions = useMemo<ThreadActions>(
    () => ({
      scrollRef: setViewport,
      contentRef: setContent,
      scrollToLatest: () => commands.current?.scrollToLatest(),
      pinToStart: (id: string) => commands.current?.pinToStart(id),
    }),
    [],
  );

  return { actions, atLatest };
}
