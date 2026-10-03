import { existsSync } from "node:fs";
import path from "node:path";

export const SOURCE = /\.[cm]?[jt]sx?$/;
/** What a specifier may leave off, in the order a bundler tries them. */
export const RESOLVE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.jsx",
];

export interface Import {
  specifier: string;
  /** Local names bound by the import: `Button`, or `Dialog` for `import * as Dialog`. */
  names: string[];
  /** `export … from`: passes the module through rather than using it. */
  reexport: boolean;
}

/** Every static import, dynamic import, and re-export's module specifier. */
export function specifiers(content: string): string[] {
  const pattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])([^"'\n]+)\1/g;
  return [...content.matchAll(pattern)].map((match) => match[2]!);
}

/**
 * Imports with the names they bind. Type-only imports are skipped. Side-effect and dynamic
 * imports bind no names.
 */
export function imports(content: string): Import[] {
  const found: Import[] = [];
  const statement =
    /\b(import|export)\s+(type\s+)?([\w$*{}\s,]*?)\s*from\s*(["'])([^"'\n]+)\4|\bimport\s*\(\s*(["'])([^"'\n]+)\6|\bimport\s+(["'])([^"'\n]+)\8/g;
  for (const match of content.matchAll(statement)) {
    if (match[7] !== undefined) {
      found.push({ specifier: match[7], names: [], reexport: false });
      continue;
    }
    if (match[9] !== undefined) {
      found.push({ specifier: match[9], names: [], reexport: false });
      continue;
    }
    if (match[2]) continue;
    const reexport = match[1] === "export";
    found.push({
      specifier: match[5]!,
      names: reexport ? [] : boundNames(match[3]!),
      reexport,
    });
  }
  return found;
}

function boundNames(clause: string): string[] {
  const names: string[] = [];
  const namespace = /\*\s*as\s+([\w$]+)/.exec(clause);
  if (namespace) names.push(namespace[1]!);
  const braces = /\{([^}]*)\}/.exec(clause);
  if (braces) {
    for (const part of braces[1]!.split(",")) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.startsWith("type ")) continue;
      const alias = /\s+as\s+([\w$]+)$/.exec(trimmed);
      names.push(alias ? alias[1]! : trimmed);
    }
  }
  const defaultName = /^([\w$]+)\s*(?:,|$)/.exec(clause.trim());
  if (defaultName) names.push(defaultName[1]!);
  return names;
}

/** The project-relative path an import points at, or undefined for package imports. */
export function resolveSpecifier(
  from: string,
  spec: string,
  aliases: Record<string, string>,
): string | undefined {
  if (spec.startsWith("./") || spec.startsWith("../")) {
    return path.posix.join(path.posix.dirname(from), spec);
  }
  const alias = Object.keys(aliases)
    .filter((key) => spec.startsWith(key.slice(0, -1)))
    .toSorted((a, b) => b.length - a.length)[0];
  return alias && aliases[alias]!.slice(0, -1) + spec.slice(alias.length - 1);
}

export function resolvesToFile(cwd: string, file: string): boolean {
  return resolveFile(cwd, file) !== undefined;
}

/** `file` with the first suffix that exists under `cwd`, e.g. `src/ui/button.tsx`. */
function resolveFile(cwd: string, file: string): string | undefined {
  const suffix = RESOLVE_SUFFIXES.find((s) => existsSync(path.join(cwd, file + s)));
  return suffix === undefined ? undefined : path.posix.normalize(file + suffix);
}

/**
 * Resolves `file` against a set of known paths without touching the disk, trying the same
 * suffixes as `resolveFile`.
 */
export function matchFile(known: Set<string>, file: string): string | undefined {
  const normalized = path.posix.normalize(file);
  for (const suffix of RESOLVE_SUFFIXES) {
    if (known.has(normalized + suffix)) return normalized + suffix;
  }
  return undefined;
}
