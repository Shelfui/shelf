import path from "node:path";
import { ShelfError } from "./errors";

/**
 * Validates a path that Shelf will join onto a trusted root (a registry or the
 * consumer project). Rejects anything that could escape that root.
 */
export function assertSafeRelativePath(value: unknown, what: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ShelfError(`${what} must be a non-empty relative path.`);
  }
  const unsafe =
    value.includes("\0") ||
    value.includes("\\") ||
    path.posix.isAbsolute(value) ||
    /^[a-zA-Z]:/.test(value) ||
    value.split("/").some((segment) => segment === "..");
  if (unsafe) {
    throw new ShelfError(
      `${what} "${value}" is not allowed. Use a forward-slash path inside the project, without "..".`,
    );
  }
  return path.posix.normalize(value).replace(/\/$/, "");
}

/** Resolves `relative` under `root` and guarantees the result stays inside `root`. */
export function resolveInside(root: string, relative: string): string {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relative);
  if (resolved !== resolvedRoot && !resolved.startsWith(resolvedRoot + path.sep)) {
    throw new ShelfError(`Path "${relative}" resolves outside ${resolvedRoot}.`);
  }
  return resolved;
}
