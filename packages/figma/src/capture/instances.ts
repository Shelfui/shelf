import type { ComponentSet, FrameNode, InstanceNode, Node, Paint } from "../ir";

type Overrides = NonNullable<InstanceNode["overrides"]>;

interface Candidate {
  set: ComponentSet;
  props: Record<string, string>;
  node: FrameNode;
}

/**
 * Replaces frames that render another Shelf component, such as a Button in a block, with an
 * instance of that component's matching variant, so the design follows the component.
 * Matching compares what the frame draws, not what the code said, and uses resting states only.
 */
export function nestInstances(components: ComponentSet[]): void {
  const byRoot = new Map<string, Candidate[]>();
  for (const set of components) {
    for (const { props, node } of set.variants) {
      if (props["State"] && props["State"] !== "Default") continue;
      const list = byRoot.get(node.name) ?? [];
      list.push({ set, props, node });
      byRoot.set(node.name, list);
    }
  }
  for (const set of components) {
    for (const variant of set.variants) {
      variant.node.children = variant.node.children.map((child) => nest(child, set, byRoot));
    }
  }
}

function nest(node: Node, owner: ComponentSet, byRoot: Map<string, Candidate[]>): Node {
  if (node.type !== "frame") return node;
  for (const candidate of byRoot.get(node.name) ?? []) {
    if (candidate.set === owner) continue;
    const overrides = matches(node, candidate.node, candidate.set);
    if (!overrides) continue;
    const instance: InstanceNode = {
      type: "instance",
      name: candidate.set.name,
      component: candidate.set.name,
      width: node.width.value,
      height: node.height.value,
      sizing: node.sizing,
      ...(Object.keys(candidate.props).length > 0 && { variant: candidate.props }),
      ...(Object.keys(overrides).length > 0 && { overrides }),
      ...(node.position && { position: node.position }),
      ...(node.cell && { cell: node.cell }),
    };
    return instance;
  }
  node.children = node.children.map((child) => nest(child, owner, byRoot));
  return node;
}

/** The overrides that turn the variant into the frame, if it draws the same apart from its text and optional icon. */
function matches(node: FrameNode, variant: FrameNode, set: ComponentSet): Overrides | undefined {
  const overrides: Overrides = {};
  if (!collect(node, variant, set, overrides)) return undefined;
  if (overrides.characters?.every((value) => value === null)) delete overrides.characters;
  if (overrides.show && Object.values(overrides.show).every((shown) => !shown)) {
    delete overrides.show;
  }
  return overrides;
}

function collect(
  node: FrameNode,
  variant: FrameNode,
  set: ComponentSet,
  overrides: Overrides,
): boolean {
  if (look(node) !== look(variant)) return false;
  const children = [...node.children];
  for (const expected of variant.children) {
    const actual = children[0];
    if (expected.type === "instance" && expected.property) {
      // An optional icon: shown and swapped when present, hidden when not.
      const present = actual?.type === "instance" && !actual.variant;
      (overrides.show ??= {})[`Show ${expected.property}`] = present;
      if (present) {
        children.shift();
        if (actual.component !== (set.instances[expected.property] ?? expected.component)) {
          (overrides.swap ??= {})[expected.property] = actual.component;
        }
      }
      continue;
    }
    if (!actual || actual.type !== expected.type) return false;
    children.shift();
    if (expected.type === "text" && actual.type === "text") {
      if (paintKey(expected.fill) !== paintKey(actual.fill)) return false;
      if (expected.fontSize.value !== actual.fontSize.value) return false;
      if (expected.fontWeight.value !== actual.fontWeight.value) return false;
      const characters = (overrides.characters ??= []);
      characters.push(actual.characters === expected.characters ? null : actual.characters);
    } else if (expected.type === "frame" && actual.type === "frame") {
      if (!collect(actual, expected, set, overrides)) return false;
    } else if (expected.type === "instance" && actual.type === "instance") {
      if (expected.component !== actual.component) return false;
    } else if (expected.type === "vector" && actual.type === "vector") {
      if (expected.svg !== actual.svg) return false;
    }
  }
  return children.length === 0;
}

/** What a frame draws, apart from its children and a hugging width. */
function look(node: FrameNode): string {
  const layout = node.layout;
  return JSON.stringify([
    paintKey(node.fill),
    node.stroke?.weight,
    node.stroke?.sides,
    paintKey(node.stroke?.paint),
    node.radius?.value,
    node.corners?.map((corner) => corner.value),
    node.opacity,
    node.shadows?.map((shadow) => [shadow.blur, shadow.spread, paintKey(shadow.paint)]),
    layout?.direction,
    layout?.gap.value,
    layout && Object.values(layout.padding).map((side) => side.value),
    node.sizing.vertical === "fixed" ? node.height.value : "hug",
  ]);
}

function paintKey(paint: Paint | undefined): string {
  if (!paint) return "";
  const { r, g, b, a } = paint.color;
  return `${paint.token ?? [r, g, b].map((channel) => channel.toFixed(3)).join(",")}/${a.toFixed(2)}`;
}
