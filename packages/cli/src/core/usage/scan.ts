import { readFile } from "node:fs/promises";
import path from "node:path";
import { PROJECT_ID, type ShelfConfig, readConfig } from "../config";
import { errorMessage } from "../errors";
import { SOURCE, imports, matchFile, resolveSpecifier } from "../imports";
import { isObject, readJsonFile } from "../json";
import { emptyLock, readLock } from "../lock";
import { projectRegistry } from "../registry";
import { itemStatuses, modifiedFiles } from "../status";
import { tsconfigAliases } from "../tsconfig";
import { workspacePackages, packageFor, packageTarget } from "./packages";
import { join, inside } from "./paths";
import { reexports, exportedNames } from "./source";
import type {
  UsageRef,
  InstalledItem,
  ProjectUsage,
  Repo,
  Project,
  Comparison,
  OpenComparison,
} from "./types";
import { compareText } from "../format";

/** `registry` is either the one registry every project is compared with, or a way to open each project's own. */
export async function scanRepo(
  repo: Repo,
  registry: Comparison | OpenComparison,
): Promise<Project[]> {
  const projects = await openProjects(repo, registry);
  const scan = await repoResolver(repo, projects);
  for (const project of projects) await markDirect(scan, projects, project);
  for (const project of projects) {
    await markTransitive(project, scan.installed, scan.read, scan.resolve);
    for (const item of Object.values(project.usage.items)) {
      item.usedBy.sort(
        (a, b) => compareText(a.project ?? "", b.project ?? "") || compareText(a.file, b.file),
      );
    }
    project.usage.consumes.sort((a, b) => compareText(a.item, b.item));
  }
  return projects.filter((project) => project.config || project.usage.consumes.length > 0);
}

/** Projects with a Shelf config, then workspaces that only consume them. */
async function openProjects(repo: Repo, registry: Comparison | OpenComparison): Promise<Project[]> {
  const projects: Project[] = [];
  for (const dir of [...repo.projects].toSorted()) {
    projects.push(await openProject(repo, dir, registry));
  }
  for (const dir of [...repo.consumers].toSorted()) {
    if (!repo.projects.has(dir)) projects.push(await openConsumer(repo, dir));
  }
  return projects;
}

interface Resolver {
  /** Installed file → the project that installed it, and the item. */
  installed: Map<string, { project: Project; item: string }>;
  /** The innermost project a file belongs to. */
  owner: (file: string) => Project | undefined;
  read: (file: string) => Promise<string | null>;
  /** The repo file an import points at, and the workspace package it went through. */
  resolve: (from: string, spec: string) => { file: string; package?: string } | undefined;
  /** Installed files reached from `file`, following re-exports through barrels. */
  follow: (
    file: string,
    names: string[] | null,
    depth?: number,
  ) => Promise<Array<{ file: string; names: string[] }>>;
}

async function repoResolver(repo: Repo, projects: Project[]): Promise<Resolver> {
  const known = new Set(repo.files);
  const packages = await workspacePackages(repo);

  const installed = new Map<string, { project: Project; item: string }>();
  for (const project of projects) {
    for (const [item, locked] of Object.entries(project.lock.items)) {
      for (const file of Object.keys(locked.files)) {
        installed.set(join(project.dir, file), { project, item });
      }
    }
  }
  const owner = (file: string) =>
    projects
      .filter((p) => p.dir === "" || file.startsWith(`${p.dir}/`))
      .toSorted((a, b) => b.dir.length - a.dir.length)[0];

  const contents = new Map<string, Promise<string | null>>();
  const read = (file: string) => {
    let content = contents.get(file);
    if (!content) {
      content = readFile(path.join(repo.root, file), "utf8").catch(() => null);
      contents.set(file, content);
    }
    return content;
  };

  const resolve = (from: string, spec: string) => {
    const project = owner(from);
    let target: string | undefined;
    let pkg: string | undefined;
    if (spec.startsWith("./") || spec.startsWith("../")) {
      target = path.posix.join(path.posix.dirname(from), spec);
    } else {
      const relative = project && resolveSpecifier(inside(project, from), spec, project.aliases);
      if (relative !== undefined && project) {
        target = join(project.dir, relative);
      } else {
        const match = packageFor(packages, spec);
        if (match) {
          target = packageTarget(match, spec);
          pkg = match.name;
        }
      }
    }
    const file = target && matchFile(known, target);
    return file ? { file, package: pkg } : undefined;
  };

  const follow: Resolver["follow"] = async (file, names, depth = 0) => {
    if (installed.has(file)) return [{ file, names: names ?? [] }];
    if (depth > 4 || !SOURCE.test(file)) return [];
    const content = await read(file);
    if (content === null) return [];
    const hits: Array<{ file: string; names: string[] }> = [];
    for (const reexport of reexports(content)) {
      const target = resolve(file, reexport.specifier)?.file;
      if (!target) continue;
      if (reexport.kind === "named") {
        const wanted = reexport.pairs.filter((p) => names === null || names.includes(p.exported));
        if (wanted.length > 0) {
          hits.push(...(await follow(target, [...new Set(wanted.map((p) => p.local))], depth + 1)));
        }
      } else if (reexport.kind === "namespace") {
        if (names === null || names.includes(reexport.name)) {
          if (installed.has(target)) hits.push({ file: target, names: [reexport.name] });
          else hits.push(...(await follow(target, null, depth + 1)));
        }
      } else if (installed.has(target)) {
        const exported = exportedNames((await read(target)) ?? "");
        const wanted = names === null ? [] : names.filter((name) => exported.has(name));
        if (names === null || wanted.length > 0) hits.push({ file: target, names: wanted });
      } else {
        hits.push(...(await follow(target, names, depth + 1)));
      }
    }
    return hits;
  };

  return { installed, owner, read, resolve, follow };
}

/** Records each import in the project's own source that reaches an installed file. */
async function markDirect(scan: Resolver, projects: Project[], project: Project): Promise<void> {
  const nested = projects.filter(
    (other) => other !== project && (project.dir === "" || other.dir.startsWith(`${project.dir}/`)),
  );
  const sources = project.repo.files.filter(
    (file) =>
      SOURCE.test(file) &&
      scan.owner(file) === project &&
      !scan.installed.has(file) &&
      !nested.some((other) => file.startsWith(`${other.dir}/`)),
  );
  for (const file of sources) {
    const content = await scan.read(file);
    if (content === null) continue;
    for (const imported of imports(content)) {
      if (imported.reexport) continue;
      const target = scan.resolve(file, imported.specifier);
      if (!target) continue;
      const names = imported.names.length > 0 ? imported.names : null;
      for (const hit of await scan.follow(target.file, names)) {
        const { project: provider, item } = scan.installed.get(hit.file)!;
        const ref: UsageRef = { file: inside(project, file), imports: hit.names.toSorted() };
        if (provider !== project) {
          ref.project = project.id;
          if (target.package) ref.package = target.package;
          addConsumer(project.usage, item, provider.id, target.package);
        }
        addRef(provider.usage.items[item]!, ref);
      }
    }
  }
}

function emptyUsage(repo: Repo, dir: string, id: string): ProjectUsage {
  const slash = id.lastIndexOf("/");
  return {
    id,
    namespace: slash === -1 ? "" : id.slice(0, slash),
    name: id.slice(slash + 1),
    source: { repo: repo.origin, path: dir || ".", commit: repo.commit },
    items: {},
    consumes: [],
    missing: [],
  };
}

async function openConsumer(repo: Repo, dir: string): Promise<Project> {
  const id = await projectId(repo, dir, undefined);
  return {
    repo,
    dir,
    id,
    config: undefined,
    lock: emptyLock(),
    aliases: await tsconfigAliases(path.join(repo.root, dir)),
    usage: emptyUsage(repo, dir, id),
  };
}

async function openProject(
  repo: Repo,
  dir: string,
  registry: Comparison | OpenComparison,
): Promise<Project> {
  const cwd = path.join(repo.root, dir);
  const config = await readConfig(cwd);
  const lock = await readLock(cwd);
  const id = await projectId(repo, dir, config);
  const usage = emptyUsage(repo, dir, id);
  usage.missing = [
    ...new Set(
      Object.values(lock.items).flatMap((item) =>
        item.shelfDependencies.filter((name) => !lock.items[name]),
      ),
    ),
  ].toSorted();

  let comparison: Comparison | undefined;
  if (typeof registry === "function") {
    try {
      const own = await projectRegistry(config, cwd);
      comparison = await registry(own.location, own);
    } catch (error) {
      usage.registryError = errorMessage(error);
    }
  } else {
    comparison = registry;
  }
  const statuses = comparison
    ? new Map(
        (await itemStatuses(cwd, { config, lock, registry: comparison.registry })).map((s) => [
          s.name,
          s,
        ]),
      )
    : undefined;

  for (const [name, item] of Object.entries(lock.items).toSorted(([a], [b]) => compareText(a, b))) {
    const status = statuses?.get(name);
    const belongs = comparison ? await comparison.known(item.revision) : undefined;
    const modified = status?.modifiedFiles ?? (await modifiedFiles(cwd, item));
    usage.items[name] = {
      type: item.type,
      revision: item.revision,
      registry: belongs === undefined ? "unknown" : belongs ? "this" : "other",
      upstream: belongs && status?.upstream ? status.upstream : null,
      updateAvailable: belongs === true && status?.updateAvailable === true,
      removed: belongs === true && status !== undefined && status.upstream === undefined,
      modified: modified.length > 0,
      modifiedFiles: modified,
      files: Object.keys(item.files).toSorted(),
      shelfDependencies: item.shelfDependencies.toSorted(),
      direct: false,
      via: [],
      usedBy: [],
    };
  }

  return {
    repo,
    dir,
    id,
    config,
    lock,
    aliases: { ...(await tsconfigAliases(cwd)), ...config.aliases },
    usage,
  };
}

/** `project` from the config, then the package.json name, then the directory. */
async function projectId(
  repo: Repo,
  dir: string,
  config: ShelfConfig | undefined,
): Promise<string> {
  if (config?.project) return config.project;
  const manifest = await readJsonFile(path.join(repo.root, dir, "package.json"));
  const name = isObject(manifest) && typeof manifest["name"] === "string" ? manifest["name"] : "";
  const fromName = name.replace(/^@/, "");
  if (PROJECT_ID.test(fromName)) return fromName;
  const fallback = dir || path.basename(repo.root);
  return PROJECT_ID.test(fallback) ? fallback : fallback.replace(/[^A-Za-z0-9._/-]/g, "-");
}

/** Marks items used by other used items, following Shelf dependencies and imports. */
async function markTransitive(
  project: Project,
  installed: Map<string, { project: Project; item: string }>,
  read: (file: string) => Promise<string | null>,
  resolve: (from: string, spec: string) => { file: string } | undefined,
): Promise<void> {
  const items = project.usage.items;
  const dependencies = new Map<string, Set<string>>();
  for (const [name, locked] of Object.entries(project.lock.items)) {
    const deps = new Set(locked.shelfDependencies.filter((dep) => items[dep]));
    for (const file of Object.keys(locked.files)) {
      const content = await read(join(project.dir, file));
      if (content === null) continue;
      for (const imported of imports(content)) {
        const target = resolve(join(project.dir, file), imported.specifier);
        const hit = target && installed.get(target.file);
        if (hit && hit.project === project && hit.item !== name) deps.add(hit.item);
      }
    }
    dependencies.set(name, deps);
  }

  const queue: string[] = [];
  for (const [name, item] of Object.entries(items)) {
    if (item.usedBy.length === 0) continue;
    item.direct = true;
    queue.push(name);
  }
  const used = new Set(queue);
  for (let name = queue.shift(); name !== undefined; name = queue.shift()) {
    for (const dep of dependencies.get(name) ?? []) {
      const item = items[dep];
      if (item && !item.via.includes(name)) item.via.push(name);
      if (!used.has(dep)) {
        used.add(dep);
        queue.push(dep);
      }
    }
  }
  for (const item of Object.values(items)) item.via.sort();
}

function addRef(item: InstalledItem, ref: UsageRef): void {
  const existing = item.usedBy.find(
    (other) => other.file === ref.file && other.project === ref.project,
  );
  if (!existing) {
    item.usedBy.push(ref);
    return;
  }
  existing.imports = [...new Set([...existing.imports, ...ref.imports])].toSorted();
  if (ref.package && !existing.package) existing.package = ref.package;
}

function addConsumer(usage: ProjectUsage, item: string, provider: string, pkg?: string): void {
  if (usage.consumes.some((c) => c.item === item && c.provider === provider)) return;
  usage.consumes.push({ item, provider, ...(pkg && { package: pkg }) });
}
