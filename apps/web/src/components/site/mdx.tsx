import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Article, BulletList } from "./docs-page";
import { CodeBlock } from "./code-block";
import { CodeFrame } from "./code-frame";

export { Heading } from "./docs-page";
export { Prose as Paragraph } from "./docs-page";
export { BulletList as List } from "./docs-page";

export function Wrapper({ children }: { children: ReactNode }) {
  return <Article>{children}</Article>;
}

const LANGUAGES = {
  bash: "bash",
  sh: "bash",
  css: "css",
  json: "json",
  yaml: "yaml",
  tsx: "tsx",
  ts: "tsx",
  js: "tsx",
  jsx: "tsx",
} as const;

interface CodeProps {
  className?: string;
  children?: ReactNode;
  title?: string;
}

/** A fenced code block. Languages Shelf can't highlight, such as `text`, render unhighlighted. */
export function Pre({ children, title }: { children?: ReactNode; title?: string }) {
  const code = Children.toArray(children).find(
    (child): child is ReactElement<CodeProps> => isValidElement(child),
  );
  const source = typeof code?.props.children === "string" ? code.props.children.trimEnd() : "";
  const name = /language-(\w+)/.exec(code?.props.className ?? "")?.[1] ?? "text";
  const lang = name in LANGUAGES ? LANGUAGES[name as keyof typeof LANGUAGES] : undefined;
  return lang ? (
    <CodeBlock code={source} lang={lang} title={title} />
  ) : (
    <CodeFrame code={source} title={title} />
  );
}

/** `<File name="vite.config.ts">` around a fenced block gives it a file name. */
export function File({ name, children }: { name: string; children: ReactNode }) {
  const block = Children.toArray(children).find(isValidElement);
  return block ? cloneElement(block as ReactElement<{ title?: string }>, { title: name }) : null;
}
