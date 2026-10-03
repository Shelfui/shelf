import * as stylex from "@stylexjs/stylex";
import * as Tabs from "@/components/ui/tabs";
import type { SourceFile } from "@/docs/source";
import { spacing } from "@/styles/shelf/tokens.stylex";
import { CodeBlock } from "./code-block";
import { Command } from "./command";

/** The add command, or the files it writes for copying by hand. */
export function InstallTabs({ name, files }: { name: string; files: SourceFile[] }) {
  return (
    <Tabs.Root defaultValue="command" style={styles.root}>
      <Tabs.List style={styles.list}>
        <Tabs.Tab value="command">Command</Tabs.Tab>
        <Tabs.Tab value="source">Source</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="command">
        <Command args={`add ${name}`} />
      </Tabs.Panel>
      <Tabs.Panel value="source" style={styles.files}>
        {files.map((file) => (
          <CodeBlock key={file.path} code={file.code} title={file.path} maxHeight />
        ))}
      </Tabs.Panel>
    </Tabs.Root>
  );
}

const styles = stylex.create({
  root: {
    gap: spacing["3"],
    display: "grid",
    minWidth: 0,
  },
  list: {
    justifySelf: "start",
  },
  files: {
    gap: spacing["3"],
    display: "grid",
    minWidth: 0,
  },
});
