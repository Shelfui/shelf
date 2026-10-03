import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readBase } from "./base";
import { ShelfError } from "./errors";
import { exec } from "./exec";
import { planFiles } from "./install-plan";
import { LOCK_FILE } from "./lock";
import type { Output } from "./output";
import { resolveInside } from "./paths";
import { loadIndex } from "./registry";
import { resolveItems } from "./resolve";
import { openProject } from "./status";

export interface DiffOptions {
  cwd: string;
  name: string;
  /** Your changes (BASE to your files) instead of Shelf's (BASE to Shelf's version). */
  local: boolean;
  out: Output;
}

export async function diff({ cwd, name, local, out }: DiffOptions): Promise<void> {
  const project = await openProject(cwd);
  const locked = project.lock.items[name];
  if (!locked) {
    throw new ShelfError(
      `${name} is not installed: it has no entry in ${LOCK_FILE}. Run: shelf add ${name}`,
    );
  }
  const base = await readBase(cwd, name);
  const other = new Map<string, string>();
  if (local) {
    for (const target of Object.keys(locked.files)) {
      const absolute = resolveInside(cwd, target);
      if (existsSync(absolute)) other.set(target, await readFile(absolute, "utf8"));
    }
  } else {
    const index = await loadIndex(project.registry);
    if (!index.some((entry) => entry.name === name)) {
      throw new ShelfError(`${name} is no longer in the registry, so there is nothing to compare.`);
    }
    const resolved = await resolveItems(project.registry, index, [name]);
    for (const file of planFiles(resolved, project.config)) {
      if (file.item === name) other.set(file.target, file.content);
    }
  }

  const label = local ? "yours" : "shelf";
  const text = await diffTrees(base, other, label);
  if (text === "") {
    out.log(
      local
        ? `You haven't changed ${name} since it was installed.`
        : `Shelf's ${name} hasn't changed since you installed it.`,
    );
    return;
  }
  out.log(text.trimEnd());
}

/** A unified diff of two sets of files, with paths shown as `base/<path>` and `<label>/<path>`. */
async function diffTrees(
  base: Map<string, string>,
  other: Map<string, string>,
  label: string,
): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "shelf-diff-"));
  try {
    for (const [side, files] of [
      ["base", base],
      [label, other],
    ] as const) {
      await mkdir(path.join(dir, side));
      for (const [target, content] of files) {
        const file = path.join(dir, side, target);
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, content);
      }
    }
    const { stdout, stderr, exitCode } = await exec(
      ["git", "diff", "--no-index", "--no-color", "--no-ext-diff", "--no-prefix", "base", label],
      { cwd: dir },
    );
    if (exitCode === 127 && !stdout) {
      throw new ShelfError("shelf diff needs git, which was not found.");
    }
    if (exitCode > 1) throw new ShelfError(`git diff failed: ${stderr.trim()}`);
    return stdout;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
