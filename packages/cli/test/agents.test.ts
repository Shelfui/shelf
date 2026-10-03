import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { run } from "../src/cli/program";
import { BLOCK_END, BLOCK_START, skillFile } from "../src/core/agents";
import { REPO_ROOT, fixtureRegistryDir, json, tempDir, writeTree } from "./helpers";

async function shelf(...args: string[]) {
  let stdout = "";
  const exitCode = await run(args, { stdout: (text) => (stdout += text), stderr: () => {} });
  return { exitCode, stdout };
}

async function project(files: Record<string, string> = {}) {
  const cwd = await tempDir("agents");
  await writeTree(cwd, { "package.json": json({ name: "app" }), ...files });
  return cwd;
}

const read = (cwd: string, file: string) => readFile(path.join(cwd, file), "utf8");

describe("shelf init agent files", () => {
  test("writes an AGENTS.md block and the skill", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await project();
    const result = await shelf("init", "--registry", registry, "--cwd", cwd);
    expect(result.exitCode).toBe(0);

    const agents = await read(cwd, "AGENTS.md");
    expect(agents).toStartWith(BLOCK_START);
    expect(agents).toContain(`Registry: ${registry}`);
    expect(agents).toContain("check --json");
    expect(agents.split("\n").length).toBeLessThanOrEqual(15);

    const skill = await read(cwd, ".agents/skills/shelf/SKILL.md");
    expect(skill).toStartWith("---\nname: shelf\ndescription: ");
  });

  test("appends to an existing AGENTS.md without touching it, and is idempotent", async () => {
    const registry = await fixtureRegistryDir();
    const own = "# Our rules\n\nUse tabs.\n";
    const cwd = await project({ "AGENTS.md": own });
    await shelf("init", "--registry", registry, "--cwd", cwd);
    const first = await read(cwd, "AGENTS.md");
    expect(first.startsWith(`${own}\n${BLOCK_START}`)).toBe(true);

    const again = await shelf("init", "--cwd", cwd);
    expect(again.stdout).toContain("AGENTS.md already has the Shelf block");
    expect(await read(cwd, "AGENTS.md")).toBe(first);
  });

  test("replaces only the text between the markers", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await project({
      "AGENTS.md": `before\n${BLOCK_START}\nold text\n${BLOCK_END}\nafter\n`,
    });
    await shelf("init", "--registry", registry, "--cwd", cwd);
    const agents = await read(cwd, "AGENTS.md");
    expect(agents).toStartWith("before\n");
    expect(agents).toEndWith(`${BLOCK_END}\nafter\n`);
    expect(agents).not.toContain("old text");
  });

  test("never overwrites a skill the project edited", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await project({ ".agents/skills/shelf/SKILL.md": "ours\n" });
    await shelf("init", "--registry", registry, "--cwd", cwd);
    expect(await read(cwd, ".agents/skills/shelf/SKILL.md")).toBe("ours\n");
  });

  test("--no-agents writes neither file", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await project();
    await shelf("init", "--registry", registry, "--cwd", cwd, "--no-agents");
    expect(await Bun.file(path.join(cwd, "AGENTS.md")).exists()).toBe(false);
    expect(await Bun.file(path.join(cwd, ".agents")).exists()).toBe(false);
  });

  test("commands match the project's package manager", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await project({ "pnpm-lock.yaml": "" });
    await shelf("init", "--registry", registry, "--cwd", cwd);
    expect(await read(cwd, "AGENTS.md")).toContain("`pnpm exec shelf search <terms>`");
  });

  test("the skill published in this repo is the one init writes", async () => {
    const published = await readFile(path.join(REPO_ROOT, "skills/shelf/SKILL.md"), "utf8");
    expect(published).toBe(skillFile("npx shelf"));
  });
});
