/**
 * A small in-memory stand-in for the parts of the Figma Plugin API that `apply` uses. It
 * records what was set and keeps parent/child links; it doesn't compute layout.
 */

let nextId = 1;
const id = () => `${nextId++}:1`;

type Data = Record<string, string>;

class FakeNode {
  id = id();
  name = "";
  parent: FakeNode | null = null;
  children: FakeNode[] = [];
  x = 0;
  y = 0;
  width = 100;
  height = 100;
  visible = true;
  boundVariables: Record<string, unknown> = {};
  componentPropertyReferences: Record<string, string> = {};
  componentPropertyDefinitions: Record<string, { type: string; defaultValue: unknown }> = {};
  fills: unknown[] = [];
  strokes: unknown[] = [];
  textStyleId = "";
  key = `key-${this.id}`;
  mainComponent: FakeNode | null = null;
  private data: Data = {};
  [field: string]: unknown;

  constructor(public type: string) {}

  getSharedPluginData(_namespace: string, key: string): string {
    return this.data[key] ?? "";
  }
  setSharedPluginData(_namespace: string, key: string, value: string): void {
    this.data[key] = value;
  }
  setRelaunchData(): void {}
  appendChild(child: FakeNode): void {
    this.insertChild(this.children.length, child);
  }
  insertChild(index: number, child: FakeNode): void {
    child.detach();
    child.parent = this;
    this.children.splice(index, 0, child);
  }
  detach(): void {
    if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  remove(): void {
    this.detach();
    this.removed = true;
  }
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
  resizeWithoutConstraints(width: number, height: number): void {
    this.resize(width, height);
  }
  rescale(scale: number): void {
    this.resize(this.width * scale, this.height * scale);
  }
  setBoundVariable(field: string, variable: FakeVariable | null): void {
    if (variable) this.boundVariables[field] = { type: "VARIABLE_ALIAS", id: variable.id };
    else delete this.boundVariables[field];
  }
  async loadAsync(): Promise<void> {}
  findAllWithCriteria(criteria: {
    types: string[];
    sharedPluginData?: { keys: string[] };
  }): FakeNode[] {
    const found: FakeNode[] = [];
    const visit = (node: FakeNode) => {
      for (const child of node.children) {
        const hasData = criteria.sharedPluginData?.keys.every((key) => child.data[key]) ?? true;
        if (criteria.types.includes(child.type) && hasData) found.push(child);
        visit(child);
      }
    };
    visit(this);
    return found;
  }
  // Components
  addComponentProperty(name: string, type: string, defaultValue: unknown): string {
    const key = `${name}#${id()}`;
    this.componentPropertyDefinitions[key] = { type, defaultValue };
    return key;
  }
  editComponentProperty(key: string, value: { defaultValue: unknown }): string {
    this.componentPropertyDefinitions[key]!.defaultValue = value.defaultValue;
    return key;
  }
  deleteComponentProperty(key: string): void {
    delete this.componentPropertyDefinitions[key];
  }
  createInstance(): FakeNode {
    const instance = new FakeNode("INSTANCE");
    instance.mainComponent = this;
    instance.resize(this.width, this.height);
    for (const child of this.children) {
      const copy = new FakeNode(child.type);
      copy.strokes = [...child.strokes];
      instance.appendChild(copy);
    }
    return instance;
  }
  async getMainComponentAsync(): Promise<FakeNode | null> {
    return this.mainComponent;
  }
  swapComponent(component: FakeNode): void {
    this.mainComponent = component;
  }
  overrides: Record<string, unknown> = {};
  get componentProperties(): Record<string, unknown> {
    const main = this.mainComponent;
    const owner = main?.parent?.type === "COMPONENT_SET" ? main.parent : main;
    return owner?.componentPropertyDefinitions ?? {};
  }
  resetOverrides(): void {
    this.overrides = {};
  }
  setProperties(properties: Record<string, unknown>): void {
    Object.assign(this.overrides, properties);
  }
  async setTextStyleIdAsync(styleId: string): Promise<void> {
    this.textStyleId = styleId;
  }
  // Grids
  gridColumnSizes: Array<{ type: string; value?: number }> = [];
  gridRowSizes: Array<{ type: string; value?: number }> = [];
  set gridColumnCount(count: number) {
    this.gridColumnSizes = Array.from({ length: count }, () => ({ type: "FLEX" }));
  }
  set gridRowCount(count: number) {
    this.gridRowSizes = Array.from({ length: count }, () => ({ type: "FLEX" }));
  }
  setGridChildPosition(row: number, column: number): void {
    this.gridCell = [row, column];
  }
  // Text ranges, recorded as [start, end, field, value].
  ranges: Array<[number, number, string, unknown]> = [];
  setRangeFills(start: number, end: number, value: unknown): void {
    this.ranges.push([start, end, "fills", value]);
  }
  setRangeFontName(start: number, end: number, value: unknown): void {
    this.ranges.push([start, end, "fontName", value]);
  }
  setRangeFontSize(start: number, end: number, value: unknown): void {
    this.ranges.push([start, end, "fontSize", value]);
  }
  setRangeTextDecoration(start: number, end: number, value: unknown): void {
    this.ranges.push([start, end, "textDecoration", value]);
  }
}

class FakeVariable {
  id = `VariableID:${id()}`;
  codeSyntax: Record<string, string> = {};
  scopes: string[] = [];
  description = "";
  valuesByMode: Record<string, unknown> = {};
  removed = false;
  constructor(
    public name: string,
    public variableCollectionId: string,
    public resolvedType: string,
    private all: FakeVariable[],
  ) {}
  setVariableCodeSyntax(platform: string, value: string): void {
    this.codeSyntax[platform] = value;
  }
  setValueForMode(modeId: string, value: unknown): void {
    this.valuesByMode[modeId] = value;
  }
  remove(): void {
    this.removed = true;
    this.all.splice(this.all.indexOf(this), 1);
  }
}

class FakeCollection {
  id = `VariableCollectionId:${id()}`;
  modes: Array<{ modeId: string; name: string }> = [{ modeId: id(), name: "Mode 1" }];
  private data: Data = {};
  constructor(public name: string) {}
  getSharedPluginData(_namespace: string, key: string): string {
    return this.data[key] ?? "";
  }
  setSharedPluginData(_namespace: string, key: string, value: string): void {
    this.data[key] = value;
  }
  removeMode(modeId: string): void {
    this.modes = this.modes.filter((mode) => mode.modeId !== modeId);
  }
  renameMode(modeId: string, name: string): void {
    this.modes.find((mode) => mode.modeId === modeId)!.name = name;
  }
  addMode(name: string): string {
    const modeId = id();
    this.modes.push({ modeId, name });
    return modeId;
  }
}

export function createFakeFigma() {
  const root = new FakeNode("DOCUMENT");
  root.appendChild(Object.assign(new FakeNode("PAGE"), { name: "Page 1" }));
  const collections: FakeCollection[] = [];
  const variables: FakeVariable[] = [];
  const textStyles: FakeNode[] = [];
  const effectStyles: FakeNode[] = [];
  const figma = {
    root,
    mixed: Symbol("mixed"),
    createPage: () => {
      const page = new FakeNode("PAGE");
      root.appendChild(page);
      return page;
    },
    createFrame: () => new FakeNode("FRAME"),
    createComponent: () => new FakeNode("COMPONENT"),
    createText: () => {
      const text = new FakeNode("TEXT");
      // Like Figma, setting a property the text style controls detaches the style.
      for (const field of [
        "fontName",
        "fontSize",
        "lineHeight",
        "letterSpacing",
        "textDecoration",
      ]) {
        let value: unknown;
        Object.defineProperty(text, field, {
          get: () => value,
          set: (next: unknown) => {
            value = next;
            text.textStyleId = "";
          },
        });
      }
      return text;
    },
    createNodeFromSvg: (svg: string) => {
      const frame = new FakeNode("FRAME");
      frame.resize(24, 24);
      for (const _ of svg.matchAll(/<path/g)) {
        frame.appendChild(Object.assign(new FakeNode("VECTOR"), { strokes: [{ type: "SOLID" }] }));
      }
      return frame;
    },
    combineAsVariants: (nodes: FakeNode[], parent: FakeNode) => {
      const set = new FakeNode("COMPONENT_SET");
      parent.appendChild(set);
      for (const node of nodes) set.appendChild(node);
      return set;
    },
    createTextStyle: () => {
      const style = new FakeNode("TEXT_STYLE");
      textStyles.push(style);
      return style;
    },
    createEffectStyle: () => {
      const style = new FakeNode("EFFECT_STYLE");
      effectStyles.push(style);
      return style;
    },
    getLocalTextStylesAsync: async () => [...textStyles],
    getLocalEffectStylesAsync: async () => [...effectStyles],
    listAvailableFontsAsync: async () =>
      ["Regular", "Medium", "SemiBold"].map((style) => ({ fontName: { family: "Geist", style } })),
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [...collections],
      getLocalVariablesAsync: async () => [...variables],
      createVariableCollection: (name: string) => {
        const collection = new FakeCollection(name);
        collections.push(collection);
        return collection;
      },
      createVariable: (name: string, collection: FakeCollection, type: string) => {
        const variable = new FakeVariable(name, collection.id, type, variables);
        variables.push(variable);
        return variable;
      },
      setBoundVariableForPaint: (paint: object, _field: string, variable: FakeVariable) => ({
        ...paint,
        boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id } },
      }),
      setBoundVariableForEffect: (effect: object, _field: string, variable: FakeVariable) => ({
        ...effect,
        boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id } },
      }),
    },
  };
  // The fake implements only what `apply` calls, so it can't satisfy the full PluginAPI type.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const api = figma as unknown as PluginAPI;
  return { figma, api, collections, variables, textStyles, effectStyles };
}

export type { FakeNode, FakeVariable };
