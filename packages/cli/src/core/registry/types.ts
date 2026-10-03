export const ITEM_TYPES = ["component", "block", "foundation", "lib"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export interface IndexEntry {
  name: string;
  type: ItemType;
  description: string;
  /** Item directory, relative to the registry root. */
  path: string;
  /** The item's current revision, written by `shelf build`; absent in a source registry. */
  revision?: string;
}

export interface RegistryFile {
  /** Relative to the item directory. */
  path: string;
  content: string;
}

export interface RegistryItem {
  name: string;
  type: ItemType;
  description: string;
  path: string;
  files: RegistryFile[];
  dependencies: Record<string, string>;
  shelfDependencies: string[];
  /** Content hash of everything that is installed for this item. */
  revision: string;
}

export interface Registry {
  location: string;
  read(relativePath: string): Promise<string>;
}
