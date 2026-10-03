import { type InstanceNode as IrInstance, variantName } from "../../ir";
import { type Context, variantKey } from "./context";

/** The icon, the plain component, or the set's variant an instance spec points at. */
export function mainOf(context: Context, spec: IrInstance): ComponentNode {
  const main = context.icons.get(spec.component) ?? context.components.get(spec.component);
  if (main?.type === "COMPONENT") return main;
  const name = spec.variant && variantName(spec.variant);
  const variant = main?.children.find(
    (child): child is ComponentNode => child.type === "COMPONENT" && variantKey(child) === name,
  );
  if (!variant) {
    throw new Error(`No component ${spec.component}${name ? ` (${name})` : ""} to instance.`);
  }
  return variant;
}

/** Text, icon visibility and swaps that differ from the main component. */
export async function override(
  context: Context,
  node: InstanceNode,
  spec: IrInstance,
): Promise<void> {
  node.resetOverrides();
  const { show = {}, swap = {}, characters = [] } = spec.overrides ?? {};
  const properties: Record<string, string | boolean> = {};
  for (const key of Object.keys(node.componentProperties)) {
    const name = key.split("#")[0]!;
    if (name in show) properties[key] = show[name]!;
    const icon = swap[name] && context.icons.get(swap[name]);
    if (icon) properties[key] = icon.id;
  }
  if (Object.keys(properties).length > 0) node.setProperties(properties);
  const texts = node.findAllWithCriteria({ types: ["TEXT"] });
  for (const [i, value] of characters.entries()) {
    const text = texts[i];
    if (value === null || !text) continue;
    if (text.fontName !== context.figma.mixed) await context.figma.loadFontAsync(text.fontName);
    text.characters = value;
  }
}
