import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { run } from "../src/cli/program";
import { fixtureConsumer, fixtureRegistryDir, json, tempDir, writeTree } from "./helpers";

async function shelf(...args: string[]) {
  let stdout = "";
  let stderr = "";
  const exitCode = await run(args, {
    stdout: (text) => (stdout += text),
    stderr: (text) => (stderr += text),
  });
  return { exitCode, stdout, stderr };
}

/** The one JSON object a --json command prints, and nothing else. */
function parse(stdout: string): Record<string, unknown> {
  const value: unknown = JSON.parse(stdout);
  if (typeof value !== "object" || value === null) throw new Error("expected a JSON object");
  return Object.fromEntries(Object.entries(value));
}

describe("--json", () => {
  test("search lists matches as data", async () => {
    const registry = await fixtureRegistryDir();
    const result = await shelf("search", "card", "--registry", registry, "--json");
    expect(result.exitCode).toBe(0);
    expect(parse(result.stdout)).toEqual({
      query: "card",
      items: [{ name: "card", type: "component", description: "A card surface." }],
    });
    const none = await shelf("search", "zzz", "--registry", registry, "--json");
    expect(parse(none.stdout)).toEqual({ query: "zzz", items: [] });
  });

  test("status reports the project and each item", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry);
    await shelf("add", "tokens", "--cwd", cwd, "--skip-install");

    const clean = parse((await shelf("status", "--cwd", cwd, "--json")).stdout);
    expect(clean["project"]).toMatchObject({
      registry,
      paths: { components: "src/components/ui" },
    });
    expect(clean["summary"]).toEqual({ installed: 1, modified: 0, updates: 0 });
    expect(clean["items"]).toMatchObject([
      { name: "tokens", modified: false, updateAvailable: false, modifiedFiles: [] },
    ]);

    await writeFile(path.join(cwd, "src/styles/shelf/tokens.stylex.ts"), "// changed\n");
    const changed = parse((await shelf("status", "tokens", "nope", "--cwd", cwd, "--json")).stdout);
    expect(changed["items"]).toMatchObject([
      { name: "tokens", modified: true, modifiedFiles: ["src/styles/shelf/tokens.stylex.ts"] },
    ]);
    expect(changed["notInstalled"]).toEqual(["nope"]);
  });

  test("check names the file, the problem, and the fix", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry);
    await shelf("add", "tokens", "--cwd", cwd, "--skip-install");

    const passing = await shelf("check", "--cwd", cwd, "--only", "provenance", "--json");
    expect(passing.exitCode).toBe(0);
    expect(parse(passing.stdout)).toMatchObject({
      ok: true,
      steps: [{ name: "provenance", status: "pass", issues: [] }],
    });

    await rm(path.join(cwd, "src/styles/shelf/tokens.stylex.ts"));
    const failing = await shelf("check", "--cwd", cwd, "--only", "provenance", "--json");
    expect(failing.exitCode).toBe(1);
    expect(failing.stderr).toBe("");
    expect(parse(failing.stdout)).toMatchObject({
      ok: false,
      steps: [
        {
          name: "provenance",
          status: "fail",
          issues: [
            {
              file: "src/styles/shelf/tokens.stylex.ts",
              problem: expect.stringContaining("missing"),
              fix: "shelf add tokens --overwrite",
            },
          ],
        },
      ],
    });
  });

  test("check --json reports a missing config as an issue", async () => {
    const cwd = await tempDir("json-check");
    await writeTree(cwd, { "package.json": json({ name: "app" }) });
    const result = await shelf("check", "--cwd", cwd, "--json");
    expect(result.exitCode).toBe(1);
    const report = parse(result.stdout);
    expect(report["ok"]).toBe(false);
    const steps = report["steps"];
    if (!Array.isArray(steps)) throw new Error("expected steps");
    expect(steps[0]).toMatchObject({
      name: "config",
      issues: [{ file: "shelf.config.json", fix: expect.any(String) }],
    });
  });

  test("diff returns the unified diff", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry);
    await shelf("add", "tokens", "--cwd", cwd, "--skip-install");
    const same = parse((await shelf("diff", "tokens", "--cwd", cwd, "--local", "--json")).stdout);
    expect(same).toEqual({ item: "tokens", mode: "local", changed: false, diff: "" });

    await writeFile(path.join(cwd, "src/styles/shelf/tokens.stylex.ts"), "// changed\n");
    const local = parse((await shelf("diff", "tokens", "--cwd", cwd, "--local", "--json")).stdout);
    expect(local["changed"]).toBe(true);
    expect(local["diff"]).toContain("// changed");
  });
});
