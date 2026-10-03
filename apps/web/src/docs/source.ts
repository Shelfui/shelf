import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface SourceFile {
  path: string;
  code: string;
}

async function lockedItem(name: string): Promise<unknown> {
  const lock: unknown = JSON.parse(
    await readFile(path.join(process.cwd(), ".shelf/lock.json"), "utf8"),
  );
  const items =
    typeof lock === "object" && lock !== null && "items" in lock ? lock.items : undefined;
  return typeof items === "object" && items !== null && name in items
    ? Reflect.get(items, name)
    : undefined;
}

/** The packages and Shelf items `name` builds on, as recorded when it was installed. */
export async function installedDependencies(
  name: string,
): Promise<{ packages: string[]; shelf: string[] }> {
  const item = await lockedItem(name);
  const packages =
    typeof item === "object" && item !== null && "dependencies" in item ? item.dependencies : {};
  const shelf =
    typeof item === "object" && item !== null && "shelfDependencies" in item
      ? item.shelfDependencies
      : [];
  return {
    packages: typeof packages === "object" && packages !== null ? Object.keys(packages) : [],
    shelf: Array.isArray(shelf) ? shelf.filter((dep) => typeof dep === "string") : [],
  };
}

/** The files `shelf add <name>` wrote to this site, from its lock file. */
export async function installedFiles(name: string): Promise<SourceFile[]> {
  const item = await lockedItem(name);
  const files =
    typeof item === "object" && item !== null && "files" in item ? item.files : undefined;
  if (typeof files !== "object" || files === null)
    throw new Error(`.shelf/lock.json has no files for "${name}"`);

  return Promise.all(
    Object.keys(files).map(async (file) => ({
      path: file,
      code: await readFile(path.join(process.cwd(), file), "utf8"),
    })),
  );
}

/**
 * The composition example from a component's doc comment: the indented lines under
 * `/**`, with the import it needs. Undefined when the comment has none.
 */
export function usageExample(file: SourceFile): string | undefined {
  for (const comment of file.code.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const lines = (comment[1] ?? "").split("\n").map((line) => line.replace(/^\s*\* ?/, ""));
    const start = lines.findIndex((line) => /^ {2}\S/.test(line));
    if (start === -1) continue;
    let end = start;
    while (end < lines.length && (/^ {2}/.test(lines[end] ?? "") || lines[end] === "")) end++;
    const example = lines
      .slice(start, end)
      .map((line) => line.slice(2))
      .join("\n")
      .trim();
    if (!example.startsWith("<")) continue;
    return `${importFor(file, example)}\n\n${example}`;
  }

  const component = path
    .basename(file.path, ".tsx")
    .replaceAll(/(?:^|-)(\w)/g, (_, letter: string) => letter.toUpperCase());
  if (!file.code.includes(`export function ${component}(`)) return undefined;
  return `import { ${component} } from "${specifier(file.path)}";\n\n<${component} />`;
}

const specifier = (file: string) => `@/${file.replace(/^src\//, "").replace(/\.tsx?$/, "")}`;
const kebab = (name: string) => name.replaceAll(/(?<=[a-z])(?=[A-Z])/g, "-").toLowerCase();

function importFor(file: SourceFile, example: string): string {
  const namespace = /<(\w+)\.\w+/.exec(example)?.[1];
  const exported = new Set(
    [...file.code.matchAll(/export function (\w+)/g)].map((match) => match[1]),
  );
  const used = [
    ...new Set([...example.matchAll(/<([A-Z]\w*)[\s/>]/g)].map((match) => match[1] ?? "")),
  ];

  const own = used.filter((name) => exported.has(name));
  const lines = [
    namespace
      ? `import * as ${namespace} from "${specifier(file.path)}";`
      : `import { ${own.join(", ")} } from "${specifier(file.path)}";`,
  ];
  for (const name of used) {
    const other = `src/components/ui/${kebab(name)}.tsx`;
    if (!exported.has(name) && other !== file.path && existsSync(path.join(process.cwd(), other))) {
      lines.push(`import { ${name} } from "${specifier(other)}";`);
    }
  }
  return lines.toSorted().join("\n");
}
