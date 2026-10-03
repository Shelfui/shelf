import {
  type ComponentSet,
  IR_VERSION,
  type Library,
  type Node as IrNode,
  variantName,
} from "../../ir";
import type { ApplyResult } from "../../protocol";
import { isPlainComponent, propertyNames, syncComponentSet } from "./components";
import { NAMESPACE, type Context, fontStyles, variantKey } from "./context";
import { syncIcons } from "./icons";
import { syncTextStyles, syncEffectStyles } from "./styles";
import { localVariables, syncVariables } from "./variables";

export interface ApplyOptions {
  /** Remove variants, properties and variables that are gone from code. */
  allowBreaking?: boolean;
}

/**
 * Makes the document match the library: variables, text and effect styles, icon components,
 * and one component set per page. Existing nodes are updated in place, matched by the ids
 * this function stores, so instances in other files stay linked. Applying twice changes nothing.
 */
export async function apply(
  figma: PluginAPI,
  library: Library,
  options: ApplyOptions = {},
): Promise<ApplyResult> {
  const version: unknown = library.version;
  if (version !== IR_VERSION) {
    throw new Error(
      `This library uses Shelf IR version ${String(version)}; the plugin reads version ${String(IR_VERSION)}. Update the Shelf plugin.`,
    );
  }
  const existing = await findShelfNodes(figma);
  const variables = await localVariables(figma, library);
  const orphans = orphanedNodes(library, existing);
  const breaking = [
    ...breakingComponentChanges(library, existing),
    ...orphans.map(([id]) => `removes ${describeId(id)}`),
    ...variables.removed,
  ];
  if (breaking.length > 0 && !options.allowBreaking) return { status: "confirm", breaking };

  const context: Context = {
    figma,
    variables: await syncVariables(figma, library, variables),
    textStyles: new Map(),
    icons: new Map(),
    components: new Map(),
    fonts: await fontStyles(figma),
    warnings: [],
  };
  context.textStyles = await syncTextStyles(context, library);
  await syncEffectStyles(context, library);
  context.icons = await syncIcons(context, library, existing);
  for (const set of dependencyOrder(library.components)) {
    await syncComponentSet(context, set, existing);
  }

  for (const [, node] of orphans) node.remove();

  const revisions = library.revisions ?? readRevisions(figma);
  figma.root.setSharedPluginData(NAMESPACE, "revisions", JSON.stringify(revisions));
  const summary = [
    `${context.variables.size} variables`,
    `${context.textStyles.size} text styles`,
    `${context.icons.size} icons`,
    ...library.components.map((set) => `${set.name}: ${set.variants.length} variants`),
  ];
  return { status: "applied", summary, warnings: context.warnings };
}

/** Components used as instances inside others come first, so their masters exist. */
function dependencyOrder(components: ComponentSet[]): ComponentSet[] {
  const byName = new Map(components.map((set) => [set.name, set]));
  const ordered: ComponentSet[] = [];
  const seen = new Set<string>();
  const uses = (node: IrNode): string[] =>
    node.type === "instance" && byName.has(node.component)
      ? [node.component]
      : node.type === "frame"
        ? node.children.flatMap(uses)
        : [];
  const visit = (set: ComponentSet) => {
    if (seen.has(set.name)) return;
    seen.add(set.name);
    for (const name of set.variants.flatMap((variant) => uses(variant.node))) {
      visit(byName.get(name)!);
    }
    ordered.push(set);
  };
  components.forEach(visit);
  return ordered;
}

/** What the document was last synced to: item name → revision. */
export function readRevisions(figma: PluginAPI): Record<string, string> {
  const raw = figma.root.getSharedPluginData(NAMESPACE, "revisions");
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? Object.fromEntries(
          Object.entries(parsed).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  } catch {
    return {};
  }
}

/** Every Shelf component and component set, by its `id`: `set:Button`, `icon:Icon/Plus`. */
export async function findShelfNodes(figma: PluginAPI): Promise<Map<string, SceneNode>> {
  const found = new Map<string, SceneNode>();
  for (const page of figma.root.children) {
    await page.loadAsync();
    for (const node of page.findAllWithCriteria({
      types: ["COMPONENT_SET", "COMPONENT"],
      sharedPluginData: { namespace: NAMESPACE, keys: ["id"] },
    })) {
      found.set(node.getSharedPluginData(NAMESPACE, "id"), node);
    }
  }
  return found;
}

/** `set:Button` → `component Button`, `icon:Icon/Plus` → `icon Icon/Plus`. */
function describeId(id: string): string {
  const [kind, name] = [id.slice(0, id.indexOf(":")), id.slice(id.indexOf(":") + 1)];
  return `${kind === "icon" ? "icon" : "component"} ${name}`;
}

/** Shelf components and icons the library no longer has. */
function orphanedNodes(
  library: Library,
  existing: Map<string, SceneNode>,
): Array<[string, SceneNode]> {
  const wanted = new Set([
    ...library.components.map((set) => `set:${set.name}`),
    ...library.icons.map((icon) => `icon:${icon.name}`),
  ]);
  return [...existing].filter(([id]) => !wanted.has(id)).toSorted(([a], [b]) => (a < b ? -1 : 1));
}

function breakingComponentChanges(library: Library, existing: Map<string, SceneNode>): string[] {
  const breaking: string[] = [];
  for (const set of library.components) {
    const node = existing.get(`set:${set.name}`);
    const plain = isPlainComponent(set);
    if (node?.type === "COMPONENT" && !plain) {
      breaking.push(`${set.name}: replaces the component with a set of variants`);
    }
    if (node?.type === "COMPONENT_SET" && plain) {
      breaking.push(`${set.name}: replaces the set of variants with a single component`);
    }
    if (node?.type !== "COMPONENT_SET" || plain) continue;
    const wanted = new Set(set.variants.map((variant) => variantName(variant.props)));
    for (const child of node.children) {
      const name = variantKey(child);
      if (!wanted.has(name)) breaking.push(`${set.name}: removes variant ${name}`);
    }
    const properties = new Set(propertyNames(set));
    for (const key of Object.keys(node.componentPropertyDefinitions)) {
      const name = key.split("#")[0]!;
      if (node.componentPropertyDefinitions[key]!.type === "VARIANT") continue;
      if (!properties.has(name)) breaking.push(`${set.name}: removes property ${name}`);
    }
  }
  return breaking;
}

export { NAMESPACE } from "./context";
