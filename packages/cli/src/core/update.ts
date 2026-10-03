import { add } from "./add";
import { ShelfError } from "./errors";
import { plural } from "./format";
import type { Output } from "./output";
import { itemStatuses, openProject } from "./status";

export interface UpdateOptions {
  cwd: string;
  /** Installed items to update; all with a newer revision when empty. */
  names: string[];
  overwrite: boolean;
  install: boolean;
  out: Output;
}

/**
 * Brings installed items to Shelf's current version: unmodified files are replaced, and your
 * modified files are merged with Shelf's changes. It is `shelf add` for what is installed.
 */
export async function update({
  cwd,
  names,
  overwrite,
  install,
  out,
}: UpdateOptions): Promise<void> {
  const project = await openProject(cwd);
  const notInstalled = names.filter((name) => !project.lock.items[name]);
  if (notInstalled.length > 0) {
    throw new ShelfError(
      `${notInstalled.join(", ")} ${notInstalled.length === 1 ? "is" : "are"} not installed. Run: shelf add ${notInstalled.join(" ")}`,
    );
  }
  const statuses = await itemStatuses(cwd, project);
  const removed = statuses.filter(
    (s) => s.upstream === undefined && (names.length === 0 || names.includes(s.name)),
  );
  const targets =
    names.length > 0
      ? names.filter((name) => !removed.some((s) => s.name === name))
      : statuses.filter((s) => s.updateAvailable).map((s) => s.name);

  if (targets.length === 0) {
    out.log("Shelf");
    out.log();
    for (const s of removed) {
      out.log(`! ${s.name} is no longer in the registry; your copy stays as it is.`);
    }
    out.log(`✓ Everything is up to date (${plural(statuses.length, "item")}).`);
    return;
  }
  await add({ cwd, names: targets, overwrite, install, out });
  for (const s of removed) {
    out.log(`! ${s.name} is no longer in the registry; your copy stays as it is.`);
  }
}
