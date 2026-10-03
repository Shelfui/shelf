"use client";

import * as stylex from "@stylexjs/stylex";
import * as Dialog from "@/components/ui/dialog";
import * as Tabs from "@/components/ui/tabs";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { generateThemeCode } from "@/themes/code";
import { type ThemeSelection, findPreset } from "@/themes/presets";
import { HighlightedCode } from "./highlighted-code";
import { usePackageManager } from "./use-package-manager";

export function ThemeCodeDialog({
  selection,
  open,
  onOpenChange,
}: {
  selection: ThemeSelection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pm] = usePackageManager();
  const files = generateThemeCode(selection, pm);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={styles.content}>
        <Dialog.Header>
          <Dialog.Title>{findPreset(selection.preset).title} theme</Dialog.Title>
          <Dialog.Description>
            Paste into the foundations in{" "}
            <code {...stylex.props(styles.path)}>src/styles/shelf</code>. Every component reads
            these tokens, so nothing else changes.
          </Dialog.Description>
        </Dialog.Header>
        <Tabs.Root defaultValue={files[0]?.file} style={styles.tabs}>
          <Tabs.List style={styles.list}>
            {files.map((item) => (
              <Tabs.Tab key={item.file} value={item.file}>
                {item.file}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {files.map((item) => (
            <Tabs.Panel key={item.file} value={item.file} style={styles.panel}>
              <p {...stylex.props(styles.action)}>{item.action}</p>
              <HighlightedCode
                code={item.code}
                lang={item.file.endsWith(".css") ? "css" : "tsx"}
                title={item.file}
                maxHeight
              />
            </Tabs.Panel>
          ))}
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

const styles = stylex.create({
  content: {
    maxWidth: "min(44rem, calc(100vw - 2rem))",
    width: "100%",
  },
  path: {
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.8125rem",
  },
  tabs: {
    minWidth: 0,
  },
  list: {
    justifySelf: "start",
  },
  panel: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  action: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
});
