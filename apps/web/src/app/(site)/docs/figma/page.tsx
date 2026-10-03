import type { Metadata } from "next";
import { Diagram } from "@/components/site/diagram";
import { Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { figma } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Designers and Figma",
  description:
    "Design with what actually ships: how Shelf is building native Figma components from production React.",
  alternates: { canonical: "/docs/figma" },
};

export default function Figma() {
  return (
    <>
      <PageHeader
        title="Designers and Figma"
        description="Design with what actually ships. This is in progress: nothing on this page is available yet."
      />
      <Prose>
        Code-first shouldn&apos;t make designers second-class. The goal is a Figma library that
        matches production because it is compiled from production, not redrawn by hand next to it.
      </Prose>

      <Section title="How it will work">
        <Diagram title={figma.title} label={figma.label}>
          {figma.art}
        </Diagram>
        <Prose>
          The React component is the source of truth. Storybook defines its supported states. Shelf
          captures the rendered output, turns it into a small internal description, and a Figma
          plugin builds native components from it. The conversion is deterministic: no screenshots,
          and no AI redrawing a design.
        </Prose>
      </Section>

      <Section title="The quality bar">
        <Prose>
          Looking right isn&apos;t enough. A designer should be able to use the component and forget
          it was generated.
        </Prose>
        <Definitions
          items={[
            { term: "Auto Layout", text: "With correct resizing, not fixed frames." },
            { term: "Variants", text: "The states that exist in code, and only those." },
            { term: "Properties", text: "Labels, icons, and toggles a designer actually edits." },
            { term: "Variables", text: "Semantic colors and sizes, not raw values." },
            { term: "Instances", text: "A nested Icon stays an Icon instance, not loose vectors." },
            { term: "Layers", text: "A clean hierarchy with meaningful names." },
          ]}
        />
      </Section>

      <Section title="Exploration stays in Figma">
        <Prose>
          Production components follow code. Everything else is normal Figma work: designers compose
          with the production components, detach and copy them, explore new concepts, and redesign
          existing ones. When a direction is approved, it is built in React, and the production
          Figma component follows.
        </Prose>
        <Prose>
          Because products own their source, a new interaction doesn&apos;t have to wait for the
          shared system to support it. Design beyond the system without leaving it behind.
        </Prose>
      </Section>
    </>
  );
}
