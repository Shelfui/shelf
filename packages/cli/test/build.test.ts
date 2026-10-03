import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { build } from "../src/core/build";
import { readLock } from "../src/core/lock";
import { loadIndex, openRegistry, revisionPath } from "../src/core/registry";
import { resolveItems } from "../src/core/resolve";
import { serveRegistry } from "../src/serve";
import {
  CLI,
  REAL_REGISTRY,
  capture,
  fixtureConsumer,
  fixtureRegistry,
  fixtureRegistryDir,
  json,
  rejection,
  tempDir,
  writeTree,
} from "./helpers";

const servers: Array<{ stop(force?: boolean): void }> = [];
afterEach(() => {
  for (const server of servers.splice(0)) server.stop(true);
});

async function buildTo(source: string) {
  const outDir = path.join(await tempDir("build"), "out");
  const out = capture();
  await build({ cwd: process.cwd(), source, outDir, out, site: false });
  return { outDir, out };
}

interface BuiltIndex {
  items: Array<{ name: string; revision: string; figma?: string }>;
}

async function builtIndex(source: string): Promise<BuiltIndex> {
  const { outDir } = await buildTo(source);
  return JSON.parse(await readFile(path.join(outDir, "index.json"), "utf8"));
}

function figmaOf(index: BuiltIndex): Record<string, string | undefined> {
  return Object.fromEntries(index.items.map((item) => [item.name, item.figma]));
}

function indexWith(figma: unknown): string {
  const index = JSON.parse(fixtureRegistry()["index.json"]!);
  return json({ ...index, figma });
}

async function everything(location: string) {
  const registry = openRegistry(location);
  const index = await loadIndex(registry);
  return resolveItems(
    registry,
    index,
    index.map((entry) => entry.name),
  );
}

describe("shelf build", () => {
  test("writes only installable files, with the same items and revisions", async () => {
    const { outDir, out } = await buildTo(REAL_REGISTRY);
    const built = await Array.fromAsync(new Bun.Glob("**/*").scan(outDir));

    expect(built.filter((file) => /\.(stories|test)\.tsx?$/.test(file))).toEqual([]);
    const [source, output] = await Promise.all([everything(REAL_REGISTRY), everything(outDir)]);
    expect(output).toEqual(source);
    const sourceIndex = JSON.parse(await readFile(path.join(REAL_REGISTRY, "index.json"), "utf8"));
    const byName = new Map(source.map((item) => [item.name, item]));
    expect(JSON.parse(await readFile(path.join(outDir, "index.json"), "utf8"))).toEqual({
      ...sourceIndex,
      items: sourceIndex.items.map((entry: { name: string }) => ({
        ...entry,
        revision: byName.get(entry.name)!.revision,
        dependencies: byName.get(entry.name)!.dependencies,
        shelfDependencies: byName.get(entry.name)!.shelfDependencies,
      })),
    });
    // index.json, llms.txt, and history.json, the docs topics, then each item's registry.json and files.
    const docsFiles = built.filter((file) => file.startsWith("docs/")).length;
    expect(built.filter((file) => !file.startsWith("revisions/"))).toHaveLength(
      3 + docsFiles + source.reduce((count, item) => count + 1 + item.files.length, 0),
    );
    const llms = await readFile(path.join(outDir, "llms.txt"), "utf8");
    expect(llms).toStartWith("# Shelf Registry\n");
    expect(llms).toContain(
      `- [button](components/button/registry.json): ${byName.get("button")!.description}`,
    );
    const history = JSON.parse(await readFile(path.join(outDir, "history.json"), "utf8"));
    expect(history.items.button[0]).toEqual({
      revision: expect.any(String),
      commit: expect.stringMatching(/^[0-9a-f]{40}$/),
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    for (const { revision } of history.items.button) {
      expect(built).toContain(revisionPath(revision));
    }
    expect(out.text()).toContain(`✓ validated ${source.length} items`);
    for (const item of source) expect(built).toContain(revisionPath(item.revision));
    // Past revisions come from git history, which this repo may not have yet;
    // "build writes every revision in the registry's git history" covers them.
    expect(built.filter((file) => file.startsWith("revisions/")).length).toBeGreaterThanOrEqual(
      source.length,
    );
  });

  test("a served build installs byte-identical files and provenance", async () => {
    const { outDir } = await buildTo(REAL_REGISTRY);
    const server = await serveRegistry(outDir);
    servers.push(server);

    const local = await fixtureConsumer(REAL_REGISTRY);
    const remote = await fixtureConsumer(server.url.toString());
    for (const cwd of [local, remote]) {
      await add({ cwd, names: ["dialog"], overwrite: false, install: false, out: capture() });
    }

    const [localLock, remoteLock] = await Promise.all([readLock(local), readLock(remote)]);
    const comparable = (lock: typeof localLock) =>
      Object.fromEntries(
        Object.entries(lock.items).map(([name, { registry: _r, installedAt: _i, ...item }]) => [
          name,
          item,
        ]),
      );
    expect(comparable(remoteLock)).toEqual(comparable(localLock));
    const targets = Object.values(localLock.items).flatMap((item) => Object.keys(item.files));
    expect(targets).toContain("src/components/ui/dialog.tsx");
    for (const target of targets) {
      const [a, b] = await Promise.all([
        readFile(path.join(local, target)),
        readFile(path.join(remote, target)),
      ]);
      expect(b.equals(a)).toBe(true);
    }
  });

  test("an invalid item fails with its name and field, and writes nothing", async () => {
    const source = await fixtureRegistryDir({
      "components/card/registry.json": json({
        name: "card",
        type: "component",
        description: "A card surface.",
        files: [],
      }),
    });
    const outDir = path.join(await tempDir("build"), "out");
    expect(await rejection(build({ cwd: "/", source, outDir, out: capture() }))).toBe(
      'Registry item "card" (components/card/registry.json): "files" must be a non-empty array of { "path": string }.',
    );
    expect(await Bun.file(path.join(outDir, "index.json")).exists()).toBe(false);
  });

  test("index.json's figma block links each item without changing revisions", async () => {
    const file = "https://www.figma.com/design/abc123/Shelf";
    const [plain, linked] = await Promise.all([
      fixtureRegistryDir(),
      fixtureRegistryDir({ "index.json": indexWith({ file, nodes: { card: "4:47" } }) }),
    ]);
    const [before, after] = await Promise.all([builtIndex(plain), builtIndex(linked)]);
    expect(figmaOf(before)).toEqual({ tokens: undefined, button: undefined, card: undefined });
    expect(figmaOf(after)).toEqual({
      tokens: file,
      button: undefined,
      card: `${file}?node-id=4-47`,
    });
    expect(after.items.map((item) => item.revision)).toEqual(
      before.items.map((item) => item.revision),
    );
  });

  test.each([
    [
      { file: "https://example.com/design/abc123", nodes: {} },
      'Registry index.json "figma".file must be a Figma file URL',
    ],
    [
      { file: "https://www.figma.com/design/abc123/Shelf?node-id=1-2", nodes: {} },
      'Registry index.json "figma".file must be a Figma file URL',
    ],
    [
      { file: "https://www.figma.com/design/abc123/Shelf", nodes: { badge: "1:2" } },
      'Registry index.json "figma".nodes lists "badge", which isn\'t an item in index.json.',
    ],
    [
      { file: "https://www.figma.com/design/abc123/Shelf", nodes: { card: "1-2" } },
      'Registry index.json "figma".nodes["card"] must be a node id, such as "4:47".',
    ],
  ])("an invalid figma block fails: %j", async (figma, message) => {
    const source = await fixtureRegistryDir({ "index.json": indexWith(figma) });
    expect(
      await rejection(build({ cwd: "/", source, outDir: `${source}-out`, out: capture() })),
    ).toStartWith(message);
  });

  test("a figma link in registry.json points to index.json", async () => {
    const source = await fixtureRegistryDir({
      "components/card/registry.json": json({
        name: "card",
        type: "component",
        description: "A card surface.",
        files: [{ path: "card.tsx" }],
        figma: "https://www.figma.com/design/abc123/Shelf?node-id=1-2",
      }),
    });
    expect(
      await rejection(build({ cwd: "/", source, outDir: `${source}-out`, out: capture() })),
    ).toBe(
      'Registry item "card" (components/card/registry.json): "figma" moved to index.json. Remove it here and add the node to "figma.nodes" in index.json.',
    );
  });

  test("an import of a file outside the item's dependencies fails", async () => {
    const source = await fixtureRegistryDir({
      "components/button/button.tsx": `import { Card } from "../card/card";\nexport const Button = Card;\n`,
    });
    expect(
      await rejection(build({ cwd: "/", source, outDir: `${source}-out`, out: capture() })),
    ).toContain('Registry item "button": components/button/button.tsx imports "../card/card"');
  });

  test("an item that is not in index.json fails", async () => {
    const source = await fixtureRegistryDir({
      "components/badge/registry.json": json({ name: "badge" }),
    });
    expect(
      await rejection(build({ cwd: "/", source, outDir: `${source}-out`, out: capture() })),
    ).toBe(
      "1 item not listed in index.json: components/badge. Add them to index.json or remove them.",
    );
  });

  test("refuses an output that overlaps the registry or holds other files", async () => {
    const source = await fixtureRegistryDir();
    const other = await tempDir("build-other");
    await writeTree(other, { "notes.txt": "keep me" });
    for (const outDir of [source, path.join(source, "dist"), path.dirname(source)]) {
      expect(await rejection(build({ cwd: "/", source, outDir, out: capture() }))).toContain(
        "overlaps the registry",
      );
    }
    expect(await rejection(build({ cwd: "/", source, outDir: other, out: capture() }))).toContain(
      "is not empty and is not a Shelf registry build",
    );
    expect(await readFile(path.join(other, "notes.txt"), "utf8")).toBe("keep me");
  });
});

/** A prebuilt site, a Storybook build, and usage files to build with. */
async function inputs() {
  const dir = await tempDir("site-inputs");
  await writeTree(dir, {
    "site/index.html": "<!doctype html><title>Shelf Registry</title>",
    "site/_site/app.js": "export {};",
    "storybook-static/iframe.html": "<!doctype html>",
    "storybook-static/index.json": json({ v: 5, entries: {} }),
    "usage.json": json({ version: 1, registry: null, projects: [] }),
    "not-usage.json": json({ projects: [] }),
    "verify.json": json({ version: 1, items: {} }),
    "not-verify.json": json({ items: {} }),
  });
  return dir;
}

describe("shelf build: the Shelf Registry site", () => {
  test("writes the site, Storybook, and usage next to the registry files", async () => {
    const [source, dir] = await Promise.all([fixtureRegistryDir(), inputs()]);
    const outDir = path.join(dir, "out");
    const out = capture();
    await Bun.write(path.join(dir, "figma/manifest.json"), '{"main":"code.js"}');
    await Bun.write(path.join(dir, "figma/code.js"), "");
    await build({
      cwd: dir,
      source,
      outDir,
      out,
      siteDir: path.join(dir, "site"),
      figmaDir: path.join(dir, "figma"),
      storybook: "storybook-static",
      usage: "usage.json",
      verify: "verify.json",
    });

    const built = await Array.fromAsync(new Bun.Glob("**/*").scan(outDir));
    for (const file of [
      "index.html",
      "_site/app.js",
      "storybook/iframe.html",
      "storybook/index.json",
      "usage.json",
      "verify.json",
      "figma/manifest.json",
      "figma/code.js",
      "llms.txt",
      "index.json",
    ]) {
      expect(built).toContain(file);
    }
    expect(await readFile(path.join(outDir, "usage.json"), "utf8")).toBe(
      await readFile(path.join(dir, "usage.json"), "utf8"),
    );
    expect(out.text()).toContain("✓ site at index.html");
    expect(out.text()).toContain("✓ Storybook at storybook/");
    expect(out.text()).toContain("✓ Figma plugin at figma/");
    expect(out.text()).toContain("✓ usage at usage.json");
    expect(out.text()).toContain("✓ verification at verify.json");

    await build({ cwd: dir, source, outDir, out: capture(), site: false });
    const rebuilt = await Array.fromAsync(new Bun.Glob("**/*").scan(outDir));
    expect(
      rebuilt.filter((file) => /^(index\.html|_site|storybook|usage|verify|figma)/.test(file)),
    ).toEqual([]);
  });

  test("without a built site, writes the registry and says how to build it", async () => {
    const [source, dir] = await Promise.all([fixtureRegistryDir(), inputs()]);
    const out = capture();
    const outDir = path.join(dir, "out");
    await build({ cwd: dir, source, outDir, out, siteDir: path.join(dir, "missing") });
    expect(out.text()).toContain("! site not built, run: bun run site:build");
    expect(out.text()).not.toContain("Figma plugin");
    expect(await Bun.file(path.join(outDir, "index.json")).exists()).toBe(true);
    expect(await Bun.file(path.join(outDir, "index.html")).exists()).toBe(false);
  });

  test("rejects a Storybook directory or usage file that isn't one", async () => {
    const [source, dir] = await Promise.all([fixtureRegistryDir(), inputs()]);
    const options = { cwd: dir, source, outDir: path.join(dir, "out"), out: capture() };
    expect(await rejection(build({ ...options, storybook: "site" }))).toBe(
      `${path.join(dir, "site")} is not a Storybook build (no iframe.html). Run: storybook build, then pass its output, usually storybook-static.`,
    );
    expect(await rejection(build({ ...options, usage: "not-usage.json" }))).toBe(
      `${path.join(dir, "not-usage.json")} is not shelf usage output. Write it with: shelf usage --json`,
    );
    expect(await rejection(build({ ...options, usage: "missing.json" }))).toContain(
      `Can't read ${path.join(dir, "missing.json")}.`,
    );
    expect(await rejection(build({ ...options, verify: "not-verify.json" }))).toContain(
      `${path.join(dir, "not-verify.json")} is not a verify report.`,
    );
  });
});

describe("shelf serve", () => {
  test("serves a registry until stopped and prints how to use it", async () => {
    const source = await fixtureRegistryDir();
    const proc = Bun.spawn([process.execPath, CLI, "serve", source, "--port", "0"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    try {
      const reader = proc.stdout.getReader();
      let text = "";
      while (!text.includes("shelf init --registry")) {
        const { value, done } = await reader.read();
        if (done) break;
        text += new TextDecoder().decode(value);
      }
      const url = /at (http:\/\/127\.0\.0\.1:\d+\/)/.exec(text)?.[1];
      expect(url).toBeDefined();
      expect(text).toContain(`Use it with: shelf init --registry ${url}`);
      const index = await loadIndex(openRegistry(url!));
      expect(index.map((entry) => entry.name)).toEqual(["tokens", "button", "card"]);
    } finally {
      proc.kill();
      await proc.exited;
    }
  });

  test("a directory without index.json is an error", async () => {
    const empty = await tempDir("serve-empty");
    const proc = Bun.spawn([process.execPath, CLI, "serve", empty], { stderr: "pipe" });
    expect(await proc.exited).toBe(1);
    expect(await new Response(proc.stderr).text()).toContain(
      `No index.json in ${empty}. Pass the registry directory: shelf serve <dir>`,
    );
  });
});
