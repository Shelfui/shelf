import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ShelfError } from "./errors";
import { exec } from "./exec";
import { type IndexEntry, type Registry, type RegistryItem, loadIndex, loadItem } from "./registry";

async function git(cwd: string, args: string[]): Promise<string | null> {
  const { stdout, exitCode } = await exec(["git", ...args], { cwd });
  return exitCode === 0 ? stdout.trim() : null;
}

/**
 * Files under `dir` that git would commit: tracked, plus untracked files that aren't ignored.
 * Paths are relative to `dir`. Null when `dir` is not in a git work tree.
 */
export async function projectFiles(dir: string): Promise<string[] | null> {
  const { stdout, exitCode } = await exec(
    ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "."],
    { cwd: dir },
  );
  if (exitCode !== 0) return null;
  return [...new Set(stdout.split("\0").filter(Boolean))].toSorted();
}

/** The repository root that contains `dir`, or null outside git. */
export function repoRoot(dir: string): Promise<string | null> {
  return git(dir, ["rev-parse", "--show-toplevel"]);
}

export function headCommit(dir: string): Promise<string | null> {
  return git(dir, ["rev-parse", "HEAD"]);
}

export function originUrl(dir: string): Promise<string | null> {
  return git(dir, ["remote", "get-url", "origin"]);
}

/**
 * A depth-1 clone of `url` into a new temp directory, with the user's own git credentials and
 * any extra git environment, such as a token header.
 */
export async function shallowClone(url: string, env: Record<string, string> = {}): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "shelf-usage-"));
  const { stderr, exitCode } = await exec(
    ["git", "clone", "--quiet", "--depth", "1", "--no-tags", url, dir],
    { cwd: tmpdir(), env: { ...process.env, ...env, GIT_TERMINAL_PROMPT: "0" } },
  );
  if (exitCode !== 0) {
    await rm(dir, { recursive: true, force: true });
    throw new ShelfError(
      `Could not clone ${url}: ${stderr.trim() || `git exited ${exitCode}`}. Check the URL and that your git credentials can read it.`,
    );
  }
  return dir;
}

/** Why a directory's git history can or can't be read. */
export type HistoryStatus = "available" | "shallow" | "untracked" | "no-git";

export async function historyStatus(dir: string): Promise<HistoryStatus> {
  const shallow = await git(dir, ["rev-parse", "--is-shallow-repository"]);
  if (shallow === null) return "no-git";
  if (shallow === "true") return "shallow";
  const last = await git(dir, ["log", "-1", "--format=%H", "--", "."]);
  return last ? "available" : "untracked";
}

interface Blobs {
  /** The file at `<rev>:<path>`, or null if there is none. */
  read(spec: string): Promise<Buffer | null>;
  close(): void;
}

/** One `git cat-file --batch` process. Requests may overlap; git answers them in order. */
function blobs(cwd: string): Blobs {
  const child = spawn("git", ["cat-file", "--batch"], { cwd, stdio: ["pipe", "pipe", "ignore"] });
  const waiting: Array<(blob: Buffer | null) => void> = [];
  let buffer = Buffer.alloc(0);

  const drain = () => {
    while (waiting.length > 0) {
      const newline = buffer.indexOf(10);
      if (newline === -1) return;
      const [, type, size = ""] = buffer.subarray(0, newline).toString().split(" ");
      if (!/^\d+$/.test(size)) {
        buffer = buffer.subarray(newline + 1);
        waiting.shift()!(null);
        continue;
      }
      const end = newline + 1 + Number(size);
      if (buffer.length <= end) return;
      const content = Buffer.from(buffer.subarray(newline + 1, end));
      buffer = buffer.subarray(end + 1);
      waiting.shift()!(type === "blob" ? content : null);
    }
  };
  const fail = () => {
    for (const resolve of waiting.splice(0)) resolve(null);
  };
  child.stdout.on("data", (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    drain();
  });
  child.on("error", fail);
  child.on("close", fail);
  child.stdin.on("error", fail);

  return {
    read(spec) {
      if (child.exitCode !== null || child.stdin.destroyed) return Promise.resolve(null);
      return new Promise((resolve) => {
        waiting.push(resolve);
        child.stdin.write(`${spec}\n`);
      });
    },
    close() {
      child.stdin.end();
    },
  };
}

interface Change {
  commit: string;
  /** Committer date, ISO 8601. */
  date: string;
  /** Changed files, relative to the directory that was logged. */
  files: string[];
}

/** Commits that changed `dir`, oldest first, following the first parent through merges. */
async function changes(dir: string): Promise<Change[]> {
  const log = await git(dir, [
    "log",
    "--reverse",
    "--first-parent",
    "-m",
    "--relative",
    "--name-only",
    "--format=>%H %cI",
    "--",
    ".",
  ]);
  if (!log) return [];
  return `\n${log}`
    .split("\n>")
    .slice(1)
    .map((block) => {
      const [header = "", ...files] = block.split("\n");
      const [commit = "", date = ""] = header.split(" ");
      return { commit, date, files: files.filter(Boolean) };
    });
}

const entryKey = (entry: IndexEntry) => `${entry.name} ${entry.type} ${entry.path}`;

/**
 * Every item revision the registry directory has had on its first-parent history, each once.
 * Commits whose index or item doesn't validate are skipped. Pass `name` to load only that item.
 *
 * A revision covers only the files in the item's directory, so history is walked oldest first
 * and an item is read only at the commits that change its directory or its index entry.
 */
export interface HistoryItem extends RegistryItem {
  /** The first commit with this revision, and its date. */
  commit: string;
  date: string;
}

export async function registryHistory(dir: string, name?: string): Promise<HistoryItem[]> {
  const prefix = await git(dir, ["rev-parse", "--show-prefix"]);
  if (prefix === null) return [];
  const store = blobs(dir);
  const items = new Map<string, HistoryItem>();
  let index: IndexEntry[] = [];
  try {
    for (const [i, { commit, date, files }] of (await changes(dir)).entries()) {
      const registry: Registry = {
        location: `${dir} at ${commit.slice(0, 12)}`,
        async read(relativePath) {
          const blob = await store.read(`${commit}:${prefix}${relativePath}`);
          if (blob === null) throw new ShelfError(`${relativePath} is not in ${commit}`);
          return blob.toString("utf8");
        },
      };
      const inDirectory = (entry: IndexEntry) =>
        files.some((file) => file.startsWith(`${entry.path}/`));
      let touched = index.filter(inDirectory);
      if (i === 0 || files.includes("index.json")) {
        const known = new Set(index.map(entryKey));
        index = await loadIndex(registry).catch(() => []);
        touched = index.filter((entry) => !known.has(entryKey(entry)) || inDirectory(entry));
      }
      const loaded = await Promise.all(
        touched
          .filter((entry) => name === undefined || entry.name === name)
          .map((entry) => loadItem(registry, entry).catch(() => null)),
      );
      for (const item of loaded) {
        if (item && !items.has(item.revision)) items.set(item.revision, { ...item, commit, date });
      }
    }
  } finally {
    store.close();
  }
  return [...items.values()];
}

/** Past contents of a project file: the staged version, then each commit, newest first. */
export async function* fileVersions(cwd: string, file: string): AsyncGenerator<Buffer> {
  const prefix = await git(cwd, ["rev-parse", "--show-prefix"]);
  if (prefix === null) return;
  const log = await git(cwd, ["log", "--format=%H", "--", file]);
  const store = blobs(cwd);
  try {
    for (const rev of ["", ...(log ? log.split("\n") : [])]) {
      const blob = await store.read(`${rev}:${prefix}${file}`);
      if (blob !== null) yield blob;
    }
  } finally {
    store.close();
  }
}

export interface MergeResult {
  content: string;
  conflicts: number;
}

export const CONFLICT_START = "<<<<<<< yours";

/**
 * A three-way merge of your file and Shelf's new version against the version installed (BASE),
 * with the markers git uses. Conflicting regions are labeled `yours` and `shelf`.
 */
export async function mergeFile(
  local: string,
  base: string,
  upstream: string,
): Promise<MergeResult> {
  const dir = await mkdtemp(path.join(tmpdir(), "shelf-merge-"));
  try {
    const files = { yours: local, base, shelf: upstream };
    for (const [name, content] of Object.entries(files)) {
      await writeFile(path.join(dir, name), content);
    }
    const { stdout, stderr, exitCode } = await exec(
      [
        "git",
        "merge-file",
        "-p",
        "-L",
        "yours",
        "-L",
        "base",
        "-L",
        "shelf",
        "yours",
        "base",
        "shelf",
      ],
      { cwd: dir },
    );
    if (exitCode === 127 && !stdout) {
      throw new ShelfError(
        "Merging your changes with Shelf's needs git, which was not found. Install git, or replace your changes with --overwrite.",
      );
    }
    if (exitCode > 127) throw new ShelfError(`git merge-file failed: ${stderr.trim()}`);
    return { content: stdout, conflicts: exitCode };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
