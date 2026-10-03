import type { ShelfConfig } from "../config";
import type { GitHub } from "../github";
import type { Lock } from "../lock";
import type { Registry } from "../registry";

export interface UsageRef {
  /** The importing file, relative to the importing project. */
  file: string;
  /** Names the file imports from the item; empty for side-effect and dynamic imports. */
  imports: string[];
  /** The importing project's id, when it isn't the project that installed the item. */
  project?: string;
  /** The workspace package the import went through, e.g. `@acme/ui`. */
  package?: string;
}

export interface InstalledItem {
  type: string;
  revision: string;
  /**
   * `this`: the revision belongs to the compared registry. `other`: it doesn't, so it came from
   * another registry. `unknown`: the registry couldn't be read.
   */
  registry: "this" | "other" | "unknown";
  /** The registry's current revision; null unless `registry` is `this`. */
  upstream: string | null;
  updateAvailable: boolean;
  /** The item is no longer in the registry. */
  removed: boolean;
  modified: boolean;
  modifiedFiles: string[];
  files: string[];
  shelfDependencies: string[];
  /** Imported by source code, in this project or another. */
  direct: boolean;
  /** Used items that depend on this one, e.g. `dialog` for `button`. */
  via: string[];
  usedBy: UsageRef[];
}

export interface ProjectUsage {
  /** e.g. `payments/bill-pay`. */
  id: string;
  /** e.g. `payments`; empty for a top-level id. */
  namespace: string;
  name: string;
  source: {
    /** The git remote, or null. */
    repo: string | null;
    /** The project directory inside the repository, `.` for the root. */
    path: string;
    commit: string | null;
  };
  /** Why the registry couldn't be compared, when it couldn't. */
  registryError?: string;
  items: Record<string, InstalledItem>;
  /** Items this project uses that another project installed, e.g. through a shared UI package. */
  consumes: Array<{ item: string; provider: string; package?: string }>;
  /** Shelf dependencies of installed items that are not installed. */
  missing: string[];
}

export interface UsageGraph {
  version: 1;
  /** The registry passed with `--registry`; null when each project used its own. */
  registry: {
    location: string;
    items: Record<string, { type: string; description: string; revision: string }>;
  } | null;
  projects: ProjectUsage[];
}

export interface UsageOptions {
  cwd: string;
  /** Directories to scan; each is searched for shelf.config.json files. */
  dirs: string[];
  /** Git URLs to clone shallowly and scan. */
  repos: string[];
  /** GitHub organizations whose repositories with a shelf.config.json are cloned and scanned. */
  github?: GitHub & { orgs: string[] };
  /** Compare every project against this registry instead of its own. */
  registry?: string;
}

export interface Repo {
  root: string;
  commit: string | null;
  origin: string | null;
  /** Every committable file, relative to `root`. */
  files: string[];
  /** Project directories relative to `root`, `""` for the root. */
  projects: Set<string>;
  /**
   * Package directories without a shelf.config.json. They are reported only when they use an
   * item another project installed, e.g. an app that imports a shared UI package.
   */
  consumers: Set<string>;
}

export interface Project {
  repo: Repo;
  /** Relative to the repo root, `""` for the root. */
  dir: string;
  id: string;
  /** Undefined for a package that has no shelf.config.json. */
  config: ShelfConfig | undefined;
  lock: Lock;
  /** tsconfig `paths` merged under shelf.config.json `aliases`. */
  aliases: Record<string, string>;
  usage: ProjectUsage;
}

export interface WorkspacePackage {
  name: string;
  dir: string;
  exports: unknown;
  main: string | undefined;
}

export interface Comparison {
  registry: Registry;
  items: Record<string, { type: string; description: string; revision: string }>;
  /** Revisions this registry has had, from git history or `revisions/`. */
  known(revision: string): Promise<boolean>;
}

export type OpenComparison = (location: string, registry?: Registry) => Promise<Comparison>;
