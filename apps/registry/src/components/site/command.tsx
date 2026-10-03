import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { PackageManagerLogo } from "@/components/site/brand-logos";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import * as Select from "@/components/ui/select";
import { PACKAGE_MANAGERS, isPackageManager, runner } from "@/lib/package-manager";
import { usePackageManager } from "@/lib/use-package-manager";
import { colors, radius, sizes, spacing, typography } from "@/styles/shelf/tokens.stylex";

const MANAGERS = PACKAGE_MANAGERS.map((pm) => ({ value: pm, label: pm }));

/**
 * A Shelf CLI command for the reader's package manager, with a copy button. `switcher` shows
 * it as a field with a package manager picker; every command on the page follows the choice.
 */
export function Command({
  args,
  label,
  switcher = false,
}: {
  /** What follows `shelf`, such as `add button`. */
  args: string;
  label?: string;
  switcher?: boolean;
}) {
  const [pm, setPm] = usePackageManager();
  const command = `${runner(pm)} ${args}`;
  const copy = <CopyButton value={command} label={`Copy ${label ?? "command"}`} />;

  if (!switcher) {
    return (
      <div {...stylex.props(styles.inline)}>
        <code {...stylex.props(styles.inlineCode)}>{command}</code>
        {copy}
      </div>
    );
  }
  return (
    <div {...stylex.props(styles.field)}>
      <code {...stylex.props(styles.command)}>
        <span {...stylex.props(styles.runner)}>{runner(pm)}</span>&nbsp;{args}
      </code>
      <Select.Root
        items={MANAGERS}
        value={pm}
        onValueChange={(value: string | null) => {
          if (isPackageManager(value)) setPm(value);
        }}
      >
        <Select.Trigger aria-label={`Package manager: ${pm}`} style={styles.picker}>
          <PackageManagerLogo pm={pm} size="0.875rem" />
        </Select.Trigger>
        <Select.Content alignItemWithTrigger={false} align="end">
          {MANAGERS.map((manager) => (
            <Select.Item key={manager.value} value={manager.value}>
              <span {...stylex.props(styles.option)}>
                <PackageManagerLogo pm={manager.value} size="0.875rem" />
                {manager.label}
              </span>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      {copy}
    </div>
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void writeClipboard(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <Button variant="ghost" size="icon-xs" aria-label={copied ? "Copied" : label} onClick={copy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

/** The Figma plugin window denies the Clipboard API, so fall back to a selected textarea. */
async function writeClipboard(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    document.body.append(area);
    area.select();
    // oxlint-disable-next-line typescript/no-deprecated
    document.execCommand("copy");
    area.remove();
  }
}

/** A Shelf CLI prefix, such as `npx shelf`, for the reader's package manager. */
export function useRunner(): string {
  return runner(usePackageManager()[0]);
}

const styles = stylex.create({
  inline: {
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    display: "inline-flex",
    gap: spacing["2"],
    maxWidth: "100%",
    paddingBlock: spacing["1"],
    paddingInlineEnd: spacing["1"],
    paddingInlineStart: spacing["3"],
  },
  inlineCode: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
  field: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.input,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    boxSizing: "border-box",
    display: "flex",
    gap: spacing["1"],
    height: sizes.controlDefault,
    maxWidth: "32rem",
    paddingInlineEnd: spacing["1"],
    width: "100%",
  },
  picker: {
    borderColor: "transparent",
    borderRadius: radius.sm,
    gap: spacing["1"],
    height: sizes.controlSm,
    minWidth: 0,
    paddingInline: spacing["2"],
  },
  option: {
    alignItems: "center",
    display: "flex",
    gap: spacing["2"],
  },
  command: {
    color: colors.foreground,
    flexGrow: 1,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    minWidth: 0,
    overflowX: "auto",
    paddingInlineStart: spacing["3"],
    scrollbarWidth: "none",
    whiteSpace: "nowrap",
  },
  runner: {
    color: colors.mutedForeground,
  },
});
