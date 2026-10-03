import type { Metadata } from "next";
import { Command } from "@/components/site/command";
import { Diagram } from "@/components/site/diagram";
import { Code, PageHeader, Prose, Section, TextLink } from "@/components/site/docs-page";
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
        Shelf needs Node 20.12 or newer, React, and a Vite app compiled with{" "}
        <Code>@stylexjs/unplugin</Code>. It works with npm, pnpm, yarn, and Bun, and uses the one
        your project&apos;s lockfile names. Components depend on Base UI and StyleX, which{" "}
        <Code>shelf add</Code> installs for you.
      </Prose>

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
