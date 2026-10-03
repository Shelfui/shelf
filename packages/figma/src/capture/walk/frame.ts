import type { FrameNode, Length, Node } from "../../ir";
import { toRgba } from "../color";
import { CaptureError, type Walk, type Parent } from "./context";
import {
  type Run,
  runs,
  outOfFlow,
  rotation,
  textOnly,
  hasBox,
  contents,
  fieldText,
  contentBox,
} from "./dom";
import {
  layoutOf,
  visualOrder,
  kindOf,
  childSizing,
  measureSpacing,
  gridLayout,
  checkHug,
} from "./layout";
import { paintOf, fills } from "./paint";
import { iconKey, icon, vector } from "./svg";
import { fieldNode, text, rangeOf } from "./text";
import { length, round } from "./units";

export function frame(element: Element, cursor: Walk, parent: Parent | undefined): FrameNode {
  const { path, context } = cursor;
  const style = getComputedStyle(element);
  checkSupported(style, path, parent);
  const rect = element.getBoundingClientRect();
  const width = length(rect.width, "sizes", context);
  const height = length(rect.height, "sizes", context);
  const node: FrameNode = {
    type: "frame",
    name: element.getAttribute("data-slot") ?? element.tagName.toLowerCase(),
    width,
    height,
    sizing: ownSizing(element, style, rect, parent, width, height),
    children: [],
    ...paintOf(element, style, cursor),
  };

  const field = fieldText(element);
  const items = field === undefined ? contents(element) : [];
  const self: Parent = { element, style, rect, kind: kindOf(style, items, path) };
  node.layout = layoutOf(self, field !== undefined, cursor);
  const placed = childrenOf(node, self, field, items, cursor);
  node.children = placed.map((child) => child.node);
  const flow = placed.filter((child) => !child.node.position);
  alignFlow(node, self, flow);
  sizingOf(node, self, field !== undefined, flow);
  return node;
}

function checkSupported(style: CSSStyleDeclaration, path: string, parent: Parent | undefined) {
  const at = (property: string, value: string) =>
    new CaptureError(`${path}: ${property}: ${value} isn't supported in Figma.`);
  if (style.backgroundImage !== "none") throw at("background-image", style.backgroundImage);
  const outline = toRgba(style.outlineColor);
  if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 && outline?.a) {
    throw at("outline", `${style.outlineWidth} ${style.outlineColor}`);
  }
  if (parent && rotation(style.transform) !== 0) throw at("transform", style.transform);
}

/** Fixed where a token sets the size or the frame is positioned, else as the parent lays it out. */
function ownSizing(
  element: Element,
  style: CSSStyleDeclaration,
  rect: DOMRect,
  parent: Parent | undefined,
  width: Length,
  height: Length,
): FrameNode["sizing"] {
  const sizing: FrameNode["sizing"] = {
    horizontal: width.token ? "fixed" : "hug",
    vertical: height.token ? "fixed" : "hug",
  };
  if (!parent) return sizing;
  if (outOfFlow(style)) return { horizontal: "fixed", vertical: "fixed" };
  return { ...sizing, ...childSizing(element, style, rect, parent, sizing) };
}

/** Each child as a node, in the order Auto Layout places them, with the gaps between them. */
function childrenOf(
  node: FrameNode,
  self: Parent,
  field: string | undefined,
  items: Array<Element | Text>,
  cursor: Walk,
): Array<{ node: Node; rect: DOMRect }> {
  const { element, style, rect, kind } = self;
  const placed: Array<{ node: Node; rect: DOMRect }> = [];
  if (field !== undefined) {
    const value = fieldNode(element, field, { ...cursor, path: `${cursor.path}/0` }, style);
    placed.push({ node: value, rect: contentBox(rect, style) });
  } else if (kind === "text") {
    const content = text(element, element, { ...cursor, path: `${cursor.path}/0` }, undefined);
    const box = contentBox(rect, style);
    if (node.sizing.horizontal !== "hug" || content.sizing.horizontal === "fixed") {
      content.sizing.horizontal = "fill";
      content.width = round(box.width);
    }
    content.name = "Text";
    placed.push({ node: content, rect: box });
  } else {
    const flex = style.display.includes("flex");
    const flowing = !flex && !style.display.includes("grid") && kind === "column";
    for (const [i, child] of (flowing ? runs(items) : items).entries()) {
      placed.push(childNode(child, { ...cursor, path: `${cursor.path}/${i}` }, self));
    }
    if (kind !== "grid" && !node.layout!.wrap) visualOrder(placed, kind === "row");
  }
  if (kind === "grid") gridLayout(node, style, rect, placed, cursor);
  else if (kind !== "text") measureSpacing(node, style, rect, placed, cursor);
  return placed;
}

/** Centering that block flow expresses with auto margins or text-align. */
function alignFlow(
  node: FrameNode,
  { style, rect, kind }: Parent,
  flow: Array<{ node: Node; rect: DOMRect }>,
) {
  if (style.display.includes("flex")) return;
  const layout = node.layout!;
  if (kind === "row" && style.textAlign === "center") layout.justify = "center";
  if (kind !== "column") return;
  const content = contentBox(rect, style);
  const loose = flow.filter((child) => !fills(child.node, "horizontal"));
  const centered = (box: DOMRect) => {
    const before = box.left - content.left;
    return before > 1 && Math.abs(before - (content.right - box.right)) <= 1;
  };
  if (loose.length > 0 && loose.every((child) => centered(child.rect))) layout.align = "center";
}

/** Hug only where Auto Layout can compute the size from the children. */
function sizingOf(
  node: FrameNode,
  { rect, kind }: Parent,
  field: boolean,
  flow: Array<{ node: Node; rect: DOMRect }>,
) {
  const { sizing } = node;
  for (const axis of ["horizontal", "vertical"] as const) {
    if (sizing[axis] !== "hug") continue;
    if (field || flow.length === 0 || flow.some((child) => fills(child.node, axis))) {
      sizing[axis] = "fixed";
    }
  }
  if (node.layout!.wrap && sizing.horizontal === "hug") sizing.horizontal = "fixed";
  if (kind !== "grid") checkHug(node, rect, flow);
}

/** One child of a frame, as a node, and where it was measured. */
function childNode(
  child: Element | Text | Run,
  cursor: Walk,
  parent: Parent,
): { node: Node; rect: DOMRect } {
  if (child instanceof Text || Array.isArray(child)) {
    const node = text(child, parent.element, cursor, parent);
    const rect = rangeOf(child).getBoundingClientRect();
    if (Array.isArray(child) || parent.kind === "column") {
      const box = contentBox(parent.rect, parent.style);
      if (!parent.style.display.includes("flex")) {
        node.sizing.horizontal = "fill";
        node.width = round(box.width);
      }
    }
    return { node, rect };
  }
  const rect = child.getBoundingClientRect();
  const style = getComputedStyle(child);
  let node: Node;
  if (child instanceof SVGElement) {
    node = cursor.context.icons.has(iconKey(child))
      ? icon(child, cursor, style)
      : vector(child, rect);
  } else if (child instanceof HTMLElement && textOnly(child) && !hasBox(child, style)) {
    node = text(child, child, cursor, parent);
  } else {
    node = frame(
      child,
      { ...cursor, path: `${cursor.path}:${child.getAttribute("data-slot") ?? child.tagName}` },
      parent,
    );
  }
  if (outOfFlow(style)) {
    node.position = {
      x: round(rect.left - parent.rect.left),
      y: round(rect.top - parent.rect.top),
    };
    if (node.type === "frame" || node.type === "text") {
      if (node.sizing.horizontal !== "fixed") node.sizing.horizontal = "fixed";
      if (node.sizing.vertical !== "fixed" && node.type === "frame") node.sizing.vertical = "fixed";
    }
  }
  return { node, rect };
}
