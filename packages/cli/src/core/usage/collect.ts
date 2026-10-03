import { existsSync, realpathSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { CONFIG_FILE, isHttpRegistry, resolveRegistryLocation } from "../config";
import { ShelfError } from "../errors";
import { findFiles } from "../files";
import {
  headCommit,
  historyStatus,
  originUrl,
  projectFiles,
  registryHistory,
  repoRoot,
  shallowClone,
} from "../git";
import { gitAuthEnv, repoKey, shelfRepos } from "../github";
import { type Registry, loadIndex, loadItem, openRegistry, readSnapshot } from "../registry";
import { scanRepo } from "./scan";
import type { UsageGraph, UsageOptions, Repo, Project, Comparison, OpenComparison } from "./types";
import { compareText } from "../format";

export async function collectUsage(options: UsageOptions): Promise<UsageGraph> {
  const clones: string[] = [];
  try {
    const repos = new Map<string, Repo>();
    for (const dir of options.dirs) await addSource(repos, path.resolve(options.cwd, dir), null);

    const { github } = options;
    const urls = [...options.repos];
    for (const org of github?.orgs ?? []) urls.push(...(await shelfRepos(github!, org)));
    const scanned = new Set(
      [...repos.values()].flatMap((repo) => (repo.origin ? [repoKey(repo.origin)] : [])),
    );
    for (const url of urls) {
      if (scanned.has(repoKey(url))) continue;
      scanned.add(repoKey(url));
      const auth = github && url.startsWith(`${github.server}/`) ? gitAuthEnv(github) : {};
      const dir = await shallowClone(url, auth);
      clones.push(dir);
      await addSource(repos, dir, url);
    }

    const open = comparisonCache();
    const shared = options.registry
      ? await open(resolveRegistryLocation(options.registry, options.cwd))
      : undefined;
    const projects: Project[] = [];
    for (const repo of [...repos.values()].toSorted((a, b) => compareText(a.root, b.root))) {
      projects.push(...(await scanRepo(repo, shared ?? open)));
    }
    const ids = new Map<string, Project>();
    for (const project of projects) {
      const other = ids.get(project.id);
      if (other) {
        throw new ShelfError(
          `Two projects are both "${project.id}": ${where(other)} and ${where(project)}. Set a distinct "project" in each ${CONFIG_FILE}.`,
        );
      }
      ids.set(project.id, project);
    }
    return {
      version: 1,
      registry: shared ? { location: options.registry!, items: shared.items } : null,
      projects: projects
        .map((project) => project.usage)
        .toSorted((a, b) => compareText(a.id, b.id)),
    };
  } finally {
    await Promise.all(clones.map((dir) => rm(dir, { recursive: true, force: true })));
  }
}

function where(project: Project): string {
  return path.join(project.repo.root, project.dir || ".");
}

/** Adds the projects under `source`. `cloneUrl` is where a temporary clone came from. */
async function addSource(
  repos: Map<string, Repo>,
  source: string,
  cloneUrl: string | null,
): Promise<void> {
  if (!existsSync(source)) throw new ShelfError(`No such directory: ${source}`);
  const dir = realpathSync(source);
  const root = (await repoRoot(dir)) ?? dir;
  let repo = repos.get(root);
  if (!repo) {
    const files = (await projectFiles(root)) ?? (await findFiles(root, () => true));
    repo = {
      root,
      commit: await headCommit(root),
      origin: cloneUrl ?? (await originUrl(root)),
      files,
      projects: new Set(),
      consumers: new Set(),
    };
    repos.set(root, repo);
  }
  const prefix = path.relative(root, dir).split(path.sep).join("/");
  for (const file of repo.files) {
    const name = path.posix.basename(file);
    if ((name !== CONFIG_FILE && name !== "package.json") || file.includes("node_modules/")) {
      continue;
    }
    const projectDir = path.posix.dirname(file) === "." ? "" : path.posix.dirname(file);
    if (prefix === "" || projectDir === prefix || projectDir.startsWith(`${prefix}/`)) {
      repo[name === CONFIG_FILE ? "projects" : "consumers"].add(projectDir);
    }
  }
}

/** Opens each registry location once per run. */
function comparisonCache(): OpenComparison {
  const comparisons = new Map<string, Promise<Comparison>>();
  return (location, registry) => {
    let comparison = comparisons.get(location);
    if (!comparison) {
      comparison = createComparison(location, registry ?? openRegistry(location));
      comparisons.set(location, comparison);
    }
    return comparison;
  };
}

async function createComparison(location: string, registry: Registry): Promise<Comparison> {
  const index = await loadIndex(registry);
  const items: Comparison["items"] = {};
  for (const entry of index) {
    items[entry.name] = {
      type: entry.type,
      description: entry.description,
      revision: entry.revision ?? (await loadItem(registry, entry)).revision,
    };
  }
  const current = new Set(Object.values(items).map((item) => item.revision));
  let history: Promise<Set<string>> | undefined;
  const snapshots = new Map<string, Promise<boolean>>();
  return {
    registry,
    items,
    async known(revision) {
      if (current.has(revision)) return true;
      if (!isHttpRegistry(location)) {
        history ??= historyStatus(location).then(async (status) =>
          status === "available"
            ? new Set((await registryHistory(location)).map((item) => item.revision))
            : new Set<string>(),
        );
        if ((await history).has(revision)) return true;
      }
      let snapshot = snapshots.get(revision);
      if (!snapshot) {
        snapshot = readSnapshot(registry, revision).then(
          (found) => found !== null,
          () => false,
        );
        snapshots.set(revision, snapshot);
      }
      return snapshot;
    },
  };
}
