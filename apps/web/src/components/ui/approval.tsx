"use client";

import * as stylex from "@stylexjs/stylex";
import { type ComponentProps, useId } from "react";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { Button } from "./button";

export interface ApprovalProps extends Styled<Omit<ComponentProps<"div">, "onSelect">> {
  /** Called with the person's answer. */
  onRespond: (approved: boolean) => void;
  /** What is being asked. */
  children?: React.ReactNode;
  approveLabel?: string;
  denyLabel?: string;
}

/**
 * Asks before a tool runs. Render it for a tool part in the `approval-requested` state and
 * answer with `addToolApprovalResponse` or your own call. It does not move focus: a person
 * who is typing keeps typing.
 */
export function Approval({
  onRespond,
  children = "Allow this tool to run?",
  approveLabel = "Approve",
  denyLabel = "Deny",
  style,
  ...props
}: ApprovalProps) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      data-slot="approval"
      {...props}
      {...stylex.props(styles.root, style)}
    >
      <span id={id} {...stylex.props(styles.question)}>
        {children}
      </span>
      <div {...stylex.props(styles.actions)}>
        <Button size="sm" variant="outline" onClick={() => onRespond(false)}>
          {denyLabel}
        </Button>
        <Button size="sm" onClick={() => onRespond(true)}>
          {approveLabel}
        </Button>
      </div>
    </div>
  );
}

const styles = stylex.create({
  root: {
    padding: spacing["2"],
    borderRadius: radius.md,
    gap: spacing["3"],
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "flex",
    justifyContent: "space-between",
  },
  question: {
    color: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  actions: { gap: spacing["1"], display: "flex" },
});
