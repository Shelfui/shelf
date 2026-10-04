"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, createContext, use, useMemo, useState } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import * as Collapsible from "./collapsible";
import { ChevronDownIcon, ReasoningIcon } from "./icons";
import { Shimmer } from "./shimmer";

const StreamingContext = createContext<{ streaming: boolean; seconds?: number }>({
  streaming: false,
});

/** Whether the model is still thinking, and how long it thought. For parts you write yourself. */
export function useReasoning() {
  return use(StreamingContext);
}

export interface RootProps extends Styled<Omit<ComponentProps<typeof Collapsible.Root>, "open">> {
  /** The model is still thinking. Open while it does; closes by itself when it stops. */
  streaming?: boolean;
  /** How long it thought, for the label once it is done. */
  seconds?: number;
}

/**
 * The model's reasoning, folded away once it is done so the answer comes first.
 *
 *   <Reasoning.Root streaming={part.state === "streaming"}>
 *     <Reasoning.Trigger />
 *     <Reasoning.Content>{part.text}</Reasoning.Content>
 *   </Reasoning.Root>
 *
 * It opens while streaming and closes when streaming ends, unless the reader has opened or
 * closed it themselves.
 */
export function Root({ streaming = false, seconds, style, ...props }: RootProps) {
  // `null` means the reader has not chosen, so streaming decides.
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [wasStreaming, setWasStreaming] = useState(streaming);
  if (wasStreaming !== streaming) {
    setWasStreaming(streaming);
    // A new stretch of thinking starts open; the reader's choice applied to the last one.
    if (streaming) setChosen(null);
  }

  const context = useMemo(() => ({ streaming, seconds }), [streaming, seconds]);

  return (
    <StreamingContext value={context}>
      <Collapsible.Root
        data-slot="reasoning"
        open={chosen ?? streaming}
        onOpenChange={setChosen}
        {...props}
        {...stylex.props(styles.root, style)}
      />
    </StreamingContext>
  );
}

/** The label: "Thinking" while streaming, then "Thought for 4s". */
export function Trigger({ children, ...props }: ComponentProps<typeof Collapsible.Trigger>) {
  const { streaming, seconds } = useReasoning();
  const label = streaming ? (
    <Shimmer>Thinking</Shimmer>
  ) : seconds === undefined ? (
    "Thought"
  ) : (
    `Thought for ${Math.max(1, Math.round(seconds))}s`
  );
  return (
    <Collapsible.Trigger data-slot="reasoning-trigger" {...props} {...stylex.props(styles.trigger)}>
      <ReasoningIcon />
      {children ?? label}
      <ChevronDownIcon {...stylex.props(styles.chevron)} />
    </Collapsible.Trigger>
  );
}

export function Content({ style, ...props }: Styled<ComponentProps<typeof Collapsible.Panel>>) {
  return (
    <Collapsible.Panel data-slot="reasoning-content" {...props}>
      <div {...stylex.props(styles.content, style)}>{props.children}</div>
    </Collapsible.Panel>
  );
}

const styles = stylex.create({
  root: { gap: spacing["1"], display: "flex", flexDirection: "column" },
  trigger: {
    padding: 0,
    borderStyle: "none",
    borderWidth: 0,
    gap: spacing["1.5"],
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  chevron: {
    transform: { default: "none", [stylex.when.ancestor("[data-panel-open]")]: "rotate(180deg)" },
  },
  content: {
    borderInlineStartColor: colors.border,
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 2,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    marginBlockStart: spacing["1"],
    paddingInlineStart: spacing["3"],
    whiteSpace: "pre-wrap",
  },
});
