import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { readBase } from "../src/core/base";
import { build } from "../src/core/build";
import { registryHistory } from "../src/core/git";
import { readLock } from "../src/core/lock";
import { computeRevision, loadIndex, openRegistry, revisionPath } from "../src/core/registry";
import { resolveItems } from "../src/core/resolve";
import { serveRegistry } from "../src/serve";
import {
  capture,
  fixtureConsumer,
  fixtureRegistryDir,
  json,
  rejection,
  tempDir,
  writeTree,
} from "./helpers";

const BUTTON = "src/components/ui/button.tsx";
const SOURCE = "components/button/button.tsx";
const V2 = `import { colors } from "../../foundations/tokens.stylex";\nexport const Button = () => [colors.text, "v2"];\n`;

const servers: Array<{ stop(): Promise<void> }> = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.stop()));
});

function git(cwd: string, ...args: string[]): string {
  const result = Bun.spawnSync(
    ["git", "-c", "user.name=Shelf", "-c", "user.email=shelf@example.com", ...args],
    { cwd },
  );
  if (result.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.toString()}`);
  return result.stdout.toString().trim();
}

function commitAll(cwd: string, message: string): void {
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", message);
}

async function gitRegistry() {
  const dir = await fixtureRegistryDir();
  git(dir, "init", "-q");
  commitAll(dir, "v1");
  return dir;
}

async function addButton(cwd: string) {
  await add({ cwd, names: ["button"], overwrite: false, install: false, out: capture() });
  return readFile(path.join(cwd, BUTTON), "utf8");
}

async function buildTo(source: string, outDir: string) {
  const out = capture();
  await build({ cwd: "/", source, outDir, out });
  return out.text();
}

const aliased = (registry: string) => ({
  "shelf.config.json": json({ registry, aliases: { "@/*": "src/*" } }),
});

describe("readBase", () => {
  test("an unmodified file is its own BASE", async () => {
    const cwd = await fixtureConsumer(await fixtureRegistryDir());
    const installed = await addButton(cwd);
    expect((await readBase(cwd, "button")).get(BUTTON)).toBe(installed);
  });

  test("comes from the project's git history, byte for byte, when it was committed", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry);
    git(cwd, "init", "-q");
    const installed = await addButton(cwd);
    commitAll(cwd, "shelf add button");

    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    await writeFile(path.join(registry, SOURCE), V2);

    expect((await readBase(cwd, "button")).get(BUTTON)).toBe(installed);
  });

  test("is rebuilt from a local registry's git history, aliases included", async () => {
    const registry = await gitRegistry();
    const cwd = await fixtureConsumer(registry, aliased(registry));
    const installed = await addButton(cwd);
    expect(installed).toContain(`from "@/styles/shelf/tokens.stylex"`);

    await writeFile(path.join(cwd, BUTTON), "// mine, never committed\n");
    await writeFile(path.join(registry, SOURCE), V2);
    commitAll(registry, "v2");

    expect((await readBase(cwd, "button")).get(BUTTON)).toBe(installed);
  });

  test("is rebuilt from an HTTP registry's revisions, which survive rebuilds", async () => {
    const source = await fixtureRegistryDir();
    const outDir = path.join(await tempDir("build"), "out");
    expect(await buildTo(source, outDir)).toContain(
      "! registry history unavailable (not committed to git)",
    );
    const server = await serveRegistry(outDir);
    servers.push(server);
    const cwd = await fixtureConsumer(server.url.toString());
    const installed = await addButton(cwd);
    const { revision } = (await readLock(cwd)).items["button"]!;

    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    await writeFile(path.join(source, SOURCE), V2);
    expect(await buildTo(source, outDir)).toContain("✓ 4 revisions in revisions/ (1 new)");
    expect(await readdir(path.join(outDir, "revisions"))).toContain(`${revision}.json`);

    expect((await readBase(cwd, "button")).get(BUTTON)).toBe(installed);
  });

  test("build writes every revision in the registry's git history", async () => {
    const registry = await gitRegistry();
    const first = path.join(await tempDir("build"), "out");
    await buildTo(registry, first);
    const [v1] = await readdir(path.join(first, "revisions"));

    await writeFile(path.join(registry, SOURCE), V2);
    commitAll(registry, "v2");
    const fresh = path.join(await tempDir("build"), "out");
    expect(await buildTo(registry, fresh)).toContain("✓ 4 revisions in revisions/ (4 new)");
    expect(await readdir(path.join(fresh, "revisions"))).toContain(v1!);
  });

  test("history follows items that are added, moved, and changed on a merged branch", async () => {
    const registry = await gitRegistry();
    const revisions = async () => {
      const index = await loadIndex(openRegistry(registry));
      const items = await resolveItems(openRegistry(registry), index, ["badge", "button"]);
      return items.map((item) => item.revision);
    };
    const index = JSON.parse(await readFile(path.join(registry, "index.json"), "utf8"));
    index.items.push({ name: "badge", type: "component", description: "A badge.", path: "badge" });
    await writeTree(registry, {
      "index.json": json(index),
      "badge/registry.json": json({
        name: "badge",
        type: "component",
        description: "A badge.",
        files: [{ path: "badge.tsx" }],
      }),
      "badge/badge.tsx": "export const Badge = 1;\n",
    });
    commitAll(registry, "add badge");
    const added = await revisions();

    index.items.at(-1).path = "components/badge";
    git(registry, "mv", "badge", "components/badge");
    await writeTree(registry, {
      "index.json": json(index),
      "components/badge/badge.tsx": "export const Badge = 2;\n",
    });
    commitAll(registry, "move and change badge");
    const moved = await revisions();

    git(registry, "checkout", "-q", "-b", "feature");
    await writeFile(path.join(registry, SOURCE), V2);
    commitAll(registry, "button v2");
    git(registry, "checkout", "-q", "-");
    git(registry, "-c", "user.name=Shelf", "merge", "-q", "--no-ff", "-m", "merge", "feature");
    const merged = await revisions();

    const history = new Set((await registryHistory(registry)).map((item) => item.revision));
    for (const revision of [...added, ...moved, ...merged]) expect(history).toContain(revision);
    const only = await registryHistory(registry, "badge");
    expect(only.map((item) => item.name)).toEqual(["badge", "badge"]);
    expect(only.every((item) => computeRevision(item) === item.revision)).toBe(true);
  });

  test("an unreachable registry is reported as unreachable, not as missing", async () => {
    const outDir = path.join(await tempDir("build"), "out");
    await buildTo(await fixtureRegistryDir(), outDir);
    const server = await serveRegistry(outDir);
    const cwd = await fixtureConsumer(server.url.toString());
    await addButton(cwd);
    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    await server.stop();

    expect(await rejection(readBase(cwd, "button"))).toContain("Could not reach registry");
  });

  test("a shallow clone builds, and says what it can't rebuild", async () => {
    const registry = await gitRegistry();
    await writeFile(path.join(registry, SOURCE), V2);
    commitAll(registry, "v2");
    const clone = path.join(await tempDir("clone"), "registry");
    git(path.dirname(clone), "clone", "-q", "--depth", "1", `file://${registry}`, clone);

    const text = await buildTo(clone, path.join(await tempDir("build"), "out"));
    expect(text).toContain("✓ 3 revisions in revisions/ (3 new)");
    expect(text).toContain(
      "! registry history unavailable (shallow clone); installs of older revisions can't be rebuilt. Use fetch-depth: 0.",
    );
  });

  test("a tampered snapshot is rejected", async () => {
    const source = await fixtureRegistryDir();
    const outDir = path.join(await tempDir("build"), "out");
    await buildTo(source, outDir);
    const server = await serveRegistry(outDir);
    servers.push(server);
    const cwd = await fixtureConsumer(server.url.toString());
    await addButton(cwd);
    await writeFile(path.join(cwd, BUTTON), "// mine\n");

    const { revision } = (await readLock(cwd)).items["button"]!;
    const snapshot = path.join(outDir, revisionPath(revision));
    await writeFile(snapshot, (await readFile(snapshot, "utf8")).replace("colors.text", "evil"));

    expect(await rejection(readBase(cwd, "button"))).toContain(
      `Registry ${revisionPath(revision)} does not hash to its revision`,
    );
  });

  test("changed aliases make a rebuild impossible, and it says so", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry, aliased(registry));
    await addButton(cwd);
    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    await writeFile(path.join(cwd, "shelf.config.json"), json({ registry }));

    expect(await rejection(readBase(cwd, "button"))).toContain(
      `Can't recover BASE for ${BUTTON}: rebuilding revision`,
    );
  });

  test("a revision that exists nowhere is reported with the fix", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry);
    await addButton(cwd);
    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    await writeFile(path.join(registry, SOURCE), V2);

    const message = await rejection(readBase(cwd, "button"));
    expect(message).toContain(`Can't recover BASE for 1 file of button (${BUTTON})`);
    expect(message).toContain("Commit right after shelf add to keep an exact BASE.");
  });
});
