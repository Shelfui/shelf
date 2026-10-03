/** The color tokens in `tokens.stylex.ts`, in file order. */
export const COLOR_NAMES = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "destructiveSurface",
  "destructiveText",
  "border",
  "input",
  "ring",
  "overlay",
] as const;

export type ColorName = (typeof COLOR_NAMES)[number];
export type Palette = Record<ColorName, string>;
export type Mode = "light" | "dark";

export interface Font {
  name: string;
  title: string;
  /** The `font-family` value on this site, where next/font loads the typeface. */
  stack: string;
  /** The `font-family` value in exported code, where the fontsource package loads it. */
  code: string;
  package: string;
  /** The CSS imports that load it from `package`. */
  imports: string[];
}

export interface Preset {
  name: string;
  title: string;
  /** Base radius in rem; see `radiusScale`. */
  radius: number;
  sans: Font;
  mono: Font;
  light: Palette;
  dark: Palette;
}

export interface Brand {
  name: string;
  title: string;
  light: { primary: string; primaryForeground: string };
  dark: { primary: string; primaryForeground: string };
}

export interface ThemeSelection {
  preset: string;
  /** A brand color that replaces the preset's primary, or "preset" to keep it. */
  brand: string;
  /** Base radius in rem, or null for the preset's own. */
  radius: number | null;
}

export const DEFAULT_SELECTION: ThemeSelection = {
  preset: "default",
  brand: "preset",
  radius: null,
};

const onLight = "#ffffff";
const onDark = "#0a0a0a";

const sansFallback = "ui-sans-serif, system-ui, sans-serif";
const monoFallback = "ui-monospace, SFMono-Regular, Menlo, monospace";

function googleFont(
  name: string,
  title: string,
  family: string,
  fallback: string,
  pkg: string,
  imports = [pkg],
): Font {
  return {
    name,
    title,
    stack: `var(--font-${name}), ${fallback}`,
    code: `"${family}", ${fallback}`,
    package: pkg,
    imports,
  };
}

export const SANS_FONTS: Font[] = [
  {
    name: "geist",
    title: "Geist",
    stack: `var(--font-geist), ${sansFallback}`,
    code: `"Geist Variable", ${sansFallback}`,
    package: "@fontsource-variable/geist",
    imports: ["@fontsource-variable/geist"],
  },
  googleFont("inter", "Inter", "Inter Variable", sansFallback, "@fontsource-variable/inter"),
  googleFont(
    "dm-sans",
    "DM Sans",
    "DM Sans Variable",
    sansFallback,
    "@fontsource-variable/dm-sans",
  ),
  googleFont(
    "instrument-sans",
    "Instrument Sans",
    "Instrument Sans Variable",
    sansFallback,
    "@fontsource-variable/instrument-sans",
  ),
];

export const MONO_FONTS: Font[] = [
  {
    name: "geist-mono",
    title: "Geist Mono",
    stack: `var(--font-geist-mono), ${monoFallback}`,
    code: `"Geist Mono Variable", ${monoFallback}`,
    package: "@fontsource-variable/geist-mono",
    imports: ["@fontsource-variable/geist-mono"],
  },
  googleFont(
    "jetbrains-mono",
    "JetBrains Mono",
    "JetBrains Mono Variable",
    monoFallback,
    "@fontsource-variable/jetbrains-mono",
  ),
];

function font(fonts: Font[], name: string): Font {
  const found = fonts.find((item) => item.name === name);
  if (!found) throw new Error(`Unknown font "${name}"`);
  return found;
}

const round = (value: number) => Number(value.toFixed(3));
const rem = (value: number) => (value === 0 ? "0" : `${round(value)}rem`);

const destructiveLight = {
  destructive: "oklch(0.577 0.245 27.3)",
  destructiveForeground: "#ffffff",
  destructiveSurface: "oklch(0.53 0.22 27.3)",
  destructiveText: "oklch(0.5 0.2 27.3)",
};

const destructiveDark = {
  destructive: "oklch(0.704 0.191 22.2)",
  destructiveForeground: "#ffffff",
  destructiveSurface: "oklch(0.53 0.22 27.3)",
  destructiveText: "oklch(0.704 0.191 22.2)",
};

/** The installed foundations: pure neutral black and white with a monochrome primary. */
const DEFAULT: Preset = {
  name: "default",
  title: "Default",
  radius: 0.375,
  sans: font(SANS_FONTS, "geist"),
  mono: font(MONO_FONTS, "geist-mono"),
  light: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    card: "#fafafa",
    cardForeground: "#0a0a0a",
    popover: "#ffffff",
    popoverForeground: "#0a0a0a",
    primary: "#171717",
    primaryForeground: "#ffffff",
    secondary: "#f2f2f2",
    secondaryForeground: "#0a0a0a",
    muted: "#f2f2f2",
    mutedForeground: "#666666",
    accent: "#ebebeb",
    accentForeground: "#0a0a0a",
    ...destructiveLight,
    border: "#eaeaea",
    input: "#e0e0e0",
    ring: "#8f8f8f",
    overlay: "rgb(0 0 0 / 40%)",
  },
  dark: {
    background: "#0a0a0a",
    foreground: "#ededed",
    card: "#111111",
    cardForeground: "#ededed",
    popover: "#171717",
    popoverForeground: "#ededed",
    primary: "#ededed",
    primaryForeground: "#0a0a0a",
    secondary: "#1f1f1f",
    secondaryForeground: "#ededed",
    muted: "#1a1a1a",
    mutedForeground: "#a1a1a1",
    accent: "#232323",
    accentForeground: "#ededed",
    ...destructiveDark,
    border: "#262626",
    input: "#333333",
    ring: "#707070",
    overlay: "rgb(0 0 0 / 60%)",
  },
};

export const PRESETS: Preset[] = [
  DEFAULT,
  {
    name: "slate",
    title: "Slate",
    radius: 0.375,
    sans: font(SANS_FONTS, "inter"),
    mono: font(MONO_FONTS, "geist-mono"),
    light: {
      background: "#ffffff",
      foreground: "#1c1d21",
      card: "#fcfcfd",
      cardForeground: "#1c1d21",
      popover: "#ffffff",
      popoverForeground: "#1c1d21",
      primary: "#08090a",
      primaryForeground: "#ffffff",
      secondary: "#f2f3f5",
      secondaryForeground: "#1c1d21",
      muted: "#f4f4f6",
      mutedForeground: "#6b6f76",
      accent: "#eff0f3",
      accentForeground: "#1c1d21",
      ...destructiveLight,
      border: "#e6e7ea",
      input: "#dcdde2",
      ring: "#8a9400",
      overlay: "rgb(0 0 0 / 35%)",
    },
    dark: {
      background: "#08090a",
      foreground: "#f7f8f8",
      card: "#0f1011",
      cardForeground: "#f7f8f8",
      popover: "#161718",
      popoverForeground: "#f7f8f8",
      primary: "#e4f222",
      primaryForeground: "#08090a",
      secondary: "#161718",
      secondaryForeground: "#f7f8f8",
      muted: "#161718",
      mutedForeground: "#8a8f98",
      accent: "#23252a",
      accentForeground: "#f7f8f8",
      ...destructiveDark,
      border: "#23252a",
      input: "rgb(255 255 255 / 8%)",
      ring: "#e4f222",
      overlay: "rgb(0 0 0 / 60%)",
    },
  },
  {
    name: "soft",
    title: "Soft",
    radius: 0.5,
    sans: font(SANS_FONTS, "inter"),
    mono: font(MONO_FONTS, "geist-mono"),
    light: {
      background: "#fbfaf9",
      foreground: "#1f1d1b",
      card: "#ffffff",
      cardForeground: "#1f1d1b",
      popover: "#ffffff",
      popoverForeground: "#1f1d1b",
      primary: "#1f1d1b",
      primaryForeground: "#ffffff",
      secondary: "#f3f1ef",
      secondaryForeground: "#1f1d1b",
      muted: "#f3f1ef",
      mutedForeground: "#6f6a65",
      accent: "#eceae7",
      accentForeground: "#1f1d1b",
      ...destructiveLight,
      border: "#e7e4e0",
      input: "#dcd8d3",
      ring: "#cf3e3e",
      overlay: "rgb(20 16 12 / 35%)",
    },
    dark: {
      background: "#040506",
      foreground: "#ffffff",
      card: "#07080a",
      cardForeground: "#ffffff",
      popover: "#111214",
      popoverForeground: "#ffffff",
      primary: "#e6e6e6",
      primaryForeground: "#454647",
      secondary: "#1b1c1e",
      secondaryForeground: "#ffffff",
      muted: "#1b1c1e",
      mutedForeground: "#9c9c9d",
      accent: "#1b1c1e",
      accentForeground: "#ffffff",
      ...destructiveDark,
      border: "#2f3031",
      input: "#363739",
      ring: "#ff6363",
      overlay: "rgb(0 0 0 / 60%)",
    },
  },
  {
    name: "classic",
    title: "Classic",
    radius: 0.5,
    sans: font(SANS_FONTS, "inter"),
    mono: font(MONO_FONTS, "jetbrains-mono"),
    light: {
      background: "#ffffff",
      foreground: "#1c2024",
      card: "#fcfcfd",
      cardForeground: "#1c2024",
      popover: "#ffffff",
      popoverForeground: "#1c2024",
      primary: "#0d74ce",
      primaryForeground: "#ffffff",
      secondary: "#f0f0f3",
      secondaryForeground: "#1c2024",
      muted: "#f0f0f3",
      mutedForeground: "#60646c",
      accent: "#e8e8ec",
      accentForeground: "#1c2024",
      ...destructiveLight,
      border: "#e0e1e6",
      input: "#d9d9e0",
      ring: "#0090ff",
      overlay: "rgb(0 0 0 / 40%)",
    },
    dark: {
      background: "#111113",
      foreground: "#edeef0",
      card: "#18191b",
      cardForeground: "#edeef0",
      popover: "#212225",
      popoverForeground: "#edeef0",
      primary: "#0d74ce",
      primaryForeground: "#ffffff",
      secondary: "#212225",
      secondaryForeground: "#edeef0",
      muted: "#212225",
      mutedForeground: "#b0b4ba",
      accent: "#272a2d",
      accentForeground: "#edeef0",
      ...destructiveDark,
      border: "#2e3135",
      input: "#363a3f",
      ring: "#0090ff",
      overlay: "rgb(0 0 0 / 60%)",
    },
  },
  {
    name: "airy",
    title: "Airy",
    radius: 0.5,
    sans: font(SANS_FONTS, "dm-sans"),
    mono: font(MONO_FONTS, "jetbrains-mono"),
    light: {
      background: "#f6f9fc",
      foreground: "#0a2540",
      card: "#ffffff",
      cardForeground: "#0a2540",
      popover: "#ffffff",
      popoverForeground: "#0a2540",
      primary: "#635bff",
      primaryForeground: "#ffffff",
      secondary: "#e9eef5",
      secondaryForeground: "#0a2540",
      muted: "#eef2f7",
      mutedForeground: "#425466",
      accent: "#e6ebf1",
      accentForeground: "#0a2540",
      ...destructiveLight,
      border: "#e3e8ee",
      input: "#d5dbe1",
      ring: "#635bff",
      overlay: "rgb(10 37 64 / 35%)",
    },
    dark: {
      background: "#0a2540",
      foreground: "#f6f9fc",
      card: "#0f2c4a",
      cardForeground: "#f6f9fc",
      popover: "#133256",
      popoverForeground: "#f6f9fc",
      primary: "#635bff",
      primaryForeground: "#ffffff",
      secondary: "#1a3a5c",
      secondaryForeground: "#f6f9fc",
      muted: "#173654",
      mutedForeground: "#adbdcc",
      accent: "#1f4166",
      accentForeground: "#f6f9fc",
      ...destructiveDark,
      border: "rgb(255 255 255 / 10%)",
      input: "rgb(255 255 255 / 16%)",
      ring: "#8d87ff",
      overlay: "rgb(3 14 26 / 60%)",
    },
  },
  {
    name: "emerald",
    title: "Emerald",
    radius: 0.375,
    sans: font(SANS_FONTS, "instrument-sans"),
    mono: font(MONO_FONTS, "jetbrains-mono"),
    light: {
      background: "#fcfcfc",
      foreground: "#1c1c1c",
      card: "#ffffff",
      cardForeground: "#1c1c1c",
      popover: "#ffffff",
      popoverForeground: "#1c1c1c",
      primary: "#0f7a4f",
      primaryForeground: "#ffffff",
      secondary: "#f0f0f0",
      secondaryForeground: "#1c1c1c",
      muted: "#f3f3f3",
      mutedForeground: "#6b6b6b",
      accent: "#ededed",
      accentForeground: "#1c1c1c",
      ...destructiveLight,
      border: "#e6e6e6",
      input: "#dadada",
      ring: "#0f7a4f",
      overlay: "rgb(0 0 0 / 40%)",
    },
    dark: {
      background: "#1c1c1c",
      foreground: "#ededed",
      card: "#232323",
      cardForeground: "#ededed",
      popover: "#282828",
      popoverForeground: "#ededed",
      primary: "#3ecf8e",
      primaryForeground: "#0a1f14",
      secondary: "#2e2e2e",
      secondaryForeground: "#ededed",
      muted: "#2a2a2a",
      mutedForeground: "#a0a0a0",
      accent: "#333333",
      accentForeground: "#ededed",
      ...destructiveDark,
      border: "#2e2e2e",
      input: "#3a3a3a",
      ring: "#3ecf8e",
      overlay: "rgb(0 0 0 / 60%)",
    },
  },
];

/** Replace the preset's primary and focus ring. Light shades carry white text; dark shades carry dark text. */
export const BRANDS: Brand[] = [
  brand("cobalt", "Cobalt", "oklch(0.5 0.23 265)", "oklch(0.72 0.15 258)"),
  brand("viridian", "Viridian", "oklch(0.5 0.1 170)", "oklch(0.78 0.12 170)"),
  brand("olive", "Olive", "oklch(0.5 0.11 125)", "oklch(0.82 0.16 122)"),
  brand("ochre", "Ochre", "oklch(0.55 0.13 68)", "oklch(0.82 0.15 80)"),
  brand("vermilion", "Vermilion", "oklch(0.56 0.2 33)", "oklch(0.72 0.17 38)"),
  brand("magenta", "Magenta", "oklch(0.55 0.24 350)", "oklch(0.75 0.17 350)"),
  brand("indigo", "Indigo", "oklch(0.45 0.2 280)", "oklch(0.72 0.14 280)"),
];

function brand(name: string, title: string, light: string, dark: string): Brand {
  return {
    name,
    title,
    light: { primary: light, primaryForeground: onLight },
    dark: { primary: dark, primaryForeground: onDark },
  };
}

/** Base radii to choose from, in rem. */
export const RADII = [0, 0.25, 0.375, 0.5, 0.75, 1];

/** The `radius` tokens for a base: small parts, controls, surfaces. */
export function radiusScale(base: number): { sm: string; md: string; lg: string } {
  return { sm: rem((base * 2) / 3), md: rem(base), lg: rem((base * 5) / 3) };
}

export function findPreset(name: string): Preset {
  return PRESETS.find((preset) => preset.name === name) ?? DEFAULT;
}

export function findBrand(name: string): Brand | undefined {
  return BRANDS.find((item) => item.name === name);
}

/** The palette, radius base, and fonts a selection resolves to in a mode. */
export function resolveTheme(selection: ThemeSelection, mode: Mode) {
  const preset = findPreset(selection.preset);
  const chosen = findBrand(selection.brand);
  const palette = { ...preset[mode] };
  if (chosen) {
    palette.primary = chosen[mode].primary;
    palette.primaryForeground = chosen[mode].primaryForeground;
    palette.ring = chosen[mode].primary;
  }
  return { preset, palette, radius: selection.radius ?? preset.radius };
}
