import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { Language } from "@/lib/highlight";
import { Article } from "./docs-page";
import { CodeBlock } from "./code-block";
import { CodeFrame } from "./code-frame";

export { Heading } from "./docs-page";
export { Prose as Paragraph } from "./docs-page";
export { BulletList as List } from "./docs-page";

export function Wrapper({ children }: { children: ReactNode }) {
  return <Article>{children}</Article>;
}

const LANGUAGES: Partial<Record<string, Language>> = {
  bash: "bash",
  sh: "bash",
  css: "css",
  json: "json",
  yaml: "yaml",
  tsx: "tsx",
  ts: "tsx",
  js: "tsx",
  jsx: "tsx",
};

interface CodeProps {
  className?: string;
  children?: ReactNode;
  title?: string;
}

/** A fenced code block. Languages Shelf can't highlight, such as `text`, render unhighlighted. */
export function Pre({ children, title }: { children?: ReactNode; title?: string }) {
  const code = Children.toArray(children).find((child): child is ReactElement<CodeProps> =>
    isValidElement(child),
  );
  const source = typeof code?.props.children === "string" ? code.props.children.trimEnd() : "";
  const name = /language-(\w+)/.exec(code?.props.className ?? "")?.[1] ?? "text";
  const lang = LANGUAGES[name];
  return lang ? (
    <CodeBlock code={source} lang={lang} title={title} />
  ) : (
    <CodeFrame code={source} title={title} />
  );
}

/** `<File name="vite.config.ts">` around a fenced block gives it a file name. */
export function File({ name, children }: { name: string; children: ReactNode }) {
  const block = Children.toArray(children).find(
    (child): child is ReactElement<{ title?: string }> => isValidElement(child),
  );
  return block ? cloneElement(block, { title: name }) : null;
}
