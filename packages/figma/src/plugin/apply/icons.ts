import type { Library } from "../../ir";
import { NAMESPACE, type Context, findPage, pageOf } from "./context";

export async function syncIcons(
  context: Context,
  library: Library,
  existing: Map<string, SceneNode>,
): Promise<Map<string, ComponentNode>> {
  const { figma } = context;
  const placed = [...existing].find(([id]) => id.startsWith("icon:"))?.[1];
  const page = placed ? pageOf(placed) : await findPage(figma, "Icons");
  const result = new Map<string, ComponentNode>();
  let x = 0;
  for (const spec of library.icons) {
    const found = existing.get(`icon:${spec.name}`);
    const component = found?.type === "COMPONENT" ? found : figma.createComponent();
    if (component.getSharedPluginData(NAMESPACE, "svg") !== spec.svg) {
      // `children` is a fresh array on every read, so removing while iterating is safe.
      for (const child of component.children) child.remove();
      const svg = figma.createNodeFromSvg(spec.svg);
      component.resizeWithoutConstraints(svg.width, svg.height);
      for (const child of svg.children) {
        component.appendChild(child);
        if ("constraints" in child) child.constraints = { horizontal: "SCALE", vertical: "SCALE" };
      }
      svg.remove();
      component.setSharedPluginData(NAMESPACE, "svg", spec.svg);
    }
    component.name = spec.name;
    component.fills = [];
    component.setSharedPluginData(NAMESPACE, "id", `icon:${spec.name}`);
    if (component.parent !== page) page.appendChild(component);
    component.x = x % 480;
    component.y = Math.floor(x / 480) * 40;
    x += 40;
    result.set(spec.name, component);
  }
  return result;
}
