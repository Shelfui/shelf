import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { ChevronRightIcon, MoreIcon } from "./icons";
import type { Styled } from "@/lib/shelf/utils";

/**
 * Where the current page sits in the site's hierarchy:
 *
 *   <Breadcrumb.Root>
 *     <Breadcrumb.List>
 *       <Breadcrumb.Item><Breadcrumb.Link href="/">Home</Breadcrumb.Link></Breadcrumb.Item>
 *       <Breadcrumb.Separator />
 *       <Breadcrumb.Item><Breadcrumb.Page>Invoices</Breadcrumb.Page></Breadcrumb.Item>
 *     </Breadcrumb.List>
 *   </Breadcrumb.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<"nav">>) {
  return <nav data-slot="breadcrumb" aria-label="Breadcrumb" {...props} {...stylex.props(style)} />;
}

export function List({ style, ...props }: Styled<ComponentProps<"ol">>) {
  return <ol data-slot="breadcrumb-list" {...props} {...stylex.props(styles.list, style)} />;
}

export function Item({ style, ...props }: Styled<ComponentProps<"li">>) {
  return <li data-slot="breadcrumb-item" {...props} {...stylex.props(styles.item, style)} />;
}

export function Link({ style, ...props }: Styled<ComponentProps<"a">>) {
  return <a data-slot="breadcrumb-link" {...props} {...stylex.props(styles.link, style)} />;
}

export function Page({ style, ...props }: Styled<ComponentProps<"span">>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      {...props}
      {...stylex.props(styles.page, style)}
    />
  );
}

/** A chevron between items, hidden from assistive tech. Pass children to replace it. */
export function Separator({ style, children, ...props }: Styled<ComponentProps<"li">>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden
      {...props}
      {...stylex.props(styles.separator, style)}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

/**
 * Stands in for collapsed items, or wraps a menu trigger that reveals them. Screen readers
 * hear its children, "More" by default.
 */
export function Ellipsis({ children = "More", style, ...props }: Styled<ComponentProps<"span">>) {
  return (
    <span data-slot="breadcrumb-ellipsis" {...props} {...stylex.props(styles.ellipsis, style)}>
      <MoreIcon />
      <span {...stylex.props(styles.visuallyHidden)}>{children}</span>
    </span>
  );
}

const styles = stylex.create({
  list: {
    fontSynthesis: "none",
    margin: 0,
    padding: 0,
    gap: spacing["1.5"],
    listStyle: "none",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    overflowWrap: "anywhere",
  },
  item: {
    gap: spacing["1.5"],
    alignItems: "center",
    display: "inline-flex",
  },
  link: {
    textDecoration: "none",
    color: {
      default: "inherit",
      ":hover": {
        default: null,
        [media.hover]: colors.foreground,
      },
    },
  },
  page: {
    color: colors.foreground,
  },
  separator: {
    display: "flex",
  },
  ellipsis: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    height: "1.25rem",
    width: "1.25rem",
  },
  visuallyHidden: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
});
