import { ShelfError } from "../errors";
import { isObject } from "../json";
import type { IndexEntry } from "./types";

/** The `figma` block of index.json: the library file, and each item's node in it. */
export interface FigmaLinks {
  file: string;
  /** Item name → node id, such as `button` → `4:47`. */
  nodes: Record<string, string>;
}

const FIGMA_EXAMPLE = `{ "file": "https://www.figma.com/design/<key>/<name>", "nodes": { "button": "4:47" } }`;
const NODE_ID = /^\d+:\d+$/;

/** Validates the optional `figma` block of a source index.json against its items. */
export function parseFigmaLinks(raw: unknown, index: IndexEntry[]): FigmaLinks | undefined {
  if (!isObject(raw) || raw["figma"] === undefined) return undefined;
  const where = `Registry index.json "figma"`;
  const figma = raw["figma"];
  if (!isObject(figma) || !isObject(figma["nodes"])) {
    throw new ShelfError(`${where} must be ${FIGMA_EXAMPLE}. The Shelf Figma plugin prints it.`);
  }
  const file = figma["file"];
  if (typeof file !== "string" || !isFigmaFileUrl(file)) {
    throw new ShelfError(
      `${where}.file must be a Figma file URL, such as https://www.figma.com/design/<key>/<name>.`,
    );
  }
  const names = new Set(index.map((entry) => entry.name));
  const nodes: Record<string, string> = {};
  for (const [name, id] of Object.entries(figma["nodes"])) {
    if (!names.has(name)) {
      throw new ShelfError(`${where}.nodes lists "${name}", which isn't an item in index.json.`);
    }
    if (typeof id !== "string" || !NODE_ID.test(id)) {
      throw new ShelfError(`${where}.nodes["${name}"] must be a node id, such as "4:47".`);
    }
    nodes[name] = id;
  }
  return { file, nodes };
}

/**
 * The item's link in Figma: its node, or the file itself for foundations, whose variables and
 * styles belong to the whole file. Undefined when the item isn't in Figma.
 */
export function figmaLink(links: FigmaLinks, entry: IndexEntry): string | undefined {
  const node = links.nodes[entry.name];
  if (node) return `${links.file}?node-id=${node.replace(":", "-")}`;
  return entry.type === "foundation" ? links.file : undefined;
}

function isFigmaFileUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "figma.com" || url.hostname === "www.figma.com") &&
      /^\/(design|file)\/[A-Za-z0-9]+(\/[^/]*)?$/.test(url.pathname) &&
      url.search === ""
    );
  } catch {
    return false;
  }
}
