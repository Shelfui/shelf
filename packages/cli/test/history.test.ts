import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { check } from "../src/core/check";
import { readLock } from "../src/core/lock";
import { status } from "../src/core/status";
import { update } from "../src/core/update";
import { REAL_REGISTRY, REPO_ROOT, capture, fixtureConsumer, json, tempDir } from "./helpers";

/**
 * Replays Shelf's own history. The registry as it was at the first commit is installed into a
 * consumer, the consumer edits the files, and the registry moves to today's source. This is
 * the situation every real consumer is in, with real components instead of a one-line fixture.
 */

const ITEMS = ["button", "dialog", "select", "data-table"];

function git(cwd: string, ...args: string[]): string {
  const result = Bun.spawnSync(
    ["git", "-c", "user.name=Shelf", "-c", "user.email=shelf@example.com", ...args],
    { cwd },
  );
  if (result.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.toString()}`);
  return result.stdout.toString().trim();
}

/** The first commit of this repository, or null when the clone is too shallow to have it. */
function firstCommit(): string | null {
  try {
    if (git(REPO_ROOT, "rev-parse", "--is-shallow-repository") === "true") return null;
    return git(REPO_ROOT, "rev-list", "--max-parents=0", "HEAD").split("\n")[0] ?? null;
  } catch {
    return null;
  }
}

const first = firstCommit();

/** The registry directory as it was at `commit`. */
async function registryAt(commit: string): Promise<string> {
  const dir = await tempDir("history");
  const archive = Bun.spawnSync(["git", "archive", commit, "registry"], { cwd: REPO_ROOT });
  if (archive.exitCode !== 0) throw new Error(archive.stderr.toString());
  const extract = Bun.spawnSync(["tar", "-x", "-C", dir], { stdin: archive.stdout });
  if (extract.exitCode !== 0) throw new Error(extract.stderr.toString());
  return path.join(dir, "registry");
}

/** Replaces the contents of `dir` with today's registry, keeping `dir` as the registry's address. */
async function moveToToday(dir: string): Promise<void> {
  for (const entry of await readdir(dir)) await rm(path.join(dir, entry), { recursive: true });
  await cp(REAL_REGISTRY, dir, { recursive: true });
}

/**
 * A consumer that already lists every package the items need, then and now, so nothing is
 * installed. Today's source can need packages the first commit did not.
 */
async function consumer(registry: string) {
  const dependencies: Record<string, string> = {};
  for (const root of [registry, REAL_REGISTRY]) {
    for (const file of await readdir(root, { recursive: true })) {
      if (!file.endsWith("registry.json")) continue;
      const manifest = JSON.parse(await readFile(path.join(root, file), "utf8"));
      for (const name of Object.keys(manifest.dependencies ?? {})) dependencies[name] = "*";
    }
  }
  return fixtureConsumer(registry, {
    "package.json": json({ name: "consumer", private: true, dependencies }),
  });
}

const run = async (fn: (out: ReturnType<typeof capture>) => Promise<unknown>) => {
  const out = capture();
  await fn(out);
  return out.text();
};

/** The two edits a team makes without thinking: a note at the top and a helper at the bottom. */
async function localEdit(file: string, name: string): Promise<void> {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  const lastImport = lines.findLastIndex((line) => /^import\s|^} from /.test(line));
  lines.splice(lastImport + 1, 0, `// Acme: local change to ${name}.`);
  await writeFile(
    file,
    `${lines.join("\n").trimEnd()}\nexport const ACME_${name.replace(/\W/g, "_").toUpperCase()} = true;\n`,
  );
}

describe.skipIf(first === null)("updating across Shelf's real history", () => {
  test("keeps local edits to real components and brings in Shelf's changes", async () => {
    const registry = await registryAt(first!);
    const cwd = await consumer(registry);
    await add({ cwd, names: ITEMS, overwrite: false, install: false, out: capture() });
    git(cwd, "init", "-q");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "shelf add");

    const lock = await readLock(cwd);
    const edited: string[] = [];
    for (const name of ITEMS) {
      const [target] = Object.keys(lock.items[name]!.files).filter(
        (file) => file.endsWith(`${name}.tsx`) && !file.includes(".stories"),
      );
      expect(target).toBeDefined();
      await localEdit(path.join(cwd, target!), name);
      edited.push(target!);
    }

    await moveToToday(registry);

    const before = await run((out) => status({ cwd, names: [], out }));
    expect(before).not.toContain("Everything is up to date");

    const text = await run((out) =>
      update({ cwd, names: [], overwrite: false, install: false, out }),
    );
    expect(text).not.toContain("conflict");

    // Every local edit survived the update.
    for (const target of edited) {
      const merged = await readFile(path.join(cwd, target), "utf8");
      expect(merged).toContain("// Acme: local change to");
      expect(merged).not.toContain("<<<<<<<");
    }

    // The lock moved forward, so a second update has nothing left to do.
    const again = await run((out) =>
      update({ cwd, names: [], overwrite: false, install: false, out }),
    );
    expect(again).toContain("Everything is up to date");

    // And what is installed is still valid.
    const report = capture();
    const passed = await check({ cwd, only: undefined, verbose: false, out: report });
    expect({ passed, report: report.text() }).toMatchObject({ passed: true });
  }, 120_000);
});
