import * as stylex from "@stylexjs/stylex";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import * as icons from "../../../registry/components/icons/icons";
import { darkTheme } from "../../../registry/foundations/themes";
import * as tokens from "../../../registry/foundations/tokens.stylex";
import { type FigmaEntry, FigmaLibrary, type MetaInput } from "./capture/library";
import { indexTokens } from "./capture/tokens";
import { CaptureError, walk } from "./capture/walk";
import { type FrameNode, type Node, type Paint, variantName } from "./ir";

const modules = import.meta.glob<Record<string, unknown>>("../../../registry/**/*.stories.tsx", {
  eager: true,
});

/** One entry per story file whose meta has `parameters.figma`. */
const entries: FigmaEntry[] = Object.entries(modules).flatMap(([file, exports]) => {
  // Every CSF factory story carries its file's meta, so any export will do.
  const meta = Object.values(exports).map(metaOf).find(Boolean);
  if (!meta) return [];
  const stories = Object.fromEntries(
    Object.entries(exports).flatMap(([name, story]) => {
      const input = isRecord(story) && story["input"];
      return isRecord(input) ? [[name, input]] : [];
    }),
  );
  return [{ meta, stories, source: file.replace(/^(\.\.\/)+/, "") }];
});

/** A story's meta input, when the story file puts its component in the Figma library. */
function metaOf(value: unknown): MetaInput | undefined {
  if (!isRecord(value) || !isRecord(value["meta"])) return undefined;
  const input = value["meta"]["input"];
  return isFigmaMeta(input) ? input : undefined;
}

function isFigmaMeta(input: unknown): input is MetaInput {
  return isRecord(input) && isRecord(input["parameters"]) && isRecord(input["parameters"]["figma"]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const darkClassName = stylex.props(darkTheme).className ?? "";

const meta = preview.meta({
  title: "Figma/Library",
});

/**
 * What the Shelf Figma plugin syncs: every component whose stories meta has `parameters.figma`,
 * one variant per combination of its argTypes, and the icons. Capture reads this page.
 */
export const Library = meta.story({
  render: () => (
    <FigmaLibrary entries={entries} icons={icons} tokens={tokens} darkClassName={darkClassName} />
  ),
  play: async ({ step }) => {
    const library = await window.shelfFigma!.capture();

    await step("foundations have light and dark colors, and sorted scales", async () => {
      const color = library.foundations.collections.find((c) => c.name === "Color")!;
      await expect(color.variables.map((v) => v.token)).toContain("colors.primary");
      for (const variable of color.variables) {
        await expect(Object.keys(variable.values)).toEqual(["Light", "Dark"]);
      }
      const spacing = library.foundations.collections.find((c) => c.name === "Spacing")!;
      const values = spacing.variables.map((v) => Number(v.values["Value"]));
      await expect(values).toEqual(values.toSorted((a, b) => a - b));
      await expect(library.foundations.textStyles.map((s) => s.name)).toContain("Sm/Medium");
    });

    await step("every icon is captured once", async () => {
      const exported = Object.keys(icons).filter((name) => name.endsWith("Icon"));
      await expect(library.icons).toHaveLength(exported.length);
      await expect(new Set(library.icons.map((icon) => icon.svg)).size).toBe(exported.length);
    });

    const button = library.components.find((set) => set.name === "Button")!;
    const variant = (props: string) =>
      button.variants.find((v) => variantName(v.props) === props)!.node;

    await step("Button has Variant × Size × State, a Label and an Icon", async () => {
      await expect(button.variants).toHaveLength(6 * 4 * 4);
      await expect(button.text).toEqual({ Label: "Button" });
      await expect(button.instances).toEqual({ Icon: "Icon/Plus" });
      await expect(button.source).toBe("registry/components/button/button.stories.tsx");
    });

    await step("Button binds tokens", async () => {
      const node = variant("Variant=Default, Size=Default, State=Default");
      await expect(node.fill?.token).toBe("colors.primary");
      await expect(node.height).toEqual({ value: 32, token: "sizes.controlDefault" });
      await expect(node.sizing).toEqual({ horizontal: "hug", vertical: "fixed" });
      await expect(node.radius?.token).toBe("radius.md");
      await expect(node.layout?.padding.left.token).toBe("spacing.2.5");
      await expect(node.layout?.gap.token).toBe("spacing.1.5");
      const [icon, label] = node.children;
      await expect(icon).toMatchObject({
        type: "instance",
        component: "Icon/Plus",
        property: "Icon",
      });
      await expect(label).toMatchObject({
        type: "text",
        property: "Label",
        textStyle: "Sm/Medium",
      });
      await expect(label?.type === "text" && label.fill.token).toBe("colors.primaryForeground");
    });

    await step("states render their pseudo-class styles", async () => {
      const hover = variant("Variant=Default, Size=Default, State=Hover");
      await expect(hover.fill).toMatchObject({ token: "colors.primary", color: { a: 0.9 } });
      const focus = variant("Variant=Outline, Size=Default, State=Focus");
      await expect(focus.stroke?.paint?.token).toBe("colors.ring");
      await expect(focus.shadows?.[0]).toMatchObject({
        spread: 3,
        paint: { token: "colors.ring" },
      });
      await expect(variant("Variant=Default, Size=Default, State=Disabled").opacity).toBe(0.5);
    });

    await step("every color is a token, except Link's mix of two tokens", async () => {
      const unbound = button.variants.flatMap(({ props, node }) =>
        paints(node)
          .filter((paint) => !paint.token)
          .map(() => variantName(props)),
      );
      await expect(unbound.filter((name) => !name.startsWith("Variant=Link"))).toEqual([]);
    });

    const nested = (name: string) => {
      const set = library.components.find((candidate) => candidate.name === name)!;
      return new Set(instances(set.variants[0]!.node).map((instance) => instance.component));
    };
    await step("Shelf components inside others are instances of them", async () => {
      await expect(nested("Dialog")).toContain("Button");
      await expect(nested("Settings Section")).toContain("Switch");
      await expect(nested("Toolbar")).toEqual(new Set(["Toggle", "Button"]));
    });
  },
});

function instances(node: Node): Array<Extract<Node, { type: "instance" }>> {
  if (node.type === "instance") return [node];
  return node.type === "frame" ? node.children.flatMap(instances) : [];
}

/** Anything outside the supported CSS subset fails with the node path and property. */
export const UnsupportedCss = meta.story({
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div data-testid="root" style={{ display: "flex" }}>
      <span data-slot="child" style={{ display: "flex", transform: "rotate(2deg)" }}>
        <b>Rotated</b>
      </span>
    </div>
  ),
  play: async ({ canvas }) => {
    const context = {
      index: indexTokens(tokens, darkClassName),
      icons: new Map(),
      textProperties: new Map(),
      instanceProperties: new Map(),
    };
    await expect(() => walk(canvas.getByTestId("root"), "Example", context)).toThrow(
      new CaptureError(
        "Example/0:child: transform: matrix(0.999391, 0.0348995, -0.0348995, 0.999391, 0, 0) isn't supported in Figma.",
      ),
    );
  },
});

function paints(node: Node): Paint[] {
  if (node.type === "text") return [node.fill];
  if (node.type === "instance") return node.color ? [node.color] : [];
  if (node.type === "vector") return [];
  const frame: FrameNode = node;
  return [
    ...(frame.fill ? [frame.fill] : []),
    ...(frame.stroke?.paint ? [frame.stroke.paint] : []),
    ...(frame.shadows ?? []).map((shadow) => shadow.paint),
    ...frame.children.flatMap(paints),
  ];
}
