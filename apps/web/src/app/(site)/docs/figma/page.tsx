import type { Metadata } from "next";
import { Diagram } from "@/components/site/diagram";
import { Code, Definitions, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { figma } from "@/docs/diagrams";

export const metadata: Metadata = {
  title: "Designers",
  description:
    "Designers work in the real components. Figma is optional: Shelf can also build a native Figma library from the same React source.",
  alternates: { canonical: "/docs/figma" },
};

export default function Designers() {
  return (
    <>
      <PageHeader
        title="Designers"
        description="Design in the real components. Figma is optional, and the Figma library is compiled from the same source."
      />
      <Prose>
        The component a designer sees should be the component that ships. With Shelf it is the same
        file. You don&apos;t have to draw it twice, and you don&apos;t have to start in Figma.
      </Prose>

      <Section title="Work in the real thing">
        <Prose>
          Every component renders live in Storybook and in these docs, with its real states. Change
          spacing, color, or a variant in the browser, or ask an agent to do it in code. The product
          picks up the change because the product owns the file.
        </Prose>
        <Prose>
          The tokens behind it are semantic: color, type, radius, spacing, and motion. A theme is
          one file, in light and dark. Design in the theme your product will ship.
        </Prose>
      </Section>

      <Section title="Figma, if your team wants it">
        <Prose>
          Teams that design in Figma get a native library instead of a redrawn one. The Shelf plugin
          builds it from your registry, and syncs it again when the code changes. The conversion is
          deterministic: no screenshots, and no AI redrawing a design.
        </Prose>
        <Diagram title={figma.title} label={figma.label}>
          {figma.art}
        </Diagram>
        <Definitions
          items={[
            { term: "Variables", text: "Semantic colors, radius, and spacing, in light and dark." },
            { term: "Styles", text: "Text styles and effect styles from the foundations." },
            {
              term: "Components",
              text: "Variants and properties for the states that exist in code.",
            },
            {
              term: "Icons",
              text: "From the Shelf icons item, kept as instances inside components.",
            },
          ]}
        />
        <Prose>
          Hover and focus stay in code. The library holds the states a designer places, not the
          states a pointer causes.
        </Prose>
      </Section>

      <Section title="Set it up">
        <Prose>
          Once per team, by whoever maintains the library file. Your registry must be built with a
          Storybook: <Code>shelf build --storybook storybook-static</Code>.
        </Prose>
        <Definitions
          items={[
            {
              term: "1. Get the plugin",
              text: (
                <>
                  Every registry built with <Code>shelf build</Code> serves the plugin at{" "}
                  <Code>/figma/manifest.json</Code> and <Code>/figma/code.js</Code>. Download both
                  into one folder, then in Figma choose Plugins, Development, Import plugin from
                  manifest. On an Organization or Enterprise plan you can publish it privately
                  instead.
                </>
              ),
            },
            {
              term: "2. Connect",
              text: "Open the file your team publishes as its library, run Shelf, and enter your registry URL. The file remembers it.",
            },
            { term: "3. Sync", text: "Sync, then publish the file as a library." },
            {
              term: "4. Link",
              text: "Copy the figma block the plugin shows into your registry's index.json and rebuild. Item pages then open their component in Figma.",
            },
          ]}
        />
        <Prose>
          The registry site has a Figma page with these steps and download links for your registry,
          and a check that shows what will sync.
        </Prose>
      </Section>

      <Section title="Day to day">
        <Prose>
          Designers enable the library and use the components. They never run the plugin. When the
          code changes, the library file offers Check for Shelf updates. Syncing updates components
          in place, so instances stay linked. Removals ask first, because instances of a removed
          variant detach.
        </Prose>
      </Section>

      <Section title="Exploration stays free">
        <Prose>
          Production components follow code. Everything else is normal work: compose with them,
          detach and copy them, explore new concepts, redesign existing ones. When a direction is
          approved, it is built in React, and the library follows. Because products own their
          source, a new interaction doesn&apos;t have to wait for the shared system.
        </Prose>
      </Section>
    </>
  );
}
