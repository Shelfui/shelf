import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import * as Tabs from "@/components/ui/tabs";
import { colors, radius, spacing } from "@/styles/shelf/tokens.stylex";
import { site } from "@/styles/site.stylex";
import { CodeBlock } from "./code-block";

export function ComponentPreview({
  children,
  code,
  compact = false,
}: {
  children: ReactNode;
  code: string;
  /** A shorter frame, for the examples below a page's main demo. */
  compact?: boolean;
}) {
  return (
    <Tabs.Root defaultValue="preview" style={styles.root}>
      <Tabs.List style={styles.list}>
        <Tabs.Tab value="preview">Preview</Tabs.Tab>
        <Tabs.Tab value="code">Code</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="preview" style={[styles.preview, compact && styles.compact]}>
        {children}
      </Tabs.Panel>
      <Tabs.Panel value="code">
        <CodeBlock code={code} maxHeight />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["3"],
    display: "grid",
  },
  list: {
    justifySelf: "start",
  },
  preview: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    display: "flex",
    justifyContent: "center",
    minHeight: "26rem",
    padding: site.space12,
  },
  compact: {
    minHeight: "12rem",
    padding: site.space8,
  },
});
