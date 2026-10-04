import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import type { Styled } from "@/lib/shelf/utils";
import { CheckIcon } from "./icons";
import { Spinner } from "./spinner";

export type StepStatus = "pending" | "active" | "done";

/** An agent's plan: the steps it intends to take and how far it has got. */
export function Root({ style, ...props }: Styled<ComponentProps<"ol">>) {
  return <ol data-slot="plan" {...props} {...stylex.props(styles.root, style)} />;
}

export interface StepProps extends Styled<Omit<ComponentProps<"li">, "children">> {
  status?: StepStatus;
  children: React.ReactNode;
}

const STATUS_LABEL: Record<StepStatus, string> = {
  pending: "Not started",
  active: "In progress",
  done: "Done",
};

export function Step({ status = "pending", children, style, ...props }: StepProps) {
  return (
    <li
      data-slot="plan-step"
      data-status={status}
      aria-current={status === "active" ? "step" : undefined}
      {...props}
      {...stylex.props(styles.step, status === "done" && styles.done, style)}
    >
      <span aria-hidden {...stylex.props(styles.marker, status === "pending" && styles.ring)}>
        {status === "done" ? <CheckIcon /> : null}
        {status === "active" ? <Spinner aria-hidden /> : null}
      </span>
      <span>{children}</span>
      <span {...stylex.props(styles.hidden)}>{STATUS_LABEL[status]}</span>
    </li>
  );
}

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    gap: spacing["2"],
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  step: {
    gap: spacing["2"],
    alignItems: "flex-start",
    color: colors.foreground,
    display: "flex",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  done: { color: colors.mutedForeground },
  marker: {
    alignItems: "center",
    boxSizing: "border-box",
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "1.25rem",
    width: "1.25rem",
  },
  ring: {
    borderColor: colors.input,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: 2,
    marginBlock: "0.1875rem",
    marginInline: "0.1875rem",
    transitionDuration: { default: "150ms", [media.reducedMotion]: "0s" },
    height: "0.875rem",
    width: "0.875rem",
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
