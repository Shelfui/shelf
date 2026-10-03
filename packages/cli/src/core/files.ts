import { mkdir, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/** Relative paths of files under `root` that match, skipping dependencies, builds, and dot directories. */
export async function findFiles(
  root: string,
  match: (name: string) => boolean,
  skip: string[] = ["node_modules"],
): Promise<string[]> {
  const found: string[] = [];
  async function visit(dir: string): Promise<void> {
    for (const entry of await readdir(path.join(root, dir), { withFileTypes: true })) {
      const relative = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && !skip.includes(entry.name)) await visit(relative);
      } else if (entry.isFile() && match(entry.name)) {
        found.push(relative);
      }
    }
  }
  await visit("");
  return found.toSorted();
}

/** Writes through a temporary file and a rename, so a crash never leaves a half-written file. */
export async function writeFileAtomic(file: string, content: string | Uint8Array): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, file);
}
