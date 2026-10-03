import type { Metadata } from "next";
import { Diagram } from "@/components/site/diagram";
import { Code, PageHeader, Prose, Section, TextLink } from "@/components/site/docs-page";
import { blocks } from "@/docs/blocks";
import { components } from "@/docs/components";
import { models } from "@/docs/diagrams";
import { siteConfig } from "@/site";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "What Shelf is: a design system that installs as source in each product and records what it installed.",
  alternates: { canonical: "/docs" },
};

export default function DocsIntroduction() {
  return (
    <>
      <PageHeader title="Introduction" description={siteConfig.lead} />
      <Prose>
        Components land in your codebase as plain React files that your team and your agents can
        change or delete. Shelf keeps a hash of each file as installed, so it can tell your changes
        from upstream changes and merge the two.
      </Prose>

      <Section title="Why">
        <Prose>
          Every team ships UI faster than a design system can follow, and now agents do too. Each
          product drifts onto its own version of the system. Shelf is one registry, many owned
          copies, and a record of every change. It is open source under the MIT license.
        </Prose>
        <Prose>
          Companies with more than one product usually end up with one of two setups. A shared
          component package keeps products consistent, but its API decides what a product can do:
          even a spacing or color change becomes an override that breaks on upgrade, or a request
          that waits on the system team. Copied files remove that wait, but after a few edits nobody
          knows what the original was, and fixes stop reaching anyone.
        </Prose>
        <Diagram title={models.title} label={models.label}>
          {models.art}
        </Diagram>
        <Prose>
          Shelf keeps the connection of a package and the ownership of copied files. Every product
          starts from the same source, and files nobody edited stay identical and update as-is. When
          a product does change something, the change is deliberate and visible: Shelf knows what
          each product installed, what it changed, and which updates it hasn&apos;t taken.
        </Prose>
      </Section>

      <Section title="Why source">
        <Prose>
          Engineers and agents change the implementation directly instead of working around an API.
          Hard interaction behavior stays a dependency: focus, keyboard, and ARIA come from Base UI,
          and styles compile with StyleX. What you own is the product-facing layer on top.
        </Prose>
        <Prose>
          Designers work from the same components too: in the browser, in Storybook, or in code with
          an agent. Figma is optional, and native Figma components are{" "}
          <TextLink href="/docs/figma">in progress</TextLink>.
        </Prose>
      </Section>

      <Section title="What you get today">
        <Prose>
          {components.length} components, {blocks.length} blocks, and semantic foundations with
          light and dark themes. A CLI with <Code>init</Code>, <Code>search</Code>, <Code>add</Code>
          , <Code>status</Code>, <Code>diff</Code>, <Code>update</Code>, and <Code>check</Code> for
          each product, and <Code>build</Code> and <Code>usage</Code> for the team that runs the{" "}
          <TextLink href="/docs/registry">registry</TextLink>. The{" "}
          <TextLink href="/docs/roadmap">roadmap</TextLink> lists what is available and what is
          planned.
        </Prose>
      </Section>

      <Section title="Where to go next">
        <Prose>
          <TextLink href="/docs/installation">Install Shelf</TextLink> in a project, read how{" "}
          <TextLink href="/docs/ownership">ownership and provenance</TextLink> work, or see how{" "}
          <TextLink href="/docs/agents">agents</TextLink> use it.
        </Prose>
      </Section>
    </>
  );
}
