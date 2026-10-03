"use client";

import * as stylex from "@stylexjs/stylex";
import { SidebarNested } from "@/components/blocks/sidebar-nested";
import { colors, radius, spacing } from "@/styles/shelf/tokens.stylex";

export default function SidebarNestedDemo() {
  return (
    <SidebarNested page="Drafts">
      <div {...stylex.props(styles.grid)}>
        <div {...stylex.props(styles.panel)} />
        <div {...stylex.props(styles.panel)} />
        <div {...stylex.props(styles.panel)} />
      </div>
      <div {...stylex.props(styles.panel, styles.wide)} />
    </SidebarNested>
  );
}

const styles = stylex.create({
  grid: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
  },
  panel: {
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    minHeight: "8rem",
  },
  wide: {
    flexGrow: 1,
    minHeight: "20rem",
  },
});
