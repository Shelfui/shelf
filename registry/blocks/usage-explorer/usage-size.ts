import { type RefObject, useEffect, useRef, useState } from "react";

/** The element's content width, updated as it resizes. `fallback` renders before layout. */
export function useWidth<T extends HTMLElement>(fallback: number): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}
