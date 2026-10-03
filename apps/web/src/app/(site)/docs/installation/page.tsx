import type { Metadata } from "next";
import { Command } from "@/components/site/command";
import { Diagram } from "@/components/site/diagram";
import {
  Code,
  Definitions,
  PageHeader,
  Prose,
  Section,
  TextLink,
} from "@/components/site/docs-page";
import { fileTree } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Installation",
  description: "Set up Shelf in a React project, add components, and check the result.",
  alternates: { canonical: "/docs/installation" },
};

const ADD_OUTPUT = `$ shelf add button dialog
✓ resolved button, dialog, foundations, utils, icons
✓ added 8 files
✓ recorded provenance in .shelf/lock.json

Button, Dialog, Foundations, Utils and Icons are now yours.`;

export default function Installation() {
  return (
    <>
      <PageHeader
        title="Installation"
        description="Install the CLI, point it at a registry, add what you need, and check it."
      />
      <Prose>
        Shelf needs Node 20.12 or newer, React, and a build that compiles StyleX. It works with npm,
        pnpm, yarn, and Bun, and uses the one your project&apos;s lockfile names. Components depend
        on Base UI and StyleX, which <Code>shelf add</Code> installs for you.
      </Prose>

      <Section title="Pick your framework">
        <Definitions
          items={[
            {
              term: <TextLink href="/docs/installation/vite">Vite</TextLink>,
              text: "StyleX through @stylexjs/unplugin. The reference setup.",
            },
            {
              term: <TextLink href="/docs/installation/nextjs">Next.js</TextLink>,
              text: "StyleX through Babel and PostCSS. This site runs on it.",
            },
            {
              term: <TextLink href="/docs/installation/tanstack-start">TanStack Start</TextLink>,
              text: "StyleX through the same Vite plugin. Not yet tested end to end.",
            },
          ]}
        />
        <Prose>
          The steps below are the same in every framework once StyleX compiles. Each guide covers
          the StyleX setup for its framework.
        </Prose>
      </Section>

      <Section title="Install the CLI">
        <Command packages={["@shelfui/cli"]} dev />
        <Prose>
          The package is <Code>@shelfui/cli</Code> and its command is <Code>shelf</Code>. Install it
          first: the npm package named <Code>shelf</Code> is unrelated, so running{" "}
          <Code>npx shelf</Code> without it installs something else.
        </Prose>
      </Section>

      <Section title="Set up a project">
        <Command args="init --registry <path-or-url>" />
        <Prose>
          <Code>init</Code> writes <Code>shelf.config.json</Code> and <Code>.shelf/lock.json</Code>.
          If your <Code>tsconfig.json</Code> declares path aliases such as <Code>@/*</Code>, it
          copies them, so installed files import the way your app does. It warns when the StyleX
          Vite plugin is missing. There is no default registry yet, so pass <Code>--registry</Code>{" "}
          or set <Code>SHELF_REGISTRY</Code>.
        </Prose>
      </Section>

      <Section title="Add components">
        <Command args="add button dialog" />
        <Prose>
          Shelf resolves the items and the Shelf items they build on, copies the files, installs the
          packages they need, and records what it installed.
        </Prose>
        <Diagram title="terminal" label="The output of shelf add button dialog.">
          {ADD_OUTPUT}
        </Diagram>
        <Diagram title={fileTree.title} label={fileTree.label}>
          {fileTree.art}
        </Diagram>
        <Prose>
          Commit all of it, including <Code>.shelf/</Code>. That record is how Shelf tells your
          changes apart from what it installed.
        </Prose>
      </Section>

      <Section title="Change them">
        <Prose>
          Edit the files like any other source. <Code>shelf add</Code> never overwrites a file you
          changed unless you pass <Code>--overwrite</Code>. Read{" "}
          <TextLink href="/docs/ownership">ownership and provenance</TextLink> for the details.
        </Prose>
      </Section>

      <Section title="Use your own fonts">
        <Prose>
          Foundations read the typefaces from <Code>--font-sans</Code> and <Code>--font-mono</Code>,
          and fall back to Geist from <Code>fonts.css</Code>. With <Code>next/font</Code>, set{" "}
          <Code>{'variable: "--font-sans"'}</Code> on your font and add its variable class to{" "}
          <Code>&lt;html&gt;</Code>. Then delete <Code>fonts.css</Code> and its import. No Shelf
          file needs editing.
        </Prose>
      </Section>

      <Section title="Check your install">
        <Command args="check" />
        <Prose>
          Checks that what Shelf installed is intact and lists what you changed. Your own
          TypeScript, lint, and build keep covering the code. See{" "}
          <TextLink href="/docs/validation">validation</TextLink>.
        </Prose>
      </Section>

      <Section title="Removing Shelf">
        <Prose>
          Delete <Code>shelf.config.json</Code>, <Code>.shelf/</Code>, and the{" "}
          <Code>@shelfui/cli</Code> package. The components keep working, because they are your
          code.
        </Prose>
      </Section>
    </>
  );
}
