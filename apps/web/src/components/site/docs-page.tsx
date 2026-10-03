import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageActions } from "./page-actions";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

export function PageHeader({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** The page's route. Pages with a generated Markdown version pass it, to show the copy actions. */
  path?: string;
}) {
  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.titleRow)}>
        <h1 {...stylex.props(styles.title)}>{title}</h1>
        {path && <PageActions path={path} />}
      </div>
      <p {...stylex.props(styles.lead)}>{description}</p>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return (
    <section aria-labelledby={id} {...stylex.props(styles.section)}>
      <h2 id={id} {...stylex.props(styles.heading)}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The `##` heading of a Markdown page: a Section title without the wrapping element. */
export function Heading({ children }: { children?: ReactNode }) {
  const id = typeof children === "string" ? children.toLowerCase().replaceAll(" ", "-") : undefined;
  return (
    <h2 id={id} {...stylex.props(styles.heading, styles.headingGap)}>
      {children}
    </h2>
  );
}

/** The column a Markdown page's blocks sit in. */
export function Article({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.article)}>{children}</div>;
}

export function BulletList({ children }: { children: ReactNode }) {
  return <ul {...stylex.props(styles.bullets)}>{children}</ul>;
}

export function Prose({ children }: { children: ReactNode }) {
  return <p {...stylex.props(styles.prose)}>{children}</p>;
}

export function Code({ children }: { children: ReactNode }) {
  return <code {...stylex.props(styles.code)}>{children}</code>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} {...stylex.props(styles.link)}>
      {children}
    </Link>
  );
}

/** Terms and what they mean, such as commands, checks, or measurements. */
export function Definitions({ items }: { items: { term: ReactNode; text: ReactNode }[] }) {
  return (
    <dl {...stylex.props(styles.list)}>
      {items.map((item, index) => (
        <div key={index} {...stylex.props(styles.row)}>
          <dt {...stylex.props(styles.term)}>{item.term}</dt>
          <dd {...stylex.props(styles.definition)}>{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}

const styles = stylex.create({
  header: {
    gap: spacing["4"],
    display: "grid",
    marginBottom: { default: site.space10, [screens.md]: site.space16 },
  },
  titleRow: {
    gap: spacing["4"],
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    fontSize: { default: site.fontSize3xl, [screens.md]: site.fontSize5xl },
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
    margin: 0,
  },
  lead: {
    color: colors.mutedForeground,
    fontSize: { default: site.fontSizeXl, [screens.md]: site.fontSize2xl },
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
    margin: 0,
    maxWidth: site.proseWidth,
    textWrap: "pretty",
  },
  section: {
    gap: spacing["6"],
    display: "grid",
    marginTop: { default: site.space12, [screens.md]: site.space16 },
  },
  heading: {
    fontSize: site.fontSize2xl,
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
    margin: 0,
  },
  article: {
    gap: spacing["6"],
    display: "grid",
  },
  headingGap: {
    marginTop: { default: site.space8, [screens.md]: site.space12 },
  },
  bullets: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeLg,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: site.proseWidth,
    paddingInlineStart: spacing["6"],
    rowGap: spacing["2"],
    display: "grid",
  },
  prose: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeLg,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: site.proseWidth,
    textWrap: "pretty",
  },
  code: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.9em",
  },
  link: {
    color: colors.foreground,
    textDecorationColor: colors.border,
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
  },
  list: {
    display: "grid",
    margin: 0,
    maxWidth: "48rem",
  },
  row: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    columnGap: spacing["6"],
    display: "grid",
    gridTemplateColumns: { default: "1fr", [screens.md]: "14rem minmax(0, 1fr)" },
    paddingBlock: spacing["4"],
    rowGap: spacing["1"],
  },
  term: {
    color: colors.foreground,
    fontSize: typography.fontSizeBase,
    lineHeight: 1.6,
  },
  definition: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeBase,
    lineHeight: 1.6,
    margin: 0,
  },
});
