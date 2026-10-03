import { readFile } from "node:fs/promises";
import path from "node:path";
import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "@/components/site/code-block";
import { ComponentPreview } from "@/components/site/component-preview";
import { VerifiedBadge } from "@/components/site/verified";
import { InstallTabs } from "@/components/site/install-tabs";
import {
  Code,
  Definitions,
  PageHeader,
  Prose,
  Section,
  TextLink,
} from "@/components/site/docs-page";
import { demos } from "@/demos";
import { examples } from "@/demos/examples";
import { components, findComponent } from "@/docs/components";
import { checksFor, formatSize, summaryFor, verificationFor, weigh } from "@/docs/verify";
import { installedDependencies, installedFiles, usageExample } from "@/docs/source";
import { siteConfig } from "@/site";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";

interface Props {
  params: Promise<{ name: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((component) => ({ name: component.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const component = findComponent((await params).name);
  if (!component) return {};
  return {
    title: component.title,
    description: component.description,
    alternates: { canonical: `/docs/components/${component.name}` },
    openGraph: { title: `${component.title} | Shelf`, description: component.description },
  };
}

export default async function ComponentPage({ params }: Props) {
  const { name } = await params;
  const component = findComponent(name);
  const Demo = demos[name];
  if (!component || !Demo) notFound();

  const [source, files, dependencies, exampleSources] = await Promise.all([
    readDemo(`${name}.tsx`),
    installedFiles(name),
    installedDependencies(name),
    Promise.all(
      (component.examples ?? []).map((example) => readDemo(`examples/${name}-${example.name}.tsx`)),
    ),
  ]);
  const verification = verificationFor(name);
  const main = files.find((file) => file.path.endsWith(`/${name}.tsx`)) ?? files[0];
  const usage = main && usageExample(main);
  const index = components.indexOf(component);
  const previous = components[index - 1];
  const next = components[index + 1];

  return (
    <article>
      <PageHeader
        title={component.title}
        description={component.description}
        aside={
          verification && (
            <VerifiedBadge
              summary={summaryFor(verification)}
              storybookHref={
                verification.storyId
                  ? new URL(
                      `storybook/?path=/story/${verification.storyId}`,
                      siteConfig.registryUrl,
                    ).href
                  : undefined
              }
            />
          )
        }
      />

      <ComponentPreview code={source}>
        <Demo />
      </ComponentPreview>

      <Section title="When to use">
        <Definitions
          items={[
            { term: "Use when", text: component.useWhen },
            { term: "Avoid when", text: component.avoidWhen },
          ]}
        />
      </Section>

      <Section title="Installation">
        <InstallTabs name={component.name} files={files} />
        <Prose>
          The source lands in <Code>{main?.path}</Code>, along with any Shelf items it builds on,
          and <Code>.shelf/lock.json</Code> records what was installed. It&apos;s yours to edit.
        </Prose>
      </Section>

      {usage && (
        <Section title="Usage">
          <CodeBlock code={usage} />
        </Section>
      )}

      {component.examples && (
        <Section title="Examples">
          {component.examples.map((example, position) => {
            const Example = examples[`${name}-${example.name}`];
            if (!Example) throw new Error(`Missing example ${name}-${example.name}`);
            return (
              <div key={example.name} {...stylex.props(styles.example)}>
                <h3 id={`example-${example.name}`} {...stylex.props(styles.exampleTitle)}>
                  {example.title}
                </h3>
                {example.description && <Prose>{example.description}</Prose>}
                <ComponentPreview code={exampleSources[position] ?? ""} compact>
                  <Example />
                </ComponentPreview>
              </div>
            );
          })}
        </Section>
      )}

      <Section title="Built on">
        <Definitions
          items={[
            {
              term: "Packages",
              text: dependencies.packages.length ? (
                <List
                  items={dependencies.packages.map((dep) => (
                    <Code key={dep}>{dep}</Code>
                  ))}
                />
              ) : (
                "None"
              ),
            },
            {
              term: "Shelf items",
              text: dependencies.shelf.length ? (
                <List
                  items={dependencies.shelf.map((dep) => {
                    const doc = findComponent(dep);
                    return doc ? (
                      <TextLink key={dep} href={`/docs/components/${dep}`}>
                        {doc.title}
                      </TextLink>
                    ) : (
                      <Code key={dep}>{dep}</Code>
                    );
                  })}
                />
              ) : (
                "None"
              ),
            },
            ...(dependencies.packages.includes("@base-ui/react")
              ? [
                  {
                    term: "Accessibility",
                    text: "Focus, keyboard, and ARIA behavior come from Base UI.",
                  },
                ]
              : []),
            {
              term: "Figma",
              text: (
                <>
                  Optional native Figma library. See{" "}
                  <TextLink href="/docs/figma">Designers</TextLink>.
                </>
              ),
            },
          ]}
        />
      </Section>

      {verification && (
        <Section title="Verified">
          <Definitions
            items={[
              {
                term: "Size",
                text: `${formatSize(weigh(verification.size.own))} gzipped on its own, ${formatSize(weigh(verification.size.total))} with the Shelf items and packages it builds on. JS and CSS in a production build, without React.`,
              },
              ...checksFor(verification).map((check) => ({
                term: check.label,
                text: check.detail,
              })),
            ]}
          />
        </Section>
      )}

      <nav aria-label="Components" {...stylex.props(styles.pager)}>
        {previous ? (
          <Link href={`/docs/components/${previous.name}`} {...stylex.props(styles.pagerLink)}>
            <span {...stylex.props(styles.pagerLabel)}>Previous</span>
            {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/docs/components/${next.name}`}
            {...stylex.props(styles.pagerLink, styles.pagerNext)}
          >
            <span {...stylex.props(styles.pagerLabel)}>Next</span>
            {next.title}
          </Link>
        )}
      </nav>
    </article>
  );
}

async function readDemo(file: string): Promise<string> {
  const source = await readFile(path.join(process.cwd(), "src/demos", file), "utf8");
  return source.replace(/^"use client";\n\n/, "");
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <span {...stylex.props(styles.inlineList)}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && ", "}
          {item}
        </Fragment>
      ))}
    </span>
  );
}

const styles = stylex.create({
  example: {
    gap: spacing["3"],
    display: "grid",
    marginTop: spacing["4"],
  },
  exampleTitle: {
    fontSize: site.fontSizeXl,
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.01em",
    margin: 0,
  },
  inlineList: {
    display: "inline",
  },
  pager: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    display: "flex",
    justifyContent: "space-between",
    marginTop: site.space16,
    paddingTop: site.space8,
  },
  pagerLink: {
    gap: spacing["1"],
    color: colors.foreground,
    display: "grid",
    fontSize: site.fontSizeXl,
    textDecoration: "none",
  },
  pagerNext: {
    textAlign: "end",
  },
  pagerLabel: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
});
