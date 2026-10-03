import { CONFIG_FILE } from "../config";
import { plural } from "../format";
import { stableStringify } from "../json";
import type { Output } from "../output";
import type { UsageGraph } from "./types";

export function usageJson(graph: UsageGraph): string {
  return `${stableStringify(graph)}\n`;
}

export function reportUsage(graph: UsageGraph, out: Output): void {
  out.log("Shelf usage");
  out.log();
  if (graph.projects.length === 0) {
    out.log(`No ${CONFIG_FILE} found. Pass the directories to scan, e.g. shelf usage apps`);
    return;
  }
  for (const project of graph.projects) {
    const items = Object.entries(project.items);
    const used = items.filter(([, item]) => item.direct || item.via.length > 0);
    const updates = items.filter(([, item]) => item.updateAvailable);
    const modified = items.filter(([, item]) => item.modified);
    const unused = items.filter(([, item]) => !item.direct && item.via.length === 0);
    const other = items.filter(([, item]) => item.registry === "other");
    const commit = project.source.commit ? ` @ ${project.source.commit.slice(0, 7)}` : "";
    out.log(`${project.id}  (${project.source.path}${commit})`);
    if (items.length > 0)
      out.log(
        `  ${[
          plural(items.length, "item"),
          `${used.length} used`,
          ...(unused.length > 0 ? [`${unused.length} unused`] : []),
          ...(updates.length > 0 ? [plural(updates.length, "update")] : []),
          ...(modified.length > 0 ? [`${modified.length} modified`] : []),
          ...(other.length > 0 ? [`${other.length} from another registry`] : []),
        ].join(", ")}`,
      );
    const at = project.source.path === "." ? "" : ` (in ${project.source.path})`;
    for (const [name] of updates)
      out.log(`  ↑ ${name}: update available. Run: shelf update ${name}${at}`);
    for (const [name] of modified)
      out.log(`  ~ ${name}: modified locally. See: shelf diff ${name} --local${at}`);
    for (const [name] of unused) out.log(`  - ${name}: installed, not imported`);
    for (const name of project.missing)
      out.log(`  ! ${name}: needed but not installed. Run: shelf add ${name}${at}`);
    const providers = [...new Set(project.consumes.map((c) => c.provider))].toSorted();
    for (const provider of providers) {
      const consumed = project.consumes.filter((c) => c.provider === provider);
      out.log(`  uses from ${provider}: ${consumed.map((c) => c.item).join(", ")}`);
    }
    if (project.registryError) out.log(`  ! registry not compared: ${project.registryError}`);
    out.log();
  }
  out.log(`${plural(graph.projects.length, "project")}. For the full graph: shelf usage --json`);
}
