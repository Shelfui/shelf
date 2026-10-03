import type { Metadata } from "next";
import { Code, Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { blocks } from "@/docs/blocks";
import { components } from "@/docs/components";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What Shelf does today, and what it is building toward.",
  alternates: { canonical: "/docs/roadmap" },
};

export default function Roadmap() {
  return (
    <>
      <PageHeader
        title="Roadmap"
        description="Shelf is early. Everything the site describes is on one of these two lists."
      />

      <Section title="Available">
        <Definitions
          items={[
            {
              term: `${components.length} components`,
              text: "React, Base UI, and StyleX, each with a live demo in these docs.",
            },
            {
              term: `${blocks.length} blocks`,
              text: "Finished pieces of a page, such as a login form, that install the components they use.",
            },
            {
              term: "Foundations and themes",
              text: "Semantic tokens for color, type, spacing, radius, and motion, with light, dark, and presets.",
            },
            {
              term: <Code>shelf init</Code>,
              text: "Configuration, path aliases, and the provenance record.",
            },
            { term: <Code>shelf search</Code>, text: "Find items in a registry." },
            {
              term: <Code>shelf add</Code>,
              text: "Copy source, resolve Shelf dependencies, install packages, and record provenance. Never overwrites your changes.",
            },
            {
              term: <Code>shelf status</Code>,
              text: "Which installed items you changed and which have a newer version.",
            },
            {
              term: <Code>shelf diff</Code>,
              text: "What an update brings, or what you changed, since you installed an item.",
            },
            {
              term: <Code>shelf update</Code>,
              text: "A three-way update from BASE, LOCAL, and UPSTREAM, with conflict markers where both changed the same lines.",
            },
            {
              term: <Code>shelf check</Code>,
              text: "Provenance with local changes and unresolved conflicts, dependencies, and imports of installed items.",
            },
            {
              term: "Private registries",
              text: "Request headers from environment variables, sent only over HTTPS.",
            },
            {
              term: <Code>shelf build</Code>,
              text: "Validate and publish a registry with every past revision, served with shelf serve or any static host.",
            },
            {
              term: "Registry site",
              text: "The built registry is also a site: every item with its source, revisions, Storybook previews, and usage.",
            },
            {
              term: "Figma library",
              text: "A plugin that builds native Figma variables, styles, and components from your registry and syncs changes. Optional, and installed privately for now.",
            },
            {
              term: <Code>shelf usage</Code>,
              text: "Which projects install and import each item, at which revision, across local directories or a GitHub organization.",
            },
          ]}
        />
      </Section>

      <Section title="Planned">
        <Definitions
          items={[
            { term: "contribute", text: "Send a local improvement back to the registry." },
            {
              term: "Patterns and templates",
              text: "Reusable interactions and page-level starting points that install the same way as components.",
            },
            {
              term: "Decisions that propagate",
              text: "Change one approved decision and have the products that use it follow, with a person reviewing how it lands.",
            },
            {
              term: "Recorded rationale",
              text: "The reason behind a change stored next to the revision, not only the diff.",
            },
            {
              term: "Visual validation",
              text: "Deterministic captures and structured differences in shelf check.",
            },
          ]}
        />
        <Prose>
          Shelf grows through real product use, so this list moves when something proves itself, not
          on a schedule.
        </Prose>
      </Section>
    </>
  );
}
