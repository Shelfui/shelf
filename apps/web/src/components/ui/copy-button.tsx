"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import type { Styled } from "@/lib/shelf/utils";
import { Button } from "./button";
import { CheckIcon, CopyIcon } from "./icons";

/**
 * Copies text to the clipboard. `copied` stays true for a moment afterwards, so a button can
 * show a check. A refused write (no permission, insecure page) changes nothing.
 */
export function useCopy(text: string, resetAfter = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    void navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfter);
      },
      () => {},
    );
  };

  return { copied, copy };
}

export interface CopyButtonProps extends Styled<
  Omit<ComponentProps<typeof Button>, "onClick" | "children">
> {
  /** What lands on the clipboard. */
  text: string;
  /** The accessible name before copying. It reads "Copied" afterwards. */
  label?: string;
  /** Show the word next to the icon. Without it the button is icon-only. */
  showLabel?: boolean;
}

/** A ghost button that copies `text` and shows a check. */
export function CopyButton({
  text,
  label = "Copy",
  showLabel = false,
  size = showLabel ? "xs" : "icon-sm",
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopy(text);
  const name = copied ? "Copied" : label;

  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={name}
      data-slot="copy-button"
      {...props}
      onClick={copy}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {showLabel ? name : null}
    </Button>
  );
}
