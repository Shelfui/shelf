"use client";

import * as stylex from "@stylexjs/stylex";
import {
  CheckIcon,
  ExternalLinkIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  TerminalIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as Tabs from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { runCommand } from "@/lib/package-manager";
import { colors, motion, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens } from "@/styles/site.stylex";
import { LinkButton } from "./link-button";
import { usePackageManager } from "./use-package-manager";

const WIDTHS = [
  { value: "100%", label: "Desktop", icon: MonitorIcon },
  { value: "48rem", label: "Tablet", icon: LandscapeTabletIcon },
  { value: "24rem", label: "Mobile", icon: SmartphoneIcon },
];

function LandscapeTabletIcon() {
  return <TabletIcon {...stylex.props(styles.landscape)} />;
}

/** A block in a live frame at a chosen width, with its source one tab away. */
export function BlockViewer({
  name,
  title,
  description,
  height,
  code,
}: {
  name: string;
  title: string;
  description: string;
  height: number;
  /** The rendered source files, shown in the Code tab. */
  code: ReactNode;
}) {
  const [width, setWidth] = useState("100%");

  return (
    <Tabs.Root id={name} defaultValue="preview" style={styles.root}>
      <div {...stylex.props(styles.toolbar)}>
        <Tabs.List>
          <Tabs.Tab value="preview">Preview</Tabs.Tab>
          <Tabs.Tab value="code">Code</Tabs.Tab>
        </Tabs.List>
        <div {...stylex.props(styles.heading)}>
          <h2 {...stylex.props(styles.title)}>
            <a href={`#${name}`} {...stylex.props(styles.anchor)}>
              {title}
            </a>
          </h2>
          <p {...stylex.props(styles.description)}>{description}</p>
        </div>
        <div {...stylex.props(styles.actions)}>
          <div {...stylex.props(styles.frameControls)}>
            <ToggleGroup
              aria-label="Preview width"
              value={[width]}
              onValueChange={(value) => {
                if (value[0]) setWidth(value[0]);
              }}
            >
              {WIDTHS.map((option) => (
                <Toggle key={option.value} value={option.value} size="sm" aria-label={option.label}>
                  <option.icon />
                </Toggle>
              ))}
            </ToggleGroup>
            <LinkButton
              href={`/view/${name}`}
              target="_blank"
              variant="ghost"
              size="icon-sm"
              aria-label="Open in a new tab"
            >
              <ExternalLinkIcon />
            </LinkButton>
          </div>
          <InstallButton args={`add ${name}`} />
        </div>
      </div>
      <Tabs.Panel value="preview" keepMounted>
        <div {...stylex.props(styles.frame)} style={{ height, maxWidth: width }}>
          <iframe
            src={`/view/${name}`}
            title={`${title} preview`}
            loading="lazy"
            // The frame shows this site's own page and reads its stored theme, so it keeps its origin.
            // oxlint-disable-next-line react/iframe-missing-sandbox
            sandbox="allow-forms allow-same-origin allow-scripts"
            {...stylex.props(styles.iframe)}
          />
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="code">{code}</Tabs.Panel>
    </Tabs.Root>
  );
}

function InstallButton({ args }: { args: string }) {
  const [pm] = usePackageManager();
  const command = runCommand(pm, args);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = copied ? setTimeout(() => setCopied(false), 2000) : undefined;
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={copied ? "Copied" : `Copy ${command}`}
      onClick={() => {
        void navigator.clipboard.writeText(command).then(() => setCopied(true));
      }}
    >
      {copied ? <CheckIcon /> : <TerminalIcon />}
      <span {...stylex.props(styles.command)}>{command}</span>
    </Button>
  );
}

const styles = stylex.create({
  landscape: {
    transform: "rotate(90deg)",
  },
  root: {
    gap: spacing["4"],
    minWidth: 0,
    scrollMarginTop: "6rem",
  },
  toolbar: {
    gap: spacing["4"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  heading: {
    display: "grid",
    flexBasis: "16rem",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeightSm,
    margin: 0,
  },
  anchor: {
    color: colors.foreground,
    textDecoration: {
      default: "none",
      ":hover": "underline",
    },
    textUnderlineOffset: "4px",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeightSm,
    margin: 0,
  },
  actions: {
    gap: spacing["2"],
    alignItems: "center",
    display: "flex",
  },
  frameControls: {
    gap: spacing["1"],
    alignItems: "center",
    display: { default: "none", [screens.lg]: "flex" },
  },
  command: {
    fontFamily: typography.fontFamilyMono,
  },
  frame: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    backgroundColor: colors.background,
    marginInline: "auto",
    overflow: "hidden",
    width: "100%",
    transitionDuration: motion.durationSlow,
    transitionProperty: "max-width",
    transitionTimingFunction: motion.easingStandard,
  },
  iframe: {
    borderWidth: 0,
    display: "block",
    height: "100%",
    width: "100%",
  },
});
