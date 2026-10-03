import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Command } from "@/components/site/command";
import { Code, PageHeader, Prose, Section } from "@/components/site/docs-page";
import { ShelfSteps } from "@/components/site/install-steps";

export const metadata: Metadata = {
  title: "TanStack Start",
  description: "Set up Shelf in a TanStack Start project.",
  alternates: { canonical: "/docs/installation/tanstack-start" },
};

const CONFIG = `import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylex({ useCSSLayers: true }),
    tanstackStart(),
    // React's plugin must come after TanStack Start's.
    viteReact(),
  ],
});`;

export default function TanStackInstallation() {
  return (
    <>
      <PageHeader title="TanStack Start" description="Set up Shelf in a TanStack Start project." />

      <Section title="Create a project">
        <CodeBlock code="npm create @tanstack/start@latest" lang="bash" />
        <Prose>Skip this if you already have a TanStack Start project.</Prose>
      </Section>

      <Section title="Set up StyleX">
        <Command packages={["@stylexjs/stylex"]} />
        <Command packages={["@stylexjs/unplugin"]} dev />
        <Prose>
          TanStack Start builds with Vite, so StyleX uses the same plugin as a plain Vite app. Add
          it to <Code>vite.config.ts</Code> before the other plugins.
        </Prose>
        <CodeBlock code={CONFIG} lang="tsx" title="vite.config.ts" />
        <Prose>
          Shelf has not been run end to end on TanStack Start yet. If the styles are missing after
          you add a component, compare your setup with the <Code>@stylexjs/unplugin</Code>{" "}
          documentation and open an issue.
        </Prose>
      </Section>

      <ShelfSteps />

      <Section title="Use a component">
        <CodeBlock
          code={`import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Button>Save</Button>;
}`}
          title="src/routes/index.tsx"
        />
        <Prose>
          Import from the alias your <Code>tsconfig.json</Code> declares. <Code>shelf init</Code>{" "}
          copies it, so installed files use the same one.
        </Prose>
      </Section>
    </>
  );
}
