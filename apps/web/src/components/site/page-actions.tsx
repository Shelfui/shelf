"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FileTextIcon,
  LinkIcon,
} from "@/components/ui/icons";
import { spacing } from "@/styles/shelf/tokens.stylex";

/**
 * Copy this page for a coding agent, or open its Markdown. `path` is the page's route, such as
 * `/docs/cli`; the Markdown is the generated file at `<path>.md`.
 */
export function PageActions({ path }: { path: string }) {
  const markdown = `${path}.md`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = copied ? setTimeout(() => setCopied(false), 2000) : undefined;
    return () => clearTimeout(timer);
  }, [copied]);

  function copy(text: () => Promise<string>) {
    void text()
      .then((value) => navigator.clipboard.writeText(value))
      .then(() => setCopied(true));
  }

  return (
    <div {...stylex.props(styles.row)}>
      <Button variant="outline" size="sm" onClick={() => copy(() => agentPrompt(markdown))}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied" : "Copy page"}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          render={<Button variant="outline" size="icon-sm" aria-label="More page actions" />}
        >
          <ChevronDownIcon />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={() => copy(() => agentPrompt(markdown))}>
            <CopyIcon />
            Copy page
          </DropdownMenu.Item>
          <DropdownMenu.LinkItem href={markdown}>
            <FileTextIcon />
            View as Markdown
          </DropdownMenu.LinkItem>
          <DropdownMenu.Item
            onClick={() => copy(() => Promise.resolve(new URL(markdown, location.origin).href))}
          >
            <LinkIcon />
            Copy Markdown link
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}

/** The page as Markdown, with a line telling the agent what to do with it. */
async function agentPrompt(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  const markdown = await response.text();
  return [
    "Follow these Shelf instructions in this project. Shelf installs components as source with `shelf add`; run `shelf check` when done.",
    `The full documentation index is at ${new URL("/llms.txt", location.origin).href}`,
    "",
    markdown,
  ].join("\n");
}

const styles = stylex.create({
  row: {
    gap: spacing["1"],
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
});
