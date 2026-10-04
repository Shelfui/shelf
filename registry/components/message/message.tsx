"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { media } from "../../foundations/conditions.stylex";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { Button } from "../button/button";
import { CheckIcon, CopyIcon } from "../icons/icons";
import { useCopy } from "../copy-button/copy-button";
import * as Tooltip from "../tooltip/tooltip";
import type { ChatRole } from "./message-types";

export * from "./message-types";

export interface RootProps extends Styled<ComponentProps<"article">> {
  /** Who sent it. Sets alignment and the user's bubble; also exposed as `data-from`. */
  from: ChatRole;
}

/**
 * One turn in a conversation. The assistant's content sits unboxed on the page; the user's is
 * a soft bubble on the right.
 *
 *   <Message.Root from={message.role}>
 *     <Message.Content>…</Message.Content>
 *     <Message.Actions>
 *       <Message.CopyAction text={text} />
 *       <Message.Action label="Retry" icon={<RetryIcon />} onClick={regenerate} />
 *     </Message.Actions>
 *   </Message.Root>
 *
 * `Message.Actions` appear on hover and keyboard focus where there is a hover, and always on touch.
 */
export function Root({ from, style, ...props }: RootProps) {
  return (
    <article
      data-slot="message"
      data-from={from}
      aria-label={from === "user" ? "You" : from === "assistant" ? "Assistant" : "System"}
      {...props}
      {...stylex.props(
        stylex.defaultMarker(),
        styles.root,
        from === "user" ? styles.fromUser : styles.fromOther,
        style,
      )}
    />
  );
}

export function Content({ style, ...props }: Styled<ComponentProps<"div">>) {
  return <div data-slot="message-content" {...props} {...stylex.props(styles.content, style)} />;
}

/** A row of small buttons under a message. */
export function Actions({ style, ...props }: Styled<ComponentProps<"div">>) {
  return (
    <div
      data-slot="message-actions"
      role="group"
      aria-label="Message actions"
      {...props}
      {...stylex.props(styles.actions, style)}
    />
  );
}

export interface ActionProps extends Styled<Omit<ComponentProps<typeof Button>, "children">> {
  /** The accessible name and the tooltip. */
  label: string;
  icon: ReactNode;
}

/** An icon button with a tooltip. */
export function Action({ label, icon, style, ...props }: ActionProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={label} style={style} {...props} />
        }
      >
        {icon}
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip.Root>
  );
}

export interface CopyActionProps extends Styled<Omit<ActionProps, "label" | "icon" | "onClick">> {
  /** What lands on the clipboard. */
  text: string;
  label?: string;
}

/** Copies `text` and shows a check for a moment. */
export function CopyAction({ text, label = "Copy", ...props }: CopyActionProps) {
  const { copied, copy } = useCopy(text);

  return (
    <Action
      label={copied ? "Copied" : label}
      icon={copied ? <CheckIcon /> : <CopyIcon />}
      onClick={copy}
      {...props}
    />
  );
}

const styles = stylex.create({
  root: {
    containIntrinsicSize: "auto 3.5rem",
    gap: spacing["1"],
    color: colors.foreground,
    // Settled messages far from the viewport skip layout and paint.
    contentVisibility: "auto",
    display: "flex",
    flexDirection: "column",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightBase,
    minWidth: 0,
  },
  fromUser: {
    alignItems: "flex-end",
  },
  fromOther: {
    alignItems: "stretch",
  },
  // The user's text sits in a soft bubble; the marker on Root says whose turn it is.
  content: {
    borderRadius: { default: null, [stylex.when.ancestor("[data-from=user]")]: radius.lg },
    paddingBlock: { default: null, [stylex.when.ancestor("[data-from=user]")]: spacing["2"] },
    paddingInline: { default: null, [stylex.when.ancestor("[data-from=user]")]: spacing["3"] },
    backgroundColor: { default: null, [stylex.when.ancestor("[data-from=user]")]: colors.muted },
    overflowWrap: "anywhere",
    whiteSpace: { default: null, [stylex.when.ancestor("[data-from=user]")]: "pre-wrap" },
    maxWidth: { default: null, [stylex.when.ancestor("[data-from=user]")]: "85%" },
    minWidth: 0,
  },
  actions: {
    gap: spacing["1"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    opacity: {
      default: 1,
      [media.hover]: {
        default: 0,
        [stylex.when.ancestor(":focus-within")]: 1,
        [stylex.when.ancestor(":hover")]: 1,
      },
    },
    transitionDuration: {
      default: "150ms",
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "opacity",
  },
});
