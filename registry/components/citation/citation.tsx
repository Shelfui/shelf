"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors, radius, spacing, typography } from "../../foundations/tokens.stylex";
import type { Styled } from "../../lib/utils";
import * as HoverCard from "../hover-card/hover-card";

/** The URL if it is `http` or `https`, otherwise `undefined`. Model output can carry any URL. */
export function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export interface CitationProps extends Styled<Omit<ComponentProps<"a">, "href" | "title">> {
  /** The number shown in the text, starting at 1. */
  index: number;
  href: string;
  title?: string;
}

/**
 * A numbered marker inside an answer that links to its source and previews it on hover.
 *
 *   …as the report shows.<Citation index={1} href={source.url} title={source.title} />
 *
 * With an unsafe URL it renders the number without a link.
 */
export function Citation({ index, href, title, style, ...props }: CitationProps) {
  const safe = safeHref(href);
  if (!safe) return <sup {...stylex.props(styles.marker, style)}>{index}</sup>;

  let host = safe;
  try {
    host = new URL(safe).hostname.replace(/^www\./, "");
  } catch {
    // `safeHref` already parsed it; the raw URL is a fine fallback.
  }

  return (
    <HoverCard.Root>
      <HoverCard.Trigger
        href={safe}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label={`Source ${index}: ${title ?? host}`}
        data-slot="citation"
        {...props}
        {...stylex.props(styles.marker, style)}
      >
        {index}
      </HoverCard.Trigger>
      <HoverCard.Content>
        <div {...stylex.props(styles.card)}>
          {title ? <span {...stylex.props(styles.title)}>{title}</span> : null}
          <span {...stylex.props(styles.host)}>{host}</span>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

const styles = stylex.create({
  marker: {
    borderRadius: radius.full,
    marginInline: "0.125rem",
    paddingInline: spacing["1.5"],
    textDecoration: "none",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightXs,
  },
  card: { gap: spacing["1"], display: "flex", flexDirection: "column", maxWidth: "18rem" },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
  },
  host: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
  },
});
