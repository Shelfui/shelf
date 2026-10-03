import path from "node:path";
import type { ShelfConfig } from "./config";
import { ShelfError } from "./errors";
import { RESOLVE_SUFFIXES, SOURCE } from "./imports";
import type { ItemType, RegistryItem } from "./registry";

export interface PlannedFile {
  item: string;
  /** Path relative to the item directory, e.g. `button.tsx`. */
  source: string;
  /** Path relative to the consumer project, e.g. `src/components/ui/button.tsx`. */
  target: string;
  content: string;
}

const TARGET_PATH: Record<ItemType, keyof ShelfConfig["paths"]> = {
  component: "components",
  block: "blocks",
  foundation: "foundations",
  lib: "lib",
};

function targetDirectory(type: ItemType, paths: ShelfConfig["paths"]): string {
  return paths[TARGET_PATH[type]];
}

/** Maps every registry file to its location in the consumer and rewrites imports between them. */
export function planFiles(
  items: RegistryItem[],
  { paths, aliases }: Pick<ShelfConfig, "paths" | "aliases">,
): PlannedFile[] {
  const targets = new Map<string, string>();
  const owners = new Map<string, string>();
  for (const item of items) {
    const directory = targetDirectory(item.type, paths);
    for (const file of item.files) {
      const target = path.posix.join(directory, file.path);
      const owner = owners.get(target);
      if (owner) {
        throw new ShelfError(
          `Items "${owner}" and "${item.name}" would both install ${target}. Rename one of the files in the registry.`,
        );
      }
      owners.set(target, item.name);
      targets.set(path.posix.join(item.path, file.path), target);
    }
  }

  return items.flatMap((item) =>
    item.files.map((file) => {
      const registryPath = path.posix.join(item.path, file.path);
      const target = targets.get(registryPath)!;
      return {
        item: item.name,
        source: file.path,
        target,
        content: installedContent(file.content, registryPath, target, targets, item.name, aliases),
      };
    }),
  );
}

/** The bytes Shelf writes for a registry file, given where every installed file lives. */
export function installedContent(
  content: string,
  registryPath: string,
  targetPath: string,
  targets: Map<string, string>,
  itemName: string,
  aliases: Record<string, string>,
): string {
  return SOURCE.test(registryPath)
    ? rewriteImports(content, registryPath, targetPath, targets, itemName, aliases)
    : content;
}

/**
 * Rewrites relative module specifiers (`from "./x"`, `import("./x")`, `import "./x"`)
 * that point at other registry files so they point at the installed locations: relative
 * within a directory, and through a matching alias across directories when one is
 * configured. Package imports are untouched. A relative import that points at a file that is
 * not being installed is a registry bug and fails loudly rather than producing
 * broken source.
 */
export function rewriteImports(
  content: string,
  registryPath: string,
  targetPath: string,
  targets: Map<string, string>,
  itemName: string,
  aliases: Record<string, string> = {},
): string {
  const specifier = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"'\n]*)\2/g;
  return content.replace(specifier, (match, prefix: string, quote: string, spec: string) => {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(registryPath), spec));
    const suffix = RESOLVE_SUFFIXES.find((candidate) => targets.has(resolved + candidate));
    if (suffix === undefined) {
      throw new ShelfError(
        `Registry item "${itemName}": ${registryPath} imports "${spec}", which is not a file of this item or of its shelfDependencies.`,
      );
    }
    const installed = targets.get(resolved + suffix)!.slice(0, suffix ? -suffix.length : undefined);
    const rewritten =
      (path.posix.dirname(installed) !== path.posix.dirname(targetPath) &&
        aliasFor(installed, aliases)) ||
      relativeSpecifier(targetPath, installed);
    return rewritten === spec ? match : `${prefix}${quote}${rewritten}${quote}`;
  });
}

function relativeSpecifier(from: string, to: string): string {
  const relative = path.posix.relative(path.posix.dirname(from), to);
  return relative.startsWith(".") ? relative : `./${relative}`;
}

/** The most specific alias whose directory contains `file`, e.g. `@/components/ui/button`. */
function aliasFor(file: string, aliases: Record<string, string>): string | undefined {
  let best: { alias: string; directory: string } | undefined;
  for (const [alias, target] of Object.entries(aliases)) {
    const directory = target.slice(0, -1);
    if (file.startsWith(directory) && directory.length >= (best?.directory.length ?? -1)) {
      best = { alias, directory };
    }
  }
  return best && best.alias.slice(0, -1) + file.slice(best.directory.length);
}
