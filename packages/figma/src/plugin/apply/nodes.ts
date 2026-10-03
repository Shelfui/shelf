import type {
  FrameNode as IrFrame,
  Length,
  Node as IrNode,
  Sizing,
  TextNode as IrText,
} from "../../ir";
import {
  NAMESPACE,
  type Context,
  type NumberField,
  bindNumber,
  bind,
  paint,
  dropShadow,
  loadFont,
} from "./context";
import { mainOf, override } from "./instances";

export async function syncFrame(
  context: Context,
  node: FrameNode | ComponentNode,
  spec: IrFrame,
  root = false,
): Promise<void> {
  if (!root) node.name = spec.name;
  syncLayout(context, node, spec.layout);
  const spread = syncPaint(context, node, spec);
  node.clipsContent = spread || (spec.clip ?? false);
  await syncChildren(context, node, spec.children);
  size(context, node, spec.sizing, spec.width, spec.height, root);
}

function syncLayout(context: Context, node: FrameNode | ComponentNode, layout: IrFrame["layout"]) {
  if (layout?.direction === "grid" && layout.grid) {
    const { columns, rows, rowGap } = layout.grid;
    node.layoutMode = "GRID";
    node.gridRowCount = rows.length;
    node.gridColumnCount = columns.length;
    const tracks = (sizes: GridTrackSize[], specs: typeof columns) =>
      sizes.forEach((slot, i) => {
        const track = specs[i]!;
        slot.type = TRACKS[track.type];
        if (track.type !== "hug") slot.value = track.value;
      });
    tracks(node.gridColumnSizes, columns);
    tracks(node.gridRowSizes, rows);
    bindNumber(context, node, "gridColumnGap", layout.gap);
    bindNumber(context, node, "gridRowGap", rowGap);
  } else {
    node.layoutMode = layout?.direction === "column" ? "VERTICAL" : "HORIZONTAL";
    node.layoutWrap = layout?.wrap ? "WRAP" : "NO_WRAP";
    node.primaryAxisAlignItems = JUSTIFY[layout?.justify ?? "start"];
    node.counterAxisAlignItems = ALIGN[layout?.align ?? "start"];
    bindNumber(context, node, "itemSpacing", layout?.gap);
  }
  bindNumber(context, node, "paddingTop", layout?.padding.top);
  bindNumber(context, node, "paddingRight", layout?.padding.right);
  bindNumber(context, node, "paddingBottom", layout?.padding.bottom);
  bindNumber(context, node, "paddingLeft", layout?.padding.left);
}

/** Fills, strokes, corners, opacity and shadows. True when a shadow spreads, which needs clipping. */
function syncPaint(context: Context, node: FrameNode | ComponentNode, spec: IrFrame): boolean {
  // Figma draws shadow spread (focus rings) only on frames that clip and have a visible fill.
  const spread = spec.shadows?.some((shadow) => shadow.spread !== 0) ?? false;
  node.fills = spec.fill
    ? [paint(context, spec.fill)]
    : spread
      ? [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.0001 }]
      : [];
  node.strokes = spec.stroke
    ? [
        spec.stroke.paint
          ? paint(context, spec.stroke.paint)
          : { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0 },
      ]
    : [];
  const sides = spec.stroke?.sides;
  if (sides) {
    node.strokeTopWeight = sides.top;
    node.strokeRightWeight = sides.right;
    node.strokeBottomWeight = sides.bottom;
    node.strokeLeftWeight = sides.left;
  } else {
    node.strokeWeight = spec.stroke?.weight ?? 1;
  }
  node.dashPattern = spec.stroke?.dash ?? [];
  node.strokeAlign = "INSIDE";
  node.strokesIncludedInLayout = true;
  const corners: NumberField[] = [
    "topLeftRadius",
    "topRightRadius",
    "bottomRightRadius",
    "bottomLeftRadius",
  ];
  for (const [i, corner] of corners.entries()) {
    bindNumber(context, node, corner, spec.corners?.[i] ?? spec.radius);
  }
  node.opacity = spec.opacity ?? 1;
  node.effects = (spec.shadows ?? []).map((shadow) => dropShadow(context, shadow));
  return spread;
}

async function syncChildren(
  context: Context,
  parent: FrameNode | ComponentNode,
  specs: IrNode[],
): Promise<void> {
  const { figma } = context;
  for (const [i, spec] of specs.entries()) {
    // Reuse a later sibling when children were added, renamed, or reordered, so the ones that
    // didn't change keep their ids and instance overrides.
    const node =
      parent.children.slice(i).find((child) => reusable(child, spec)) ?? createNode(context, spec);
    if (parent.children[i] !== node) parent.insertChild(i, node);
    if (spec.type === "frame" && node.type === "FRAME") await syncFrame(context, node, spec);
    else if (spec.type === "text" && node.type === "TEXT") await syncText(context, node, spec);
    else if (spec.type === "vector") node.name = spec.name;
    else if (spec.type === "instance" && node.type === "INSTANCE") {
      const main = mainOf(context, spec);
      if ((await node.getMainComponentAsync())?.id !== main.id) node.swapComponent(main);
      node.name = spec.name;
      node.visible = true;
      node.rotation = 0;
      if (spec.sizing) {
        await override(context, node, spec);
        const mode = { fixed: "FIXED", hug: "HUG", fill: "FILL" } as const;
        if (spec.sizing.horizontal === "fixed" || spec.sizing.vertical === "fixed") {
          node.resize(spec.width, spec.height);
        }
        node.layoutSizingHorizontal = mode[spec.sizing.horizontal];
        node.layoutSizingVertical = mode[spec.sizing.vertical];
      } else if (Math.abs(node.width - spec.width) > 0.01) {
        node.rescale(spec.width / node.width);
      }
      if (spec.rotation) node.rotation = spec.rotation;
      if (spec.color) {
        const tint = paint(context, spec.color);
        for (const vector of node.findAllWithCriteria({ types: ["VECTOR"] })) {
          if (vector.strokes.length > 0) vector.strokes = [tint];
          if (vector.fills !== figma.mixed && vector.fills.length > 0) vector.fills = [tint];
        }
      }
    }
    if (node.type === "FRAME" || node.type === "TEXT" || node.type === "INSTANCE") {
      place(parent, node, spec);
    }
  }
  for (const extra of parent.children.slice(specs.length)) extra.remove();
}

/** The same kind of node with the same name, so syncing it keeps overrides in instances. */
function reusable(node: SceneNode, spec: IrNode): boolean {
  if (node.name !== spec.name) return false;
  const svg = node.getSharedPluginData(NAMESPACE, "svg");
  if (spec.type === "vector") return node.type === "FRAME" && svg === spec.svg;
  if (spec.type === "frame") return node.type === "FRAME" && !svg;
  return node.type === { text: "TEXT", instance: "INSTANCE" }[spec.type];
}

function createNode(context: Context, spec: IrNode): FrameNode | TextNode | InstanceNode {
  const { figma } = context;
  if (spec.type === "frame") return figma.createFrame();
  if (spec.type === "text") return figma.createText();
  if (spec.type === "instance") return mainOf(context, spec).createInstance();
  const vector = figma.createNodeFromSvg(spec.svg);
  vector.name = spec.name;
  vector.fills = [];
  vector.setSharedPluginData(NAMESPACE, "svg", spec.svg);
  return vector;
}

/** Out of Auto Layout at an offset, or in its grid cell. */
function place(
  parent: FrameNode | ComponentNode,
  node: FrameNode | TextNode | InstanceNode,
  spec: IrNode,
): void {
  if (spec.position) {
    node.layoutPositioning = "ABSOLUTE";
    node.x = spec.position.x;
    node.y = spec.position.y;
    return;
  }
  if (node.layoutPositioning === "ABSOLUTE") node.layoutPositioning = "AUTO";
  if (parent.layoutMode === "GRID" && spec.cell) {
    node.setGridChildPosition(spec.cell.row, spec.cell.column);
    node.gridRowSpan = spec.cell.rowSpan;
    node.gridColumnSpan = spec.cell.columnSpan;
  }
}

async function syncText(context: Context, node: TextNode, spec: IrText): Promise<void> {
  node.name = spec.name;
  const fontName = await loadFont(context, spec.fontFamily, spec.fontWeight.value);
  // Setting any property a text style controls detaches the style, so styled text sets none.
  const plain = spec.letterSpacing === 0 && !spec.underline;
  const style = spec.textStyle && plain ? context.textStyles.get(spec.textStyle) : undefined;
  if (style) {
    await node.setTextStyleIdAsync(style.id);
  } else {
    if (node.textStyleId) await node.setTextStyleIdAsync("");
    node.fontName = fontName;
    bindNumber(context, node, "fontSize", spec.fontSize);
    node.lineHeight = { unit: "PIXELS", value: spec.lineHeight.value };
    const lineHeight = spec.lineHeight.token && context.variables.get(spec.lineHeight.token);
    if (lineHeight) node.setBoundVariable("lineHeight", lineHeight);
    node.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
    node.textDecoration = spec.underline ? "UNDERLINE" : "NONE";
  }
  node.characters = spec.characters;
  node.fills = [paint(context, spec.fill)];
  node.textAlignHorizontal =
    spec.align === "center" ? "CENTER" : spec.align === "right" ? "RIGHT" : "LEFT";
  for (const range of spec.ranges ?? []) {
    const { start, end } = range;
    if (range.fill) node.setRangeFills(start, end, [paint(context, range.fill)]);
    if (range.fontFamily || range.fontWeight) {
      const family = range.fontFamily ?? spec.fontFamily;
      const weight = range.fontWeight?.value ?? spec.fontWeight.value;
      node.setRangeFontName(start, end, await loadFont(context, family, weight));
    }
    if (range.fontSize) node.setRangeFontSize(start, end, range.fontSize.value);
    if (range.underline !== undefined) {
      node.setRangeTextDecoration(start, end, range.underline ? "UNDERLINE" : "NONE");
    }
  }
  node.textAutoResize = spec.sizing.horizontal === "hug" ? "WIDTH_AND_HEIGHT" : "HEIGHT";
  if (spec.sizing.horizontal === "fixed") node.resize(spec.width, node.height);
  if (spec.sizing.horizontal === "fill") node.layoutSizingHorizontal = "FILL";
}

function size(
  context: Context,
  node: FrameNode | ComponentNode,
  sizing: { horizontal: Sizing; vertical: Sizing },
  width: Length,
  height: Length,
  root: boolean,
): void {
  const mode = (value: Sizing) =>
    value === "fixed" ? "FIXED" : value === "fill" && !root ? "FILL" : "HUG";
  node.layoutSizingHorizontal = mode(sizing.horizontal);
  node.layoutSizingVertical = mode(sizing.vertical);
  if (sizing.horizontal === "fixed" || sizing.vertical === "fixed") {
    // Figma's smallest size; spacers are 0 across.
    node.resize(
      Math.max(0.01, sizing.horizontal === "fixed" ? width.value : node.width),
      Math.max(0.01, sizing.vertical === "fixed" ? height.value : node.height),
    );
  }
  if (sizing.horizontal === "fixed") bind(context, node, "width", width.token);
  if (sizing.vertical === "fixed") bind(context, node, "height", height.token);
}

const JUSTIFY = {
  start: "MIN",
  center: "CENTER",
  end: "MAX",
  "space-between": "SPACE_BETWEEN",
} as const;

const ALIGN = { start: "MIN", center: "CENTER", end: "MAX", baseline: "BASELINE" } as const;

const TRACKS = { fixed: "FIXED", flex: "FLEX", hug: "HUG" } as const;
