import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { build } from "../src/core/build";
import { docs } from "../src/core/docs";
import { capture, fixtureRegistryDir, json, rejection, tempDir } from "./helpers";

const TOPICS = {
  "docs/index.json": json({
    topics: [{ topic: "start", title: "Start", description: "Begin here.", path: "start.md" }],
  }),
  "docs/start.md": "# Start\n\nAdd a card with `shelf add card`.\n",
};

async function print(registry: string, topic?: string) {
  const out = capture();
  await docs({ cwd: process.cwd(), topic, registry, out });
  return out.text();
}

describe("shelf docs", () => {
  test("lists topics and items", async () => {
    const registry = await fixtureRegistryDir(TOPICS);
    const text = await print(registry);
    expect(text).toContain("start  Begin here.");
    expect(text).toContain("Items: 3.");
    expect(text).toContain("button, card, tokens");
  });

  test("prints a topic as Markdown", async () => {
    const registry = await fixtureRegistryDir(TOPICS);
    expect(await print(registry, "start")).toBe("# Start\n\nAdd a card with `shelf add card`.");
  });

  test("prints an item's description, dependencies, and source", async () => {
    const registry = await fixtureRegistryDir(TOPICS);
    const text = await print(registry, "card");
    expect(text).toContain("# card\n\nA card surface.");
    expect(text).toContain("Shelf items: button, tokens");
    expect(text).toContain("## card.tsx");
    expect(text).toContain("export const Card");
  });

  test("works on a registry without topics", async () => {
    const registry = await fixtureRegistryDir();
    expect(await print(registry)).toContain("this registry publishes no topic pages");
    expect(await print(registry, "tokens")).toContain("# tokens");
  });

  test("an unknown name says how to list what exists", async () => {
    const registry = await fixtureRegistryDir(TOPICS);
    expect(await rejection(print(registry, "nope"))).toBe(
      'No docs for "nope". Run: shelf docs (lists topics and items)',
    );
  });

  test("build publishes topics and lists them in llms.txt", async () => {
    const registry = await fixtureRegistryDir(TOPICS);
    const outDir = path.join(await tempDir("docs-build"), "out");
    await build({ cwd: process.cwd(), source: registry, outDir, out: capture(), site: false });

    expect(await readFile(path.join(outDir, "docs/start.md"), "utf8")).toContain("# Start");
    expect(await readFile(path.join(outDir, "docs/index.json"), "utf8")).toContain('"start"');
    expect(await readFile(path.join(outDir, "llms.txt"), "utf8")).toContain(
      "- [Start](docs/start.md): Begin here.",
    );
    expect(await print(outDir, "start")).toContain("# Start");
  });

  test("build rejects a topic whose file is missing", async () => {
    const registry = await fixtureRegistryDir({ "docs/index.json": TOPICS["docs/index.json"] });
    const outDir = path.join(await tempDir("docs-build"), "out");
    expect(
      await rejection(
        build({ cwd: process.cwd(), source: registry, outDir, out: capture(), site: false }),
      ),
    ).toBe('docs/index.json lists "start", but docs/start.md is missing.');
  });
});
