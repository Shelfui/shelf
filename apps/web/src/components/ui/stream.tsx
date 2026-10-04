"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, memo, useMemo, useState } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { createBlockSplitter, heal } from "./stream-blocks";
import { renderBlock, type WordAnimation } from "./stream-render";
import { useSmoothedText } from "./use-smoothed-text";

export interface StreamProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  /** The markdown source. While streaming, pass the text received so far. */
  children: string;
  /** The text is still arriving. Completes unfinished syntax and keeps an open code fence plain. */
  streaming?: boolean;
  /** Release streamed text steadily instead of in bursts. On by default while streaming. */
  smooth?: boolean;
  /**
   * How new words appear while streaming: `fade`, `rise` (fade plus a small lift), or `none`.
   * Only words that have just arrived animate; finished text is plain.
   */
  animation?: "none" | WordAnimation;
  /** Origins images may load from. By default none do: model output can point anywhere. */
  imageOrigins?: readonly string[];
}

const NO_ORIGINS: readonly string[] = [];

/**
 * Renders model output. Built for streaming: only the block still growing re-renders, the
 * rest stay as they were, and the cost per token does not grow with the length of the response.
 *
 *   <Stream streaming={status === "streaming"}>{text}</Stream>
 *
 * Output is safe by default: raw HTML shows as text, links open in a new tab with only
 * `http`, `https`, and `mailto` targets, and images stay off until you allow their origin.
 */
export function Stream({
  children,
  streaming = false,
  smooth = true,
  animation = "fade",
  imageOrigins = NO_ORIGINS,
  style,
  ...props
}: StreamProps) {
  const { text, pending } = useSmoothedText(children, streaming && smooth, animation !== "none");
  // Stay live until the paced text has caught up, so the end of a response does not jump.
  const live = streaming || pending;
  const [splitter] = useState(createBlockSplitter);
  const sources = useMemo(() => splitter.split(text), [splitter, text]);
  const last = sources.length - 1;
  const animate = animation === "none" ? undefined : animation;

  return (
    <div
      data-slot="markdown"
      data-streaming={live || undefined}
      aria-busy={live || undefined}
      {...props}
      {...stylex.props(styles.root, style)}
    >
      {sources.map((source, i) => (
        // Blocks only ever append, so the index is a stable identity.
        // oxlint-disable-next-line react/no-array-index-key
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <Block
          key={i}
          source={live && i === last ? heal(source) : source}
          streaming={live && i === last}
          // The block before the last keeps its words until their animation has played out.
          animation={live && i >= last - 1 ? animate : undefined}
          imageOrigins={imageOrigins}
        />
      ))}
    </div>
  );
}

const Block = memo(function Block({
  source,
  streaming,
  animation,
  imageOrigins,
}: {
  source: string;
  streaming: boolean;
  animation: WordAnimation | undefined;
  imageOrigins: readonly string[];
}) {
  return (
    <div data-slot="markdown-block" {...stylex.props(styles.block)}>
      {renderBlock(source, { streaming, animation, imageOrigins })}
    </div>
  );
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
    // A growing block does not make the browser re-lay out the blocks around it.
    contain: "layout style",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
});
