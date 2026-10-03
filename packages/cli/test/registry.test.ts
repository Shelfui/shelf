import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { DEFAULT_PATHS } from "../src/core/config";
import { planFiles } from "../src/core/install-plan";
import { loadIndex, openRegistry, computeRevision } from "../src/core/registry";
import { resolveItems } from "../src/core/resolve";
import { REAL_REGISTRY, fixtureRegistryDir, json, rejection } from "./helpers";

/** Packages every consumer app already has. */
const PROVIDED_BY_APP = ["react", "react-dom"];
const PACKAGE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^."'][^"']*)["']/g;

async function resolveIn(dir: string, names: string[]) {
  const registry = openRegistry(dir);
  return resolveItems(registry, await loadIndex(registry), names);
}

describe("the real registry", () => {
  test("every indexed item loads and lists all of its installable files", async () => {
    const registry = openRegistry(REAL_REGISTRY);
    const index = await loadIndex(registry);
    const items = await resolveItems(
      registry,
      index,
      index.map((entry) => entry.name),
    );
    expect(items.map((item) => item.name).toSorted()).toEqual(
      index.map((entry) => entry.name).toSorted(),
    );
    for (const item of items) {
      const onDisk = await readdir(path.join(REAL_REGISTRY, item.path));
      const unlisted = onDisk.filter(
        (file) =>
          file !== "registry.json" &&
          !/\.(stories|test|perf)\.tsx?$/.test(file) &&
          !item.files.some((listed) => listed.path === file),
      );
      expect(
        unlisted,
        `${item.name} has files that are neither installed nor stories/tests`,
      ).toEqual([]);
      expect(item.revision).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  test("every item's package imports are declared, and its relative imports install", async () => {
    const registry = openRegistry(REAL_REGISTRY);
    const index = await loadIndex(registry);
    for (const entry of index) {
      const items = await resolveItems(registry, index, [entry.name]);
      const item = items.at(-1)!;
      const declared = new Set([...PROVIDED_BY_APP, ...Object.keys(item.dependencies)]);
      for (const file of item.files) {
        for (const [, spec] of file.content.matchAll(PACKAGE_IMPORT)) {
          const pkg = spec!.startsWith("@")
            ? spec!.split("/").slice(0, 2).join("/")
            : spec!.split("/")[0]!;
          expect(declared.has(pkg), `${item.name}/${file.path} imports undeclared "${pkg}"`).toBe(
            true,
          );
        }
      }
      expect(() => planFiles(items, { paths: DEFAULT_PATHS, aliases: {} })).not.toThrow();
    }
  });

  test("every registry.json on disk is in index.json, with the same name and type", async () => {
    const index = await loadIndex(openRegistry(REAL_REGISTRY));
    const onDisk = [];
    for await (const file of new Bun.Glob("**/registry.json").scan(REAL_REGISTRY)) {
      const item = await Bun.file(path.join(REAL_REGISTRY, file)).json();
      onDisk.push({ name: item.name, type: item.type, path: path.posix.dirname(file) });
    }
    expect(onDisk.toSorted((a, b) => a.name.localeCompare(b.name))).toEqual(
      index.map(({ name, type, path: itemPath }) => ({ name, type, path: itemPath })),
    );
  });

  test("relative imports reach only the item itself or its direct shelfDependencies", async () => {
    const registry = openRegistry(REAL_REGISTRY);
    const index = await loadIndex(registry);
    const itemAt = new Map(index.map((entry) => [entry.path, entry.name]));
    const RELATIVE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'](\.{1,2}\/[^"']*)["']/g;
    for (const entry of index) {
      const item = (await resolveItems(registry, index, [entry.name])).at(-1)!;
      const allowed = new Set([item.name, ...item.shelfDependencies]);
      for (const file of item.files) {
        for (const [, spec] of file.content.matchAll(RELATIVE_IMPORT)) {
          const target = path.posix.dirname(
            path.posix.normalize(path.posix.join(item.path, path.posix.dirname(file.path), spec!)),
          );
          const owner = itemAt.get(target);
          expect(
            owner !== undefined && allowed.has(owner),
            `${item.name}/${file.path} imports "${spec}" from ${owner ?? "outside any item"}, which is not in its shelfDependencies`,
          ).toBe(true);
        }
      }
    }
  });

  test("no registry source styles through attribute selectors", async () => {
    // StyleX treats `:is([data-*])` keys as an unsupported escape hatch; use Base UI's state instead.
    for (const file of await Array.fromAsync(new Bun.Glob("**/*.{ts,tsx}").scan(REAL_REGISTRY))) {
      const content = await Bun.file(path.join(REAL_REGISTRY, file)).text();
      expect(content.includes(":is(["), `${file} uses an :is([...]) selector`).toBe(false);
    }
  });

  test("button depends on foundations and utils, and declares its packages", async () => {
    const items = await resolveIn(REAL_REGISTRY, ["button"]);
    const button = items.at(-1);
    expect(items.map((item) => item.name).toSorted()).toEqual(["button", "foundations", "utils"]);
    expect(Object.keys(button!.dependencies).toSorted()).toEqual([
      "@base-ui/react",
      "@stylexjs/stylex",
    ]);
  });
});

describe("resolution", () => {
  test("unknown items suggest a close match", async () => {
    const dir = await fixtureRegistryDir();
    expect(await rejection(resolveIn(dir, ["buton"]))).toContain(
      'Unknown Shelf item "buton". Did you mean "button"?',
    );
    expect(await rejection(resolveIn(dir, ["zzzzzz"]))).toContain(
      "Available: button, card, tokens",
    );
  });

  test("diamond dependencies install once, dependencies first", async () => {
    const dir = await fixtureRegistryDir();
    const items = await resolveIn(dir, ["card"]);
    expect(items.map((item) => item.name)).toEqual(["tokens", "button", "card"]);
  });

  test("duplicate and overlapping names in argv resolve once", async () => {
    const dir = await fixtureRegistryDir();
    const items = await resolveIn(dir, ["button", "tokens", "button", "card", "tokens"]);
    expect(items.map((item) => item.name)).toEqual(["tokens", "button", "card"]);
  });

  test("dependency cycles are reported, not recursed forever", async () => {
    const dir = await fixtureRegistryDir({
      "foundations/registry.json": json({
        name: "tokens",
        type: "foundation",
        description: "Design tokens.",
        files: [{ path: "tokens.stylex.ts" }],
        shelfDependencies: ["card"],
      }),
    });
    expect(await rejection(resolveIn(dir, ["card"]))).toContain(
      "Shelf dependency cycle: card -> button -> tokens -> card",
    );
  });

  test("a dependency missing from the index names the item that needs it", async () => {
    const dir = await fixtureRegistryDir({
      "components/card/registry.json": json({
        name: "card",
        type: "component",
        description: "A card.",
        files: [{ path: "card.tsx" }],
        shelfDependencies: ["ghost"],
      }),
    });
    expect(await rejection(resolveIn(dir, ["card"]))).toContain(
      'Registry item "card" depends on "ghost", which is not in the registry index.',
    );
  });
});

describe("registry validation", () => {
  const cases: Array<[string, Record<string, string>, string]> = [
    [
      "malformed registry.json",
      { "components/button/registry.json": "{ nope" },
      "is not valid JSON",
    ],
    [
      "missing description",
      {
        "components/button/registry.json": json({
          name: "button",
          type: "component",
          files: [{ path: "button.tsx" }],
        }),
      },
      '"description" must be a non-empty string',
    ],
    [
      "listed file that does not exist",
      {
        "components/button/registry.json": json({
          name: "button",
          type: "component",
          description: "A button.",
          files: [{ path: "button.tsx" }, { path: "missing.tsx" }],
          shelfDependencies: ["tokens"],
        }),
      },
      "Registry file not found:",
    ],
    [
      "duplicate names in index.json",
      {
        "index.json": json({
          items: [
            { name: "button", type: "component", description: "A.", path: "components/button" },
            { name: "button", type: "component", description: "B.", path: "components/card" },
          ],
        }),
      },
      'Duplicate item "button" in registry index.json.',
    ],
    [
      "name mismatch between index and item",
      {
        "components/button/registry.json": json({
          name: "buttn",
          type: "component",
          description: "A button.",
          files: [{ path: "button.tsx" }],
        }),
      },
      'is named "buttn", but index.json lists it as "button"',
    ],
    [
      "file path traversal",
      {
        "components/button/registry.json": json({
          name: "button",
          type: "component",
          description: "A button.",
          files: [{ path: "../../../etc/passwd" }],
        }),
      },
      'files[0].path "../../../etc/passwd" is not allowed',
    ],
    [
      "absolute file path",
      {
        "components/button/registry.json": json({
          name: "button",
          type: "component",
          description: "A button.",
          files: [{ path: "/etc/passwd" }],
        }),
      },
      'files[0].path "/etc/passwd" is not allowed',
    ],
    [
      "item path traversal in index.json",
      {
        "index.json": json({
          items: [{ name: "button", type: "component", description: "A.", path: "../outside" }],
        }),
      },
      'path "../outside" is not allowed',
    ],
    [
      "dependency range that looks like a CLI flag",
      {
        "components/button/registry.json": json({
          name: "button",
          type: "component",
          description: "A button.",
          files: [{ path: "button.tsx" }],
          dependencies: { react: "--global" },
        }),
      },
      'dependency "react" needs a version range string',
    ],
    [
      "invalid package name",
      {
        "components/button/registry.json": json({
          name: "button",
          type: "component",
          description: "A button.",
          files: [{ path: "button.tsx" }],
          dependencies: { "Not A Package": "1.0.0" },
        }),
      },
      '"Not A Package" is not a valid package name',
    ],
  ];

  for (const [name, overrides, message] of cases) {
    test(name, async () => {
      const dir = await fixtureRegistryDir(overrides);
      expect(await rejection(resolveIn(dir, ["button"]))).toContain(message);
    });
  }

  test("missing registry directory is actionable", () => {
    expect(() => openRegistry("/definitely/not/here")).toThrow(
      'Registry directory not found: /definitely/not/here. Check "registry" in shelf.config.json.',
    );
  });
});

describe("revision", () => {
  const base = {
    name: "button",
    type: "component" as const,
    path: "components/button",
    files: [{ path: "button.tsx", content: "a" }],
    dependencies: { react: "^19" },
    shelfDependencies: [],
  };

  test("is deterministic and independent of file order", () => {
    const reordered = {
      ...base,
      files: [
        { path: "b.ts", content: "2" },
        { path: "a.ts", content: "1" },
      ],
    };
    const ordered = { ...reordered, files: reordered.files.toReversed() };
    expect(computeRevision(reordered)).toBe(computeRevision(ordered));
  });

  test("is the same on every machine: sorting doesn't follow the locale", () => {
    const item = {
      ...base,
      files: [
        { path: "b.ts", content: "2" },
        { path: "a.ts", content: "1" },
        { path: "B.ts", content: "3" },
      ],
      dependencies: { react: "^19", "@stylexjs/stylex": "^0.19" },
      shelfDependencies: ["icons", "foundations"],
    };
    expect(computeRevision(item)).toBe(
      "48fa30f7dbfebfe4ad6822725b27aae6459187c97f9a169aa1ba5b567d267958",
    );
  });

  test("changes when source or dependencies change", () => {
    const original = computeRevision(base);
    expect(computeRevision({ ...base, files: [{ path: "button.tsx", content: "b" }] })).not.toBe(
      original,
    );
    expect(computeRevision({ ...base, dependencies: { react: "^20" } })).not.toBe(original);
  });
});
