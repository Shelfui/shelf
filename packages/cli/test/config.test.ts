import path from "node:path";
import { describe, expect, test } from "bun:test";
import { CONFIG_KEYS, CONFIG_SCHEMA, DEFAULT_PATHS, readConfig } from "../src/core/config";
import { tsconfigAliases } from "../src/core/tsconfig";
import { json, rejection, tempDir, writeTree } from "./helpers";

async function configFrom(config: unknown) {
  const cwd = await tempDir("config");
  await writeTree(cwd, { "shelf.config.json": json(config) });
  return readConfig(cwd);
}

describe("readConfig", () => {
  test("fills in default paths and no aliases", async () => {
    const config = await configFrom({ registry: "../registry" });
    expect(config.paths).toEqual({
      components: "src/components/ui",
      blocks: "src/components/blocks",
      foundations: "src/styles/shelf",
      lib: "src/lib/shelf",
    });
    expect(config.aliases).toEqual({});
  });

  test("a config written before blocks existed gets the default blocks path", async () => {
    const config = await configFrom({
      registry: "../registry",
      paths: { components: "app/ui", foundations: "app/theme", lib: "app/lib" },
    });
    expect(config.paths.blocks).toBe("src/components/blocks");
  });

  test("normalizes alias directories", async () => {
    const config = await configFrom({
      registry: "../registry",
      aliases: { "@/*": "./src/*", "#ui/*": "src/components/ui/*", "~/*": "*" },
    });
    expect(config.aliases).toEqual({ "@/*": "src/*", "#ui/*": "src/components/ui/*", "~/*": "*" });
  });

  test.each([
    [{ "@/": "src/*" }, 'an alias must end in "*"'],
    [{ "./*": "src/*" }, 'an alias must end in "*" and not start with "."'],
    [{ "@/*": "src" }, 'must be a directory ending in "/*"'],
    [{ "@/*": "../outside/*" }, "is not allowed"],
  ])("rejects %j", async (aliases, message) => {
    expect(await rejection(configFrom({ registry: "../registry", aliases }))).toContain(message);
  });

  test("accepts $schema", async () => {
    const config = await configFrom({ $schema: CONFIG_SCHEMA, registry: "../registry" });
    expect(config.registry).toBe("../registry");
  });

  test.each([
    [{ registry: "../registry", path: {} }, 'unknown key "path"'],
    [{ registry: "../registry", paths: { component: "src/ui" } }, 'unknown key "paths.component"'],
  ])("rejects unknown keys in %j", async (config, message) => {
    expect(await rejection(configFrom(config))).toContain(message);
  });
});

describe("tsconfigAliases", () => {
  test("reads single-target directory aliases, with comments and baseUrl", async () => {
    const cwd = await tempDir("tsconfig");
    await writeTree(cwd, {
      "tsconfig.json": `{
        // Vite-style root config
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@/*": ["./src/*"],
            "~ui/*": ["src/components/ui/*"],
            "exact": ["src/exact.ts"],
            "many/*": ["a/*", "b/*"],
            "up/*": ["../outside/*"],
          },
        },
      }`,
    });
    expect(await tsconfigAliases(cwd)).toEqual({ "@/*": "src/*", "~ui/*": "src/components/ui/*" });
  });

  test("falls back to tsconfig.app.json and resolves from baseUrl", async () => {
    const cwd = await tempDir("tsconfig-app");
    await writeTree(cwd, {
      "tsconfig.json": json({ files: [], references: [{ path: "./tsconfig.app.json" }] }),
      "tsconfig.app.json": json({ compilerOptions: { baseUrl: "src", paths: { "#/*": ["*"] } } }),
    });
    expect(await tsconfigAliases(cwd)).toEqual({ "#/*": "src/*" });
  });

  test("no tsconfig means relative imports", async () => {
    expect(await tsconfigAliases(await tempDir("no-tsconfig"))).toEqual({});
  });
});

describe("schema.json", () => {
  test("describes the keys readConfig accepts", async () => {
    const schema = await Bun.file(path.join(import.meta.dir, "../schema.json")).json();
    expect(Object.keys(schema.properties).toSorted()).toEqual(CONFIG_KEYS.toSorted());
    expect(schema.properties.paths.properties).toEqual(
      Object.fromEntries(
        Object.entries(DEFAULT_PATHS).map(([key, value]) => [
          key,
          { type: "string", default: value },
        ]),
      ),
    );
  });

  test("is what shelf init points $schema at, and ships in the package", async () => {
    const manifest = await Bun.file(path.join(import.meta.dir, "../package.json")).json();
    expect(CONFIG_SCHEMA).toBe(`./node_modules/${manifest.name}/schema.json`);
    expect(manifest.files).toContain("schema.json");
  });
});
