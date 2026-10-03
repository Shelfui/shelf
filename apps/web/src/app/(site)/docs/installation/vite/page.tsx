import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Command } from "@/components/site/command";
import { Code, PageHeader, Prose, Section, TextLink } from "@/components/site/docs-page";
import { ShelfSteps } from "@/components/site/install-steps";

export const metadata: Metadata = {
  title: "Vite",
  description: "Set up Shelf in a Vite and React project.",
  alternates: { canonical: "/docs/installation/vite" },
};

const CONFIG = `import stylex from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [stylex({ useCSSLayers: true }), react()],
});`;

export default function ViteInstallation() {
  return (
    <>
      <PageHeader title="Vite" description="Set up Shelf in a Vite and React project." />

      <Section title="Create a project">
        <CodeBlock code="npm create vite@latest my-app -- --template react-ts" lang="bash" />
        <Prose>Skip this if you already have a Vite and React project.</Prose>
      </Section>

      <Section title="Set up StyleX">
        <Command packages={["@stylexjs/stylex"]} />
        <Command packages={["@stylexjs/unplugin"]} dev />
        <Prose>
          Add the plugin to <Code>vite.config.ts</Code>, before the React plugin.
        </Prose>
        <CodeBlock code={CONFIG} lang="tsx" title="vite.config.ts" />
      </Section>

      <ShelfSteps />

      <Section title="Use a component">
        <CodeBlock
          code={`import { Button } from "./components/ui/button";

export function App() {
  return <Button>Save</Button>;
}`}
          title="src/App.tsx"
        />
        <Prose>
          Importing <Code>./styles/shelf/fonts.css</Code> once in your entry file loads Geist. To
          use your own fonts, see <TextLink href="/docs/installation">installation</TextLink>.
        </Prose>
      </Section>
    </>
  );
}
