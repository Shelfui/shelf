import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { parseJsonc } from "../src/core/jsonc";
import {
  PACKAGE_MANAGERS,
  type PackageManager,
  addArgs,
  detectPackageManager,
  runArgs,
} from "../src/core/package-manager";
import { json, tempDir, writeTree } from "./helpers";

let agent: string | undefined;
beforeEach(() => {
  agent = process.env["npm_config_user_agent"];
  delete process.env["npm_config_user_agent"];
});
afterEach(() => {
  if (agent === undefined) delete process.env["npm_config_user_agent"];
  else process.env["npm_config_user_agent"] = agent;
});

async function project(files: Record<string, string>) {
  const dir = await tempDir("pm", { outsideRepo: true });
  await writeTree(dir, { "package.json": json({ name: "app" }), ...files });
  return dir;
}

describe("detectPackageManager", () => {
  test.each<[string, PackageManager]>([
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ])("%s means %s", async (lockfile, expected) => {
    expect(await detectPackageManager(await project({ [lockfile]: "" }))).toBe(expected);
  });

  test("the packageManager field wins over a lockfile", async () => {
    const dir = await project({
      "package.json": json({ name: "app", packageManager: "pnpm@9.12.0" }),
      "package-lock.json": "",
    });
    expect(await detectPackageManager(dir)).toBe("pnpm");
  });

  test("a workspace root's lockfile applies to its packages", async () => {
    const root = await project({ "yarn.lock": "", "apps/web/package.json": json({ name: "web" }) });
    expect(await detectPackageManager(path.join(root, "apps/web"))).toBe("yarn");
  });

  test("without a lockfile, the package manager running the command decides", async () => {
    process.env["npm_config_user_agent"] = "pnpm/9.12.0 npm/? node/v22.0.0 darwin arm64";
    expect(await detectPackageManager(await project({}))).toBe("pnpm");
  });

  test("with nothing to go on, Bun running Shelf means bun", async () => {
    expect(await detectPackageManager(await project({}))).toBe("bun");
  });
});

describe("commands", () => {
  test("adding packages", () => {
    expect(PACKAGE_MANAGERS.map((pm) => addArgs(pm, ["react@19"]).join(" "))).toEqual([
      "npm install react@19",
      "pnpm add react@19",
      "yarn add react@19",
      "bun add react@19",
    ]);
    expect(PACKAGE_MANAGERS.map((pm) => addArgs(pm, ["oxfmt"], { dev: true }).join(" "))).toEqual([
      "npm install -D oxfmt",
      "pnpm add -D oxfmt",
      "yarn add -D oxfmt",
      "bun add -d oxfmt",
    ]);
  });

  test("running a local bin", () => {
    expect(PACKAGE_MANAGERS.map((pm) => runArgs(pm, "oxfmt", ["--check"]).join(" "))).toEqual([
      "npx oxfmt --check",
      "pnpm exec oxfmt --check",
      "yarn oxfmt --check",
      "bunx oxfmt --check",
    ]);
  });
});

describe("parseJsonc", () => {
  test("reads tsconfig-style comments and trailing commas, and leaves strings alone", () => {
    const text = `{
      // line comment
      "compilerOptions": {
        /* block */ "paths": { "@/*": ["./src/*"], },
        "url": "http://example.com/*not a comment*/",
      },
    }`;
    expect(parseJsonc(text)).toEqual({
      compilerOptions: {
        paths: { "@/*": ["./src/*"] },
        url: "http://example.com/*not a comment*/",
      },
    });
  });
});
