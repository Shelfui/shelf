import type { Metadata } from "next";
import { Diagram } from "@/components/site/diagram";
import {
  Code,
  Definitions,
  PageHeader,
  Prose,
  Section,
  TextLink,
} from "@/components/site/docs-page";
import { learnLoop } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Philosophy",
  description:
    "The system team owns foundations and defaults; each product owns its implementation. How Shelf splits the work.",
  alternates: { canonical: "/docs/philosophy" },
};

export default function Philosophy() {
  return (
    <>
      <PageHeader
        title="Philosophy"
        description="The system team owns foundations and defaults. Each product owns its implementation."
      />
      <Prose>
        Tokens, typography, icons, motion, and accessibility are worth centralizing: they are hard
        to get right and should match across products. The final implementation of a product&apos;s
        interface belongs in the product, where its requirements are.
      </Prose>

      <Section title="Distribute implementations, not abstractions">
        <Prose>
          A package distributes an abstraction. Its public API is the only way in, so even a spacing
          or color change becomes an override from the outside or a request to the system team, and
          the system team has to anticipate every product. Shelf distributes the implementation. The
          shared component only has to be a good default.
        </Prose>
      </Section>

      <Section title="Dependency or source">
        <Prose>
          For each piece, ask whether it gains more from one correct version or from local control.
        </Prose>
        <Definitions
          items={[
            {
              term: "Dependencies",
              text: "Base UI for focus, keyboard, and ARIA behavior. StyleX for compiling styles.",
            },
            {
              term: "Your source",
              text: "Button, Dialog presentation, form fields, blocks, and the product UI you compose from them.",
            },
          ]}
        />
      </Section>

      <Section title="Use, learn, then standardize">
        <Prose>
          A new interface idea doesn&apos;t have to start as a company-wide abstraction. Build it in
          the product and ship it. When a second product needs it, move it into the registry.
        </Prose>
        <Diagram title={learnLoop.title} label={learnLoop.label}>
          {learnLoop.art}
        </Diagram>
      </Section>

      <Section title="Components, patterns, blocks, templates">
        <Definitions
          items={[
            { term: "Component", text: "Small reusable UI, such as Button, Dialog, or Input." },
            {
              term: "Pattern",
              text: "A reusable interaction or composition, such as a command palette.",
            },
            {
              term: "Block",
              text: "A finished piece of a page, such as a login form or a settings section.",
            },
            { term: "Template", text: "A page-level starting point, such as a settings page." },
          ]}
        />
        <Prose>
          Components and <TextLink href="/blocks">blocks</TextLink> ship today. Patterns and
          templates will install the same way.
        </Prose>
      </Section>

      <Section title="For design-system teams">
        <Prose>
          The system team stops owning every product&apos;s implementation and owns what should be
          shared: foundations, accessibility, defaults, and guidance for agents. In return it gets a
          record it doesn&apos;t have today. See where this is going in{" "}
          <TextLink href="/docs/future">the future</TextLink>.
        </Prose>
        <Definitions
          items={[
            {
              term: "Where each item is used",
              text: "shelf usage reads every product's repository and reports which items it installed, which it imports, and at which revision.",
            },
            {
              term: "What each product changed",
              text: "Every product's lock records what it installed, so local changes are visible instead of silent.",
            },
            {
              term: "How far behind it is",
              text: "shelf status in a product lists every item with a newer revision. shelf update merges it in.",
            },
            {
              term: "How to adopt it",
              text: "One item at a time. shelf add copies a single item into a product, next to the package it uses today, so nothing needs a rewrite.",
            },
            {
              term: "Who governs it",
              text: "The system team publishes the registry. Products own their copies. Every difference is recorded, so a change is a decision you can see.",
            },
          ]}
        />
      </Section>

      <Section title="Open source">
        <Prose>
          You can read every line you install and every line of the tooling, and host your own
          registry with <Code>shelf build</Code>, publicly or behind sign-in.
        </Prose>
      </Section>

      <Section title="What Shelf is not">
        <Prose>
          Not a component package, a runtime framework, an AI UI generator, or a no-code tool. Not a
          replacement for Figma, Storybook, Base UI, or StyleX.
        </Prose>
      </Section>
    </>
  );
}
