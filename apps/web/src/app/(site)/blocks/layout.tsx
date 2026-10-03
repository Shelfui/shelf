import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { BlockNav } from "@/components/site/block-nav";
import { PageHeader } from "@/components/site/docs-page";
import { colors, spacing } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

export default function BlocksLayout({ children }: { children: ReactNode }) {
  return (
    <main {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.intro)}>
        <PageHeader
          title="Blocks"
          description="Finished pieces of a page, composed from Shelf components. Add one, then make it yours."
        />
        <BlockNav />
      </div>
      {children}
    </main>
  );
}

const styles = stylex.create({
  main: {
    marginInline: "auto",
    maxWidth: site.pageWidth,
    paddingBottom: "8rem",
    paddingInline: site.gutter,
    paddingTop: { default: site.space10, "@media (min-width: 768px)": "5rem" },
  },
  intro: {
    gap: spacing["6"],
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    display: "grid",
    marginBottom: { default: site.space10, "@media (min-width: 768px)": site.space12 },
    paddingBottom: spacing["4"],
  },
});
