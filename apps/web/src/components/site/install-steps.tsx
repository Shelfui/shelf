import { Command } from "@/components/site/command";
import { Code, Prose, Section, TextLink } from "@/components/site/docs-page";

/** The steps every framework guide shares once StyleX compiles. */
export function ShelfSteps() {
  return (
    <>
      <Section title="Install the CLI">
        <Command packages={["@shelfui/cli"]} dev />
        <Prose>
          The package is <Code>@shelfui/cli</Code> and its command is <Code>shelf</Code>.
        </Prose>
      </Section>

      <Section title="Initialize Shelf">
        <Command args="init --registry <path-or-url>" />
        <Prose>
          Writes <Code>shelf.config.json</Code> and <Code>.shelf/lock.json</Code>, and copies the
          path aliases from your <Code>tsconfig.json</Code>. It warns about anything missing from
          the StyleX setup above.
        </Prose>
      </Section>

      <Section title="Add components">
        <Command args="add button" />
        <Prose>
          Copies Button, the foundations it uses, and the packages it needs into your project, then
          records what it installed. The files are yours to edit. See{" "}
          <TextLink href="/docs/ownership">ownership and provenance</TextLink>.
        </Prose>
      </Section>

      <Section title="Check the result">
        <Command args="check" />
        <Prose>
          Verifies config, provenance, and imports. Your own build still covers the rest. See{" "}
          <TextLink href="/docs/validation">validation</TextLink>.
        </Prose>
      </Section>
    </>
  );
}
