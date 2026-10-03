"use client";

import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { sizes, spacing } from "@/styles/shelf/tokens.stylex";
import { buttonStyles } from "./button";
import { ChevronLeftIcon, ChevronRightIcon, MoreIcon } from "./icons";
import type { Styled } from "@/lib/shelf/utils";

/**
 * Links between the pages of a long list. Each page is a real `<a>`, so it works
 * without JavaScript. For a router's link, give it `buttonStyles` from Button.
 *
 *   <Pagination.Root>
 *     <Pagination.List>
 *       <Pagination.Item><Pagination.Previous href="?page=1" /></Pagination.Item>
 *       <Pagination.Item><Pagination.Link href="?page=1">1</Pagination.Link></Pagination.Item>
 *       <Pagination.Item><Pagination.Link href="?page=2" isActive>2</Pagination.Link></Pagination.Item>
 *       <Pagination.Item><Pagination.Next href="?page=3" /></Pagination.Item>
 *     </Pagination.List>
 *   </Pagination.Root>
 */
export function Root({ style, ...props }: Styled<ComponentProps<"nav">>) {
  return (
    <nav
      data-slot="pagination"
      aria-label="Pagination"
      {...props}
      {...stylex.props(styles.root, style)}
    />
  );
}

export function List({ style, ...props }: Styled<ComponentProps<"ul">>) {
  return <ul data-slot="pagination-list" {...props} {...stylex.props(styles.list, style)} />;
}

export function Item(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

export type LinkProps = Styled<ComponentProps<"a">> & {
  /** Marks the current page, for sighted users and with `aria-current`. */
  isActive?: boolean;
};

export function Link({ isActive = false, style, ...props }: LinkProps) {
  return (
    <a
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      {...props}
      {...stylex.props(buttonStyles(isActive ? "outline" : "ghost", "icon"), style)}
    />
  );
}

export function Previous({ style, ...props }: Styled<ComponentProps<"a">>) {
  return (
    <a
      data-slot="pagination-previous"
      aria-label="Go to previous page"
      {...props}
      {...stylex.props(buttonStyles("ghost"), style)}
    >
      <ChevronLeftIcon />
      <span>Previous</span>
    </a>
  );
}

export function Next({ style, ...props }: Styled<ComponentProps<"a">>) {
  return (
    <a
      data-slot="pagination-next"
      aria-label="Go to next page"
      {...props}
      {...stylex.props(buttonStyles("ghost"), style)}
    >
      <span>Next</span>
      <ChevronRightIcon />
    </a>
  );
}

export function Ellipsis({ style, ...props }: Styled<ComponentProps<"span">>) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      {...props}
      {...stylex.props(styles.ellipsis, style)}
    >
      <MoreIcon />
    </span>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: spacing["1"],
    listStyle: "none",
    alignItems: "center",
    display: "flex",
  },
  ellipsis: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: sizes.controlDefault,
    width: sizes.controlDefault,
  },
});
