import path from "node:path";
import type { Project } from "./types";

export function join(dir: string, file: string): string {
  return path.posix.normalize(dir ? `${dir}/${file}` : file);
}

export function inside(project: Project, file: string): string {
  return project.dir ? file.slice(project.dir.length + 1) : file;
}
