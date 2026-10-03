import type { FrameNode, InstanceNode, VectorNode } from "../../ir";
import { CaptureError, type Walk } from "./context";
import { toRgba } from "../color";
import { rotation } from "./dom";
import { color, track } from "./paint";
import { round } from "./units";

/** A component that is an icon, such as Spinner: a frame around the icon's instance. */
export function iconRoot(svg: SVGElement, cursor: Walk): FrameNode {
  const instance = icon(svg, { ...cursor, path: `${cursor.path}/0` }, getComputedStyle(svg));
  const zero = { value: 0 };
  return {
    type: "frame",
    name: svg.getAttribute("data-slot") ?? "icon",
    width: { value: instance.width },
    height: { value: instance.height },
    sizing: { horizontal: "hug", vertical: "hug" },
    layout: {
      direction: "row",
      gap: zero,
      padding: { top: zero, right: zero, bottom: zero, left: zero },
      align: "center",
      justify: "center",
      wrap: false,
    },
    children: [instance],
  };
}

/** Normalized SVG markup: what makes two icons the same icon. */
export function iconKey(svg: SVGElement): string {
  const viewBox = svg.getAttribute("viewBox") ?? "";
  return `${viewBox}|${svg.innerHTML.replace(/\s+/g, " ").trim()}`;
}

export function icon(svg: SVGElement, cursor: Walk, style: CSSStyleDeclaration): InstanceNode {
  const { context, slots, path } = cursor;
  const component = context.icons.get(iconKey(svg));
  if (!component) {
    throw new CaptureError(
      `${path}: an SVG that isn't a Shelf icon. Use an icon from the icons item, or add one there.`,
    );
  }
  const rect = svg.getBoundingClientRect();
  const read = () => getComputedStyle(svg).color;
  const paint = color(style.color);
  const property = context.instanceProperties.get(component);
  const turned = rotation(style.transform);
  return {
    type: "instance",
    name: property ?? component.split("/").pop() ?? component,
    component,
    width: round(parseFloat(style.width) || rect.width),
    height: round(parseFloat(style.height) || rect.height),
    ...(turned !== 0 && { rotation: turned }),
    ...(paint && { color: track(slots, paint, read) }),
    ...(property && { property }),
  };
}

/** An SVG that isn't an icon, with each shape's computed paint written in. */
export function vector(svg: SVGElement, rect: DOMRect): VectorNode {
  const clone = svg.cloneNode(true);
  if (!(clone instanceof SVGElement)) throw new CaptureError("SVG clone isn't an SVG.");
  const sources = [svg, ...svg.querySelectorAll("*")];
  const targets = [clone, ...clone.querySelectorAll("*")];
  sources.forEach((source, i) => {
    const target = targets[i]!;
    const style = getComputedStyle(source);
    for (const property of [
      "fill",
      "stroke",
      "stroke-width",
      "opacity",
      "fill-opacity",
      "stroke-opacity",
    ]) {
      target.setAttribute(property, style.getPropertyValue(property));
    }
    if (source instanceof SVGTextContentElement) {
      for (const property of ["font-family", "font-size", "font-weight", "text-anchor"]) {
        target.setAttribute(property, style.getPropertyValue(property));
      }
    }
    flattenPattern(svg, target, "fill");
    flattenPattern(svg, target, "stroke");
    srgb(target, "fill");
    srgb(target, "stroke");
    for (const name of target.getAttributeNames()) {
      if (name === "class" || name === "style" || name === "role" || name === "tabindex") {
        target.removeAttribute(name);
      } else if (name.startsWith("data-") || name.startsWith("aria-")) {
        target.removeAttribute(name);
      }
    }
  });
  for (const pattern of clone.querySelectorAll("pattern")) pattern.remove();
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(round(rect.width)));
  clone.setAttribute("height", String(round(rect.height)));
  return {
    type: "vector",
    name: svg.getAttribute("data-slot") ?? "Vector",
    svg: clone.outerHTML,
    width: round(rect.width),
    height: round(rect.height),
  };
}

/** How opaque a pattern's color is once its hatch or dots are averaged into a flat fill. */
const PATTERN_ALPHA = 0.3;

/**
 * Figma's SVG import drops `<pattern>` paints. A paint that references one becomes the pattern's
 * own color at a flat, lighter opacity, so a patterned series still reads as its series.
 */
function flattenPattern(svg: SVGElement, target: Element, attribute: "fill" | "stroke"): void {
  const match = /^url\(["']?#([^"')]+)["']?\)/.exec(target.getAttribute(attribute) ?? "");
  const pattern = match && svg.querySelector(`[id="${CSS.escape(match[1]!)}"]`);
  if (!pattern || pattern.tagName !== "pattern") return;
  const shape = pattern.firstElementChild;
  const flat = shape ? getComputedStyle(shape).fill : "none";
  target.setAttribute(attribute, flat);
  target.setAttribute(`${attribute}-opacity`, String(PATTERN_ALPHA));
}

/** Figma's SVG import reads sRGB only, so oklch and the like become rgb, with alpha in the paint's opacity. */
function srgb(target: Element, attribute: "fill" | "stroke"): void {
  const value = target.getAttribute(attribute) ?? "";
  if (value === "none" || value.startsWith("url(")) return;
  const rgba = toRgba(value);
  if (!rgba) return;
  const [r, g, b] = [rgba.r, rgba.g, rgba.b].map((channel) => Math.round(channel * 255));
  target.setAttribute(attribute, `rgb(${r}, ${g}, ${b})`);
  const opacity = `${attribute}-opacity`;
  const current = Number(target.getAttribute(opacity) ?? 1);
  target.setAttribute(opacity, String(Math.round(current * rgba.a * 1000) / 1000));
}
