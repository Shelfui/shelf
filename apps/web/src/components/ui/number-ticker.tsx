"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import type { Styled } from "@/lib/shelf/utils";

export interface NumberTickerProps extends Styled<Omit<ComponentProps<"span">, "children">> {
  value: number;
  /** Milliseconds the count takes. Skipped when the user prefers reduced motion. */
  duration?: number;
  /** Passed to `Intl.NumberFormat`: `{ style: "currency", currency: "USD" }`. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
}

/**
 * A number that counts to its new value when it changes. Screen readers get the final value
 * at once rather than every step on the way.
 */
export function NumberTicker({
  value,
  duration = 600,
  format,
  locale,
  style,
  ...props
}: NumberTickerProps) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || duration <= 0) {
      const frame = requestAnimationFrame(() => {
        from.current = value;
        setShown(value);
      });
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      // Ease out: fast at first, settling on the value.
      const current = start + (value - start) * (1 - (1 - progress) ** 3);
      from.current = current;
      setShown(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  const formatKey = JSON.stringify(format);
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- `formatKey` stands for `format`, which is usually a new object each render.
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, formatKey]);

  return (
    <span data-slot="number-ticker" {...props} {...stylex.props(styles.root, style)}>
      <span aria-hidden>{formatter.format(shown)}</span>
      <span {...stylex.props(styles.hidden)}>{formatter.format(value)}</span>
    </span>
  );
}

const styles = stylex.create({
  root: {
    fontVariantNumeric: "tabular-nums",
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
