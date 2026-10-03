import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isObject } from "./json";
import { parseJsonc } from "./jsonc";

/**
 * The project's own `compilerOptions.paths`, so installed files import the way the app does.
 * Vite templates keep them in `tsconfig.app.json`. Only single-target directory wildcards
 * such as `"@/*": ["./src/*"]` are used; `extends` is not followed.
 */
export async function tsconfigAliases(cwd: string): Promise<Record<string, string>> {
  for (const name of ["tsconfig.json", "tsconfig.app.json"]) {
    const file = path.join(cwd, name);
    if (!existsSync(file)) continue;
    let tsconfig: unknown;
    try {
      tsconfig = parseJsonc(await readFile(file, "utf8"));
    } catch {
      continue;
    }
    const options = isObject(tsconfig) ? tsconfig["compilerOptions"] : undefined;
    if (!isObject(options) || !isObject(options["paths"])) continue;
    const baseUrl = typeof options["baseUrl"] === "string" ? options["baseUrl"] : ".";
    const aliases: Record<string, string> = {};
    for (const [alias, targets] of Object.entries(options["paths"])) {
      if (!Array.isArray(targets) || targets.length !== 1 || typeof targets[0] !== "string") {
        continue;
      }
      const target = path.posix.join(baseUrl, targets[0]);
      if (!/^[^.\s*][^\s*]*\/\*$/.test(alias) || !/^(?:[^*.][^*]*\/)?\*$/.test(target)) continue;
      aliases[alias] = target;
    }
    if (Object.keys(aliases).length > 0) return aliases;
  }
  return {};
}
