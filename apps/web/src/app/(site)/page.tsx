import * as stylex from "@stylexjs/stylex";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Faq } from "@/components/home/faq";
import { DriftArt, GraphArt, SourceArt, TrackedArt } from "@/components/home/illustrations";
import { AddMock, ChangeMock, CheckMock, StatusMock } from "@/components/home/mocks";
import { Diagram } from "@/components/site/diagram";
import { FeatureTiles } from "@/components/site/feature-tiles";
import { GetStarted } from "@/components/site/get-started";
import { Headline } from "@/components/site/headline";
import { Stack } from "@/components/site/stack";
import { agentSession, registry, threeWay } from "@/docs/diagrams";
import { siteConfig } from "@/site";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

const PILLARS = [
  {
    title: "Consistent by default",
    text: "Every product installs the same source on the same tokens. Files nobody edited stay identical and update as-is.",
    art: <GraphArt />,
  },
  {
    title: "Change without waiting",
    text: "Most changes are small: spacing, a color, a variant. A product edits the style in its copy, not an override that breaks on the next upgrade.",
    art: <SourceArt />,
  },
  {
    title: "Every change is visible",
    text: "shelf status shows what a product changed. shelf usage shows it across all your products.",
    art: <TrackedArt />,
  },
  {
    title: "Edited copies still update",
    text: "shelf update merges upstream fixes into files you changed. Only overlapping edits conflict.",
    art: <DriftArt />,
  },
];

const WORKFLOW = [
  {
    title: "Add",
    text: "shelf add copies the source, the items it depends on, and installs its packages.",
    mock: <AddMock />,
  },
  {
    title: "Change",
    text: "Adjust spacing, color, or markup where it is defined. It is a normal file in your repository.",
    mock: <ChangeMock />,
  },
  {
    title: "Review",
    text: "shelf status and shelf diff show what you changed and what is new upstream.",
    mock: <StatusMock />,
  },
  {
    title: "Check",
    text: "shelf check confirms the install is intact. A failure names the file and the fix.",
    mock: <CheckMock />,
  },
];

const AUDIENCES: { title: string; headline: string; text: string; href: string; note?: string }[] =
  [
    {
      title: "System teams",
      headline: "Own the foundations, not every product's UI.",
      text: "Publish to one registry and see which products use each item, and which changed it.",
      href: "/docs/philosophy",
    },
    {
      title: "Product engineers",
      headline: "Edit the style, not an override.",
      text: "Adjust spacing, color, or a variant in the component itself, and keep taking updates.",
      href: "/docs/installation",
    },
    {
      title: "Coding agents",
      headline: "Work from the source, not the docs.",
      text: "Commands with stable output and failures that say what to run.",
      href: "/docs/agents",
    },
    {
      title: "Designers",
      headline: "Design with what ships.",
      text: "Work in the real components, in the browser or in code. Want Figma? A plugin builds a native library from the same source.",
      href: "/docs/figma",
      note: "Figma: early",
    },
  ];

export default function Home() {
  return (
    <main {...stylex.props(styles.page)}>
      <section {...stylex.props(styles.hero)}>
        <Headline as="h1" size="display" strong="The design system every product owns." />
        <p {...stylex.props(styles.heroLead)}>{siteConfig.lead}</p>
        <div {...stylex.props(styles.actions)}>
          <GetStarted size="lg" />
          <GetStarted
            size="lg"
            variant="secondary"
            href="/docs/components"
            label="Browse components"
          />
        </div>
        <Stack />
      </section>

      <FeatureTiles items={PILLARS} />

      <Split
        id="workflow"
        label="Workflow"
        strong="Add it. Change it."
        muted="Check it."
        lead="Four steps, each one command. Everything else is normal code."
      >
        <ul {...stylex.props(styles.grid, styles.features)}>
          {WORKFLOW.map((item) => (
            <li key={item.title} {...stylex.props(styles.feature)}>
              <div {...stylex.props(styles.stage)}>{item.mock}</div>
              <div {...stylex.props(styles.caption)}>
                <h3 {...stylex.props(styles.title)}>{item.title}</h3>
                <p {...stylex.props(styles.text)}>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Split>

      <Split
        id="provenance"
        label="Provenance"
        strong="Diverge"
        muted="without drifting"
        lead="A package can't be edited. A copy can't be updated. Shelf does both. It knows the version every copy started from, so an update is a three-way merge, not a rewrite."
        action={<More href="/docs/ownership">Ownership and provenance</More>}
      >
        <div {...stylex.props(styles.pair)}>
          <Diagram title={threeWay.title} label={threeWay.label}>
            {threeWay.art}
          </Diagram>
          <Statement>
            Untouched files update. Edited files merge. Overlapping edits get standard conflict
            markers.
          </Statement>
        </div>
      </Split>

      <Split
        id="agents"
        label="Agents"
        strong="Agents guess."
        muted="Give them the source."
        lead="They read the file that renders, the revision, and the check. Not a PDF. shelf search finds what exists, and shelf check says what to fix."
        action={
          <div {...stylex.props(styles.moreRow)}>
            <More href="/docs/agents">Shelf for agents</More>
            <More href="/docs/future">Where this goes</More>
          </div>
        }
      >
        <div {...stylex.props(styles.pair)}>
          <Diagram title={agentSession.title} label={agentSession.label}>
            {agentSession.art}
          </Diagram>
          <Statement>A real session: find, add, change, check.</Statement>
        </div>
      </Split>

      <Split
        id="registry"
        label="Registry"
        strong="One registry"
        muted="for every product"
        lead="The system team publishes components, blocks, and foundations as plain files on any static host, public or behind sign-in. No Shelf cloud, no accounts. Delete Shelf and your code stays."
        action={
          <div {...stylex.props(styles.moreRow)}>
            <More href="/registry">See the registry</More>
            <More href="/docs/registry">How registries work</More>
          </div>
        }
      >
        <div {...stylex.props(styles.pair)}>
          <Diagram title={registry.title} label={registry.label}>
            {registry.art}
          </Diagram>
          <Statement>
            Browse every item with its source, revisions, previews, and the products that use it.
          </Statement>
        </div>
      </Split>

      <Split
        id="audiences"
        label="Who it's for"
        strong="Shared foundations"
        muted="owned implementations"
        lead="The system team owns tokens, accessibility, and defaults. Product teams own what they ship. Both work from the same registry."
      >
        <ul {...stylex.props(styles.grid)}>
          {AUDIENCES.map((audience) => (
            <li key={audience.title} {...stylex.props(styles.item)}>
              <Link href={audience.href} {...stylex.props(styles.tile, styles.audience)}>
                <div {...stylex.props(styles.audienceHead)}>
                  <span {...stylex.props(styles.eyebrow)}>{audience.title}</span>
                  {audience.note && <span {...stylex.props(styles.note)}>{audience.note}</span>}
                </div>
                <div {...stylex.props(styles.caption)}>
                  <h3 {...stylex.props(styles.title)}>{audience.headline}</h3>
                  <p {...stylex.props(styles.text)}>{audience.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Split>

      <Split
        id="themes"
        label="Themes"
        strong="Your brand"
        muted="from one set of tokens"
        lead="Components read semantic tokens for color, radius, and type. Pick a preset, then edit one file to match your brand, in light and dark."
      />

      <Split
        id="faq"
        label="FAQ"
        strong="Questions"
        muted="teams ask first"
        lead="Drift, updates, hosting, and what happens if you leave."
        action={<Faq />}
      />

      <section aria-labelledby="start" {...stylex.props(styles.closing)}>
        <Headline id="start" strong="Consistent by default. Yours when needed." align="center" />
        <GetStarted size="lg" />
      </section>
    </main>
  );
}

/** A section: a label, then a heading and lead, then whatever shows it. */
function Split({
  id,
  label,
  strong,
  muted,
  lead,
  action,
  children,
}: {
  id: string;
  label: string;
  strong: string;
  muted: string;
  lead: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={id} {...stylex.props(styles.split)}>
      <div {...stylex.props(styles.intro)}>
        <p {...stylex.props(styles.label)}>{label}</p>
        <div {...stylex.props(styles.introBody)}>
          <Headline id={id} strong={strong} muted={muted} />
          <p {...stylex.props(styles.lead)}>{lead}</p>
          {action && <div>{action}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Statement({ children }: { children: ReactNode }) {
  return (
    <div {...stylex.props(styles.statement)}>
      <p {...stylex.props(styles.statementText)}>{children}</p>
    </div>
  );
}

function More({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} {...stylex.props(styles.more)}>
      {children}
      <ArrowRightIcon />
    </Link>
  );
}

const styles = stylex.create({
  page: {
    marginInline: "auto",
    maxWidth: site.pageWidth,
    paddingInline: site.gutter,
  },
  hero: {
    gap: site.space12,
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    paddingBottom: { default: site.space16, [screens.md]: "8rem" },
    paddingTop: { default: site.space12, [screens.md]: "8rem" },
  },
  heroLead: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: { default: site.fontSizeXl, [screens.md]: site.fontSize2xl },
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
    maxWidth: "44rem",
    textWrap: "pretty",
  },
  actions: {
    gap: spacing["3"],
    display: "flex",
    flexWrap: "wrap",
  },
  grid: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [screens.md]: "repeat(2, minmax(0, 1fr))",
      [screens.xl]: "repeat(4, minmax(0, 1fr))",
    },
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  item: {
    display: "grid",
  },
  tile: {
    gap: site.space10,
    backgroundColor: colors.card,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    padding: { default: spacing["6"], [screens.md]: site.space12, [screens.xl]: site.space10 },
  },
  caption: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: site.fontSize2xl,
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
  },
  text: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: {
      default: typography.fontSizeLg,
      [screens.md]: site.fontSizeXl,
      [screens.xl]: typography.fontSizeLg,
    },
    lineHeight: 1.375,
    maxWidth: "30rem",
    textWrap: "pretty",
  },
  features: {
    rowGap: site.space16,
  },
  feature: {
    gap: site.space8,
    display: "flex",
    flexDirection: "column",
  },
  stage: {
    alignItems: "center",
    backgroundColor: colors.card,
    display: "flex",
    justifyContent: "center",
    minHeight: "14rem",
    padding: spacing["6"],
  },

  audience: {
    justifyContent: "space-between",
    minHeight: { default: null, [screens.md]: "20rem" },
    textDecoration: "none",
    backgroundColor: {
      default: colors.card,
      [media.hover]: { default: colors.card, ":hover": colors.muted },
    },
  },
  audienceHead: {
    gap: spacing["3"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  eyebrow: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeBase,
  },
  note: {
    borderColor: colors.border,
    borderRadius: 999,
    borderStyle: "solid",
    borderWidth: 1,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    paddingBlock: spacing["1"],
    paddingInline: spacing["3"],
  },
  split: {
    gap: { default: site.space12, [screens.md]: "6rem" },
    display: "flex",
    flexDirection: "column",
    paddingTop: { default: "6rem", [screens.md]: "12rem" },
  },
  intro: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: { default: "1fr", [screens.md]: "repeat(2, minmax(0, 1fr))" },
    rowGap: site.space8,
  },
  label: {
    margin: 0,
    color: colors.foreground,
    fontSize: { default: site.fontSize3xl, [screens.md]: site.fontSize5xl },
    letterSpacing: "-0.03em",
    lineHeight: 1.25,
  },
  introBody: {
    gap: site.space12,
    display: "flex",
    flexDirection: "column",
  },
  lead: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: { default: site.fontSizeXl, [screens.md]: site.fontSize3xl },
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
    textWrap: "pretty",
  },
  pair: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: { default: "1fr", [screens.lg]: "repeat(2, minmax(0, 1fr))" },
  },
  statement: {
    alignItems: "center",
    backgroundColor: colors.card,
    display: "flex",
    padding: { default: spacing["6"], [screens.md]: site.space16 },
  },
  statementText: {
    margin: 0,
    color: colors.foreground,
    fontSize: { default: site.fontSizeXl, [screens.md]: site.fontSize2xl },
    lineHeight: 1.375,
    maxWidth: "24rem",
  },
  moreRow: {
    columnGap: spacing["6"],
    display: "flex",
    flexWrap: "wrap",
    rowGap: spacing["3"],
  },
  more: {
    gap: spacing["2"],
    alignItems: "center",
    borderBottomColor: "currentColor",
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    color: colors.foreground,
    display: "inline-flex",
    fontSize: typography.fontSizeLg,
    paddingBottom: spacing["1"],
    textDecoration: "none",
    opacity: { default: 1, [media.hover]: { default: null, ":hover": 0.7 } },
  },
  closing: {
    gap: site.space12,
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingBlock: { default: "8rem", [screens.md]: "14rem" },
  },
});
