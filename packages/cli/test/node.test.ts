import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, expect, test } from "bun:test";
import { CLI_VERSION, REPO_ROOT, fixtureRegistryDir, json, tempDir, writeTree } from "./helpers";

const node = Bun.which("node");
let bundle: string;

async function runNode(args: string[], cwd: string) {
  const proc = Bun.spawn([node ?? "node", bundle, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

beforeAll(async () => {
  bundle = path.join(await tempDir("node-bundle"), "shelf.js");
  const build = Bun.spawnSync(
    [process.execPath, "build", "src/index.ts", "--target", "node", "--outfile", bundle],
    { cwd: path.join(REPO_ROOT, "packages/cli") },
  );
  if (build.exitCode !== 0) throw new Error(build.stderr.toString());
});

describe.skipIf(!node)("the CLI on Node, without Bun", () => {
  test("help and version", async () => {
    const help = await runNode(["--help"], REPO_ROOT);
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain("Usage: shelf");
    expect((await runNode(["--version"], REPO_ROOT)).stdout).toBe(`${CLI_VERSION}\n`);
  });

  test("init reads tsconfig paths with comments, then search and add work", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await tempDir("node-consumer");
    await writeTree(cwd, {
      "package.json": json({ name: "consumer", private: true }),
      "tsconfig.json": `{\n  // aliases\n  "compilerOptions": { "paths": { "@/*": ["./src/*"], } },\n}\n`,
    });
    const init = await runNode(["init", "--registry", registry], cwd);
    expect(init.stderr).toBe("");
    expect(init.stdout).toContain("imports use the @/* alias");

    const search = await runNode(["search", "button"], cwd);
    expect(search.exitCode).toBe(0);
    expect(search.stdout).toContain("button");

    const add = await runNode(["add", "tokens", "--skip-install"], cwd);
    expect(add.stderr).toBe("");
    expect(add.exitCode).toBe(0);
    expect(existsSync(path.join(cwd, ".shelf/lock.json"))).toBe(true);
    expect(await readFile(path.join(cwd, ".shelf/lock.json"), "utf8")).toContain('"tokens"');
  });

  test("check runs", async () => {
    const cwd = await tempDir("node-check", { outsideRepo: true });
    await writeTree(cwd, {
      "package.json": json({ name: "consumer", private: true }),
      "shelf.config.json": json({ registry: "./registry" }),
    });
    const result = await runNode(["check"], cwd);
    expect(result.stdout).toContain("✓ config       registry ./registry");
    expect(result.exitCode).toBe(0);
  });
});
