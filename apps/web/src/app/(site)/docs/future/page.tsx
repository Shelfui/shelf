import type { Metadata } from "next";
import {
  Code,
  Definitions,
  PageHeader,
  Prose,
  Section,
  TextLink,
} from "@/components/site/docs-page";

export const metadata: Metadata = {
  title: "Agentic systems are the future of interfaces",
  description:
    "Teams and agents ship UI faster than any design system can follow. The fix is one registry, owned copies, and a record of every change.",
  alternates: { canonical: "/docs/future" },
};

export default function Future() {
  return (
    <>
      <PageHeader
        title="Agentic systems are the future of interfaces"
        description="Your agents are making design decisions right now. Do they know which version of your company is current?"
      />

      <Section title="The drift">
        <Prose>
          A new designer opens the design system. It is months old. A new engineer copies a button
          from another product. A founder prompts a settings page into existence on Friday. An agent
          picks the file that looks right and keeps going.
        </Prose>
        <Prose>
          Everyone is doing good work. Everyone is working from a different version of the company.
        </Prose>
      </Section>

      <Section title="Guessing is the default">
        <Prose>
          A screenshot shows a button on one page. It does not say what the button does on the page
          nobody drew. People ask whoever built it. Agents guess, and the result looks fine. Each
          guess moves the product a little closer to a generic one.
        </Prose>
        <Prose>
          A package does not fix this. An agent sees types and docs, hits the edge of the API, and
          wraps it. Copied files do not fix it either. Nobody knows what changed, and fixes stop
          reaching anyone.
        </Prose>
      </Section>

      <Section title="What an agentic system is">
        <Prose>
          One registry. Many owned copies. Every change traceable. A system that people can browse
          and agents can read, made of the files that actually render.
        </Prose>
        <Definitions
          items={[
            {
              term: "The source",
              text: "Markup, styles, and behavior in plain React and StyleX. The file an agent reads is the file that ships.",
            },
            {
              term: "The record",
              text: "Each product's lock holds the revision it installed. Each revision keeps the commit that introduced it.",
            },
            {
              term: "The check",
              text: "shelf check names the file and the command that fixes a failure. No human interpretation needed.",
            },
          ]}
        />
        <Prose>
          Edit a file and it is yours. <Code>shelf status</Code> shows the change.{" "}
          <Code>shelf update</Code> still merges upstream fixes into it. Delete Shelf and your code
          stays.
        </Prose>
      </Section>

      <Section title="Open by design">
        <Prose>
          The system of record is files you can read, fork, and host. Not a vendor you rent. Shelf
          is MIT licensed, and you can run your own registry on any static host.
        </Prose>
      </Section>

      <Section title="Where this goes">
        <Prose>
          <strong>Planned, not available yet.</strong> Change one approved decision and have every
          product that uses it follow. Capture the reason behind a change, not only the diff. Settle
          who approves a change when a team, another studio, and an agent can all suggest one.
        </Prose>
        <Prose>
          Tokens and values are easy to carry across tools. Judgment is harder, and a person should
          still review how each change lands. Today Shelf makes drift visible and updates mergeable.
          The <TextLink href="/docs/roadmap">roadmap</TextLink> lists what ships and what does not.
        </Prose>
      </Section>
    </>
  );
}
