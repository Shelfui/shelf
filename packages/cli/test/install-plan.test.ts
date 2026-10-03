import { describe, expect, test } from "bun:test";
import { planFiles, rewriteImports } from "../src/core/install-plan";
import type { RegistryItem } from "../src/core/registry";

const paths = {
  components: "src/components/ui",
  blocks: "src/components/blocks",
  foundations: "src/styles/shelf",
  lib: "src/lib",
};
const config = { paths, aliases: {} };

function item(
  overrides: Partial<RegistryItem> & Pick<RegistryItem, "name" | "type" | "path" | "files">,
) {
  return { description: "", dependencies: {}, shelfDependencies: [], revision: "r", ...overrides };
}

const tokens = item({
  name: "foundations",
  type: "foundation",
  path: "foundations",
  files: [
    { path: "tokens.stylex.ts", content: "export const colors = {};\n" },
    { path: "themes.ts", content: `import { colors } from "./tokens.stylex";\n` },
  ],
});

describe("planFiles", () => {
  test("maps item types to configured directories and rewrites cross-item imports", () => {
    const button = item({
      name: "button",
      type: "component",
      path: "components/button",
      files: [
        {
          path: "button.tsx",
          content: `import * as stylex from "@stylexjs/stylex";\nimport { colors } from "../../foundations/tokens.stylex";\n`,
        },
      ],
    });
    const planned = planFiles([tokens, button], config);
    expect(planned.map((file) => file.target)).toEqual([
      "src/styles/shelf/tokens.stylex.ts",
      "src/styles/shelf/themes.ts",
      "src/components/ui/button.tsx",
    ]);
    expect(planned[1]?.content).toBe(`import { colors } from "./tokens.stylex";\n`);
    expect(planned[2]?.content).toBe(
      `import * as stylex from "@stylexjs/stylex";\nimport { colors } from "../../styles/shelf/tokens.stylex";\n`,
    );
  });

  test("honors custom nested paths", () => {
    const button = item({
      name: "button",
      type: "component",
      path: "components/button",
      files: [
        {
          path: "button.tsx",
          content: `import { colors } from "../../foundations/tokens.stylex";\n`,
        },
      ],
    });
    const planned = planFiles([tokens, button], {
      paths: {
        components: "app/ui/shelf/components",
        blocks: "app/ui/shelf/blocks",
        foundations: "app/theme",
        lib: "app/lib",
      },
      aliases: {},
    });
    expect(planned.at(-1)?.target).toBe("app/ui/shelf/components/button.tsx");
    expect(planned.at(-1)?.content).toBe(
      `import { colors } from "../../../theme/tokens.stylex";\n`,
    );
  });

  test("uses an alias across directories and stays relative within one", () => {
    const utils = item({
      name: "utils",
      type: "lib",
      path: "lib",
      files: [{ path: "utils.ts", content: "export type Styled<P> = P;\n" }],
    });
    const button = item({
      name: "button",
      type: "component",
      path: "components/button",
      files: [
        {
          path: "button.tsx",
          content: `import { colors } from "../../foundations/tokens.stylex";\nimport type { Styled } from "../../lib/utils";\n`,
        },
      ],
    });
    const group = item({
      name: "button-group",
      type: "component",
      path: "components/button-group",
      files: [
        { path: "button-group.tsx", content: `import { Button } from "../button/button";\n` },
      ],
    });
    const planned = planFiles([tokens, utils, button, group], {
      paths,
      aliases: { "@/*": "src/*", "#ui/*": "./src/components/ui/*" },
    });
    const content = (target: string) => planned.find((file) => file.target === target)?.content;

    expect(content("src/styles/shelf/themes.ts")).toBe(
      `import { colors } from "./tokens.stylex";\n`,
    );
    expect(content("src/components/ui/button.tsx")).toBe(
      `import { colors } from "@/styles/shelf/tokens.stylex";\nimport type { Styled } from "@/lib/utils";\n`,
    );
    expect(content("src/components/ui/button-group.tsx")).toBe(
      `import { Button } from "./button";\n`,
    );
  });

  test("blocks install into their own directory and import components from theirs", () => {
    const button = item({
      name: "button",
      type: "component",
      path: "components/button",
      files: [{ path: "button.tsx", content: "export function Button() {}\n" }],
    });
    const login = item({
      name: "login-form",
      type: "block",
      path: "blocks/login-form",
      files: [
        {
          path: "login-form.tsx",
          content: `import { Button } from "../../components/button/button";\n`,
        },
      ],
    });
    const plan = (aliases: Record<string, string>) =>
      planFiles([button, login], { paths, aliases }).at(-1);

    expect(plan({})?.target).toBe("src/components/blocks/login-form.tsx");
    expect(plan({})?.content).toBe(`import { Button } from "../ui/button";\n`);
    expect(plan({ "@/*": "src/*" })?.content).toBe(
      `import { Button } from "@/components/ui/button";\n`,
    );
  });

  test("the most specific alias wins, and files outside every alias stay relative", () => {
    const button = item({
      name: "button",
      type: "component",
      path: "components/button",
      files: [
        {
          path: "button.tsx",
          content: `import { colors } from "../../foundations/tokens.stylex";\n`,
        },
      ],
    });
    const aliased = (aliases: Record<string, string>) =>
      planFiles([tokens, button], { paths, aliases }).at(-1)?.content;

    expect(aliased({ "@/*": "src/*", "#theme/*": "src/styles/shelf/*" })).toBe(
      `import { colors } from "#theme/tokens.stylex";\n`,
    );
    expect(aliased({ "~/*": "app/*" })).toBe(
      `import { colors } from "../../styles/shelf/tokens.stylex";\n`,
    );
  });

  test("two items installing the same target is an error", () => {
    const a = item({
      name: "a",
      type: "component",
      path: "a",
      files: [{ path: "x.tsx", content: "" }],
    });
    const b = item({
      name: "b",
      type: "component",
      path: "b",
      files: [{ path: "x.tsx", content: "" }],
    });
    expect(() => planFiles([a, b], config)).toThrow(
      'Items "a" and "b" would both install src/components/ui/x.tsx.',
    );
  });

  test("non-code files are copied verbatim", () => {
    const content = `@import "../../foundations/whatever.css";\n`;
    const a = item({
      name: "a",
      type: "component",
      path: "a",
      files: [{ path: "a.css", content }],
    });
    expect(planFiles([a], config)[0]?.content).toBe(content);
  });
});

describe("rewriteImports", () => {
  const targets = new Map([
    ["foundations/tokens.stylex.ts", "src/styles/tokens.stylex.ts"],
    ["foundations/index.ts", "src/styles/index.ts"],
    ["components/button/button.tsx", "src/ui/button.tsx"],
    ["components/button/types.ts", "src/ui/types.ts"],
  ]);
  const rewrite = (content: string) =>
    rewriteImports(content, "components/button/button.tsx", "src/ui/button.tsx", targets, "button");

  test.each([
    [
      "without extension",
      `import { a } from "../../foundations/tokens.stylex";`,
      `import { a } from "../styles/tokens.stylex";`,
    ],
    [
      "with extension",
      `import { a } from "../../foundations/tokens.stylex.ts";`,
      `import { a } from "../styles/tokens.stylex.ts";`,
    ],
    ["import type", `import type { T } from "./types";`, `import type { T } from "./types";`],
    [
      "export star",
      `export * from "../../foundations/tokens.stylex";`,
      `export * from "../styles/tokens.stylex";`,
    ],
    [
      "named re-export",
      `export { a } from '../../foundations/tokens.stylex';`,
      `export { a } from '../styles/tokens.stylex';`,
    ],
    [
      "side-effect import",
      `import "../../foundations/tokens.stylex";`,
      `import "../styles/tokens.stylex";`,
    ],
    [
      "dynamic import",
      `const m = await import("../../foundations/tokens.stylex");`,
      `const m = await import("../styles/tokens.stylex");`,
    ],
    ["directory index", `import { x } from "../../foundations";`, `import { x } from "../styles";`],
    [
      "multiple imports on one line",
      `import { a } from "../../foundations/tokens.stylex"; import type { T } from "./types";`,
      `import { a } from "../styles/tokens.stylex"; import type { T } from "./types";`,
    ],
    [
      "multi-line import",
      `import {\n  a,\n  b,\n} from "../../foundations/tokens.stylex";`,
      `import {\n  a,\n  b,\n} from "../styles/tokens.stylex";`,
    ],
  ])("%s", (_, input, expected) => {
    expect(rewrite(input)).toBe(expected);
  });

  test("package imports are untouched", () => {
    const input = `import * as stylex from "@stylexjs/stylex";\nimport { Button } from "@base-ui/react/button";\nimport React from "react";`;
    expect(rewrite(input)).toBe(input);
  });

  test("a relative import to a file that is not being installed fails loudly", () => {
    expect(() => rewrite(`import { x } from "./missing";`)).toThrow(
      'Registry item "button": components/button/button.tsx imports "./missing", which is not a file of this item or of its shelfDependencies.',
    );
  });
});
