import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";
import { ShelfError } from "./errors";
import { isObject, parseJson } from "./json";
import { assertSafeRelativePath } from "./paths";

export const CONFIG_FILE = "shelf.config.json";
/** Resolves once `@shelfui/cli` is a dev dependency, and then matches the installed version. */
export const CONFIG_SCHEMA = "./node_modules/@shelfui/cli/schema.json";

export interface ShelfConfig {
  /** A local directory (relative to the config file) or an http(s) URL. */
  registry: string;
  /** Request headers for an http(s) registry, as written: `${VAR}` is expanded when used. */
  headers: Record<string, string>;
  paths: {
    components: string;
    blocks: string;
    foundations: string;
    lib: string;
  };
  /**
   * Import aliases in tsconfig `paths` form, e.g. `{ "@/*": "src/*" }`. Imports between
   * installed files in different directories use a matching alias; without one they stay
   * relative.
   */
  aliases: Record<string, string>;
  /**
   * The project's id in `shelf usage`, e.g. `payments/bill-pay`. Leading segments are its
   * namespace. Unset, the package.json name or the directory is used.
   */
  project?: string;
}

export const DEFAULT_PATHS: ShelfConfig["paths"] = {
  components: "src/components/ui",
  blocks: "src/components/blocks",
  foundations: "src/styles/shelf",
  lib: "src/lib/shelf",
};

export async function readConfig(cwd: string): Promise<ShelfConfig> {
  const file = path.join(cwd, CONFIG_FILE);
  if (!existsSync(file)) {
    throw new ShelfError(`No ${CONFIG_FILE} in ${cwd}. Run: shelf init --registry <path-or-url>`);
  }
  const raw = parseJson(await readFile(file, "utf8"), CONFIG_FILE);
  if (!isObject(raw)) throw new ShelfError(`${CONFIG_FILE} must be a JSON object.`);
  assertKnownKeys(raw, CONFIG_KEYS, "");
  const { registry, headers } = parseRegistry(raw["registry"]);
  const paths = raw["paths"] ?? {};
  if (!isObject(paths)) {
    throw new ShelfError(`${CONFIG_FILE}: "paths" must be an object.`);
  }
  assertKnownKeys(paths, Object.keys(DEFAULT_PATHS), "paths.");
  const aliases = raw["aliases"] ?? {};
  if (!isObject(aliases)) {
    throw new ShelfError(`${CONFIG_FILE}: "aliases" must be an object, e.g. { "@/*": "src/*" }.`);
  }
  const project = raw["project"];
  if (project !== undefined && (typeof project !== "string" || !PROJECT_ID.test(project))) {
    throw new ShelfError(
      `${CONFIG_FILE}: "project" must be an id like "payments/bill-pay": letters, digits, ".", "_", "-", separated by "/".`,
    );
  }
  return {
    registry,
    headers,
    ...(project !== undefined && { project }),
    aliases: Object.fromEntries(
      Object.entries(aliases).map(([alias, target]) => [alias, parseAlias(alias, target)]),
    ),
    paths: {
      components: assertSafeRelativePath(
        paths["components"] ?? DEFAULT_PATHS.components,
        `${CONFIG_FILE} paths.components`,
      ),
      blocks: assertSafeRelativePath(
        paths["blocks"] ?? DEFAULT_PATHS.blocks,
        `${CONFIG_FILE} paths.blocks`,
      ),
      foundations: assertSafeRelativePath(
        paths["foundations"] ?? DEFAULT_PATHS.foundations,
        `${CONFIG_FILE} paths.foundations`,
      ),
      lib: assertSafeRelativePath(paths["lib"] ?? DEFAULT_PATHS.lib, `${CONFIG_FILE} paths.lib`),
    },
  };
}

export const CONFIG_KEYS = ["$schema", "registry", "project", "paths", "aliases"];

export const PROJECT_ID = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;

function assertKnownKeys(object: Record<string, unknown>, known: string[], prefix: string) {
  const unknown = Object.keys(object).find((key) => !known.includes(key));
  if (unknown !== undefined) {
    throw new ShelfError(
      `${CONFIG_FILE}: unknown key "${prefix}${unknown}". Expected one of: ${known.map((key) => prefix + key).join(", ")}.`,
    );
  }
}

function parseAlias(alias: string, target: unknown): string {
  const where = `${CONFIG_FILE} aliases["${alias}"]`;
  if (!/^[^.\s*][^\s*]*\*$/.test(alias)) {
    throw new ShelfError(`${where}: an alias must end in "*" and not start with ".", e.g. "@/*".`);
  }
  if (typeof target !== "string" || !/^(?:[^*]+\/)?\*$/.test(target)) {
    throw new ShelfError(`${where} must be a directory ending in "/*", e.g. "src/*".`);
  }
  if (target === "*" || target === "./*") return "*";
  return `${assertSafeRelativePath(target.slice(0, -2), where)}/*`;
}

const HEADER_NAME = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;
const EXAMPLE = `{ "url": "https://…", "headers": { "Authorization": "Bearer \${SHELF_REGISTRY_TOKEN}" } }`;

function parseRegistry(value: unknown): { registry: string; headers: Record<string, string> } {
  if (typeof value === "string" && value.trim() !== "") return { registry: value, headers: {} };
  if (!isObject(value)) {
    throw new ShelfError(`${CONFIG_FILE} must contain a "registry": a path or URL, or ${EXAMPLE}.`);
  }
  assertKnownKeys(value, ["url", "headers"], "registry.");
  const url = value["url"];
  if (typeof url !== "string" || url.trim() === "") {
    throw new ShelfError(`${CONFIG_FILE}: "registry.url" must be a path or URL.`);
  }
  const headers = value["headers"] ?? {};
  if (!isObject(headers)) {
    throw new ShelfError(`${CONFIG_FILE}: "registry.headers" must be an object, e.g. ${EXAMPLE}.`);
  }
  const parsed: Record<string, string> = {};
  for (const [name, header] of Object.entries(headers)) {
    if (!HEADER_NAME.test(name) || typeof header !== "string") {
      throw new ShelfError(
        `${CONFIG_FILE}: "registry.headers" must map header names to strings; "${name}" does not.`,
      );
    }
    parsed[name] = header;
  }
  if (Object.keys(parsed).length > 0 && !isHttpRegistry(url)) {
    throw new ShelfError(
      `${CONFIG_FILE}: "registry.headers" only apply to an http(s) registry, and "${url}" is a directory.`,
    );
  }
  return { registry: url, headers: parsed };
}

/** Header values with `${VAR}` expanded, and the names of the variables they use. */
export interface RegistryAuth {
  headers: Record<string, string>;
  variables: string[];
}

const VARIABLE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

/**
 * Expands `${VAR}` in the configured headers from the environment, then `.env.local` and
 * `.env` in the project. Fails before any request when a variable is not set.
 */
export async function registryAuth(config: ShelfConfig, cwd: string): Promise<RegistryAuth> {
  const variables = [
    ...new Set(
      Object.values(config.headers).flatMap((v) => [...v.matchAll(VARIABLE)].map((m) => m[1]!)),
    ),
  ];
  const values = new Map<string, string>();
  let files: Record<string, string> | undefined;
  for (const name of variables) {
    let value = process.env[name];
    if (value === undefined) {
      files ??= await envFiles(cwd);
      value = files[name];
    }
    if (value !== undefined && value !== "") values.set(name, value);
  }
  const missing = variables.filter((name) => !values.has(name));
  if (missing.length > 0) {
    throw new ShelfError(
      `Registry headers in ${CONFIG_FILE} need ${missing.join(", ")}. Set ${missing.length === 1 ? "it" : "them"} in your environment or .env.local.`,
    );
  }
  const headers = Object.fromEntries(
    Object.entries(config.headers).map(([name, value]) => [
      name,
      value.replace(VARIABLE, (_, variable: string) => values.get(variable)!),
    ]),
  );
  return { headers, variables };
}

async function envFiles(cwd: string): Promise<Record<string, string>> {
  const merged: Record<string, string> = {};
  for (const name of [".env", ".env.local"]) {
    const file = path.join(cwd, name);
    if (existsSync(file)) Object.assign(merged, parseEnv(await readFile(file, "utf8")));
  }
  return merged;
}

export function isHttpRegistry(location: string): boolean {
  return /^https?:\/\//i.test(location);
}

/** Local registries are resolved relative to the project; URLs are used as-is. */
export function resolveRegistryLocation(registry: string, cwd: string): string {
  return isHttpRegistry(registry) ? registry : path.resolve(cwd, registry);
}
