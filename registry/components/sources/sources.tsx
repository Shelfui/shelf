"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import { safeHref } from "../citation/citation";
import * as Collapsible from "../collapsible/collapsible";
import { ChevronDownIcon, SourceIcon } from "../icons/icons";
import type { SourceUrlPart } from "../message/message-types";

export interface SourcesProps extends Styled<Omit<ComponentProps<"div">, "children">> {
  sources: readonly SourceUrlPart[];
  defaultOpen?: boolean;
}

/**
 * The pages an answer drew on, folded under "Used 3 sources". Pass the message's
 * `source-url` parts as they are.
 */
export function Sources({ sources, defaultOpen = false, style, ...props }: SourcesProps) {
  if (sources.length === 0) return null;
  return (
    <div data-slot="sources" {...props} {...stylex.props(styles.root, style)}>
      <Collapsible.Root defaultOpen={defaultOpen}>
        <Collapsible.Trigger {...stylex.props(styles.trigger)}>
          <SourceIcon />
          Used {sources.length} {sources.length === 1 ? "source" : "sources"}
          <ChevronDownIcon {...stylex.props(styles.chevron)} />
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <ol {...stylex.props(styles.list)}>
            {sources.map((source) => {
              const href = safeHref(source.url);
              return (
                <li key={source.sourceId}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      {...stylex.props(styles.link)}
                    >
                      {source.title ?? href}
                    </a>
                  ) : (
                    <span>{source.title ?? "Untitled source"}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

const styles = stylex.create({
  root: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
  },
  trigger: {
    font: "inherit",
    padding: 0,
    borderStyle: "none",
    borderWidth: 0,
    gap: spacing["1.5"],
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    alignItems: "center",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    display: "inline-flex",
  },
  chevron: {
    transform: { default: "none", [stylex.when.ancestor("[data-panel-open]")]: "rotate(180deg)" },
  },
  list: {
    margin: 0,
    gap: spacing["1"],
    paddingBlock: spacing["2"],
    display: "flex",
    flexDirection: "column",
    paddingInlineStart: spacing["6"],
  },
  link: {
    color: colors.foreground,
    textDecorationColor: colors.ring,
    textUnderlineOffset: "0.2em",
  },
});
