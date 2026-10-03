import type { FrameNode, Length, Node, Paint, Sides } from "../../ir";
import { toRgba } from "../color";
import { type TokenIndex, decodeMarker, parseShadows, withColorMarkers } from "../tokens";
import { CaptureError, type ColorSlot, type Walk } from "./context";
import { length } from "./units";

/** A color's token, where two marker passes agree on which token produced it. */
export function nameColors(slots: ColorSlot[], index: TokenIndex): void {
  const passes = [0, 1].map((seed) =>
    withColorMarkers(index, seed, () =>
      slots.map((slot) => {
        const css = slot.read();
        return { token: decodeMarker(index, seed, css), alpha: toRgba(css)?.a ?? 1 };
      }),
    ),
  );
  slots.forEach((slot, i) => {
    const [first, second] = [passes[0]![i]!, passes[1]![i]!];
    if (first.token && first.token === second.token) {
      slot.paint.token = first.token;
      slot.paint.color = { ...slot.paint.color, a: first.alpha };
    }
  });
}

export function paintOf(
  element: Element,
  style: CSSStyleDeclaration,
  cursor: Walk,
): Partial<FrameNode> {
  const { context, slots } = cursor;
  const paint: Partial<FrameNode> = {};
  const fill = color(style.backgroundColor);
  if (fill) paint.fill = track(slots, fill, () => getComputedStyle(element).backgroundColor);
  const stroke = strokeOf(element, style, cursor);
  if (stroke) paint.stroke = stroke;

  const corner = (name: string) =>
    length(parseFloat(style.getPropertyValue(`border-${name}-radius`)) || 0, "radius", context);
  const corners: [Length, Length, Length, Length] = [
    corner("top-left"),
    corner("top-right"),
    corner("bottom-right"),
    corner("bottom-left"),
  ];
  if (corners.some((other) => other.value !== corners[0].value)) paint.corners = corners;
  else if (corners[0].value > 0) paint.radius = corners[0];

  const opacity = parseFloat(style.opacity);
  if (opacity < 1) paint.opacity = opacity;
  if (style.overflow !== "visible") paint.clip = true;

  const shadows = parseShadows(style.boxShadow);
  if (shadows.length > 0) {
    paint.shadows = shadows.map((shadow, i) => {
      const read = () => shadowColors(getComputedStyle(element).boxShadow)[i] ?? "";
      return { ...shadow, paint: track(slots, shadow.paint, read) };
    });
  }
  return paint;
}

function strokeOf(element: Element, style: CSSStyleDeclaration, cursor: Walk): FrameNode["stroke"] {
  const names = ["top", "right", "bottom", "left"] as const;
  const widths = names.map(
    (side) => parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0,
  );
  const drawn = names.filter((_, i) => widths[i]! > 0);
  if (drawn.length === 0) return undefined;
  const at = (property: string, value: string) =>
    new CaptureError(`${cursor.path}: ${property}: ${value} isn't supported in Figma.`);
  const colors = new Set(drawn.map((side) => style.getPropertyValue(`border-${side}-color`)));
  if (colors.size > 1) throw at("border-color", "per side");
  const styles = new Set(drawn.map((side) => style.getPropertyValue(`border-${side}-style`)));
  const [line = "solid"] = styles;
  if (styles.size > 1 || !["solid", "dashed"].includes(line))
    throw at("border-style", [...styles].join(" "));
  const side = drawn[0]!;
  const read = () => getComputedStyle(element).getPropertyValue(`border-${side}-color`);
  const paint = color(style.getPropertyValue(`border-${side}-color`));
  const weight = Math.max(...widths);
  const [top = 0, right = 0, bottom = 0, left = 0] = widths;
  const uneven: Sides | undefined = widths.every((width) => width === weight)
    ? undefined
    : { top, right, bottom, left };
  return {
    weight,
    ...(paint && { paint: track(cursor.slots, paint, read) }),
    ...(uneven && { sides: uneven }),
    ...(line === "dashed" && { dash: [weight * 3, weight * 3] }),
  };
}

export function fills(node: Node, axis: "horizontal" | "vertical"): boolean {
  return (node.type === "frame" || node.type === "text") && node.sizing[axis] === "fill";
}

export function color(css: string): Paint | undefined {
  const parsed = toRgba(css);
  return parsed && parsed.a > 0 ? { color: parsed } : undefined;
}

export function track(slots: ColorSlot[], paint: Paint, read: () => string): Paint {
  slots.push({ paint, read });
  return paint;
}

function shadowColors(css: string): string[] {
  if (!css || css === "none") return [];
  return css
    .split(/,(?![^(]*\))/)
    .map((part) => part.match(/(?:rgba?|oklab|oklch|color)\([^)]*\)|#[\da-f]+/i)?.[0] ?? "");
}
