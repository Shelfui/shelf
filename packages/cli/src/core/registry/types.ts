export const ITEM_TYPES = [
  "component",
  "pattern",
  "block",
  "template",
  "foundation",
  "lib",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export interface IndexEntry {
  name: string;
  type: ItemType;
  description: string;
  /** Item directory, relative to the registry root. */
  path: string;
  /** The item's current revision, written by `shelf build`; absent in a source registry. */
  revision?: string;
  /** Words people and agents use for it that the name and description don't. */
  keywords?: string[];
  /** When to reach for it. */
  useWhen?: string;
  /** When another item fits better, and which. */
  avoidWhen?: string;
  /** `experimental` means the API or behavior may still change; absent means stable. */
  status?: "experimental";
  /** Items that are used with it or instead of it. */
  related?: string[];
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
