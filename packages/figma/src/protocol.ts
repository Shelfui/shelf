import type { Library } from "./ir";

/**
 * Messages between the plugin and its window, which is the registry site's `/figma` page.
 * Only types, so the site can import them without the Figma plugin globals.
 */
export type FromUi =
  | { type: "status" }
  | { type: "sync"; library: Library; allowBreaking?: boolean }
  | { type: "registry"; url: string }
  | { type: "change-registry" };

export type ToUi =
  | { type: "status"; file: FileInfo }
  | { type: "synced"; result: ApplyResult; file: FileInfo }
  | { type: "error"; message: string };

export type ApplyResult =
  | { status: "applied"; summary: string[]; warnings: string[] }
  | { status: "confirm"; breaking: string[] };

export interface FileInfo {
  /** Null unless the plugin runs in a file of an organization that installed it privately. */
  key: string | null;
  name: string;
  /** Item name → revision last synced into this file. */
  revisions: Record<string, string>;
  /** Component set name → node id. */
  nodes: Record<string, string>;
  /** The Icons page's node id, once icons are synced. */
  icons: string | null;
}
