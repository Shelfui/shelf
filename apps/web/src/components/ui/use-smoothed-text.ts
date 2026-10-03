import { useEffect, useState } from "react";

/**
 * Releases `target` a few characters per frame instead of in network-sized bursts. The pace
 * adapts to the backlog, so the text never falls far behind. When `enabled` is false, or the
 * user prefers reduced motion, it returns `target` unchanged.
 *
 * Text already present on mount shows at once: only text that arrives afterwards is paced.
 */
export function useSmoothedText(target: string, enabled: boolean): string {
  const [length, setLength] = useState(target.length);

  useEffect(() => {
    if (length === target.length) return undefined;
    // One frame at a time; the next frame is scheduled by the state change this one makes.
    const frame = requestAnimationFrame(() => {
      if (!enabled || length > target.length) {
        setLength(target.length);
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const backlog = target.length - length;
      let next = reduced ? target.length : length + Math.max(2, Math.ceil(backlog / 12));
      // Never split a surrogate pair.
      const code = target.charCodeAt(next - 1);
      if (next < target.length && code >= 0xd800 && code <= 0xdbff) next += 1;
      setLength(Math.min(next, target.length));
    });
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, length]);

  return enabled ? target.slice(0, Math.min(length, target.length)) : target;
}
