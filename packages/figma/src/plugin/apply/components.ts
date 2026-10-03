import { type ComponentSet, type Node as IrNode, variantName } from "../../ir";
import { NAMESPACE, type Context, findPage, pageOf, variantKey } from "./context";
import { syncFrame } from "./nodes";

const SET_STROKE: SolidPaint = { type: "SOLID", color: { r: 0.592, g: 0.278, b: 1 } };

export function propertyNames(set: ComponentSet): string[] {
  return [
    ...Object.keys(set.text),
    ...Object.keys(set.instances).flatMap((name) => [name, `Show ${name}`]),
  ];
}

/** A component with no variant axes, synced as a plain component rather than a set of one. */
export function isPlainComponent(spec: ComponentSet): boolean {
  const [only] = spec.variants;
  return spec.variants.length === 1 && only !== undefined && Object.keys(only.props).length === 0;
}

export async function syncComponentSet(
  context: Context,
  spec: ComponentSet,
  existing: Map<string, SceneNode>,
): Promise<void> {
  const { figma } = context;
  const found = existing.get(`set:${spec.name}`);
  const [only] = spec.variants;
  if (only && isPlainComponent(spec)) {
    const component = found?.type === "COMPONENT" ? found : figma.createComponent();
    const page = found ? pageOf(found) : await findPage(figma, spec.name);
    if (component.parent !== page) page.appendChild(component);
    await syncFrame(context, component, only.node, true);
    component.name = spec.name;
    component.setSharedPluginData(NAMESPACE, "id", `set:${spec.name}`);
    describe(component, spec);
    bindProperties(component, only.node, syncProperties(context, component, spec));
    if (found?.type === "COMPONENT_SET") found.remove();
    context.components.set(spec.name, component);
    return;
  }
  if (found?.type === "COMPONENT") found.remove();
  let set = found?.type === "COMPONENT_SET" ? found : undefined;
  const page = set ? pageOf(set) : await findPage(figma, spec.name);
  const byVariant = new Map<string, ComponentNode>();
  for (const child of set?.children ?? []) {
    if (child.type !== "COMPONENT") continue;
    byVariant.set(variantKey(child), child);
  }

  const components: ComponentNode[] = [];
  for (const variant of spec.variants) {
    const name = variantName(variant.props);
    const component = byVariant.get(name) ?? figma.createComponent();
    byVariant.delete(name);
    component.setSharedPluginData(NAMESPACE, "variant", name);
    await syncFrame(context, component, variant.node, true);
    component.name = name;
    // combineAsVariants needs its nodes on the target page.
    const parent = set ?? page;
    if (component.parent !== parent) parent.appendChild(component);
    components.push(component);
  }
  for (const stale of byVariant.values()) stale.remove();

  if (!set) {
    set = figma.combineAsVariants(components, page);
    set.x = 0;
    set.y = 0;
  }
  set.name = spec.name;
  set.setSharedPluginData(NAMESPACE, "id", `set:${spec.name}`);
  describe(set, spec);

  const properties = syncProperties(context, set, spec);
  spec.variants.forEach((variant, i) => bindProperties(components[i]!, variant.node, properties));
  layoutVariants(set, spec, components);
  context.components.set(spec.name, set);
}

function describe(node: ComponentSetNode | ComponentNode, spec: ComponentSet): void {
  node.description = [spec.description, spec.item?.install].filter(Boolean).join("\n\n");
  if (spec.item?.docs) node.documentationLinks = [{ uri: spec.item.docs }];
}

/** Property name → id, such as `Label` → `Label#12:3`. */
function syncProperties(
  context: Context,
  set: ComponentSetNode | ComponentNode,
  spec: ComponentSet,
): Map<string, string> {
  const ids = new Map<string, string>();
  const current = () =>
    new Map(Object.keys(set.componentPropertyDefinitions).map((key) => [key.split("#")[0]!, key]));
  const ensure = (
    name: string,
    type: "TEXT" | "BOOLEAN" | "INSTANCE_SWAP",
    value: string | boolean,
    extra?: { preferredValues: InstanceSwapPreferredValue[] },
  ) => {
    const id = current().get(name);
    if (id && set.componentPropertyDefinitions[id]!.type === type) {
      set.editComponentProperty(id, { defaultValue: value, ...extra });
      ids.set(name, id);
    } else {
      if (id) set.deleteComponentProperty(id);
      ids.set(name, set.addComponentProperty(name, type, value, extra));
    }
  };
  for (const [name, value] of Object.entries(spec.text)) ensure(name, "TEXT", value);
  for (const [name, component] of Object.entries(spec.instances)) {
    const main = context.icons.get(component);
    if (!main) throw new Error(`${spec.name}: ${name} uses ${component}, which isn't an icon.`);
    const preferredValues = [...context.icons.values()].map((candidate) => ({
      type: "COMPONENT" as const,
      key: candidate.key,
    }));
    ensure(name, "INSTANCE_SWAP", main.id, { preferredValues });
    ensure(`Show ${name}`, "BOOLEAN", false);
  }
  const wanted = new Set(propertyNames(spec));
  for (const [name, id] of current()) {
    if (set.componentPropertyDefinitions[id]!.type !== "VARIANT" && !wanted.has(name)) {
      set.deleteComponentProperty(id);
    }
  }
  return ids;
}

function bindProperties(node: SceneNode, spec: IrNode, ids: Map<string, string>): void {
  if (spec.type === "text" && node.type === "TEXT") {
    const id = spec.property && ids.get(spec.property);
    node.componentPropertyReferences = id ? { characters: id } : {};
  } else if (spec.type === "instance" && node.type === "INSTANCE") {
    const swap = spec.property && ids.get(spec.property);
    const show = spec.property && ids.get(`Show ${spec.property}`);
    node.componentPropertyReferences = swap && show ? { mainComponent: swap, visible: show } : {};
    if (show) node.visible = false;
  } else if (spec.type === "frame" && "children" in node) {
    spec.children.forEach((child, i) => {
      const target = node.children[i];
      if (target) bindProperties(target, child, ids);
    });
  }
}

/**
 * Lays the variants out as a grid: a row per value of the first property, in argTypes order,
 * and a column per combination of the rest, so State is always across.
 */
function layoutVariants(set: ComponentSetNode, spec: ComponentSet, nodes: ComponentNode[]): void {
  const gap = 16;
  const padding = 24;
  const rows = [...new Set(spec.variants.map((variant) => rowKey(variant.props)))];
  const columns = [...new Set(spec.variants.map((variant) => columnKey(variant.props)))];
  const cells = spec.variants.flatMap((variant, i) => {
    const node = nodes[i];
    if (!node) return [];
    const column = columns.indexOf(columnKey(variant.props));
    return [{ node, column, row: rows.indexOf(rowKey(variant.props)) }];
  });
  const widths = columns.map((_, column) =>
    Math.max(0, ...cells.filter((cell) => cell.column === column).map((cell) => cell.node.width)),
  );
  const heights = rows.map((_, row) =>
    Math.max(0, ...cells.filter((cell) => cell.row === row).map((cell) => cell.node.height)),
  );
  const offset = (lengths: number[], index: number) =>
    padding + lengths.slice(0, index).reduce((total, length) => total + length + gap, 0);
  for (const cell of cells) {
    cell.node.x = offset(widths, cell.column);
    cell.node.y = offset(heights, cell.row);
  }
  set.resizeWithoutConstraints(
    offset(widths, widths.length) - gap + padding,
    offset(heights, heights.length) - gap + padding,
  );
  set.strokes = [SET_STROKE];
  set.dashPattern = [10, 5];
  set.cornerRadius = 5;
}

function rowKey(props: Record<string, string>): string {
  return Object.values(props)[0] ?? "";
}

function columnKey(props: Record<string, string>): string {
  return Object.values(props).slice(1).join(",");
}
