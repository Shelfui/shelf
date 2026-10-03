"use client";

import * as stylex from "@stylexjs/stylex";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Tabs from "@/components/ui/tabs";
import { type PackageManager, isPackageManager } from "@/lib/package-manager";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { CopyButton } from "./copy-button";
import { usePackageManager } from "./use-package-manager";

export function CommandTabs({
  commands,
}: {
  commands: Array<{ pm: PackageManager; code: string; html: string }>;
}) {
  const [pm, setPm] = usePackageManager();
  const current = commands.find((command) => command.pm === pm) ?? commands[0];

  return (
    <Tabs.Root
      value={pm}
      onValueChange={(value) => {
        if (isPackageManager(value)) setPm(value);
      }}
      style={styles.root}
    >
      <div {...stylex.props(styles.header)}>
        <Tabs.List aria-label="Package manager" style={styles.list}>
          {commands.map((command) => (
            <Tabs.Tab key={command.pm} value={command.pm} style={styles.tab}>
              {command.pm}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <CopyButton value={current?.code ?? ""} />
      </div>
      {commands.map((command) => (
        <Tabs.Panel key={command.pm} value={command.pm}>
          <ScrollArea>
            <div
              {...stylex.props(styles.code)}
              dangerouslySetInnerHTML={{ __html: command.html }}
            />
          </ScrollArea>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}

const styles = stylex.create({
  root: {
    gap: 0,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    minWidth: 0,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: spacing["1"],
    paddingInlineEnd: spacing["1"],
    paddingInlineStart: spacing["4"],
  },
  list: {
    padding: 0,
    backgroundColor: "transparent",
  },
  tab: {
    flexGrow: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
  code: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyMono,
    fontSize: "0.8125rem",
    lineHeight: "1.4rem",
    paddingBlock: spacing["4"],
    paddingInline: spacing["6"],
    width: "max-content",
  },
});
