import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Diagram } from "@/components/site/diagram";
import {
  Code,
  Definitions,
  PageHeader,
  Prose,
  Section,
  TextLink,
} from "@/components/site/docs-page";
import { registry } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Registry",
  description:
    "Where Shelf items come from: a folder of JSON and source that every product adds from and stays tracked against.",
  alternates: { canonical: "/docs/registry" },
};

const LAYOUT = `registry/
├── index.json
├── blocks/
│   └── login-form/
├── patterns/
│   └── confirm-dialog/
├── templates/
│   └── settings-page/
├── components/
│   ├── button/
│   │   ├── registry.json
│   │   ├── button.tsx
│   │   └── button.stories.tsx
│   └── dialog/
│       ├── registry.json
│       └── dialog.tsx
├── foundations/
└── lib/`;

const ITEM = `{
  "name": "dialog",
  "type": "component",
  "description": "A modal window composed from Root, Trigger, Content, ...",
  "files": [{ "path": "dialog.tsx" }],
  "dependencies": {
    "@base-ui/react": "^1.8.0",
    "@stylexjs/stylex": "^0.19.1"
  },
  "shelfDependencies": ["button", "foundations", "icons", "utils"]
}`;

const SYNC = `$ shelf add button
Shelf

✓ button is up to date (revision f79cc395084a)

Nothing changed.`;

const PUBLISH = `permissions:
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx storybook build
      - run: bunx shelf usage apps --registry registry --json > usage.json
      - run: >
          bunx shelf build registry --out dist/registry
          --storybook storybook-static --usage usage.json
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/registry
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4`;

const USAGE = `$ shelf usage apps/onboarding apps/bill-pay packages/ui --registry registry
Shelf usage

growth/onboarding  (apps/onboarding @ 612592c)
  7 items, 6 used, 1 unused, 2 updates
  ↑ button: update available. Run: shelf update button (in apps/onboarding)
  ↑ foundations: update available. Run: shelf update foundations (in apps/onboarding)
  - skeleton: installed, not imported

payments/bill-pay  (apps/bill-pay @ 612592c)
  6 items, 6 used
  uses from platform/ui: button, card, dialog, input

platform/ui  (packages/ui @ 612592c)
  8 items, 7 used, 1 unused
  - tabs: installed, not imported

3 projects. For the full graph: shelf usage --json`;

const REPOS = `- run: bunx shelf usage --github acme --registry registry --json > usage.json
  env:
    GH_TOKEN: \${{ secrets.SHELF_USAGE_TOKEN }}`;

const FORMAT = `{
  "ignorePatterns": [".shelf/**", "src/components/ui/**", "src/components/blocks/**"]
}`;

const PRIVATE = `{
  "registry": {
    "url": "https://ui.example.com/registry",
    "headers": { "Authorization": "Bearer \${SHELF_REGISTRY_TOKEN}" }
  }
}`;

export default function Registry() {
  return (
    <>
      <PageHeader
        title="Registry"
        description="Where the system team publishes, and every product adds from. Plain files on any static host."
      />
      <Prose>
        A registry holds components, blocks, foundations, and the helpers they share. The system
        team publishes to it and products add from it. Each product records the revision it
        installed, so the team can see who is behind, and each product can see what changed
        upstream.
      </Prose>
      <Diagram title={registry.title} label={registry.label}>
        {registry.art}
      </Diagram>

      <Section title="What's in a registry">
        <Prose>
          Plain files, no database and no service. <Code>index.json</Code> lists every item, and
          each item is a folder with a <Code>registry.json</Code> and its source.
        </Prose>
        <Diagram title="layout" label="A registry folder: index.json, then one folder per item.">
          {LAYOUT}
        </Diagram>
        <CodeBlock code={ITEM} lang="json" title="components/dialog/registry.json" />
        <Definitions
          items={[
            {
              term: <Code>type</Code>,
              text: "component, pattern, block, template, foundation, or lib. It decides where the files go.",
            },
            {
              term: <Code>files</Code>,
              text: "The source that gets copied. Stories and tests stay behind.",
            },
            { term: <Code>dependencies</Code>, text: "Packages that shelf add installs." },
            {
              term: <Code>shelfDependencies</Code>,
              text: "Other items it builds on, added with it the first time.",
            },
            {
              term: <Code>figma</Code>,
              text: "Optional. A figma.com link to the item's design. The registry site shows Open in Figma; it doesn't change the revision.",
            },
          ]}
        />
      </Section>

      <Section title="Blocks">
        <Prose>
          A block composes components into a finished piece of a page, such as a login form or an
          app shell. It is an item like any other: <Code>shelf add login-form</Code> adds the
          components it uses, then writes the block to <Code>paths.blocks</Code>, which defaults to{" "}
          <Code>src/components/blocks</Code>. Its imports point at your copies of those components.
          See <TextLink href="/blocks">Blocks</TextLink>.
        </Prose>
      </Section>

      <Section title="Patterns and templates">
        <Prose>
          A pattern is an interaction built from components, such as a confirmation that shows a
          pending state. A template is a whole page, such as a settings page. They are items like
          blocks: <Code>shelf add settings-page</Code> adds the blocks, patterns, and components it
          uses, then writes the template to <Code>paths.templates</Code>, which defaults to{" "}
          <Code>src/components/templates</Code>. Patterns go to <Code>paths.patterns</Code>,{" "}
          <Code>src/components/patterns</Code> by default. See{" "}
          <TextLink href="/blocks/patterns">Patterns</TextLink> and{" "}
          <TextLink href="/blocks/templates">Templates</TextLink>.
        </Prose>
      </Section>

      <Section title="Helping people and agents choose">
        <Prose>
          Each entry in <Code>index.json</Code> can add <Code>keywords</Code>, <Code>useWhen</Code>,{" "}
          <Code>avoidWhen</Code>, and <Code>related</Code>. <Code>shelf search</Code> ranks with
          them, <Code>shelf docs</Code> prints them, and <Code>llms.txt</Code> lists them. They
          never change an item&apos;s revision.
        </Prose>
      </Section>

      <Section title="Revisions">
        <Prose>
          A revision is a hash of an item&apos;s files and dependencies, computed by Shelf. Change a
          line and the item has a new revision; there is nothing to bump by hand. Every product
          records the revision it installed in <Code>.shelf/lock.json</Code>.
        </Prose>
      </Section>

      <Section title="Staying in sync">
        <Prose>
          <Code>shelf status</Code> shows which installed items have a newer revision, and{" "}
          <Code>shelf update</Code> brings them up to date. When the revision hasn&apos;t changed,
          nothing happens. When it has, files you haven&apos;t touched take the new version, files
          only you changed stay yours, and files you and Shelf both changed are merged, with
          conflict markers where you both changed the same lines. Pass <Code>--overwrite</Code> to
          take Shelf&apos;s version instead.
        </Prose>
        <Diagram title="terminal" label="shelf add button when the product is already up to date.">
          {SYNC}
        </Diagram>
        <Prose>
          Items a component builds on, such as foundations, stay as they are when you add something
          else. Shelf says when a newer version exists and which command updates it. See ownership
          and provenance for every case.
        </Prose>
      </Section>

      <Section title="Hosting">
        <Prose>
          Point <Code>registry</Code> in <Code>shelf.config.json</Code> at a directory or an http(s)
          URL. To publish, build it once and upload the output to any static host.
        </Prose>
        <CodeBlock
          code={"shelf build registry --out dist/registry\nshelf serve dist/registry"}
          lang="bash"
        />
        <Prose>
          <Code>build</Code> validates every item the way <Code>add</Code> reads it, then writes
          only the files that install. It also writes <Code>revisions/</Code>: every revision the
          items have had in git history, so a product can always get back the exact version it
          installed. Build from a full clone; a shallow one only has today&apos;s revisions.
        </Prose>
      </Section>

      <Section title="Shelf Registry">
        <Prose>
          The same build is also a site. Open the registry URL in a browser to browse every item
          with its source, revisions, and Storybook previews, and to see where each one is used. The
          folder that <Code>shelf add</Code> installs from is the one people read, so the two
          can&apos;t disagree.
        </Prose>
        <Definitions
          items={[
            {
              term: "Catalog",
              text: "Every item with its description, install command, packages, and the items it needs and is needed by.",
            },
            {
              term: "Source and history",
              text: "The files an item installs, highlighted, and each revision it has had with the commit that introduced it.",
            },
            {
              term: "Previews",
              text: "Stories from a Storybook build, passed with --storybook and served from the same host.",
            },
            {
              term: "Usage",
              text: "A matrix of projects by item, grouped by namespace, from a usage.json passed with --usage. Each project has a page with the command that fixes each item.",
            },
            {
              term: "Agents",
              text: "llms.txt lists every item and links its registry.json, so an agent can find the right one before writing new UI.",
            },
          ]}
        />
        <CodeBlock code={PUBLISH} lang="yaml" title=".github/workflows/registry.yml" />
        <Prose>
          Pass <Code>--no-site</Code> to write only the files that install.
        </Prose>
      </Section>

      <Section title="Usage">
        <Prose>
          <Code>shelf usage</Code> reads what is already in git: each project&apos;s{" "}
          <Code>.shelf/lock.json</Code> and the imports in its source. It reports which items each
          project installed, which it actually imports, which are out of date or changed locally,
          and which it uses through a shared workspace package instead of its own copy. No service
          collects anything; run it wherever the code is.
        </Prose>
        <Diagram
          title="terminal"
          label="shelf usage over two apps and the shared package they import."
        >
          {USAGE}
        </Diagram>
        <Definitions
          items={[
            {
              term: "Projects",
              text: 'Every directory with a shelf.config.json. Set "project": "payments/bill-pay" to name it; the part before the last slash is its namespace.',
            },
            {
              term: "Shared packages",
              text: "A workspace package that installs items and re-exports them credits the apps that import it.",
            },
            {
              term: "Revisions",
              text: "An item counts as this registry's when its revision is the current one, one from git history, or one in revisions/.",
            },
            {
              term: "Output",
              text: "--json writes the whole graph, sorted, so the same code always gives the same file.",
            },
          ]}
        />
      </Section>

      <Section title="Across repositories">
        <Prose>
          <Code>--github acme</Code> finds every repository in the organization with a{" "}
          <Code>shelf.config.json</Code> through GitHub code search. Shelf makes a shallow clone of
          each, reads it, and deletes it; a repository already scanned from a local directory is
          skipped. The token comes from <Code>GH_TOKEN</Code> or <Code>GITHUB_TOKEN</Code>: use a
          GitHub App token or a fine-grained personal access token that can read the repositories.
          It is sent to GitHub as a header, never written into clone URLs. For other hosts, pass
          each repository with <Code>--repo</Code>.
        </Prose>
        <CodeBlock code={REPOS} lang="yaml" title=".github/workflows/registry.yml" />
        <Prose>
          <Code>usage.json</Code> includes file paths and repository URLs. When it covers private
          code, publish the registry to a host behind your sign-in, not public GitHub Pages.
        </Prose>
      </Section>

      <Section title="Formatters">
        <Prose>
          Shelf compares installed files byte for byte with what it installed, so a formatter that
          rewrites them makes every item look changed. Exclude installed paths from your formatter,
          or accept the reformatted files as your own changes.
        </Prose>
        <CodeBlock code={FORMAT} lang="json" title=".oxfmtrc.json" />
      </Section>

      <Section title="Private registries">
        <Prose>
          A registry behind sign-in takes request headers. Write the token as a{" "}
          <Code>{"${VAR}"}</Code> reference so the config can be committed and the secret
          can&apos;t.
        </Prose>
        <CodeBlock code={PRIVATE} lang="json" title="shelf.config.json" />
        <CodeBlock
          code={
            "shelf init --registry https://ui.example.com/registry \\\n  --header 'Authorization: Bearer ${SHELF_REGISTRY_TOKEN}'"
          }
          lang="bash"
        />
        <Definitions
          items={[
            {
              term: "Variables",
              text: "Read from the environment first, then .env.local, then .env in the project root. A missing one fails before any request, naming the variable.",
            },
            {
              term: "HTTPS only",
              text: "Shelf won't send headers over plain http, except to localhost.",
            },
            {
              term: "Redirects",
              text: "Followed only within the same origin. A redirect elsewhere, usually to a sign-in page, fails instead of passing your token along.",
            },
            {
              term: "Errors",
              text: "A 401 or 403 shows the server's message and what to check. Header values are never printed or written to the lock.",
            },
          ]}
        />
      </Section>
    </>
  );
}
