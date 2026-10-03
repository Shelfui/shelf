"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import * as Tooltip from "@/components/ui/tooltip";

/**
 * An icon button that copies `value` and shows a tooltip. `value` can be a function, for text
 * that is fetched when the button is pressed.
 */
export function CopyButton({
  value,
  label = "Copy code",
  style,
}: {
  value: string | (() => Promise<string>);
  label?: string;
  style?: stylex.StaticStyles;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = copied ? setTimeout(() => setCopied(false), 2000) : undefined;
    return () => clearTimeout(timer);
  }, [copied]);

  const text = copied ? "Copied" : label;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={text}
            style={style}
            onClick={() => {
              const content = typeof value === "string" ? Promise.resolve(value) : value();
              void content
                .then((copy) => navigator.clipboard.writeText(copy))
                .then(() => setCopied(true));
            }}
          />
        }
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Tooltip.Trigger>
      <Tooltip.Content>{text}</Tooltip.Content>
    </Tooltip.Root>
  );
}
