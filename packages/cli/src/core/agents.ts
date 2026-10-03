import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Output } from "./output";
import { type PackageManager, runArgs } from "./package-manager";

export const AGENTS_FILE = "AGENTS.md";
export const SKILL_FILE = ".agents/skills/shelf/SKILL.md";
export const BLOCK_START = "<!-- shelf:start -->";
export const BLOCK_END = "<!-- shelf:end -->";

/** `npx shelf`, `pnpm exec shelf`, and so on: how this project runs the CLI. */
export function runner(pm: PackageManager): string {
  return runArgs(pm, "shelf").join(" ");
}

/**
 * The block `shelf init` puts in AGENTS.md. Short on purpose: it is read on every prompt, so it
 * holds only what an agent would get wrong without it, and points to the skill for the rest.
 */
export function agentsBlock(shelf: string, registry: string): string {
  return `${BLOCK_START}
## Shelf

Shelf components are copied into this repo as source. Edit them freely: \`.shelf/lock.json\` records what was installed, so updates still merge. Registry: ${registry}

- Before building UI, search: \`${shelf} search <terms>\`. Add what exists with \`${shelf} add <item>\` and adapt it.
- Read an item's docs and examples with \`${shelf} docs <item>\`.
- Before finishing, run \`${shelf} check --json\`, apply each issue's \`fix\`, and run it again.
- Do not edit \`.shelf/\` by hand. More in \`${SKILL_FILE}\`.
${BLOCK_END}
`;
}

/** The Shelf skill, in the SKILL.md format coding agents load on demand. */
export function skillFile(shelf: string): string {
  return `---
name: shelf
description: Adds, searches, updates, and checks Shelf components, the source-owned React and StyleX components in this project. Use when building UI, when the project has a shelf.config.json or a .shelf directory, or when asked about Shelf.
---

# Shelf

Shelf installs components as normal source files in this project and records what it installed in \`.shelf/lock.json\`. The files are the project's: change them like any other code. Shelf can still tell your changes from its own, so \`${shelf} update\` merges instead of overwriting.

## Before building UI

1. See what is installed and how the project is set up: \`${shelf} status --json\`. It reports the package manager, registry, paths, import aliases, and each item's revision, local changes, and available updates.
2. Look for an existing component: \`${shelf} search <terms> --json\`.
3. Read its documentation and examples: \`${shelf} docs <item>\`. Run \`${shelf} docs\` to list topics.
4. Add it: \`${shelf} add <item>\`. This copies the source, installs its packages, and records provenance.

Use the installed component and adapt it. Do not build a new one when a Shelf item covers the need.

## Changing components

Edit the installed files directly. Use semantic tokens from the foundations (for example \`colors.surface\`) instead of raw values, and keep styles in StyleX. Do not import an icon library directly in installed files: use the project's \`icons\` item.

## Before finishing

Run \`${shelf} check --json\`. It validates config, provenance, dependencies, and imports of installed files. Each issue has a \`file\`, a \`problem\`, and usually a \`fix\` command. Apply the fixes and run it again until \`ok\` is true. It does not run the project's TypeScript, lint, or build; run those too.

## Updating

\`${shelf} status --json\` shows items with \`updateAvailable\`. \`${shelf} diff <item>\` shows what an update brings. \`${shelf} update\` merges Shelf's changes into files that were edited. If it leaves conflict markers (\`<<<<<<< yours\`), resolve them using \`${shelf} diff <item> --local\` for context, then run check.

## Rules

- Never edit \`.shelf/lock.json\` by hand.
- Do not pass \`--overwrite\` unless the user asked to discard their changes to a file.
- Commit \`.shelf/\` together with the components.
`;
}

export interface AgentFilesOptions {
  cwd: string;
  pm: PackageManager;
  registry: string;
  out: Output;
}

/**
 * Writes the AGENTS.md block and the skill. Re-running replaces only the text between the
 * markers; the rest of AGENTS.md is never touched. An existing skill file is left alone.
 */
export async function writeAgentFiles({
  cwd,
  pm,
  registry,
  out,
}: AgentFilesOptions): Promise<void> {
  const shelf = runner(pm);
  const block = agentsBlock(shelf, registry);

  const agentsPath = path.join(cwd, AGENTS_FILE);
  const existing = existsSync(agentsPath) ? await readFile(agentsPath, "utf8") : undefined;
  if (existing === undefined) {
    await writeFile(agentsPath, block);
    out.log(`✓ created ${AGENTS_FILE} with Shelf instructions for coding agents`);
  } else {
    const start = existing.indexOf(BLOCK_START);
    const end = existing.indexOf(BLOCK_END);
    if (start !== -1 && end > start) {
      const next =
        existing.slice(0, start) + block.trimEnd() + existing.slice(end + BLOCK_END.length);
      if (next === existing) {
        out.log(`✓ ${AGENTS_FILE} already has the Shelf block`);
      } else {
        await writeFile(agentsPath, next);
        out.log(`✓ updated the Shelf block in ${AGENTS_FILE}`);
      }
    } else {
      const separator = existing.endsWith("\n") ? "\n" : "\n\n";
      await writeFile(agentsPath, `${existing}${separator}${block}`);
      out.log(`✓ added the Shelf block to ${AGENTS_FILE}`);
    }
  }

  const skillPath = path.join(cwd, SKILL_FILE);
  if (existsSync(skillPath)) {
    out.log(`✓ ${SKILL_FILE} already exists`);
  } else {
    await mkdir(path.dirname(skillPath), { recursive: true });
    await writeFile(skillPath, skillFile(shelf));
    out.log(`✓ created ${SKILL_FILE}`);
  }
}
