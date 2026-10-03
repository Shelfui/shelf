"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { FileTextIcon } from "@/components/ui/icons";
import * as Tooltip from "@/components/ui/tooltip";
import { spacing } from "@/styles/shelf/tokens.stylex";
import { CopyButton } from "./copy-button";

/**
 * Copy this page for a coding agent, or open its Markdown. `path` is the page's route, such as
 * `/docs/cli`; the Markdown is the generated file at `<path>.md`.
 */
export function PageActions({ path }: { path: string }) {
  const markdown = `${path}.md`;
  return (
    <div {...stylex.props(styles.row)}>
      <CopyButton label="Copy page for agent" value={() => agentPrompt(markdown)} />
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Link
              href={markdown}
              aria-label="View as Markdown"
              {...stylex.props(buttonStyles("ghost", "icon-sm"))}
            />
          }
        >
          <FileTextIcon />
        </Tooltip.Trigger>
        <Tooltip.Content>View as Markdown</Tooltip.Content>
      </Tooltip.Root>
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
  },
});
