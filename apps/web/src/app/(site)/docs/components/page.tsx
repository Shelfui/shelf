import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/docs-page";
import { components } from "@/docs/components";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

export const metadata: Metadata = {
  title: "Components",
  description: "Every Shelf component, with a live preview, its source, and the command to add it.",
  alternates: { canonical: "/docs/components" },
};

export default function ComponentsIndex() {
  return (
    <>
      <PageHeader
        title="Components"
        description={`${components.length} accessible components, each one command away.`}
      />
      <ul {...stylex.props(styles.grid)}>
        {components.map((component) => (
          <li key={component.name} {...stylex.props(styles.item)}>
            <Link href={`/docs/components/${component.name}`} {...stylex.props(styles.card)}>
              <span {...stylex.props(styles.title)}>{component.title}</span>
              <span {...stylex.props(styles.description)}>{component.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

const styles = stylex.create({
  grid: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  item: {
    display: "grid",
  },
  card: {
    gap: spacing["2"],
    alignContent: "end",
    backgroundColor: {
      default: colors.card,
      [media.hover]: { default: null, ":hover": colors.muted },
    },
    borderRadius: radius.lg,
    color: colors.cardForeground,
    display: "grid",
    minHeight: "11rem",
    padding: spacing["6"],
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color",
  },
  title: {
    fontSize: site.fontSizeXl,
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightBase,
    textWrap: "pretty",
  },
});
