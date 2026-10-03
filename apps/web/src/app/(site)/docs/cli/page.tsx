import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Command } from "@/components/site/command";
import {
  Code,
  Definitions,
  PageHeader,
  Prose,
  Section,
  TextLink,
} from "@/components/site/docs-page";

export const metadata: Metadata = {
  title: "CLI",
  description: "Every Shelf command, its options, and shelf.config.json.",
  alternates: { canonical: "/docs/cli" },
};

const CONFIG = `{
  "$schema": "./node_modules/@shelfui/cli/schema.json",
  "registry": "https://example.com/registry",
  "paths": {
    "components": "src/components/ui",
    "foundations": "src/styles/shelf",
    "lib": "src/lib/shelf"
  },
  "aliases": {
    "@/*": "src/*"
  }
}`;

export default function Cli() {
  return (
    <>
      <PageHeader
        title="CLI"
        description="Small, deterministic, and scriptable. The output is written for people and agents alike."
      />
      <Prose>
        Install <Code>@shelfui/cli</Code> as a dev dependency, then run <Code>shelf</Code> through
        your package manager, such as <Code>npx shelf add button</Code>. Every command takes{" "}
        <Code>--cwd &lt;dir&gt;</Code> and <Code>--help</Code>, and none of them prompt.
      </Prose>
      <Command packages={["@shelfui/cli"]} dev />

      <Section title="Commands">
        <Definitions
          items={[
            {
              term: <Code>init --registry &lt;location&gt;</Code>,
              text: "Create shelf.config.json and .shelf/, and copy path aliases from tsconfig.json.",
            },
            {
              term: <Code>search [query...]</Code>,
              text: "List registry items that match every term. --registry searches another registry than the configured one, and works before init.",
            },
            {
              term: <Code>add &lt;items...&gt;</Code>,
              text: "Copy items and the Shelf items they build on, install their packages, and record provenance. Keeps files you changed, and merges Shelf's changes into them when both changed.",
            },
            {
              term: <Code>status [items...]</Code>,
              text: "List installed items, which ones you changed, and which have a newer version. Read-only.",
            },
            {
              term: <Code>diff &lt;item&gt; [--local]</Code>,
              text: "Show what an update would bring, as a unified diff from what you installed. --local shows your changes instead.",
            },
            {
              term: <Code>update [items...]</Code>,
              text: "Update every item with a newer version, or the ones named, merging Shelf's changes into files you changed. Takes the same options as add.",
            },
            {
              term: <Code>check [--only &lt;steps&gt;]</Code>,
              text: "Check that installed files, their Shelf and package dependencies, and their imports are intact, and list what you changed. Exits 1 on failure. Each step lists its first 30 details; --verbose lists them all.",
            },
            {
              term: <Code>usage [dirs...]</Code>,
              text: "Show where installed items are used: which each project imports, which are out of date or changed, and which come through a shared package. --repo adds other repositories, --github adds every Shelf repository in a GitHub organization, and --json writes the graph.",
            },
            {
              term: <Code>build [dir] --out &lt;dir&gt;</Code>,
              text: "Validate a registry and write the files that install, every revision in its git history, and the Shelf Registry site, for static hosting. --storybook and --usage add previews and usage; --no-site leaves the site out.",
            },
            {
              term: <Code>serve [dir] --port &lt;port&gt;</Code>,
              text: "Serve a registry directory on 127.0.0.1.",
            },
          ]}
        />
      </Section>

      <Section title="Options for init">
        <Definitions
          items={[
            {
              term: <Code>--header &lt;header&gt;</Code>,
              text: "A request header for a private http(s) registry, such as 'Authorization: Bearer ${SHELF_REGISTRY_TOKEN}'. Repeatable. Quote it so the variable is written as-is and expanded only when Shelf makes a request.",
            },
          ]}
        />
      </Section>

      <Section title="Options for add and update">
        <Definitions
          items={[
            {
              term: <Code>--overwrite</Code>,
              text: "Replace locally modified files, or files Shelf didn't install, with the registry's version instead of merging.",
            },
            {
              term: <Code>--skip-install</Code>,
              text: "Copy files and record provenance, but leave package installs to you.",
            },
          ]}
        />
      </Section>

      <Section title="Configuration">
        <CodeBlock code={CONFIG} lang="json" title="shelf.config.json" />
        <Definitions
          items={[
            {
              term: <Code>registry</Code>,
              text: "A directory, relative to this file, or an http(s) URL. For a private registry, an object with url and headers.",
            },
            {
              term: <Code>paths</Code>,
              text: "Where each kind of item is copied, relative to the project.",
            },
            {
              term: <Code>aliases</Code>,
              text: "Optional, in the same form as compilerOptions.paths. Without it, imports between installed files are relative.",
            },
            {
              term: <Code>$schema</Code>,
              text: "Autocomplete and validation in your editor. Unknown keys are an error, so typos don't pass silently.",
            },
          ]}
        />
      </Section>

      <Section title="Hosting a registry">
        <CodeBlock
          code={"shelf build registry --out dist/registry\nshelf serve dist/registry"}
          lang="bash"
        />
        <Prose>
          <Code>build</Code> checks every item the way <Code>add</Code> reads it, including that its
          imports resolve, and leaves out stories and tests. Upload the output to any static host
          and point <Code>registry</Code> at its URL.
        </Prose>
        <Prose>
          It also writes <Code>revisions/</Code>, one snapshot for every revision the items have had
          in git, and never deletes it. That is how a product gets back the exact files it
          installed. Build from a full clone; a shallow one only has current revisions, and{" "}
          <Code>build</Code> says so. See{" "}
          <TextLink href="/docs/ownership">ownership and provenance</TextLink>.
        </Prose>
      </Section>
    </>
  );
}
