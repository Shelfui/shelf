import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Command } from "@/components/site/command";
import { Code, PageHeader, Prose, Section, TextLink } from "@/components/site/docs-page";
import { ShelfSteps } from "@/components/site/install-steps";

export const metadata: Metadata = {
  title: "Next.js",
  description: "Set up Shelf in a Next.js project.",
  alternates: { canonical: "/docs/installation/nextjs" },
};

const BABEL = `const path = require("node:path");

module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@stylexjs/babel-plugin",
      {
        dev: process.env.NODE_ENV === "development",
        runtimeInjection: false,
        treeshakeCompensation: true,
        // Match the aliases in tsconfig.json.
        aliases: { "@/*": [path.join(__dirname, "src/*")] },
        unstable_moduleResolution: { type: "commonJS" },
      },
    ],
  ],
};`;

const POSTCSS = `const babelConfig = require("./babel.config");

module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      babelConfig: {
        babelrc: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
  },
};`;

export default function NextInstallation() {
  return (
    <>
      <PageHeader title="Next.js" description="Set up Shelf in a Next.js project." />

      <Section title="Create a project">
        <CodeBlock code="npx create-next-app@latest my-app --typescript --src-dir" lang="bash" />
        <Prose>
          Skip this if you already have a Next.js project. This site runs on Next with Shelf, so the
          steps below are the ones it uses.
        </Prose>
      </Section>

      <Section title="Set up StyleX">
        <Command packages={["@stylexjs/stylex"]} />
        <Command packages={["@stylexjs/babel-plugin", "@stylexjs/postcss-plugin"]} dev />
        <Prose>
          Next compiles StyleX with Babel and writes the CSS with PostCSS. Add{" "}
          <Code>babel.config.js</Code>:
        </Prose>
        <CodeBlock code={BABEL} lang="tsx" title="babel.config.js" />
        <Prose>
          Add <Code>postcss.config.js</Code>, reusing the same Babel plugins:
        </Prose>
        <CodeBlock code={POSTCSS} lang="tsx" title="postcss.config.js" />
        <Prose>
          Add the <Code>@stylex</Code> directive where the generated CSS should go, once, in the
          stylesheet your root layout imports.
        </Prose>
        <CodeBlock code="@stylex;" lang="css" title="src/app/globals.css" />
        <Prose>
          A <Code>babel.config.js</Code> makes Next use Babel instead of SWC for your source, so
          builds are somewhat slower.
        </Prose>
      </Section>

      <ShelfSteps />

      <Section title="Use a component">
        <CodeBlock
          code={`import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button>Save</Button>;
}`}
          title="src/app/page.tsx"
        />
        <Prose>
          Interactive components ship with <Code>&quot;use client&quot;</Code> where they need it,
          so you can import them from server components. For fonts, Shelf reads{" "}
          <Code>--font-sans</Code> and <Code>--font-mono</Code>, which works with{" "}
          <Code>next/font</Code>. See <TextLink href="/docs/installation">installation</TextLink>.
        </Prose>
      </Section>
    </>
  );
}
