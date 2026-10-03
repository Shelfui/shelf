import type { Metadata } from "next";
import { Diagram } from "@/components/site/diagram";
import { Code, Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { agentLoop, agentSession } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Agents",
  description:
    "Why coding agents work better with source they can read, and the loop Shelf gives them.",
  alternates: { canonical: "/docs/agents" },
};

export default function Agents() {
  return (
    <>
      <PageHeader
        title="Agents"
        description="Give agents the source: the file that renders, in your repo."
      />
      <Prose>
        Against a package, an agent sees types and docs. When the API doesn&apos;t fit, it adds a
        wrapper or an override. With Shelf, it reads the file that renders and changes that.
      </Prose>

      <Section title="What an agent can read">
        <Definitions
          items={[
            {
              term: "The implementation",
              text: "Markup, behavior wiring, and every variant, in one normal React file.",
            },
            {
              term: "The styles",
              text: "StyleX next to the markup, using semantic tokens it can look up.",
            },
            {
              term: "Local changes",
              text: "shelf check lists which files your team already modified.",
            },
            {
              term: "The catalog",
              text: "shelf search finds an existing component before the agent builds a new one.",
            },
          ]}
        />
      </Section>

      <Section title="The loop">
        <Diagram title={agentLoop.title} label={agentLoop.label}>
          {agentLoop.art}
        </Diagram>
        <Prose>
          Every step is a command with short, stable output and no prompts. A failing check names
          the file and what to run, so the agent can fix it and check again.
        </Prose>
      </Section>

      <Section title="An example">
        <Diagram title={agentSession.title} label={agentSession.label}>
          {agentSession.art}
        </Diagram>
        <Prose>
          The output above is real. The agent found Alert Dialog instead of building a modal, added
          it, changed it, and got a passing check that lists the change.
        </Prose>
      </Section>

      <Section title="Tell your agent">
        <Prose>
          Add a line to your <Code>AGENTS.md</Code> or rules file: search Shelf with{" "}
          <Code>shelf search</Code> before creating UI, add what exists with <Code>shelf add</Code>,
          and run <Code>shelf check</Code> before finishing.
        </Prose>
      </Section>

      <Section title="What comes next">
        <Prose>
          Today, when <Code>shelf update</Code> leaves conflict markers, an agent resolves them with{" "}
          <Code>shelf diff --local</Code> for context, and <Code>shelf check</Code> fails until none
          are left. Planned, not available yet: stories and tests alongside each version, and visual
          feedback that says what changed.
        </Prose>
      </Section>
    </>
  );
}
