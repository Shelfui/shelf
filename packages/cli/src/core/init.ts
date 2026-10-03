import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CONFIG_FILE, CONFIG_SCHEMA, DEFAULT_PATHS, isHttpRegistry, readConfig } from "./config";
import { ShelfError } from "./errors";
import { isObject, parseJson } from "./json";
import { LOCK_FILE, SHELF_DIR, emptyLock, writeLock } from "./lock";
import type { Output } from "./output";
import { addHint, detectPackageManager } from "./package-manager";
import { loadIndex, projectRegistry } from "./registry";
import { tsconfigAliases } from "./tsconfig";

export interface InitOptions {
  cwd: string;
  registry: string | undefined;
  /** `Name: value` request headers for an http(s) registry. */
  header: string[];
  out: Output;
}

/** `Name: value` pairs from `--header`, kept unexpanded so `${VAR}` stays out of the file. */
function parseHeaders(values: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const value of values) {
    const colon = value.indexOf(":");
    const name = value.slice(0, colon).trim();
    if (colon <= 0 || name === "") {
      throw new ShelfError(
        `--header must be "Name: value", e.g. --header 'Authorization: Bearer \${SHELF_REGISTRY_TOKEN}'. Got "${value}".`,
      );
    }
    headers[name] = value.slice(colon + 1).trim();
  }
  return headers;
}

export async function init({ cwd, registry, header, out }: InitOptions): Promise<void> {
  if (!existsSync(path.join(cwd, "package.json"))) {
    throw new ShelfError(`No package.json in ${cwd}. Run shelf init from your project root.`);
  }
  out.log("Shelf");
  out.log();

  const configPath = path.join(cwd, CONFIG_FILE);
  if (existsSync(configPath)) {
    const config = await readConfig(cwd);
    out.log(`✓ ${CONFIG_FILE} already exists (registry: ${config.registry})`);
  } else {
    const location = registry ?? process.env["SHELF_REGISTRY"];
    if (!location) {
      throw new ShelfError(
        "No registry given. Run: shelf init --registry <path-or-url> (or set SHELF_REGISTRY).",
      );
    }
    const headers = parseHeaders(header);
    if (Object.keys(headers).length > 0 && !isHttpRegistry(location)) {
      throw new ShelfError(
        `--header only applies to an http(s) registry, and "${location}" is a directory.`,
      );
    }
    const items = await loadIndex(
      await projectRegistry(
        { registry: location, headers, paths: DEFAULT_PATHS, aliases: {} },
        cwd,
      ),
    );
    const aliases = await tsconfigAliases(cwd);
    const config = {
      $schema: CONFIG_SCHEMA,
      registry: Object.keys(headers).length > 0 ? { url: location, headers } : location,
      paths: DEFAULT_PATHS,
      ...(Object.keys(aliases).length > 0 && { aliases }),
    };
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    out.log(`✓ created ${CONFIG_FILE} (registry: ${location}, ${items.length} items)`);
    for (const [alias, target] of Object.entries(aliases)) {
      out.log(`✓ imports use the ${alias} alias (${target}) from tsconfig`);
    }
  }

  await mkdir(path.join(cwd, SHELF_DIR), { recursive: true });
  if (existsSync(path.join(cwd, LOCK_FILE))) {
    out.log(`✓ ${LOCK_FILE} already exists`);
  } else {
    await writeLock(cwd, emptyLock());
    out.log(`✓ created ${LOCK_FILE}`);
  }

  for (const warning of await styleXWarnings(cwd)) out.log(`! ${warning}`);
  out.log();
  out.log("Next: shelf add button");
}

async function styleXWarnings(cwd: string): Promise<string[]> {
  const manifest = parseJson(
    await readFile(path.join(cwd, "package.json"), "utf8"),
    "package.json",
  );
  const field = (key: string) =>
    isObject(manifest) && isObject(manifest[key]) ? manifest[key] : {};
  const dev = { ...field("dependencies"), ...field("devDependencies") };
  const warnings: string[] = [];
  const files = await readdir(cwd);
  const pm = await detectPackageManager(cwd);
  if (dev["next"]) {
    for (const plugin of ["@stylexjs/babel-plugin", "@stylexjs/postcss-plugin"]) {
      if (!dev[plugin])
        warnings.push(`StyleX ${plugin} missing. Run: ${addHint(pm, [plugin], { dev: true })}`);
    }
    if (!files.some((file) => /^(babel\.config|\.babelrc)/.test(file))) {
      warnings.push(
        "No babel.config.js found. Next.js compiles StyleX with @stylexjs/babel-plugin.",
      );
    }
    if (!files.some((file) => file.startsWith("postcss.config."))) {
      warnings.push("No postcss.config.js found. @stylexjs/postcss-plugin writes the CSS.");
    }
    return warnings;
  }
  if (!dev["@stylexjs/unplugin"]) {
    warnings.push(
      `StyleX build plugin missing. Run: ${addHint(pm, ["@stylexjs/unplugin"], { dev: true })}`,
    );
  }
  const viteConfig = files.find((file) => /^vite\.config\.[cm]?[jt]s$/.test(file));
  if (!viteConfig) {
    warnings.push("No vite.config.ts found. Shelf's reference stack compiles StyleX with Vite.");
  } else if (!(await readFile(path.join(cwd, viteConfig), "utf8")).includes("@stylexjs/unplugin")) {
    warnings.push(
      `${viteConfig} does not use @stylexjs/unplugin. Add stylex.vite() before react() in its plugins.`,
    );
  }
  return warnings;
}
