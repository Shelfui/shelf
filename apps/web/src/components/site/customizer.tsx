"use client";

import * as stylex from "@stylexjs/stylex";
import { MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import * as Popover from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import {
  BRANDS,
  DEFAULT_SELECTION,
  PRESETS,
  RADII,
  type Mode,
  type ThemeSelection,
  findPreset,
  resolveTheme,
} from "@/themes/presets";
import { withoutTransitions } from "@/themes/apply";
import { useMode, useThemeSelection } from "@/themes/use-theme";
import { ThemeCodeDialog } from "./theme-code-dialog";

const MODES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

export function Customizer() {
  const [selection, setSelection] = useThemeSelection();
  const { theme, setTheme } = useTheme();
  const mode = useMode() ?? "light";
  const [open, setOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const preset = findPreset(selection.preset);
  const current = resolveTheme(selection, mode);

  const update = (next: Partial<ThemeSelection>) => setSelection({ ...selection, ...next });

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger render={<Button variant="ghost" size="sm" />}>
          <PaletteIcon />
          Customize
        </Popover.Trigger>
        <Popover.Content align="end" style={styles.popup}>
          <Popover.Header>
            <Popover.Title>Customize</Popover.Title>
            <Popover.Description>
              Every page follows your theme. Copy the code into your app.
            </Popover.Description>
          </Popover.Header>

          <Section label="Mode">
            <ToggleGroup
              aria-label="Mode"
              value={theme ? [theme] : []}
              onValueChange={([value]) => {
                if (value) withoutTransitions(() => setTheme(value));
              }}
              style={styles.row}
            >
              {MODES.map(({ value, label, icon: Icon }) => (
                <Toggle key={value} value={value} variant="outline" size="sm" style={styles.grow}>
                  <Icon />
                  {label}
                </Toggle>
              ))}
            </ToggleGroup>
          </Section>

          <Section label="Preset">
            <ToggleGroup
              aria-label="Preset"
              value={[preset.name]}
              onValueChange={([value]) => {
                if (value) update({ preset: value, radius: null });
              }}
              style={styles.presets}
            >
              {PRESETS.map((item) => (
                <Toggle key={item.name} value={item.name} variant="outline" style={styles.preset}>
                  <PresetSwatch preset={item.name} mode={mode} />
                  {item.title}
                </Toggle>
              ))}
            </ToggleGroup>
          </Section>

          <Section label="Brand color">
            <ToggleGroup
              aria-label="Brand color"
              value={[selection.brand]}
              onValueChange={([value]) => {
                if (value) update({ brand: value });
              }}
              style={styles.wrap}
            >
              <Toggle
                value="preset"
                aria-label={`${preset.title} primary`}
                size="sm"
                style={styles.brand}
              >
                <span {...stylex.props(styles.dot, styles.fill(preset[mode].primary))} />
              </Toggle>
              {BRANDS.map((item) => (
                <Toggle
                  key={item.name}
                  value={item.name}
                  aria-label={item.title}
                  size="sm"
                  style={styles.brand}
                >
                  <span {...stylex.props(styles.dot, styles.fill(item[mode].primary))} />
                </Toggle>
              ))}
            </ToggleGroup>
          </Section>

          <Section label="Radius">
            <ToggleGroup
              aria-label="Radius"
              value={[String(current.radius)]}
              onValueChange={([value]) => {
                if (value === undefined) return;
                const base = Number(value);
                update({ radius: base === preset.radius ? null : base });
              }}
              style={styles.row}
            >
              {RADII.map((base) => (
                <Toggle
                  key={base}
                  value={String(base)}
                  variant="outline"
                  size="sm"
                  style={styles.grow}
                >
                  {base}
                </Toggle>
              ))}
            </ToggleGroup>
          </Section>

          <div {...stylex.props(styles.footer)}>
            <Button variant="ghost" size="sm" onClick={() => setSelection(DEFAULT_SELECTION)}>
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setOpen(false);
                setCodeOpen(true);
              }}
            >
              Copy code
            </Button>
          </div>
        </Popover.Content>
      </Popover.Root>
      <ThemeCodeDialog selection={selection} open={codeOpen} onOpenChange={setCodeOpen} />
    </>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div {...stylex.props(styles.section)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      {children}
    </div>
  );
}

/** Background, primary, and foreground of a preset. */
function PresetSwatch({ preset, mode }: { preset: string; mode: Mode }) {
  const palette = findPreset(preset)[mode];
  return (
    <span aria-hidden {...stylex.props(styles.swatch, styles.fill(palette.background))}>
      <span {...stylex.props(styles.half, styles.fill(palette.primary))} />
    </span>
  );
}

const styles = stylex.create({
  popup: {
    width: "20rem",
  },
  section: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
  },
  presets: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  preset: {
    justifyContent: "flex-start",
  },
  wrap: {
    flexWrap: "wrap",
  },
  row: {
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  },
  brand: {
    borderRadius: radius.full,
  },
  dot: {
    borderRadius: radius.full,
    boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 12%)",
    height: "1rem",
    width: "1rem",
  },
  fill: (color: string) => ({
    backgroundColor: color,
  }),
  swatch: {
    borderRadius: radius.full,
    boxShadow: "inset 0 0 0 1px oklch(0.5 0 0 / 30%)",
    display: "inline-flex",
    flexShrink: 0,
    height: "1rem",
    justifyContent: "flex-end",
    overflow: "hidden",
    width: "1rem",
  },
  half: {
    width: "50%",
  },
  footer: {
    gap: spacing["2"],
    display: "flex",
    justifyContent: "flex-end",
  },
});
