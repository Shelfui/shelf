import type { FrameNode, Length, Node, Sides, Sizing, Track } from "../../ir";
import { CaptureError, type Walk, type Kind, type Parent } from "./context";
import { inlineLevel, plainInline, contentBox } from "./dom";
import { length, align, justify, round, sum, max } from "./units";

export function layoutOf(
  { style, kind }: Parent,
  field: boolean,
  { path, context }: Walk,
): NonNullable<FrameNode["layout"]> {
  const padding = (side: string) =>
    length(parseFloat(style.getPropertyValue(`padding-${side}`)), "spacing", context);
  const flex = style.display.includes("flex");
  const gap = kind === "row" || kind === "grid" ? style.columnGap : style.rowGap;
  return {
    direction: kind === "text" ? "row" : kind,
    gap: length(parseFloat(gap) || 0, "spacing", context),
    padding: {
      top: padding("top"),
      right: padding("right"),
      bottom: padding("bottom"),
      left: padding("left"),
    },
    align: flex ? align(style.alignItems, path) : field ? "center" : "start",
    justify: flex
      ? justify(style.justifyContent, path)
      : style.display === "table-cell" && style.verticalAlign === "middle"
        ? "center"
        : "start",
    wrap: flex ? style.flexWrap === "wrap" : kind === "row" && !style.display.includes("grid"),
  };
}

/**
 * Auto Layout places children in order, so in-flow children take the order they appear in,
 * which `order` or `caption-side` can make differ from the DOM. Positioned children keep theirs.
 */
export function visualOrder(placed: Array<{ node: Node; rect: DOMRect }>, row: boolean): void {
  const slots = placed.flatMap((child, i) => (child.node.position ? [] : [i]));
  const sorted = slots
    .map((i) => placed[i]!)
    .toSorted((a, b) => (row ? a.rect.left - b.rect.left : a.rect.top - b.rect.top));
  slots.forEach((slot, i) => {
    placed[slot] = sorted[i]!;
  });
}

export function kindOf(
  style: CSSStyleDeclaration,
  items: Array<Element | Text>,
  path: string,
): Kind {
  const display = style.display;
  if (display.includes("flex")) {
    if (!["row", "column"].includes(style.flexDirection)) {
      throw new CaptureError(
        `${path}: flex-direction: ${style.flexDirection} isn't supported in Figma.`,
      );
    }
    return style.flexDirection === "row" ? "row" : "column";
  }
  if (display.includes("grid")) {
    const columns = tracks(style.gridTemplateColumns).length;
    const rows = tracks(style.gridTemplateRows).length;
    if (columns <= 1) return "column";
    if (rows <= 1) return "row";
    return "grid";
  }
  if (display === "table-row") return "row";
  if (
    [
      "table",
      "inline-table",
      "table-row-group",
      "table-header-group",
      "table-footer-group",
    ].includes(display)
  ) {
    return "column";
  }
  // Block flow: block boxes stack, inline content runs in lines.
  const inline = items.filter((item) => item instanceof Text || inlineLevel(item));
  const plain = inline.every((item) => item instanceof Text || plainInline(item));
  if (inline.length === 0) return "column";
  if (inline.length === items.length) return plain ? "text" : "row";
  // An SVG with no text beside it is alone on its line, so it stacks like a block (a chart above its legend).
  if (!plain && !inline.every((item) => item instanceof SVGElement)) {
    throw new CaptureError(
      `${path}: display: ${display} mixing block children with inline boxes isn't supported in Figma. Wrap the inline content.`,
    );
  }
  return "column";
}

/** Fill where the item stretches or grows, as its parent's layout decides. */
export function childSizing(
  element: Element,
  style: CSSStyleDeclaration,
  rect: DOMRect,
  parent: Parent,
  current: { horizontal: Sizing; vertical: Sizing },
): Partial<{ horizontal: Sizing; vertical: Sizing }> {
  const result: Partial<{ horizontal: Sizing; vertical: Sizing }> = {};
  const display = parent.style.display;
  const content = contentBox(parent.rect, parent.style);
  const spans = (axis: "horizontal" | "vertical") =>
    axis === "horizontal"
      ? Math.abs(rect.width - content.width) <= 1
      : Math.abs(rect.height - content.height) <= 1;
  if (display.includes("flex")) {
    const row = parent.style.flexDirection === "row";
    const grows = parseFloat(style.flexGrow) > 0;
    const self = style.alignSelf === "auto" ? parent.style.alignItems : style.alignSelf;
    const stretches = self === "stretch" || self === "normal";
    if (grows) result[row ? "horizontal" : "vertical"] = "fill";
    if (stretches) result[row ? "vertical" : "horizontal"] = "fill";
  } else if (display.includes("grid")) {
    if (parent.kind === "column" && spans("horizontal")) result.horizontal = "fill";
    if (parent.kind === "row" && spans("vertical")) result.vertical = "fill";
  } else if (display === "table-row") {
    result.horizontal = "fixed";
    result.vertical = "fill";
  } else if (parent.kind === "column") {
    const block = !getComputedStyle(element).display.startsWith("inline");
    if (block && spans("horizontal")) result.horizontal = "fill";
  }
  if (current.horizontal === "fixed") result.horizontal = "fixed";
  if (current.vertical === "fixed") result.vertical = "fixed";
  return result;
}

/**
 * Gap and padding as laid out, so margins count: uniform spacing between children becomes
 * the gap, and the first child's offset the leading padding.
 */
export function measureSpacing(
  node: FrameNode,
  style: CSSStyleDeclaration,
  rect: DOMRect,
  placed: Array<{ node: Node; rect: DOMRect }>,
  cursor: Walk,
): void {
  const layout = node.layout;
  const flow = placed.filter((child) => !child.node.position);
  const first = flow[0];
  const last = flow.at(-1);
  if (!layout || !first || !last || layout.wrap || layout.justify !== "start") return;
  const row = layout.direction === "row";
  const start = (box: DOMRect) => (row ? box.left : box.top);
  const end = (box: DOMRect) => (row ? box.right : box.bottom);
  const gaps: Array<{ previous: DOMRect; next: (typeof placed)[number]; spacing: number }> = [];
  let previous = first;
  for (const next of flow.slice(1)) {
    gaps.push({ previous: previous.rect, next, spacing: start(next.rect) - end(previous.rect) });
    previous = next;
  }
  const [firstGap] = gaps;
  if (firstGap && gaps.every((gap) => Math.abs(gap.spacing - firstGap.spacing) <= 0.5)) {
    if (Math.abs(firstGap.spacing - layout.gap.value) > 0.5) {
      layout.gap = length(firstGap.spacing, "spacing", cursor.context);
    }
  } else if (firstGap) {
    // Margins that differ between children, such as a heading's, become spacers.
    layout.gap = { value: 0 };
    for (const gap of gaps.toReversed()) {
      const spacing = round(gap.spacing);
      if (spacing <= 0.5) continue;
      const box = row
        ? new DOMRect(end(gap.previous), rect.top, spacing, 0)
        : new DOMRect(rect.left, end(gap.previous), 0, spacing);
      const filler = spacer(length(spacing, "spacing", cursor.context), row);
      placed.splice(placed.indexOf(gap.next), 0, { node: filler, rect: box });
    }
  }
  const border = (side: string) => parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0;
  const leading = row ? "left" : "top";
  const offset = start(first.rect) - (row ? rect.left : rect.top) - border(leading);
  if (Math.abs(offset - layout.padding[leading].value) > 0.5 && offset >= 0) {
    layout.padding[leading] = length(offset, "spacing", cursor.context);
  }
  const axis = row ? "horizontal" : "vertical";
  const trailing = row ? "right" : "bottom";
  if (node.sizing[axis] === "hug") {
    const after = (row ? rect.right : rect.bottom) - end(last.rect) - border(trailing);
    if (Math.abs(after - layout.padding[trailing].value) > 0.5 && after >= 0) {
      layout.padding[trailing] = length(after, "spacing", cursor.context);
    }
  }
}

function spacer(size: Length, row: boolean): FrameNode {
  const zero = { value: 0 };
  return {
    type: "frame",
    name: "Spacer",
    width: row ? size : zero,
    height: row ? zero : size,
    sizing: { horizontal: "fixed", vertical: "fixed" },
    children: [],
  };
}

/** Tracks from the resolved template, and each child's cell from where it sits. */
export function gridLayout(
  node: FrameNode,
  style: CSSStyleDeclaration,
  rect: DOMRect,
  placed: Array<{ node: Node; rect: DOMRect }>,
  cursor: Walk,
): void {
  const columns = tracks(style.gridTemplateColumns);
  const rows = tracks(style.gridTemplateRows);
  const columnGap = parseFloat(style.columnGap) || 0;
  const rowGap = parseFloat(style.rowGap) || 0;
  const content = contentBox(rect, style);
  const columnStarts = trackStarts(columns, content.left, columnGap);
  const rowStarts = trackStarts(rows, content.top, rowGap);
  for (const child of placed) {
    if (child.node.position) continue;
    const column = Math.max(0, trackAt(columnStarts, child.rect.left));
    const row = Math.max(0, trackAt(rowStarts, child.rect.top));
    const columnSpan = trackSpan(columnStarts, columns, column, child.rect.right);
    const rowSpan = trackSpan(rowStarts, rows, row, child.rect.bottom);
    child.node.cell = { row, column, rowSpan, columnSpan };
    if (child.node.type === "frame" || child.node.type === "text") {
      const width =
        columnStarts[column + columnSpan - 1]! +
        columns[column + columnSpan - 1]! -
        columnStarts[column]!;
      const height = rowStarts[row + rowSpan - 1]! + rows[row + rowSpan - 1]! - rowStarts[row]!;
      if (Math.abs(child.rect.width - width) <= 1 && child.node.sizing.horizontal !== "fixed") {
        child.node.sizing.horizontal = "fill";
      }
      if (Math.abs(child.rect.height - height) <= 1 && child.node.sizing.vertical !== "fixed") {
        child.node.sizing.vertical = "fill";
      }
    }
  }
  const equal = columns.every((size) => Math.abs(size - columns[0]!) <= 1);
  const widest = columns.indexOf(Math.max(...columns));
  const columnTracks: Track[] = columns.map((size, i) =>
    equal || i === widest ? { type: "flex", value: 1 } : { type: "fixed", value: round(size) },
  );
  node.layout!.grid = {
    columns: columnTracks,
    rows: rows.map(() => ({ type: "hug", value: 0 })),
    rowGap: length(rowGap, "spacing", cursor.context),
  };
  // Flex tracks share the frame's width, so it can't hug.
  if (node.sizing.horizontal === "hug") node.sizing.horizontal = "fixed";
}

function trackStarts(sizes: number[], origin: number, gap: number): number[] {
  return sizes.map(
    (_, i) => origin + sizes.slice(0, i).reduce((total, size) => total + size + gap, 0),
  );
}

/** The track that starts at the value, else the last one that starts before it. */
function trackAt(starts: number[], value: number): number {
  const found = starts.findIndex((start) => Math.abs(start - value) <= 1);
  return found === -1 ? starts.filter((start) => start <= value + 1).length - 1 : found;
}

function trackSpan(starts: number[], sizes: number[], from: number, to: number): number {
  let count = 1;
  while (from + count < sizes.length && starts[from + count]! < to - 1) count++;
  return count;
}

function tracks(template: string): number[] {
  if (!template || template === "none") return [];
  return template
    .replace(/\[[^\]]*\]/g, "")
    .trim()
    .split(/\s+/)
    .map(parseFloat)
    .filter((value) => !Number.isNaN(value));
}

/**
 * A hug axis must measure what Auto Layout will compute from the children, or the component
 * resizes wrongly. When it doesn't, the CSS sets a size of its own, such as a height or a
 * min-width, and the axis is fixed at it.
 */
export function checkHug(
  node: FrameNode,
  rect: DOMRect,
  flow: Array<{ node: Node; rect: DOMRect }>,
): void {
  const layout = node.layout;
  if (!layout) return;
  const stroke = node.stroke;
  const border = (side: keyof Sides) => (stroke ? (stroke.sides?.[side] ?? stroke.weight) : 0);
  // Text is as tall as its line boxes, which its glyphs' box may not fill.
  const sizes = flow.map(({ node: child, rect: box }) => ({
    width: box.width,
    height:
      child.type === "text"
        ? Math.max(1, Math.round(box.height / child.lineHeight.value)) * child.lineHeight.value
        : box.height,
  }));
  const gaps = Math.max(0, sizes.length - 1) * layout.gap.value;
  const inline =
    layout.padding.left.value + layout.padding.right.value + border("left") + border("right");
  const block =
    layout.padding.top.value + layout.padding.bottom.value + border("top") + border("bottom");
  const row = layout.direction === "row";
  const width =
    inline +
    (row ? sum(sizes.map((size) => size.width)) + gaps : max(sizes.map((size) => size.width)));
  const height =
    block +
    (row ? max(sizes.map((size) => size.height)) : sum(sizes.map((size) => size.height)) + gaps);
  if (node.sizing.horizontal === "hug" && !layout.wrap && Math.abs(width - rect.width) > 1) {
    node.sizing.horizontal = "fixed";
  }
  if (node.sizing.vertical === "hug" && !layout.wrap && Math.abs(height - rect.height) > 1) {
    node.sizing.vertical = "fixed";
  }
}
