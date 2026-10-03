import * as stylex from "@stylexjs/stylex";
import { darkTheme } from "@/styles/shelf/themes";
import { colors, radius, typography } from "@/styles/shelf/tokens.stylex";
import {
  COLOR_NAMES,
  DEFAULT_SELECTION,
  type Mode,
  type ThemeSelection,
  findBrand,
  findPreset,
  radiusScale,
  resolveTheme,
} from "./presets";

/**
 * The stored selection includes resolved CSS variable values (font stacks, StyleX variable names),
 * and the script below applies them before hydration. Bump the suffix whenever those change, or
 * returning visitors paint with stale values until the first hydration fixes them (a visible flash).
 */
export const THEME_STORAGE_KEY = "shelf-theme-2";
/** next-themes' key for "light", "dark", or "system". */
export const MODE_STORAGE_KEY = "theme";

/** Custom property name → value, set inline on `<body>`. */
export type ThemeVars = Record<string, string>;

interface StoredTheme {
  selection: ThemeSelection;
  vars: Record<Mode, ThemeVars>;
}

/** A StyleX theme's own class. Its other class only marks the variable group it themes. */
function themeClass(theme: stylex.Theme<typeof colors>): string {
  const group = new Set(Object.keys(theme));
  const own = (stylex.props(theme).className ?? "").split(" ").find((name) => !group.has(name));
  if (!own) throw new Error("StyleX theme has no class of its own");
  return own;
}

/** The class next-themes puts on `<html>` for dark mode. */
export const darkClass = themeClass(darkTheme);

/** `var(--x1abc)` → `--x1abc`. */
function varName(ref: unknown): string {
  const match = /^var\((--[\w-]+)\)$/.exec(String(ref));
  if (!match?.[1]) throw new Error(`Not a StyleX variable: ${String(ref)}`);
  return match[1];
}

const colorVars = COLOR_NAMES.map((name) => [name, varName(colors[name])] as const);
const radiusVars = { sm: varName(radius.sm), md: varName(radius.md), lg: varName(radius.lg) };
const fontVars = { sans: varName(typography.fontFamily), mono: varName(typography.fontFamilyMono) };
const allVarNames = [
  ...colorVars.map(([, name]) => name),
  ...Object.values(radiusVars),
  ...Object.values(fontVars),
];

/** Every variable a selection sets, on `<body>` or on one element such as a preview. */
export function selectionVars(selection: ThemeSelection, mode: Mode): ThemeVars {
  const { preset, palette, radius: base } = resolveTheme(selection, mode);
  const vars: ThemeVars = {};
  for (const [name, cssVar] of colorVars) vars[cssVar] = palette[name];
  const scale = radiusScale(base);
  vars[radiusVars.sm] = scale.sm;
  vars[radiusVars.md] = scale.md;
  vars[radiusVars.lg] = scale.lg;
  vars[fontVars.sans] = preset.sans.stack;
  vars[fontVars.mono] = preset.mono.stack;
  return vars;
}

/**
 * Runs `change` with CSS transitions off, so a mode switch repaints at once instead of fading.
 * Used for user-triggered switches only: next-themes' own `disableTransitionOnChange` forces a
 * synchronous style recalculation (`getComputedStyle`) on every mount, which PageSpeed reports as
 * a forced reflow.
 */
export function withoutTransitions(change: () => void): void {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(style);
  change();
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
}

export function applyThemeVars(
  vars: ThemeVars,
  mode: Mode,
  element: HTMLElement = document.body,
): void {
  for (const name of allVarNames) element.style.removeProperty(name);
  for (const [name, value] of Object.entries(vars)) element.style.setProperty(name, value);
  element.dataset["mode"] = mode;
}

export function readSelection(): ThemeSelection {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? "null");
    return parseSelection(stored);
  } catch {
    return DEFAULT_SELECTION;
  }
}

function parseSelection(value: unknown): ThemeSelection {
  if (typeof value !== "object" || value === null || !("selection" in value))
    return DEFAULT_SELECTION;
  const selection: unknown = value.selection;
  if (typeof selection !== "object" || selection === null) return DEFAULT_SELECTION;
  const preset =
    "preset" in selection && typeof selection.preset === "string" ? selection.preset : "";
  const brand = "brand" in selection && typeof selection.brand === "string" ? selection.brand : "";
  const base =
    "radius" in selection && typeof selection.radius === "number" ? selection.radius : null;
  return {
    preset: findPreset(preset).name,
    brand: findBrand(brand)?.name ?? "preset",
    radius: base,
  };
}

export function storeSelection(selection: ThemeSelection): void {
  const stored: StoredTheme = {
    selection,
    vars: { light: selectionVars(selection, "light"), dark: selectionVars(selection, "dark") },
  };
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(stored));
}

const defaultVars: Record<Mode, ThemeVars> = {
  light: selectionVars(DEFAULT_SELECTION, "light"),
  dark: selectionVars(DEFAULT_SELECTION, "dark"),
};

/**
 * Runs before paint: sets the stored theme's variables, or Default's, on `<body>`, where they
 * override both modes' classes. It resolves the mode the way next-themes does.
 */
export const themeScript = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)}) || "system";
    const dark = stored === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : stored === "dark";
    const mode = dark ? "dark" : "light";
    document.body.dataset.mode = mode;
    const theme = JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) || "null");
    const saved = theme && theme.vars && theme.vars[mode];
    const vars = saved && Object.keys(saved).length ? saved : ${JSON.stringify(defaultVars)}[mode];
    for (const name in vars) document.body.style.setProperty(name, vars[name]);
  } catch {}
})();`;
