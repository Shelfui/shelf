import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { media } from "../../foundations/conditions.stylex";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { CheckIcon } from "../icons/icons";

export type StepStatus = "upcoming" | "current" | "complete";

/**
 * Where the user is in a multi-step flow. Each step is a bar with a title; the current one is
 * marked with `aria-current="step"`.
 *
 *   <Stepper.Root aria-label="Checkout">
 *     <Stepper.Step status="complete"><Stepper.Title>Cart</Stepper.Title></Stepper.Step>
 *     <Stepper.Step status="current"><Stepper.Title>Payment</Stepper.Title></Stepper.Step>
 *     <Stepper.Step><Stepper.Title>Review</Stepper.Title></Stepper.Step>
 *   </Stepper.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<"ol">>) {
  return <ol data-slot="stepper" {...props} {...stylex.props(styles.root, style)} />;
}

const STATUS_LABEL: Record<StepStatus, string> = {
  upcoming: "Upcoming",
  current: "Current step",
  complete: "Complete",
};

export interface StepProps extends Styled<Omit<ComponentProps<"li">, "children">> {
  status?: StepStatus;
  children: ReactNode;
}

export function Step({ status = "upcoming", children, style, ...props }: StepProps) {
  return (
    <li
      data-slot="stepper-step"
      data-status={status}
      aria-current={status === "current" ? "step" : undefined}
      {...props}
      {...stylex.props(styles.step, status !== "upcoming" && styles.reached, style)}
    >
      <div {...stylex.props(styles.row)}>
        {status === "complete" ? <CheckIcon /> : null}
        {children}
      </div>
      <span {...stylex.props(styles.hidden)}>{STATUS_LABEL[status]}</span>
    </li>
  );
}

export function Title({ style, ...props }: Styled<ComponentProps<"span">>) {
  return <span data-slot="stepper-title" {...props} {...stylex.props(styles.title, style)} />;
}

export function Description({ style, ...props }: Styled<ComponentProps<"span">>) {
  return (
    <span data-slot="stepper-description" {...props} {...stylex.props(styles.description, style)} />
  );
}

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    gap: spacing["2"],
    listStyle: "none",
    display: "flex",
  },
  step: {
    color: colors.mutedForeground,
    flexBasis: 0,
    flexGrow: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    transitionDuration: { default: "150ms", [media.reducedMotion]: "0s" },
    transitionProperty: "border-color",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 3,
    minWidth: 0,
    paddingTop: spacing["2"],
  },
  reached: {
    color: colors.foreground,
    borderTopColor: colors.foreground,
  },
  row: {
    gap: spacing["1.5"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  title: {
    fontWeight: typography.fontWeightMedium,
  },
  description: {
    color: colors.mutedForeground,
    display: "block",
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    width: "100%",
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
