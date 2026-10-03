import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ShelfError } from "./errors";
import { isObject, parseJson } from "./json";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const LOCKFILES: Array<[string, PackageManager]> = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
];

function parse(value: unknown): PackageManager | undefined {
  if (typeof value !== "string") return undefined;
  const name = value.split("@")[0];
  return PACKAGE_MANAGERS.find((pm) => pm === name);
}

/**
 * The package manager a project uses: the nearest package.json `packageManager` field, then
 * the nearest lockfile, then the one running this command (Bun, if it runs Shelf), then npm.
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  let dir = path.resolve(cwd);
  for (;;) {
    const manifest = path.join(dir, "package.json");
    if (existsSync(manifest)) {
      try {
        const fromField = parse(JSON.parse(await readFile(manifest, "utf8")).packageManager);
        if (fromField) return fromField;
      } catch {
        // An unreadable package.json says nothing about the package manager.
      }
    }
    const lockfile = LOCKFILES.find(([file]) => existsSync(path.join(dir, file)));
    if (lockfile) return lockfile[1];
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const agent = parse(process.env["npm_config_user_agent"]?.split("/")[0]);
  return agent ?? (process.versions["bun"] ? "bun" : "npm");
}

/** The command that adds packages, as argv. */
export function addArgs(pm: PackageManager, specs: string[], { dev = false } = {}): string[] {
  const install = pm === "npm" ? ["npm", "install"] : [pm, "add"];
  return [...install, ...(dev ? [pm === "bun" ? "-d" : "-D"] : []), ...specs];
}

/** The command that runs a locally installed bin, as argv. */
export function runArgs(pm: PackageManager, bin: string, args: string[] = []): string[] {
  const runner = { npm: ["npx"], pnpm: ["pnpm", "exec"], yarn: ["yarn"], bun: ["bunx"] }[pm];
  return [...runner, bin, ...args];
}

/** Hints for people and agents: the same argv, as one line. */
export const addHint = (pm: PackageManager, specs: string[], options?: { dev?: boolean }) =>
  addArgs(pm, specs, options).join(" ");

/** Every package named in the project's package.json, in any dependency field. */
export async function declaredPackages(cwd: string): Promise<Set<string>> {
  const manifestPath = path.join(cwd, "package.json");
  if (!existsSync(manifestPath)) {
    throw new ShelfError(`No package.json in ${cwd}. Run shelf from your project root.`);
  }
  const manifest = parseJson(await readFile(manifestPath, "utf8"), "package.json");
  if (!isObject(manifest)) return new Set();
  return new Set(
    ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"].flatMap(
      (field) => {
        const deps = manifest[field];
        return isObject(deps) ? Object.keys(deps) : [];
      },
    ),
  );
}
