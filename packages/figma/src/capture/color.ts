import { type Color, parse, rgb, toGamut } from "culori";
import type { Rgba } from "../ir";

const toSrgb = toGamut("rgb", "oklch");

/** A CSS color in sRGB, gamut-mapped the way browsers do, or undefined when it doesn't parse. */
export function toRgba(css: string): Rgba | undefined {
  const parsed: Color | undefined = parse(css);
  if (!parsed) return undefined;
  const { r, g, b, alpha } = toSrgb(parsed);
  return { r: clamp(r), g: clamp(g), b: clamp(b), a: round(alpha ?? 1) };
}

/** WCAG 2 contrast ratio of two opaque colors. */
export function contrast(a: Rgba, b: Rgba): number {
  const [light, dark] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

export function toHex({ r, g, b, a }: Rgba): string {
  return `#${hexPart(r)}${hexPart(g)}${hexPart(b)}${a < 1 ? hexPart(a) : ""}`;
}

function hexPart(value: number): string {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
}

function luminance(color: Rgba): number {
  const { r, g, b } = rgb({ mode: "rgb", ...color });
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function linear(value: number): number {
  return value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function clamp(value: number): number {
  return round(Math.min(1, Math.max(0, value)));
}

function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
