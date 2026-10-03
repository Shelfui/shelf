import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/site/docs-sidebar";
import { site } from "@/styles/site.stylex";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div {...stylex.props(styles.root)}>
      <DocsSidebar />
      <main {...stylex.props(styles.main)}>
        <p {...stylex.props(styles.agents)}>
          For AI agents: the documentation index is at /llms.txt, and any docs page is available as
          Markdown by appending .md to its URL.
        </p>
        {children}
      </main>
    </div>
  );
}

const styles = stylex.create({
  agents: {
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
  },
  root: {
    gap: { default: site.space10, "@media (min-width: 1024px)": "5rem" },
    display: "flex",
    marginInline: "auto",
    maxWidth: site.pageWidth,
    paddingInline: site.gutter,
  },
  main: {
    flexGrow: 1,
    maxWidth: "64rem",
    minWidth: 0,
    paddingBottom: "8rem",
    paddingTop: { default: site.space10, "@media (min-width: 768px)": "5rem" },
  },
});
