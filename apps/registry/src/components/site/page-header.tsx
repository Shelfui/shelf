import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

/** A page's large heading, a muted lead, and anything that belongs with them. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header {...stylex.props(styles.header)}>
      {eyebrow && <div {...stylex.props(styles.eyebrow)}>{eyebrow}</div>}
      <h1 {...stylex.props(styles.title)}>{title}</h1>
      {lead && <p {...stylex.props(styles.lead)}>{lead}</p>}
      {children && <div {...stylex.props(styles.extra)}>{children}</div>}
    </header>
  );
}

const styles = stylex.create({
  header: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["4"],
    paddingBottom: site.space12,
    paddingTop: { default: site.space8, [screens.md]: site.space16 },
  },
  eyebrow: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: typography.fontSizeSm,
    gap: spacing["2"],
  },
  title: {
    color: colors.foreground,
    fontSize: { default: site.fontSize3xl, [screens.md]: site.fontSize5xl },
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    margin: 0,
    overflowWrap: "anywhere",
    textWrap: "balance",
  },
  lead: {
    color: colors.mutedForeground,
    fontSize: site.fontSizeXl,
    letterSpacing: "-0.01em",
    lineHeight: site.lineHeightXl,
    margin: 0,
    textWrap: "pretty",
  },
  extra: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: spacing["2"],
    paddingTop: spacing["2"],
  },
});
