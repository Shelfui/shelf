"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, memo, useMemo, useState } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { createBlockSplitter, heal } from "./markdown-blocks";
import { renderBlock } from "./markdown-render";
import { useSmoothedText } from "./use-smoothed-text";

export interface MarkdownProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  /** The markdown source. While streaming, pass the text received so far. */
  children: string;
  /** The text is still arriving. Completes unfinished syntax and keeps an open code fence plain. */
  streaming?: boolean;
  /** Release streamed text steadily instead of in bursts. On by default while streaming. */
  smooth?: boolean;
  /** Origins images may load from. By default none do: model output can point anywhere. */
  imageOrigins?: readonly string[];
}

const NO_ORIGINS: readonly string[] = [];

/**
 * Renders model output. Built for streaming: only the block still growing re-renders, the
 * rest stay as they were, and the cost per token does not grow with the length of the response.
 *
 *   <Markdown streaming={status === "streaming"}>{text}</Markdown>
 *
 * Output is safe by default: raw HTML shows as text, links open in a new tab with only
 * `http`, `https`, and `mailto` targets, and images stay off until you allow their origin.
 */
export function Markdown({
  children,
  streaming = false,
  smooth = true,
  imageOrigins = NO_ORIGINS,
  style,
  ...props
}: MarkdownProps) {
  const text = useSmoothedText(children, streaming && smooth);
  const [splitter] = useState(createBlockSplitter);
  const sources = useMemo(() => splitter.split(text), [splitter, text]);
  const last = sources.length - 1;

  return (
    <div
      data-slot="markdown"
      data-streaming={streaming || undefined}
      {...props}
      {...stylex.props(styles.root, style)}
    >
      {sources.map((source, i) => (
        // Blocks only ever append, so the index is a stable identity.
        // oxlint-disable-next-line react/no-array-index-key
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <Block
          key={i}
          source={streaming && i === last ? heal(source) : source}
          streaming={streaming && i === last}
          imageOrigins={imageOrigins}
        />
      ))}
    </div>
  );
}

const Block = memo(function Block({
  source,
  streaming,
  imageOrigins,
}: {
  source: string;
  streaming: boolean;
  imageOrigins: readonly string[];
}) {
  return (
    <div data-slot="markdown-block" {...stylex.props(styles.block, streaming && styles.tail)}>
      {renderBlock(source, { streaming, imageOrigins })}
    </div>
  );
});

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const styles = stylex.create({
  root: {
    gap: spacing["3"],
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightBase,
    overflowWrap: "anywhere",
    minWidth: 0,
  },
  block: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  tail: {
    animationDuration: "150ms",
    animationName: { default: fadeIn, "@media (prefers-reduced-motion: reduce)": "none" },
    animationTimingFunction: "ease-out",
  },
});
