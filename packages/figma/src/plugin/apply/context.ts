import type { Length, Paint as IrPaint, Shadow } from "../../ir";

/** Shared plugin data namespace. Keys: `id` on nodes and styles, `revisions` on the document. */
export const NAMESPACE = "shelf";

const WEIGHTS: Record<number, string[]> = {
  100: ["Thin"],
  200: ["ExtraLight", "Extra Light"],
  300: ["Light"],
  400: ["Regular"],
  500: ["Medium"],
  600: ["SemiBold", "Semi Bold"],
  700: ["Bold"],
  800: ["ExtraBold", "Extra Bold"],
  900: ["Black"],
};

export interface Context {
  figma: PluginAPI;
  /** Token → variable. */
  variables: Map<string, Variable>;
  /** Text style name → style. */
  textStyles: Map<string, TextStyle>;
  /** Icon name → component. */
  icons: Map<string, ComponentNode>;
  /** Component name → its set, or its component when it has no variants. Filled as they sync. */
  components: Map<string, ComponentSetNode | ComponentNode>;
  /** Family → available styles. */
  fonts: Map<string, Set<string>>;
  warnings: string[];
}

export type NumberField =
  | "itemSpacing"
  | "gridColumnGap"
  | "gridRowGap"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
  | "topLeftRadius"
  | "topRightRadius"
  | "bottomLeftRadius"
  | "bottomRightRadius";

export function bindNumber(
  context: Context,
  node: FrameNode | ComponentNode | TextNode,
  field: NumberField | "fontSize",
  length: Length | undefined,
): void {
  const value = length?.value ?? 0;
  if (field === "fontSize" && node.type === "TEXT") node.fontSize = value;
  else if (field !== "fontSize" && node.type !== "TEXT") node[field] = value;
  bind(context, node, field, length?.token);
}

/** Binds a field to a token's variable, or unbinds it when the value isn't a token. */
export function bind(
  context: Context,
  node: SceneNode,
  field: VariableBindableNodeField | VariableBindableTextField,
  token: string | undefined,
): void {
  const variable = token ? context.variables.get(token) : undefined;
  const bound = "boundVariables" in node && node.boundVariables?.[field];
  if (!variable && !bound) return;
  node.setBoundVariable(field, variable ?? null);
}

export function paint(context: Context, spec: IrPaint): SolidPaint {
  const { r, g, b, a } = spec.color;
  const solid: SolidPaint = { type: "SOLID", color: { r, g, b }, opacity: a };
  const variable = spec.token ? context.variables.get(spec.token) : undefined;
  return variable
    ? context.figma.variables.setBoundVariableForPaint(solid, "color", variable)
    : solid;
}

/** Shadows bind their color only when opaque: a bound effect color replaces the alpha too. */
export function dropShadow(context: Context, shadow: Shadow): Effect {
  const { r, g, b, a } = shadow.paint.color;
  const effect: DropShadowEffect = {
    type: "DROP_SHADOW",
    color: { r, g, b, a },
    offset: { x: shadow.x, y: shadow.y },
    radius: shadow.blur,
    spread: shadow.spread,
    visible: true,
    blendMode: "NORMAL",
    showShadowBehindNode: false,
  };
  const variable =
    shadow.paint.token && a === 1 ? context.variables.get(shadow.paint.token) : undefined;
  return variable
    ? context.figma.variables.setBoundVariableForEffect(effect, "color", variable)
    : effect;
}

export async function fontStyles(figma: PluginAPI): Promise<Map<string, Set<string>>> {
  const fonts = new Map<string, Set<string>>();
  for (const { fontName } of await figma.listAvailableFontsAsync()) {
    const styles = fonts.get(fontName.family) ?? new Set();
    styles.add(fontName.style);
    fonts.set(fontName.family, styles);
  }
  return fonts;
}

export async function loadFont(
  context: Context,
  family: string,
  weight: number,
): Promise<FontName> {
  const styles = context.fonts.get(family);
  if (!styles) {
    throw new Error(`Figma has no font ${family}. Install it, or enable it in your organization.`);
  }
  const style = (WEIGHTS[weight] ?? []).find((candidate) => styles.has(candidate));
  const fallback = styles.has("Regular") ? "Regular" : [...styles][0]!;
  const fontName = { family, style: style ?? fallback };
  if (!style) context.warnings.push(`${family} has no weight ${weight}; used ${fallback}.`);
  await context.figma.loadFontAsync(fontName);
  return fontName;
}

/** The page Shelf made for `name`; a designer's page with the same name is left alone. */
export async function findPage(figma: PluginAPI, name: string): Promise<PageNode> {
  const page = figma.root.children.find(
    (candidate) => candidate.getSharedPluginData(NAMESPACE, "page") === name,
  );
  if (page) {
    await page.loadAsync();
    return page;
  }
  const created = figma.createPage();
  created.name = name;
  created.setSharedPluginData(NAMESPACE, "page", name);
  return created;
}

/** The variant a component in a set stands for, e.g. `Variant=Default, Size=Small`. */
export function variantKey(component: SceneNode): string {
  return component.getSharedPluginData(NAMESPACE, "variant") || component.name;
}

export function pageOf(node: BaseNode): PageNode {
  let current: BaseNode | null = node;
  while (current && current.type !== "PAGE") current = current.parent;
  if (!current) throw new Error(`${node.name} isn't on a page.`);
  return current;
}
