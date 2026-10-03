import type {
  Collection,
  EffectStyle,
  Foundations,
  Rgba,
  Shadow,
  TextStyle,
  Variable,
  VariableScope,
} from "../ir";
import { toRgba } from "./color";

/** A `defineVars` result; its values stringify to `var(--hash)`. */
type Vars = object;

/** The runtime `defineVars` objects: each value is `var(--hash)`. */
export interface Tokens {
  colors: Vars;
  typography: Vars;
  spacing: Vars;
  radius: Vars;
  sizes: Vars;
  elevation: Vars;
}

/** What capture needs to name the values it measures. */
export interface TokenIndex {
  foundations: Foundations;
  /** Color tokens by CSS variable name, such as `--xjycr67` → `colors.primary`. */
  colors: Map<string, string>;
  /** Pixel value → token, per role. Values are unique within a role. */
  lengths: Record<LengthRole, Map<number, string>>;
  /** Figma family → token, such as `Geist` → `typography.fontFamily`. */
  families: Map<string, string>;
  textStyles: TextStyle[];
}

export type LengthRole = "spacing" | "radius" | "sizes" | "fontSize" | "lineHeight" | "fontWeight";

const WEIGHT_NAMES: Record<string, string> = {
  fontWeightRegular: "Regular",
  fontWeightMedium: "Medium",
  fontWeightSemibold: "Semibold",
};

/** Reads every token's value in light and dark from the live page. */
export function indexTokens(tokens: Tokens, darkClassName: string): TokenIndex {
  if (document.documentElement.dataset["theme"] === "dark") {
    throw new Error("Capture reads the light theme. Switch Storybook to light and capture again.");
  }
  const light = document.createElement("div");
  const dark = document.createElement("div");
  dark.className = darkClassName;
  const darkProbe = document.createElement("div");
  dark.append(darkProbe);
  document.body.append(light, dark);
  try {
    const px = (property: string, value: string) =>
      parseFloat(computed(light, property, value)) || 0;

    const colors = new Map<string, string>();
    const colorVariables: Variable[] = entries(tokens.colors).map(([key, value]) => {
      colors.set(varName(value), `colors.${key}`);
      return {
        name: key,
        token: `colors.${key}`,
        type: "COLOR",
        scopes: ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"],
        values: {
          Light: tokenColor(computed(light, "color", value), key),
          Dark: tokenColor(computed(darkProbe, "color", value), key),
        },
      };
    });

    const lengths: TokenIndex["lengths"] = {
      spacing: new Map(),
      radius: new Map(),
      sizes: new Map(),
      fontSize: new Map(),
      lineHeight: new Map(),
      fontWeight: new Map(),
    };
    const families = new Map<string, string>();
    const numeric = (
      group: "spacing" | "radius" | "sizes",
      property: string,
      scopes: VariableScope[],
    ): Variable[] =>
      entries(tokens[group])
        .map(([key, value]): Variable => {
          const token = `${group}.${key}`;
          const measured = px(property, value);
          lengths[group].set(measured, token);
          return {
            name: figmaName(key),
            token,
            type: "FLOAT",
            scopes,
            values: { Value: measured },
          };
        })
        // Integer-like keys ("1", "2") come first in object order; designers expect the scale.
        .toSorted((a, b) => Number(a.values["Value"]) - Number(b.values["Value"]));

    const typography: Variable[] = entries(tokens.typography).map(([key, value]) => {
      const token = `typography.${key}`;
      if (key.startsWith("fontFamily")) {
        return {
          name: key,
          token,
          type: "STRING",
          scopes: ["FONT_FAMILY"],
          values: { Value: familyName(computed(light, "font-family", value)) },
        };
      }
      const [role, property, scope] = key.startsWith("fontSize")
        ? (["fontSize", "font-size", "FONT_SIZE"] as const)
        : key.startsWith("lineHeight")
          ? (["lineHeight", "line-height", "LINE_HEIGHT"] as const)
          : (["fontWeight", "font-weight", "FONT_WEIGHT"] as const);
      const measured = px(property, value);
      lengths[role].set(measured, token);
      return { name: key, token, type: "FLOAT", scopes: [scope], values: { Value: measured } };
    });
    for (const variable of typography) {
      if (typeof variable.values["Value"] === "string") {
        families.set(variable.values["Value"], variable.token);
      }
    }

    const collections: Collection[] = [
      { name: "Color", modes: ["Light", "Dark"], variables: colorVariables },
      { name: "Typography", modes: ["Value"], variables: typography },
      { name: "Spacing", modes: ["Value"], variables: numeric("spacing", "padding-top", ["GAP"]) },
      {
        name: "Radius",
        modes: ["Value"],
        variables: numeric("radius", "border-top-left-radius", ["CORNER_RADIUS"]),
      },
      { name: "Size", modes: ["Value"], variables: numeric("sizes", "width", ["WIDTH_HEIGHT"]) },
    ];

    const family = typography.find((variable) => variable.type === "STRING");
    const textStyles: TextStyle[] = [];
    for (const size of typography.filter((variable) => variable.name.startsWith("fontSize"))) {
      const suffix = size.name.slice("fontSize".length);
      const lineHeight = typography.find((variable) => variable.name === `lineHeight${suffix}`);
      if (!family || !lineHeight) continue;
      for (const weight of typography.filter((variable) => variable.name in WEIGHT_NAMES)) {
        textStyles.push({
          name: `${suffix}/${WEIGHT_NAMES[weight.name]}`,
          fontFamily: family.token,
          fontSize: size.token,
          lineHeight: lineHeight.token,
          fontWeight: weight.token,
        });
      }
    }

    const effectStyles: EffectStyle[] = entries(tokens.elevation)
      .map(([key, value]) => ({
        name: `Elevation/${capitalize(key)}`,
        token: `elevation.${key}`,
        shadows: parseShadows(computed(light, "box-shadow", value)),
      }))
      .filter((style) => style.shadows.length > 0);

    return {
      foundations: { collections, textStyles, effectStyles },
      colors,
      lengths,
      families,
      textStyles,
    };
  } finally {
    light.remove();
    dark.remove();
  }
}

/**
 * Sets every color token to a distinct marker on `:root`, runs `read`, and restores the
 * tokens. Colors never change layout, so the page stays measured correctly.
 */
export function withColorMarkers<T>(index: TokenIndex, seed: number, read: () => T): T {
  const root = document.documentElement.style;
  const names = [...index.colors.keys()];
  if (names.length > 100) throw new Error("Capture supports up to 100 color tokens.");
  names.forEach((name, i) => root.setProperty(name, markerCss(markerFor(i, seed))));
  try {
    return read();
  } finally {
    for (const name of names) root.removeProperty(name);
  }
}

/** The token a color was painted with in a marker pass, or undefined for any other color. */
export function decodeMarker(index: TokenIndex, seed: number, css: string): string | undefined {
  const color = toRgba(css);
  if (!color || color.a === 0) return undefined;
  const names = [...index.colors.keys()];
  for (let i = 0; i < names.length; i++) {
    const marker = markerFor(i, seed);
    if (close(color.r, marker[0]) && close(color.g, marker[1]) && close(color.b, marker[2])) {
      return index.colors.get(names[i]!);
    }
  }
  return undefined;
}

/**
 * One of 100 well-separated sRGB colors, assigned in a seed-dependent order. A mix of two
 * tokens can land on a marker by chance, but not on the same token in both passes.
 */
function markerFor(i: number, seed: number): [number, number, number] {
  const slot = (i * 37 + seed * 11) % 100;
  return [15 + (slot % 10) * 24, 15 + Math.floor(slot / 10) * 24, seed === 0 ? 60 : 190];
}

/** Whether a 0–1 channel is within rounding of a 0–255 marker channel. */
function close(channel: number, marker: number): boolean {
  return Math.abs(channel * 255 - marker) <= 1.5;
}

function computed(probe: HTMLElement, property: string, value: string): string {
  probe.style.setProperty(property, value);
  return getComputedStyle(probe).getPropertyValue(property);
}

function markerCss([r, g, b]: [number, number, number]): string {
  return `rgb(${r} ${g} ${b})`;
}

export function parseShadows(css: string): Shadow[] {
  if (!css || css === "none") return [];
  const shadows: Shadow[] = [];
  // Computed values are `color x y blur spread [inset]`, comma-separated outside parentheses.
  for (const part of css.split(/,(?![^(]*\))/)) {
    const color = part.match(/(?:rgba?|oklab|oklch|color)\([^)]*\)|#[\da-f]+/i)?.[0] ?? "";
    const numbers = part.replace(color, "").trim().split(/\s+/).map(parseFloat);
    const paint = toRgba(color);
    if (!paint || part.includes("inset")) continue;
    shadows.push({
      x: numbers[0] ?? 0,
      y: numbers[1] ?? 0,
      blur: numbers[2] ?? 0,
      spread: numbers[3] ?? 0,
      paint: { color: paint },
    });
  }
  return shadows;
}

/** The Figma family for a CSS stack: its first family, without the fontsource `Variable` suffix. */
export function familyName(stack: string): string {
  const first = stack.split(",")[0] ?? "";
  return first
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/ Variable$/, "");
}

function varName(value: string): string {
  const name = value.match(/var\((--[^),\s]+)/)?.[1];
  if (!name) throw new Error(`Expected a StyleX variable, got ${value}`);
  return name;
}

function tokenColor(css: string, key: string): Rgba {
  const parsed = toRgba(css);
  if (!parsed) throw new Error(`colors.${key}: can't read ${css}`);
  return parsed;
}

function entries(vars: Vars): Array<[string, string]> {
  return Object.entries(vars)
    .filter(([key, value]) => !key.startsWith("__") && typeof value === "string")
    .map(([key, value]) => [key, String(value)]);
}

/** Figma variable names can't contain dots, so `2.5` becomes `2_5`. */
function figmaName(key: string): string {
  return key.replaceAll(".", "_");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
