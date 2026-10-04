"use client";

import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Command from "@/components/ui/command";
import { SearchIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens } from "@/styles/site.stylex";
import { type SearchGroup, type SearchItem, type SearchKind, searchFor } from "./search-items";

const KIND: Record<SearchKind, string> = {
  page: "Page",
  component: "Component",
  block: "Block",
};

export function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const groups = searchFor(query);

  function go(item: SearchItem) {
    onOpenChange(false);
    router.push(item.href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
      title="Search"
      description="Search the documentation, components, and blocks."
      style={styles.dialog}
    >
      <Command.Root
        items={groups}
        filteredItems={groups}
        onValueChange={setQuery}
        style={styles.root}
      >
        <Command.Input
          aria-label="Search documentation"
          placeholder="Search documentation, components, blocks…"
          style={styles.input}
        />
        <Kbd style={styles.esc} aria-hidden>
          Esc
        </Kbd>
        <div {...stylex.props(styles.body)}>
          <Command.List aria-label="Results" style={styles.list}>
            {(group: SearchGroup) => (
              <Command.Group key={group.value} items={group.items} style={styles.group}>
                <Command.GroupLabel style={styles.groupLabel}>{group.value}</Command.GroupLabel>
                <Command.Collection>
                  {(item: SearchItem) => (
                    <Result key={item.value} item={item} query={query} onSelect={go} />
                  )}
                </Command.Collection>
              </Command.Group>
            )}
          </Command.List>
          <Command.Empty style={styles.empty}>
            <span {...stylex.props(styles.emptyIcon)}>
              <SearchIcon />
            </span>
            <span {...stylex.props(styles.emptyTitle)}>No results for “{query.trim()}”</span>
            <span>Try a component name, like “dialog”, or a topic, like “agents”.</span>
          </Command.Empty>
        </div>
        <div {...stylex.props(styles.footer)}>
          <span {...stylex.props(styles.hint)}>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span {...stylex.props(styles.hint)}>
            <Kbd>↵</Kbd>
            Open
          </span>
          <span {...stylex.props(styles.hint, styles.brand)}>Shelf</span>
        </div>
      </Command.Root>
    </Command.Dialog>
  );
}

function Result({
  item,
  query,
  onSelect,
}: {
  item: SearchItem;
  query: string;
  onSelect: (item: SearchItem) => void;
}) {
  const label = KIND[item.kind];
  return (
    <Command.Item
      value={item}
      onClick={() => onSelect(item)}
      style={[stylex.defaultMarker(), styles.item]}
    >
      <span {...stylex.props(styles.text)}>
        <span {...stylex.props(styles.title)}>
          <Marked text={item.label} query={query} />
        </span>
        {item.description && <span {...stylex.props(styles.description)}>{item.description}</span>}
      </span>
      <span {...stylex.props(styles.kind)}>{label}</span>
      <Kbd aria-hidden style={styles.enter}>
        ↵
      </Kbd>
    </Command.Item>
  );
}

/** The title with the typed words in bold. */
function Marked({ text, query }: { text: string; query: string }) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  const marked = Array.from({ length: text.length }, () => false);
  for (const word of words) {
    const start = lower.indexOf(word);
    if (start >= 0) marked.fill(true, start, start + word.length);
  }
  const parts: { text: string; on: boolean }[] = [];
  for (const [i, char] of text.split("").entries()) {
    const on = marked[i] === true;
    const last = parts.at(-1);
    if (last?.on === on) last.text += char;
    else parts.push({ text: char, on });
  }
  return parts.map((part, i) =>
    part.on ? (
      <mark key={i} {...stylex.props(styles.mark)}>
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}

const highlighted = "[data-highlighted]";

const styles = stylex.create({
  dialog: {
    borderRadius: radius.lg,
    boxShadow: "0 24px 64px -12px rgb(0 0 0 / 0.28), 0 8px 20px -8px rgb(0 0 0 / 0.14)",
    maxWidth: "40rem",
    top: { default: "1rem", [screens.md]: "18%" },
    transform: "translateX(-50%)",
    width: "calc(100% - 1.5rem)",
  },
  root: {
    position: "relative",
    backgroundColor: colors.popover,
  },
  input: {
    paddingInline: spacing["4"],
    gap: spacing["3"],
    // Leaves room for the Esc key.
    paddingInlineEnd: "4rem",
    height: "3rem",
  },
  esc: {
    insetInlineEnd: spacing["4"],
    position: "absolute",
    top: "0.875rem",
  },
  body: {
    position: "relative",
    height: "min(20rem, 56dvh)",
  },
  list: {
    padding: spacing["1.5"],
    scrollPaddingBlock: spacing["1.5"],
    height: "100%",
    maxHeight: "none",
  },
  group: {
    paddingBlock: 0,
  },
  groupLabel: {
    paddingBlock: spacing["1.5"],
    paddingInline: spacing["3"],
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
  },
  item: {
    borderRadius: radius.md,
    gap: spacing["3"],
    paddingBlock: spacing["1"],
    paddingInline: spacing["3"],
    minHeight: "2rem",
    transitionDuration: {
      default: motion.durationFast,
      [media.reducedMotion]: "0s",
    },
    transitionProperty: "background-color",
  },
  text: {
    gap: spacing["2"],
    alignItems: "baseline",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    flexShrink: 0,
    fontWeight: typography.fontWeightMedium,
    whiteSpace: "nowrap",
  },
  description: {
    flexShrink: 1,
    minWidth: 0,
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    lineHeight: typography.lineHeightXs,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  mark: {
    backgroundColor: "transparent",
    color: "inherit",
    fontWeight: typography.fontWeightSemibold,
  },
  kind: {
    color: colors.mutedForeground,
    display: {
      default: "none",
      [screens.md]: { default: "block", [stylex.when.ancestor(highlighted)]: "none" },
    },
    flexShrink: 0,
    fontSize: typography.fontSizeXs,
  },
  enter: {
    display: { default: "none", [stylex.when.ancestor(highlighted)]: "inline-flex" },
    flexShrink: 0,
  },
  empty: {
    inset: 0,
    gap: spacing["1.5"],
    alignItems: "center",
    color: colors.mutedForeground,
    display: { default: "flex", ":empty": "none" },
    flexDirection: "column",
    justifyContent: "center",
    position: "absolute",
    paddingInline: spacing["6"],
    fontSize: typography.fontSizeSm,
    textAlign: "center",
  },
  emptyIcon: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "flex",
    height: "2.5rem",
    justifyContent: "center",
    marginBottom: spacing["2"],
    width: "2.5rem",
  },
  emptyTitle: {
    color: colors.foreground,
    fontWeight: typography.fontWeightMedium,
  },
  footer: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    gap: spacing["4"],
    paddingBlock: spacing["2.5"],
    paddingInline: spacing["4"],
    alignItems: "center",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    display: { default: "none", [screens.md]: "flex" },
    fontSize: typography.fontSizeXs,
  },
  hint: {
    gap: spacing["1"],
    alignItems: "center",
    display: "inline-flex",
  },
  brand: {
    fontWeight: typography.fontWeightMedium,
    marginInlineStart: "auto",
  },
});
