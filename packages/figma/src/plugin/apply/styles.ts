import type { Library } from "../../ir";
import { NAMESPACE, type Context, dropShadow, loadFont } from "./context";
import { valueOf } from "./variables";

export async function syncTextStyles(
  context: Context,
  library: Library,
): Promise<Map<string, TextStyle>> {
  const { figma } = context;
  const local = await figma.getLocalTextStylesAsync();
  const result = new Map<string, TextStyle>();
  for (const spec of library.foundations.textStyles) {
    const style =
      local.find((candidate) => candidate.getSharedPluginData(NAMESPACE, "id") === spec.name) ??
      figma.createTextStyle();
    style.setSharedPluginData(NAMESPACE, "id", spec.name);
    style.name = spec.name;
    const family = valueOf(context, spec.fontFamily);
    if (typeof family !== "string") throw new Error(`${spec.fontFamily} isn't a font family.`);
    const fontName = await loadFont(context, family, Number(valueOf(context, spec.fontWeight)));
    style.fontName = fontName;
    style.fontSize = Number(valueOf(context, spec.fontSize));
    style.lineHeight = { unit: "PIXELS", value: Number(valueOf(context, spec.lineHeight)) };
    for (const [field, token] of [
      ["fontFamily", spec.fontFamily],
      ["fontSize", spec.fontSize],
      ["lineHeight", spec.lineHeight],
      ["fontWeight", spec.fontWeight],
    ] as const) {
      const variable = context.variables.get(token);
      if (variable) style.setBoundVariable(field, variable);
    }
    result.set(spec.name, style);
  }
  return result;
}

export async function syncEffectStyles(context: Context, library: Library): Promise<void> {
  const local = await context.figma.getLocalEffectStylesAsync();
  for (const spec of library.foundations.effectStyles) {
    const style =
      local.find((candidate) => candidate.getSharedPluginData(NAMESPACE, "id") === spec.token) ??
      context.figma.createEffectStyle();
    style.setSharedPluginData(NAMESPACE, "id", spec.token);
    style.name = spec.name;
    style.effects = spec.shadows.map((shadow) => dropShadow(context, shadow));
  }
}
