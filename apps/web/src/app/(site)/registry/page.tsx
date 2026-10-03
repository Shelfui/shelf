import * as stylex from "@stylexjs/stylex";
import { ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { BrowseArt, DriftArt, GraphArt, ReadArt } from "@/components/home/illustrations";
import { CodeBlock } from "@/components/site/code-block";
import { FeatureTiles } from "@/components/site/feature-tiles";
import { Headline } from "@/components/site/headline";
import { LinkButton } from "@/components/site/link-button";
import { UsageDemo } from "@/components/site/usage-demo";
import { acmeUsage } from "@/demos/usage";
import { components } from "@/docs/components";
import { siteConfig } from "@/site";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

export const metadata: Metadata = {
  title: "Registry",
  description:
    "A component registry for people and agents: every component, block, and foundation with previews and source, and a tracked graph of where each is installed and which copies are behind.",
  alternates: { canonical: "/registry" },
};

const DEPLOY = `on:
  schedule: [{ cron: "0 6 * * *" }]
  push: { branches: [main] }

jobs:
  registry:
    runs-on: ubuntu-latest
    environment: github-pages
    permissions: { contents: read, pages: write, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx shelf usage --github acme --registry registry --json > usage.json
        env: { GH_TOKEN: "\${{ secrets.SHELF_USAGE_TOKEN }}" }
      - run: bunx storybook build --output-dir storybook-static
      - run: bunx shelf build registry --out dist --storybook storybook-static --usage usage.json
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4`;

const FEATURES = [
  {
    title: "For people",
    text: "Browse every item, preview each variant, and read its source and history.",
    art: <BrowseArt />,
  },
  {
    title: "For agents",
    text: "llms.txt and JSON for every item, so agents find what exists before they build it.",
    art: <ReadArt />,
  },
  {
    title: "Every install tracked",
    text: "Lockfiles and imports show which projects use each item, across all your repos.",
    art: <GraphArt />,
  },
  {
    title: "Drift in view",
    text: "See which copies are behind the registry, and which were changed locally.",
    art: <DriftArt />,
  },
];

export default function RegistryPage() {
  const projects = acmeUsage.usage.projects.length;
  const namespaces = new Set(acmeUsage.usage.projects.map((project) => project.namespace)).size;

  return (
    <div {...stylex.props(styles.page)}>
      <section {...stylex.props(styles.hero)}>
        <Headline as="h1" size="display" strong="Every item" muted="and where it's used" />
        <p {...stylex.props(styles.heroLead)}>
          A component registry for people and agents. Every component, block, and foundation, with
          previews and source. Each install is tracked, so the graph shows which projects use what,
          which copies are behind, and which were changed.
        </p>
        <div {...stylex.props(styles.actions)}>
          <LinkButton href={siteConfig.registryUrl} size="lg">
            Open the live registry
            <ArrowUpRightIcon />
          </LinkButton>
          <LinkButton href="/docs/registry" size="lg" variant="secondary">
            Docs
          </LinkButton>
        </div>
      </section>

      <section aria-label="Usage demo" {...stylex.props(styles.demoSection)}>
        <div {...stylex.props(styles.demo)}>
          <UsageDemo
            snapshot={acmeUsage}
            documented={components.map((component) => component.name)}
          />
        </div>
        <p {...stylex.props(styles.caption)}>
          Example data: {projects} projects in {namespaces} teams. Drift shows how far behind each
          copy is, Graph shows which projects use which components, and Flow traces items from the
          registry through shared packages into apps.
        </p>
      </section>

      <section aria-labelledby="audiences" {...stylex.props(styles.section)}>
        <Headline id="audiences" strong="For people" muted="and agents" />
        <FeatureTiles items={FEATURES} />
      </section>

      <section aria-labelledby="deploy" {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.intro)}>
          <Headline id="deploy" strong="Track usage" muted="across your GitHub" />
          <p {...stylex.props(styles.lead)}>
            One scheduled job finds every repo in your organization with a shelf.config.json, reads
            its lockfile and imports, and publishes the site as static files. Product teams add
            nothing, and the token only needs read access.
          </p>
        </div>
        <div {...stylex.props(styles.code)}>
          <CodeBlock code={DEPLOY} lang="yaml" title=".github/workflows/registry.yml" />
        </div>
      </section>
    </div>
  );
}

const styles = stylex.create({
  page: {
    marginInline: "auto",
    maxWidth: site.pageWidth,
    paddingBottom: site.space24,
    paddingInline: site.gutter,
  },
  hero: {
    gap: site.space12,
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    paddingBottom: { default: site.space12, [screens.md]: site.space16 },
    paddingTop: { default: site.space12, [screens.md]: site.space24 },
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
  demoSection: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    paddingBottom: { default: site.space16, [screens.md]: site.space24 },
  },
  caption: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
  section: {
    gap: site.space8,
    display: "flex",
    flexDirection: "column",
    paddingBottom: { default: site.space16, [screens.md]: site.space24 },
  },
  intro: {
    gap: spacing["4"],
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  lead: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: site.fontSizeXl,
    letterSpacing: "-0.01em",
    lineHeight: 1.5,
    maxWidth: "44rem",
    textWrap: "pretty",
  },
  demo: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    padding: { default: spacing["4"], [screens.md]: site.space8 },
  },
  code: {
    minWidth: 0,
  },
});
