"use client";

import * as stylex from "@stylexjs/stylex";
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { colors, radius, spacing } from "@/styles/shelf/tokens.stylex";
import { screens } from "@/styles/site.stylex";

// The results and their index load on first open; the header paints without them.
const SearchPalette = dynamic(() => import("./search-palette").then((m) => m.SearchPalette));

/** The header's search field, and the ⌘K / Ctrl K shortcut that opens the same palette. */
export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  // Stay mounted after the first open so the dialog can animate out.
  const [used, setUsed] = useState(false);
  const modifier = useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"),
    () => "⌘",
  );

  function show(next: boolean) {
    setOpen(next);
    if (next) setUsed(true);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((current) => !current);
      setUsed(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Search documentation"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => show(true)}
        style={styles.trigger}
      >
        <SearchIcon />
        <span {...stylex.props(styles.label)}>Search documentation…</span>
        <Kbd aria-hidden style={styles.kbd}>
          {modifier}
          {modifier === "Ctrl" ? " K" : "K"}
        </Kbd>
      </Button>
      {used && <SearchPalette open={open} onOpenChange={show} />}
    </>
  );
}

const styles = stylex.create({
  trigger: {
    borderRadius: radius.full,
    gap: spacing["2"],
    color: colors.mutedForeground,
    justifyContent: { default: "center", [screens.md]: "flex-start" },
    width: { default: null, [screens.md]: "15rem" },
  },
  label: {
    display: { default: "none", [screens.md]: "inline" },
    flexGrow: 1,
    textAlign: "start",
  },
  kbd: {
    display: { default: "none", [screens.md]: "inline-flex" },
  },
});
