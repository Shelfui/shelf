import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Diagram } from "@/components/site/diagram";
import { Code, Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { recovery, threeWay } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Ownership and provenance",
  description:
    "What Shelf records when it installs a component, and how that lets you change anything without losing track.",
  alternates: { canonical: "/docs/ownership" },
};

const LOCK = `{
  "items": {
    "button": {
      "type": "component",
      "revision": "f79cc395084a…",
      "installedAt": "2026-09-27T21:46:22.143Z",
      "files": {
        "src/components/ui/button.tsx": {
          "source": "button.tsx",
          "baseHash": "a8357131844f…"
        }
      },
      "dependencies": { "@base-ui/react": "^1.8.0", "@stylexjs/stylex": "^0.19.1" },
      "shelfDependencies": ["foundations", "utils"]
    }
  }
}`;

const STATUS = `$ shelf status
Shelf status

  button       modified locally, update available
  dialog       update available
  foundations  up to date

2 updates available, 1 with local changes to merge. See: shelf diff <item>. Run: shelf update`;

const UPDATE = `$ shelf update
✓ updated 1 file
✓ merged Shelf's changes into your modified src/components/ui/button.tsx
✓ recorded provenance in .shelf/lock.json`;

const CONFLICT = `<<<<<<< yours
    borderRadius: radius.full,
=======
    borderRadius: radius.lg,
>>>>>>> shelf`;

export default function Ownership() {
  return (
    <>
      <PageHeader
        title="Ownership and provenance"
        description="The source is yours. Shelf keeps a record of what it gave you, so you can change anything and lose nothing."
      />
      <Prose>
        Copy and paste loses the thread: after a few edits, nobody knows what the original was or
        what changed since. Shelf records it at install time, so divergence is intentional and
        visible instead of accidental.
      </Prose>

      <Section title="What Shelf records">
        <Prose>
          <Code>.shelf/lock.json</Code> has an entry for every installed item: the registry
          revision, when it was installed, its dependencies, and a hash of each file exactly as
          installed. Commit it. Nothing else is copied: the hashes identify what you installed, and
          Shelf can always get the files back.
        </Prose>
        <CodeBlock code={LOCK} lang="json" title=".shelf/lock.json" />
      </Section>

      <Section title="Three versions of every file">
        <Diagram title={threeWay.title} label={threeWay.label}>
          {threeWay.art}
        </Diagram>
        <Prose>
          BASE is what you installed. LOCAL is the file in your app today. UPSTREAM is what the
          registry has now. Comparing all three is how a change of yours and a change of
          Shelf&apos;s can be told apart, instead of looking like one big difference.
        </Prose>
      </Section>

      <Section title="Where BASE comes from">
        <Prose>
          The lock names BASE by its hash, so Shelf doesn&apos;t keep a copy. When it needs the
          bytes, it tries three places in order and only accepts bytes that match the hash.
        </Prose>
        <Diagram title={recovery.title} label={recovery.label}>
          {recovery.art}
        </Diagram>
        <Definitions
          items={[
            { term: "The file itself", text: "If you haven't changed it, it is BASE." },
            {
              term: "Your git history",
              text: "Commit after shelf add and that commit holds BASE exactly. No network, any git host.",
            },
            {
              term: "The registry",
              text: "Every revision it has published stays available. Shelf checks the revision's hash, rewrites its imports the way add did, and checks the result against baseHash.",
            },
          ]}
        />
        <Prose>
          A rebuild only matches if the install layout is the same, so changing <Code>aliases</Code>{" "}
          after installing, without having committed, leaves nothing that matches. Shelf says so
          rather than guessing.
        </Prose>
      </Section>

      <Section title="What happens when you add again">
        <Prose>
          <Code>shelf add</Code> classifies every file before it touches anything:
        </Prose>
        <Definitions
          items={[
            { term: "Missing", text: "The file is created." },
            { term: "Same as Shelf's", text: "Nothing to do." },
            {
              term: "Unchanged since install",
              text: "It matches BASE, so Shelf's newer version replaces it.",
            },
            {
              term: "Changed by you",
              text: "If Shelf's version of it is the same as BASE, yours is kept. There is nothing to update.",
            },
            {
              term: "Changed by you and by Shelf",
              text: "Shelf merges its changes into yours, using BASE as the common ancestor. See Updating below.",
            },
            {
              term: "Not installed by Shelf",
              text: "Treated like a change of yours: Shelf won't replace a file it didn't write.",
            },
            {
              term: "Dropped by Shelf",
              text: "If a newer version no longer has a file, yours is kept and listed so you can delete it.",
            },
          ]}
        />
        <Prose>
          Shelf items that a component builds on, such as foundations, stay as you have them. Shelf
          says when a newer version exists, and updating it is an explicit{" "}
          <Code>shelf add foundations</Code>.
        </Prose>
      </Section>

      <Section title="Seeing what you changed">
        <Prose>
          <Code>shelf check</Code> compares every installed file with its BASE hash and lists the
          ones you modified. It fails if the record itself is damaged, for example an installed file
          that was deleted, and says how to restore it.
        </Prose>
      </Section>

      <Section title="Updating">
        <Prose>
          <Code>shelf status</Code> lists every installed item and whether you changed it, Shelf
          changed it, or both. It reads only the registry index, so it is quick enough to run often.
        </Prose>
        <Diagram title="terminal" label="shelf status listing two items with updates.">
          {STATUS}
        </Diagram>
        <Prose>
          <Code>shelf diff button</Code> shows what an update would bring: BASE against Shelf&apos;s
          current version. <Code>shelf diff button --local</Code> shows your changes: BASE against
          your file.
        </Prose>
        <Prose>
          <Code>shelf update</Code> updates every item with a newer version, or only the items you
          name. Files you haven&apos;t changed are replaced. Files you changed are merged with{" "}
          <Code>git merge-file</Code>, using BASE as the common ancestor, so your edits and
          Shelf&apos;s both survive when they touch different lines.
        </Prose>
        <Diagram
          title="terminal"
          label="shelf update merging Shelf's changes into a modified button."
        >
          {UPDATE}
        </Diagram>
        <Prose>
          When both sides changed the same lines, the file gets standard conflict markers and{" "}
          <Code>shelf update</Code> says how many. Resolve them in your editor, or ask an agent to;{" "}
          <Code>shelf check</Code> fails, with the file and line, until no marker is left.
        </Prose>
        <Diagram
          title="src/components/ui/button.tsx"
          label="A conflict between your border radius and Shelf's."
        >
          {CONFLICT}
        </Diagram>
        <Definitions
          items={[
            {
              term: "Nothing is half done",
              text: "Every merge is computed before any file is written. If one file can't be merged, nothing changes.",
            },
            {
              term: "No BASE, no merge",
              text: "If BASE can't be recovered, Shelf refuses and says why. --overwrite replaces your file with Shelf's instead.",
            },
            {
              term: "Reformatted files",
              text: "If your formatter rewrote most of a file, a merge conflicts widely. Shelf says so and points at shelf diff --local.",
            },
            {
              term: "Changed packages",
              text: "When a newer version needs a different range of a package you already have, Shelf prints the command to update it.",
            },
          ]}
        />
        <Prose>
          After an update the lock records Shelf&apos;s new version as BASE, so a merged file reads
          as modified locally, and the next update merges from there.
        </Prose>
      </Section>

      <Section title="What comes next">
        <Prose>
          Shelf is building toward <Code>contribute</Code> on top of this record: sending a local
          improvement back to the registry. It doesn&apos;t exist yet.
        </Prose>
        <Prose>
          The lifecycle it serves: start together, diverge intentionally, and converge when
          something proves reusable.
        </Prose>
      </Section>
    </>
  );
}
