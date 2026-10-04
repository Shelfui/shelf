import { useEffect, useRef, useState } from "react";

export interface SmoothedText {
  /** The text to show now. */
  text: string;
  /** Text received but not yet shown. */
  pending: boolean;
}

/** A tab that was hidden stops getting frames. Past this gap, show everything at once. */
const STALE_MS = 500;

/**
 * Releases `target` a few characters per frame instead of in network-sized bursts. The pace
 * adapts to the backlog, so the text never falls far behind. It paces text that grows after
 * mount; once `enabled` turns false the backlog still drains, so a response never jumps at
 * its end. With `byWord`, each step ends on a word boundary. Reduced motion shows everything.
 */
export function useSmoothedText(target: string, enabled: boolean, byWord = false): SmoothedText {
  const [length, setLength] = useState(target.length);
  const [active, setActive] = useState(enabled);
  const lastFrame = useRef(0);

  // Derived during render, so a change lands in the same frame it arrives.
  if (enabled && !active) setActive(true);
  if (!enabled && active && length >= target.length) setActive(false);
  if ((!active && length !== target.length) || length > target.length) setLength(target.length);

  const shown = active ? Math.min(length, target.length) : target.length;
  const pending = shown < target.length;

  useEffect(() => {
    if (!pending) {
      lastFrame.current = 0;
      return undefined;
    }
    // One frame at a time; the next is scheduled by the state change this one makes.
    const frame = requestAnimationFrame((time) => {
      const stale = lastFrame.current > 0 && time - lastFrame.current > STALE_MS;
      lastFrame.current = time;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let next =
        stale || reduced
          ? target.length
          : shown + Math.max(2, Math.ceil((target.length - shown) / 12));
      if (byWord && next < target.length) {
        const gap = target.slice(next).search(/\s/);
        next = gap === -1 ? target.length : next + gap;
      }
      // Never split a surrogate pair.
      const code = target.charCodeAt(next - 1);
      if (next < target.length && code >= 0xd800 && code <= 0xdbff) next += 1;
      setLength(Math.min(next, target.length));
    });
    return () => cancelAnimationFrame(frame);
  }, [target, shown, pending, byWord]);

  return { text: active ? target.slice(0, shown) : target, pending };
}
