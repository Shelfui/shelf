import type { MDXComponents } from "mdx/types";
import { Command } from "@/components/site/command";
import { Diagram } from "@/components/site/diagram";
import { Code, PageHeader, TextLink } from "@/components/site/docs-page";
import { File, Heading, List, Paragraph, Pre, Wrapper } from "@/components/site/mdx";

/**
 * How Markdown in `.mdx` docs renders. Pages are written as plain Markdown so the same file is
 * the HTML page and the `.md` an agent fetches; only `Command`, `Diagram`, `File`, and `PageHeader` are JSX,
 * and `scripts/agent-docs.ts` knows how to turn each into Markdown.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: Wrapper,
    h2: Heading,
    p: Paragraph,
    ul: List,
    code: Code,
    pre: Pre,
    a: ({ href = "", children }) => <TextLink href={href}>{children}</TextLink>,
    Command,
    Diagram,
    File,
    PageHeader,
    ...components,
  };
}
