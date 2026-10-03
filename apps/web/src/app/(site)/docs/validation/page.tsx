import type { Metadata } from "next";
import { Command } from "@/components/site/command";
import { Diagram } from "@/components/site/diagram";
import { Code, Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";

export const metadata: Metadata = {
  title: "Validation",
  description:
    "shelf check: whether what Shelf installed is intact, what you changed, and what it still needs.",
  alternates: { canonical: "/docs/validation" },
};

const OUTPUT = `$ shelf check
Shelf check

✓ config       registry ../../registry
✓ provenance   5 items, 8 files, 2 modified locally
    ~ src/components/ui/button.tsx (button, modified locally)
    ~ src/components/ui/dialog.tsx (dialog, modified locally)
✓ dependencies 5 packages declared, Shelf dependencies installed
✓ imports      9 local imports resolve

✓ All checks passed (4 passed, 0 skipped)`;

const SCRIPT = `"check": "shelf check && tsc --noEmit && oxlint && vite build"`;

export default function Validation() {
  return (
    <>
      <PageHeader
        title="Validation"
        description="One command tells you, or your agent, whether what Shelf installed is still intact, and what you changed."
      />
      <Command args="check" />
      <Diagram
        title="terminal"
        label="shelf check output from the example app, with two files modified locally."
      >
        {OUTPUT}
      </Diagram>

      <Section title="Steps">
        <Prose>
          Every step checks something Shelf wrote. They read files only, so the check is offline and
          takes milliseconds.
        </Prose>
        <Definitions
          items={[
            {
              term: <Code>config</Code>,
              text: "shelf.config.json exists and is valid.",
            },
            {
              term: <Code>provenance</Code>,
              text: "Every installed file against its BASE hash. Lists what you changed, and fails if a file or the record is missing, or a file still has a conflict marker from shelf update, naming the line.",
            },
            {
              term: <Code>dependencies</Code>,
              text: "Every Shelf dependency of an installed item is installed, and every package it needs is in package.json. Prints the commands that fix it.",
            },
            {
              term: <Code>imports</Code>,
              text: "Relative and alias imports in installed files still point at files, so an edit or a deleted file can't leave one dangling.",
            },
          ]}
        />
      </Section>

      <Section title="Your own tools">
        <Prose>
          TypeScript, linting, formatting, tests, and the build belong to your project, and Shelf
          doesn&apos;t run them for you. Installed components are normal source, so the tools you
          already use cover them. Put <Code>shelf check</Code> next to those tools in your own
          script:
        </Prose>
        <Diagram
          title="package.json"
          label="A check script that runs shelf check and the app's tools."
        >
          {SCRIPT}
        </Diagram>
      </Section>

      <Section title="Output for agents">
        <Prose>
          The output is short and stable. A failure names the file and says what to run, so an agent
          can fix it without a person interpreting it. Pass <Code>--only provenance,imports</Code>{" "}
          to run a subset, or <Code>--verbose</Code> to list every detail instead of the first 30.
          The exit code is 1 on failure.
        </Prose>
      </Section>

      <Section title="What comes next">
        <Prose>
          Shelf is building toward visual validation: deterministic captures of each Storybook
          state, compared structurally, so a report reads like &quot;Button horizontal padding
          increased 4px, from the control spacing token&quot; rather than a percentage of changed
          pixels. It isn&apos;t available yet.
        </Prose>
      </Section>
    </>
  );
}
