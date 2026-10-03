import { describe, expect, test } from "bun:test";
import { type FrameNode, IR_VERSION, type Library, type Variable } from "../ir";
import { nestInstances } from "../capture/instances";
import { apply, readRevisions } from "./apply";
import { type FakeNode, createFakeFigma } from "./fake-figma";

const white = { r: 1, g: 1, b: 1, a: 1 };
const black = { r: 0.09, g: 0.09, b: 0.09, a: 1 };

function button(fill: string, state: string): FrameNode {
  return {
    type: "frame",
    name: "button",
    width: { value: 86 },
    height: { value: 32, token: "sizes.controlDefault" },
    sizing: { horizontal: "hug", vertical: "fixed" },
    fill: { color: black, token: fill },
    stroke: { weight: 1 },
    radius: { value: 6, token: "radius.md" },
    ...(state === "Disabled" && { opacity: 0.5 }),
    layout: {
      direction: "row",
      gap: { value: 6 },
      padding: {
        top: { value: 0 },
        right: { value: 10, token: "spacing.2.5" },
        bottom: { value: 0 },
        left: { value: 10, token: "spacing.2.5" },
      },
      align: "center",
      justify: "center",
      wrap: false,
    },
    children: [
      {
        type: "instance",
        name: "Icon",
        component: "Icon/Plus",
        width: 14,
        height: 14,
        color: { color: white, token: "colors.primaryForeground" },
        property: "Icon",
      },
      {
        type: "text",
        name: "Label",
        characters: "Button",
        fill: { color: white, token: "colors.primaryForeground" },
        fontFamily: "Geist",
        fontWeight: { value: 500 },
        fontSize: { value: 14 },
        lineHeight: { value: 20 },
        letterSpacing: 0,
        underline: false,
        sizing: { horizontal: "hug", vertical: "hug" },
        width: 44,
        property: "Label",
      },
    ],
  };
}

/** A Button as another component renders it, with its own label and icon. */
function placedButton(characters: string, icon: string): FrameNode {
  const node = button("colors.primary", "Default");
  node.children = node.children.map((child) =>
    child.type === "text"
      ? { ...child, characters, property: undefined }
      : { ...child, component: icon, property: undefined },
  );
  return node;
}

/** An instance's override of a component property, by the property's name without its id. */
function overridden(node: FakeNode | undefined, property: string): unknown {
  return Object.entries(node!.overrides).find(([key]) => key.split("#")[0] === property)?.[1];
}

function color(token: string, value = black): Variable {
  return {
    name: token.split(".")[1]!,
    token,
    type: "COLOR",
    scopes: ["ALL_FILLS"],
    values: { Light: value, Dark: value },
  };
}

function number(token: string, value: number): Variable {
  return {
    name: token.split(".").slice(1).join("."),
    token,
    type: "FLOAT",
    scopes: ["GAP"],
    values: { Value: value },
  };
}

function library(states = ["Default", "Disabled"], fill = "colors.primary"): Library {
  return {
    version: IR_VERSION,
    foundations: {
      collections: [
        {
          name: "Color",
          modes: ["Light", "Dark"],
          variables: [
            color("colors.primary"),
            color("colors.secondary"),
            color("colors.primaryForeground", white),
          ],
        },
        { name: "Spacing", modes: ["Value"], variables: [number("spacing.2.5", 10)] },
        { name: "Radius", modes: ["Value"], variables: [number("radius.md", 6)] },
        { name: "Size", modes: ["Value"], variables: [number("sizes.controlDefault", 32)] },
      ],
      textStyles: [],
      effectStyles: [],
    },
    icons: [
      {
        name: "Icon/Plus",
        svg: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
      },
    ],
    components: [
      {
        name: "Button",
        source: "registry/components/button/button.stories.tsx",
        description: "An action trigger.",
        text: { Label: "Button" },
        instances: { Icon: "Icon/Plus" },
        variants: states.map((state) => ({
          props: { Variant: "Default", State: state },
          node: button(fill, state),
        })),
        item: {
          name: "button",
          revision: "abc",
          docs: "https://ui.example.com/#/items/button",
          install: "bunx @shelfui/cli add button",
        },
      },
    ],
    revisions: { button: "abc", foundations: "def" },
  };
}

function componentSet(root: FakeNode): FakeNode {
  const set = root.findAllWithCriteria({ types: ["COMPONENT_SET"] })[0];
  if (!set) throw new Error("no component set");
  return set;
}

/** Every node id under the root, in order: stable across applies means nothing was recreated. */
function ids(root: FakeNode): string[] {
  return root
    .findAllWithCriteria({
      types: ["PAGE", "COMPONENT_SET", "COMPONENT", "FRAME", "TEXT", "INSTANCE"],
    })
    .map((node) => `${node.type}:${node.name}:${node.id}`);
}

describe("apply", () => {
  test("builds variables, icons, and a component set with properties", async () => {
    const { figma, api, variables } = createFakeFigma();
    const result = await apply(api, library());

    expect(result.status).toBe("applied");
    expect(figma.root.children.map((page) => page.name)).toEqual(["Page 1", "Icons", "Button"]);
    expect(variables.map((variable) => variable.codeSyntax["WEB"])).toContain("colors.primary");

    const set = componentSet(figma.root);
    expect(set.children.map((variant) => variant.name)).toEqual([
      "Variant=Default, State=Default",
      "Variant=Default, State=Disabled",
    ]);
    expect(set["description"]).toBe("An action trigger.\n\nbunx @shelfui/cli add button");
    expect(set["documentationLinks"]).toEqual([{ uri: "https://ui.example.com/#/items/button" }]);
    const properties = Object.entries(set.componentPropertyDefinitions).map(
      ([key, value]) => `${key.split("#")[0]}:${value.type}:${String(value.defaultValue)}`,
    );
    expect(properties).toEqual([
      "Label:TEXT:Button",
      `Icon:INSTANCE_SWAP:${figma.root.children[1]!.children[0]!.id}`,
      "Show Icon:BOOLEAN:false",
    ]);

    const variant = set.children[0]!;
    const primary = variables.find((variable) => variable.codeSyntax["WEB"] === "colors.primary")!;
    expect(variant.fills).toEqual([
      {
        type: "SOLID",
        color: { r: 0.09, g: 0.09, b: 0.09 },
        opacity: 1,
        boundVariables: { color: { type: "VARIABLE_ALIAS", id: primary.id } },
      },
    ]);
    expect(Object.keys(variant.boundVariables).toSorted()).toEqual([
      "bottomLeftRadius",
      "bottomRightRadius",
      "height",
      "paddingLeft",
      "paddingRight",
      "topLeftRadius",
      "topRightRadius",
    ]);
    const [icon, label] = variant.children;
    expect(icon?.componentPropertyReferences).toEqual({
      mainComponent: expect.stringMatching(/^Icon#/),
      visible: expect.stringMatching(/^Show Icon#/),
    });
    expect(icon?.visible).toBe(false);
    expect(label?.componentPropertyReferences).toEqual({
      characters: expect.stringMatching(/^Label#/),
    });
    expect(set.children[1]!["opacity"]).toBe(0.5);
    expect(readRevisions(api)).toEqual({
      button: "abc",
      foundations: "def",
    });
  });

  test("applying twice changes no node ids and adds nothing", async () => {
    const { figma, api, variables } = createFakeFigma();
    await apply(api, library());
    const before = ids(figma.root);
    const variableIds = variables.map((variable) => variable.id);

    await apply(api, library());

    expect(ids(figma.root)).toEqual(before);
    expect(variables.map((variable) => variable.id)).toEqual(variableIds);
  });

  test("updates variants in place, so instances stay linked", async () => {
    const { figma, api, variables } = createFakeFigma();
    await apply(api, library());
    const before = ids(figma.root);

    await apply(api, library(["Default", "Disabled"], "colors.secondary"));

    expect(ids(figma.root)).toEqual(before);
    const secondary = variables.find(
      (variable) => variable.codeSyntax["WEB"] === "colors.secondary",
    )!;
    expect(componentSet(figma.root).children[0]!.fills).toMatchObject([
      { boundVariables: { color: { id: secondary.id } } },
    ]);
  });

  test("adding a variant keeps the existing ones", async () => {
    const { figma, api } = createFakeFigma();
    await apply(api, library());
    const [first] = componentSet(figma.root).children;

    await apply(api, library(["Default", "Hover", "Disabled"]));

    const set = componentSet(figma.root);
    expect(set.children.map((variant) => variant.name)).toEqual([
      "Variant=Default, State=Default",
      "Variant=Default, State=Disabled",
      "Variant=Default, State=Hover",
    ]);
    expect(set.children[0]).toBe(first);
  });

  test("asks before removing variants or variables", async () => {
    const { figma, api, variables } = createFakeFigma();
    await apply(api, library());
    const smaller = library(["Default"]);
    smaller.foundations.collections[0]!.variables.pop();

    expect(await apply(api, smaller)).toEqual({
      status: "confirm",
      breaking: [
        "Button: removes variant Variant=Default, State=Disabled",
        "removes variable colors.primaryForeground",
      ],
    });
    expect(componentSet(figma.root).children).toHaveLength(2);

    await apply(api, smaller, { allowBreaking: true });
    expect(componentSet(figma.root).children).toHaveLength(1);
    expect(variables.map((variable) => variable.codeSyntax["WEB"])).not.toContain(
      "colors.primaryForeground",
    );
  });

  test("keeps text styles attached and draws focus rings on unfilled frames", async () => {
    const { figma, api } = createFakeFigma();
    const styled = library(["Default", "Hover", "Focus"]);
    styled.foundations.collections.push({
      name: "Typography",
      modes: ["Value"],
      variables: [
        {
          name: "fontFamily",
          token: "typography.fontFamily",
          type: "STRING",
          scopes: [],
          values: { Value: "Geist" },
        },
        {
          name: "fontSizeSm",
          token: "typography.fontSizeSm",
          type: "FLOAT",
          scopes: [],
          values: { Value: 14 },
        },
        {
          name: "lineHeightSm",
          token: "typography.lineHeightSm",
          type: "FLOAT",
          scopes: [],
          values: { Value: 20 },
        },
        {
          name: "fontWeightMedium",
          token: "typography.fontWeightMedium",
          type: "FLOAT",
          scopes: [],
          values: { Value: 500 },
        },
      ],
    });
    styled.foundations.textStyles.push({
      name: "Sm/Medium",
      fontFamily: "typography.fontFamily",
      fontSize: "typography.fontSizeSm",
      lineHeight: "typography.lineHeightSm",
      fontWeight: "typography.fontWeightMedium",
    });
    const [plain, underlined, focused] = styled.components[0]!.variants.map(
      (variant) => variant.node,
    );
    for (const node of [plain, underlined, focused]) {
      const label = node!.children[1];
      if (label?.type === "text") label.textStyle = "Sm/Medium";
    }
    const link = underlined!.children[1];
    if (link?.type === "text") link.underline = true;
    delete focused!.fill;
    focused!.shadows = [{ x: 0, y: 0, blur: 0, spread: 3, paint: { color: { ...black, a: 0.5 } } }];

    await apply(api, styled);

    const [first, second, third] = componentSet(figma.root).children;
    const style = (await figma.getLocalTextStylesAsync())[0]!;
    expect(first!.children[1]!.textStyleId).toBe(style.id);
    expect(second!.children[1]!.textStyleId).toBe("");
    expect(second!.children[1]!["textDecoration"]).toBe("UNDERLINE");
    expect(third!["clipsContent"]).toBe(true);
    expect(third!.fills).toEqual([{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.0001 }]);
  });

  test("lays out grids, positioned children, vectors and styled text in a plain component", async () => {
    const { figma, api } = createFakeFigma();
    const card = button("colors.primary", "Default");
    const [icon, label] = card.children;
    card.layout = {
      ...card.layout!,
      direction: "grid",
      grid: {
        columns: [
          { type: "fixed", value: 14 },
          { type: "flex", value: 1 },
        ],
        rows: [{ type: "hug", value: 0 }],
        rowGap: { value: 4 },
      },
    };
    card.stroke = { weight: 1, sides: { top: 0, right: 0, bottom: 1, left: 0 }, dash: [3, 3] };
    card.children = [
      { ...icon!, cell: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 } },
      label!.type === "text"
        ? {
            ...label!,
            cell: { row: 0, column: 1, rowSpan: 1, columnSpan: 1 },
            ranges: [{ start: 0, end: 3, fontWeight: { value: 600 } }],
          }
        : label!,
      {
        type: "vector",
        name: "Chart",
        svg: "<svg><path d='M0 0'/></svg>",
        width: 24,
        height: 24,
        position: { x: 4, y: 2 },
      },
    ];
    const plain = library();
    plain.components[0]!.variants = [{ props: {}, node: card }];

    await apply(api, plain);

    const component = figma.root
      .findAllWithCriteria({ types: ["COMPONENT"] })
      .find((node) => node.name === "Button")!;
    expect(figma.root.findAllWithCriteria({ types: ["COMPONENT_SET"] })).toEqual([]);
    expect(component["layoutMode"]).toBe("GRID");
    expect(component.gridColumnSizes).toEqual([
      { type: "FIXED", value: 14 },
      { type: "FLEX", value: 1 },
    ]);
    expect(component["strokeBottomWeight"]).toBe(1);
    expect(component["strokeTopWeight"]).toBe(0);
    expect(component["dashPattern"]).toEqual([3, 3]);
    const [instance, text, chart] = component.children;
    expect(instance!["gridCell"]).toEqual([0, 0]);
    expect(text!["gridCell"]).toEqual([0, 1]);
    expect(text!.ranges).toEqual([[0, 3, "fontName", { family: "Geist", style: "SemiBold" }]]);
    expect(chart).toMatchObject({ name: "Chart", layoutPositioning: "ABSOLUTE", x: 4, y: 2 });
    expect(component.componentPropertyDefinitions).not.toEqual({});

    const before = ids(figma.root);
    await apply(api, plain);
    expect(ids(figma.root)).toEqual(before);
  });

  test("a component inside another becomes an instance of its variant, with overrides", async () => {
    const { figma, api } = createFakeFigma();
    const nested = library();
    const save = button("colors.primary", "Default");
    save.children = save.children
      .slice(1)
      .map((child) =>
        child.type === "text" ? { ...child, characters: "Save", property: undefined } : child,
      );
    const form: FrameNode = {
      ...button("colors.secondary", "Default"),
      name: "form",
      children: [save],
    };
    nested.components.unshift({
      name: "Form",
      source: "registry/components/form/form.stories.tsx",
      text: {},
      instances: {},
      variants: [{ props: {}, node: form }],
    });
    nestInstances(nested.components);

    expect(form.children[0]).toMatchObject({
      type: "instance",
      component: "Button",
      variant: { Variant: "Default", State: "Default" },
      overrides: { characters: ["Save"] },
    });

    await apply(api, nested);

    const component = figma.root
      .findAllWithCriteria({ types: ["COMPONENT"] })
      .find((node) => node.name === "Form")!;
    const instance = component.children[0]!;
    const variant = componentSet(figma.root).children[0]!;
    expect(instance.type).toBe("INSTANCE");
    expect(instance.mainComponent).toBe(variant);
    expect(instance.findAllWithCriteria({ types: ["TEXT"] })[0]!["characters"]).toBe("Save");
    // The icon is hidden by default, so leaving it out needs no override.
    expect(instance.overrides).toEqual({});
  });

  test("a nested component's icon is shown, or swapped for another icon", async () => {
    const { figma, api } = createFakeFigma();
    const nested = library();
    nested.icons.push({
      name: "Icon/Check",
      svg: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
    });
    const add = placedButton("Add", "Icon/Plus");
    const done = placedButton("Done", "Icon/Check");
    const form: FrameNode = {
      ...button("colors.secondary", "Default"),
      name: "form",
      children: [add, done],
    };
    nested.components.unshift({
      name: "Form",
      source: "registry/components/form/form.stories.tsx",
      text: {},
      instances: {},
      variants: [{ props: {}, node: form }],
    });
    nestInstances(nested.components);

    expect(form.children[0]).toMatchObject({
      type: "instance",
      overrides: { show: { "Show Icon": true }, characters: ["Add"] },
    });
    expect(form.children[0]).not.toHaveProperty("overrides.swap");
    expect(form.children[1]).toMatchObject({
      type: "instance",
      overrides: {
        show: { "Show Icon": true },
        swap: { Icon: "Icon/Check" },
        characters: ["Done"],
      },
    });

    await apply(api, nested);

    const components = figma.root.findAllWithCriteria({ types: ["COMPONENT"] });
    const check = components.find((node) => node.name.endsWith("Check"))!;
    const [shown, swapped] = components.find((node) => node.name === "Form")!.children;
    expect(overridden(shown, "Show Icon")).toBe(true);
    expect(overridden(shown, "Icon")).toBeUndefined();
    expect(overridden(swapped, "Show Icon")).toBe(true);
    expect(overridden(swapped, "Icon")).toBe(check.id);
  });

  test("a renamed or inserted child keeps its siblings' ids", async () => {
    const { figma, api } = createFakeFigma();
    await apply(api, library());
    const label = () => componentSet(figma.root).children[0]!.children.at(-1)!;
    const before = label().id;

    const renamed = library();
    for (const variant of renamed.components[0]!.variants) {
      const [icon, text] = variant.node.children;
      if (icon?.type !== "instance" || text?.type !== "text") throw new Error("unexpected button");
      variant.node.children = [
        { ...text, name: "Badge", characters: "New", property: undefined },
        { ...icon, name: "Glyph" },
        text,
      ];
    }
    await apply(api, renamed);

    const children = componentSet(figma.root).children[0]!.children;
    expect(children.map((child) => child.name)).toEqual(["Badge", "Glyph", "Label"]);
    expect(label().id).toBe(before);
  });

  test("asks before turning a set of variants into a single component", async () => {
    const { figma, api } = createFakeFigma();
    await apply(api, library());
    const single = library();
    single.components[0]!.variants = [{ props: {}, node: button("colors.primary", "Default") }];

    expect(await apply(api, single)).toEqual({
      status: "confirm",
      breaking: ["Button: replaces the set of variants with a single component"],
    });
    expect(figma.root.findAllWithCriteria({ types: ["COMPONENT_SET"] })).toHaveLength(1);

    await apply(api, single, { allowBreaking: true });
    expect(figma.root.findAllWithCriteria({ types: ["COMPONENT_SET"] })).toHaveLength(0);
  });

  test("asks before removing components and icons that are gone from code", async () => {
    const { figma, api } = createFakeFigma();
    await apply(api, library());
    const empty = { ...library(), icons: [], components: [], revisions: { foundations: "def" } };

    expect(await apply(api, empty)).toEqual({
      status: "confirm",
      breaking: ["removes icon Icon/Plus", "removes component Button"],
    });

    await apply(api, empty, { allowBreaking: true });
    expect(figma.root.findAllWithCriteria({ types: ["COMPONENT", "COMPONENT_SET"] })).toEqual([]);
    expect(readRevisions(api)).toEqual({ foundations: "def" });
  });

  test("leaves a designer's collection, style and page alone when the names match", async () => {
    const { figma, api, collections, effectStyles } = createFakeFigma();
    const theirs = figma.variables.createVariableCollection("Color");
    const shadow = figma.createEffectStyle();
    shadow.name = "Elevation/Sm";
    const page = figma.createPage();
    page.name = "Button";
    const withShadow = library();
    withShadow.foundations.effectStyles.push({
      name: "Elevation/Sm",
      token: "elevation.sm",
      shadows: [],
    });

    await apply(api, withShadow);

    expect(collections.filter((collection) => collection.name === "Color")).toHaveLength(2);
    expect(theirs.modes.map((mode) => mode.name)).toEqual(["Mode 1"]);
    expect(effectStyles).toHaveLength(2);
    expect(shadow.getSharedPluginData("shelf", "id")).toBe("");
    expect(page.children).toEqual([]);
  });

  test("matches variable modes by name and asks before removing one", async () => {
    const { api, collections } = createFakeFigma();
    await apply(api, library());
    const palette = collections.find((collection) => collection.name === "Color")!;
    const [, dark] = palette.modes;
    const reordered = library();
    reordered.foundations.collections[0]!.modes = ["Dark"];

    expect(await apply(api, reordered)).toEqual({
      status: "confirm",
      breaking: ["removes Color mode Light"],
    });
    await apply(api, reordered, { allowBreaking: true });
    expect(palette.modes).toEqual([dark!]);
  });

  test("rejects a library from a newer capture", async () => {
    const { api } = createFakeFigma();
    const newer = Object.assign(library(), { version: IR_VERSION + 1 });
    expect(apply(api, newer)).rejects.toThrow("Update the Shelf plugin");
  });
});
