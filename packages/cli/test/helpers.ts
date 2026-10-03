import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll } from "bun:test";
import type { Output } from "../src/core/output";

export const REPO_ROOT = path.resolve(import.meta.dir, "../../..");
export const CLI = path.join(REPO_ROOT, "packages/cli/src/index.ts");
export const REAL_REGISTRY = path.join(REPO_ROOT, "registry");

/** The CLI's own version, so tests don't change on every release. */
export const CLI_VERSION: string = (
  await Bun.file(path.join(REPO_ROOT, "packages/cli/package.json")).json()
).version;

const TEMP_ROOT = path.join(REPO_ROOT, ".tmp/tests");
const created: string[] = [];

/**
 * Temp directories live inside the repo (under the ignored `.tmp/`) so tools
 * such as tsc, oxlint, and vite resolve from the repo's node_modules.
 */
export async function tempDir(prefix: string, { outsideRepo = false } = {}): Promise<string> {
  const root = outsideRepo ? tmpdir() : TEMP_ROOT;
  await mkdir(root, { recursive: true });
  const dir = await mkdtemp(path.join(root, `shelf-${prefix}-`));
  created.push(dir);
  return dir;
}

afterAll(async () => {
  await Promise.all(created.map((dir) => rm(dir, { recursive: true, force: true })));
});

export async function writeTree(root: string, files: Record<string, string>): Promise<void> {
  for (const [file, content] of Object.entries(files)) {
    const absolute = path.join(root, file);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
  }
}

/** Resolves to the rejection message; fails the test if the promise resolves. */
export async function rejection(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("Expected the promise to reject, but it resolved.");
}

export function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export interface Captured extends Output {
  lines: string[];
  text(): string;
}

export function capture(): Captured {
  const lines: string[] = [];
  return {
    lines,
    log: (line = "") => lines.push(line),
    text: () => lines.join("\n"),
  };
}

export async function runCli(args: string[], cwd: string, env: Record<string, string> = {}) {
  const proc = Bun.spawn([process.execPath, CLI, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, ...env },
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

/** A small synthetic registry: tokens <- button <- card, and card -> tokens (a diamond). */
export function fixtureRegistry(): Record<string, string> {
  return {
    "index.json": json({
      items: [
        { name: "tokens", type: "foundation", description: "Design tokens.", path: "foundations" },
        { name: "button", type: "component", description: "A button.", path: "components/button" },
        {
          name: "card",
          type: "component",
          description: "A card surface.",
          path: "components/card",
        },
      ],
    }),
    "foundations/registry.json": json({
      name: "tokens",
      type: "foundation",
      description: "Design tokens.",
      files: [{ path: "tokens.stylex.ts" }],
      dependencies: { "@stylexjs/stylex": "^0.19.1" },
      shelfDependencies: [],
    }),
    "foundations/tokens.stylex.ts": `export const colors = { text: "black" };\n`,
    "components/button/registry.json": json({
      name: "button",
      type: "component",
      description: "A button.",
      files: [{ path: "button.tsx" }],
      dependencies: { "@base-ui/react": "^1.8.0" },
      shelfDependencies: ["tokens"],
    }),
    "components/button/button.tsx": `import { colors } from "../../foundations/tokens.stylex";\nexport const Button = () => colors.text;\n`,
    "components/card/registry.json": json({
      name: "card",
      type: "component",
      description: "A card surface.",
      files: [{ path: "card.tsx" }],
      dependencies: {},
      shelfDependencies: ["button", "tokens"],
    }),
    "components/card/card.tsx": `import { Button } from "../button/button";\nimport { colors } from "../../foundations/tokens.stylex";\nexport const Card = () => [Button, colors];\n`,
  };
}

/** A consumer whose package.json already has every fixture dependency, so no install runs. */
export async function fixtureConsumer(registry: string, extra: Record<string, string> = {}) {
  const dir = await tempDir("consumer");
  await writeTree(dir, {
    "package.json": json({
      name: "consumer",
      private: true,
      dependencies: { "@stylexjs/stylex": "0.19.1", "@base-ui/react": "1.8.0" },
    }),
    "shelf.config.json": json({ registry }),
    ...extra,
  });
  return dir;
}

export async function fixtureRegistryDir(overrides: Record<string, string> = {}) {
  const dir = await tempDir("registry");
  await writeTree(dir, { ...fixtureRegistry(), ...overrides });
  return dir;
}
