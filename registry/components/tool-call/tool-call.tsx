"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { Badge } from "../badge/badge";
import { CodeBlock } from "../code-block/code-block";
import * as Collapsible from "../collapsible/collapsible";
import { ChevronDownIcon, ToolIcon } from "../icons/icons";
import {
  type DynamicToolPart,
  type ToolPart,
  type ToolState,
  toolName,
} from "../message/message-types";
import { Spinner } from "../spinner/spinner";

const LABELS: Record<ToolState, string> = {
  "input-streaming": "Preparing",
  "input-available": "Running",
  "approval-requested": "Needs approval",
  "approval-responded": "Approved",
  "output-available": "Done",
  "output-error": "Failed",
  "output-denied": "Denied",
};

export interface ToolCallProps extends Styled<Omit<ComponentProps<"div">, "children" | "part">> {
  /** A tool part from a message, as the AI SDK produces it. */
  part: ToolPart | DynamicToolPart;
  /** Shown under the details, such as an `Approval`. */
  children?: ReactNode;
}

/**
 * One tool call: its name, where it is, and what went in and came out. Collapsed by default,
 * because most people want the answer, not the plumbing.
 *
 *   <ToolCall part={part}>
 *     {part.state === "approval-requested" && <Approval onRespond={respond} />}
 *   </ToolCall>
 */
export function ToolCall({ part, children, style, ...props }: ToolCallProps) {
  const running = part.state === "input-streaming" || part.state === "input-available";
  return (
    <div
      data-slot="tool-call"
      data-state={part.state}
      {...props}
      {...stylex.props(styles.root, style)}
    >
      <Collapsible.Root>
        <Collapsible.Trigger {...stylex.props(styles.trigger)}>
          <ToolIcon />
          <span {...stylex.props(styles.name)}>{toolName(part)}</span>
          <Badge
            variant={
              part.state === "output-error" || part.state === "output-denied"
                ? "destructive"
                : part.state === "output-available"
                  ? "secondary"
                  : "outline"
            }
          >
            {running ? <Spinner aria-hidden /> : null}
            {LABELS[part.state]}
          </Badge>
          <ChevronDownIcon {...stylex.props(styles.chevron)} />
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <div {...stylex.props(styles.details)}>
            {part.input === undefined ? null : <Section title="Input" value={part.input} />}
            {part.output === undefined ? null : <Section title="Output" value={part.output} />}
            {part.errorText ? (
              <p role="alert" {...stylex.props(styles.error)}>
                {part.errorText}
              </p>
            ) : null}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
      {children}
    </div>
  );
}

function Section({ title, value }: { title: string; value: unknown }) {
  return (
    <div {...stylex.props(styles.section)}>
      <span {...stylex.props(styles.heading)}>{title}</span>
      <CodeBlock
        language="json"
        code={typeof value === "string" ? value : (JSON.stringify(value, null, 2) ?? String(value))}
      />
    </div>
  );
}

const styles = stylex.create({
  root: {
    padding: spacing["2"],
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["2"],
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  trigger: {
    padding: 0,
    borderStyle: "none",
    borderWidth: 0,
    gap: spacing["2"],
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    alignItems: "center",
    backgroundColor: "transparent",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    width: "100%",
  },
  name: { fontFamily: typography.fontFamilyMono, fontWeight: typography.fontWeightMedium },
  chevron: {
    marginInlineStart: "auto",
    transform: { default: "none", [stylex.when.ancestor("[data-panel-open]")]: "rotate(180deg)" },
  },
  details: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
    paddingBlockStart: spacing["2"],
  },
  section: { gap: spacing["1"], display: "flex", flexDirection: "column" },
  heading: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightXs,
    textTransform: "uppercase",
  },
  error: {
    margin: 0,
    color: colors.destructiveText,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
  },
});
