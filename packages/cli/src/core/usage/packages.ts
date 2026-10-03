import path from "node:path";
import { isObject, readJsonFile } from "../json";
import { join } from "./paths";
import type { Repo, WorkspacePackage } from "./types";

export async function workspacePackages(repo: Repo): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = [];
  for (const file of repo.files) {
    if (path.posix.basename(file) !== "package.json" || file.includes("node_modules/")) continue;
    const manifest = await readJsonFile(path.join(repo.root, file));
    if (!isObject(manifest) || typeof manifest["name"] !== "string") continue;
    const dir = path.posix.dirname(file);
    packages.push({
      name: manifest["name"],
      dir: dir === "." ? "" : dir,
      exports: manifest["exports"],
      main: typeof manifest["main"] === "string" ? manifest["main"] : undefined,
    });
  }
  return packages.toSorted((a, b) => b.name.length - a.name.length);
}

export function packageFor(
  packages: WorkspacePackage[],
  spec: string,
): WorkspacePackage | undefined {
  return packages.find((pkg) => spec === pkg.name || spec.startsWith(`${pkg.name}/`));
}

/**
 * Where `spec` points inside a workspace package, through `exports` (a string, a subpath map,
 * `"./*"` patterns, and `import`/`default` conditions), else `main` or the directory itself.
 */
export function packageTarget(pkg: WorkspacePackage, spec: string): string {
  const subpath = `.${spec.slice(pkg.name.length)}`;
  const exported = exportTarget(pkg.exports, subpath);
  if (exported) return join(pkg.dir, exported);
  if (subpath === ".") return join(pkg.dir, pkg.main ?? "index");
  return join(pkg.dir, subpath);
}

function exportTarget(exports: unknown, subpath: string): string | undefined {
  if (exports === undefined || exports === null) return undefined;
  const isMap = isObject(exports) && Object.keys(exports).some((key) => key.startsWith("."));
  if (!isMap) return subpath === "." ? condition(exports) : undefined;
  const map = exports;
  if (subpath in map) return condition(map[subpath]);
  for (const [key, value] of Object.entries(map)) {
    const star = key.indexOf("*");
    if (star === -1) continue;
    const [before, after] = [key.slice(0, star), key.slice(star + 1)];
    if (subpath.startsWith(before) && subpath.endsWith(after)) {
      const middle = subpath.slice(before.length, subpath.length - after.length);
      return condition(value)?.replaceAll("*", middle);
    }
  }
  return undefined;
}

function condition(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(condition).find(Boolean);
  if (!isObject(value)) return undefined;
  for (const key of ["import", "default", "types", "require"]) {
    const found = condition(value[key]);
    if (found) return found;
  }
  return undefined;
}
