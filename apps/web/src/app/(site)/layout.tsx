import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { WebMcp } from "@/components/site/web-mcp";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <WebMcp />
      <SiteHeader />
      <div {...stylex.props(styles.main)}>{children}</div>
      <SiteFooter />
    </>
  );
}

const styles = stylex.create({
  main: {
    flexGrow: 1,
  },
});
