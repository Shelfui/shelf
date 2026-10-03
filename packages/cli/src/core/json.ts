import { readFile } from "node:fs/promises";
import { ShelfError, errorMessage } from "./errors";

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parses JSON, or fails naming the file and, when given, how to fix it. */
export function parseJson(text: string, where: string, fix?: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    const message = `${where} is not valid JSON: ${errorMessage(error)}`;
    throw new ShelfError(fix ? `${message}. ${fix}` : message);
  }
}

/** A JSON file's contents, or `undefined` when it is missing or not JSON. */
export async function readJsonFile(file: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return undefined;
  }
}

/** Two-space JSON with object keys sorted, so equal values always serialize the same. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value), null, 2);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (isObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .toSorted()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
}
