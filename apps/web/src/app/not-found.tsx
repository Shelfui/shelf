import * as stylex from "@stylexjs/stylex";
import { LinkButton } from "@/components/site/link-button";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main {...stylex.props(styles.root)}>
        <h1 {...stylex.props(styles.title)}>Page not found</h1>
        <p {...stylex.props(styles.text)}>That page isn&apos;t on the shelf.</p>
        <LinkButton href="/docs/components">Browse components</LinkButton>
      </main>
      <SiteFooter />
    </>
  );
}

const styles = stylex.create({
  root: {
    flexGrow: 1,
    gap: spacing["4"],
    alignItems: "center",
    display: "grid",
    justifyItems: "center",
    paddingBlock: site.space24,
    paddingInline: spacing["6"],
    textAlign: "center",
  },
  title: {
    fontSize: site.fontSize3xl,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.025em",
    margin: 0,
  },
  text: { color: colors.mutedForeground, margin: 0 },
});
