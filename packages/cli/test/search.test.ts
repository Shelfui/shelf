import { describe, expect, test } from "bun:test";
import { loadIndex, openRegistry } from "../src/core/registry";
import type { IndexEntry } from "../src/core/registry";
import { rankEntries } from "../src/core/search";
import { json, rejection, tempDir, writeTree } from "./helpers";

function entry(overrides: Partial<IndexEntry> & Pick<IndexEntry, "name">): IndexEntry {
  return { type: "component", description: "", path: `components/${overrides.name}`, ...overrides };
}

const index: IndexEntry[] = [
  entry({
    name: "alert-dialog",
    description: "A modal that asks the user to confirm or cancel.",
    keywords: ["delete", "destructive"],
    useWhen: "An action needs an explicit confirm or cancel.",
  }),
  entry({ name: "dialog", description: "A modal window composed from Root and Content." }),
  entry({ name: "toast", description: "A brief message that goes away on its own." }),
  entry({
    name: "confirm-dialog",
    type: "pattern",
    description: "Ask before a destructive action, then run it.",
  }),
  entry({ name: "settings-page", type: "template", description: "A page of settings sections." }),
  entry({ name: "settings-section", type: "block", description: "A titled group of settings." }),
];

function names(query: string): string[] {
  return rankEntries(index, query).map((found) => found.name);
}

describe("rankEntries", () => {
  test("a name match beats a description match", () => {
    expect(names("dialog")).toEqual(["dialog", "confirm-dialog", "alert-dialog"]);
    expect(names("toast")[0]).toBe("toast");
  });

  test("finds an item by a keyword that is not in its name or description", () => {
    expect(names("delete")[0]).toBe("alert-dialog");
  });

  test("matches a longer or shorter form of a word", () => {
    expect(names("confirmation")).toContain("alert-dialog");
    expect(names("dialogs")).toContain("dialog");
  });

  test("every term must match", () => {
    expect(names("delete modal")).toEqual(["alert-dialog"]);
    expect(names("delete toast")).toEqual([]);
  });

  test("an exact name comes first, and higher-level items win ties", () => {
    expect(names("settings")).toEqual(["settings-page", "settings-section"]);
    expect(names("settings-section")[0]).toBe("settings-section");
  });

  test("no terms lists everything", () => {
    expect(names("")).toHaveLength(index.length);
  });
});

async function registryWith(items: unknown[]) {
  const dir = await tempDir("index");
  await writeTree(dir, { "index.json": json({ items }) });
  return openRegistry(dir);
}

describe("index metadata", () => {
  const base = { type: "component", description: "d", path: "components/x" };

  test("reads the optional fields", async () => {
    const registry = await registryWith([
      { ...base, name: "x", keywords: ["a"], useWhen: "u", avoidWhen: "v", related: ["y"] },
      { ...base, name: "y", path: "components/y" },
    ]);
    const [first] = await loadIndex(registry);
    expect(first).toMatchObject({ keywords: ["a"], useWhen: "u", avoidWhen: "v", related: ["y"] });
  });

  test("rejects a related item that does not exist", async () => {
    const registry = await registryWith([{ ...base, name: "x", related: ["nope"] }]);
    expect(await rejection(loadIndex(registry))).toContain('"nope"');
  });

  test("rejects keywords that are not strings", async () => {
    const registry = await registryWith([{ ...base, name: "x", keywords: "dialog" }]);
    expect(await rejection(loadIndex(registry))).toContain("keywords must be an array");
  });
});
