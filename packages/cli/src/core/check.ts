import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CONFIG_FILE, type ShelfConfig, readConfig } from "./config";
import { ShelfError, errorMessage } from "./errors";
import { compareText, plural } from "./format";
import { CONFLICT_START } from "./git";
import { SOURCE, resolveSpecifier, resolvesToFile, specifiers } from "./imports";
import { LOCK_FILE, type Lock, hashContent, readLock } from "./lock";
import type { Output } from "./output";
import {
  type PackageManager,
  addHint,
  declaredPackages,
  detectPackageManager,
} from "./package-manager";
import { resolveInside } from "./paths";

export const STEPS = ["config", "provenance", "dependencies", "imports"] as const;
export type StepName = (typeof STEPS)[number];

export interface StepResult {
  name: StepName;
  status: "pass" | "fail" | "skip";
  summary: string;
  details: string[];
}

export interface CheckOptions {
  cwd: string;
  only: StepName[] | undefined;
  verbose: boolean;
  out: Output;
}

interface Project {
  cwd: string;
  pm: PackageManager;
  config: ShelfConfig | Error;
  lock: Lock | Error | undefined;
}

const MAX_DETAILS = 30;

export async function check({ cwd, only, verbose, out }: CheckOptions): Promise<boolean> {
  const steps: Record<StepName, (project: Project) => Promise<StepResult>> = {
    config: checkConfig,
    provenance: checkProvenance,
    dependencies: checkDependencies,
    imports: checkImports,
  };

  const project: Project = {
    cwd,
    pm: await detectPackageManager(cwd),
    config: await readConfig(cwd).catch(asError),
    lock: existsSync(path.join(cwd, LOCK_FILE)) ? await readLock(cwd).catch(asError) : undefined,
  };
  out.log("Shelf check");
  out.log();
  const results: StepResult[] = [];
  for (const name of STEPS) {
    if (only && !only.includes(name)) continue;
    const result = await steps[name](project);
    results.push(result);
    const icon = { pass: "✓", fail: "✗", skip: "-" }[result.status];
    out.log(`${icon} ${name.padEnd(12)} ${result.summary}`.trimEnd());
    const details = verbose ? result.details : result.details.slice(0, MAX_DETAILS);
    for (const line of details) out.log(`    ${line}`);
    if (details.length < result.details.length) {
      out.log(`    … ${result.details.length - MAX_DETAILS} more (run with --verbose)`);
    }
  }

  const failed = results.filter((result) => result.status === "fail");
  out.log();
  if (failed.length > 0) {
    out.log(
      `✗ ${failed.length} of ${plural(results.length, "step")} failed: ${failed.map((r) => r.name).join(", ")}`,
    );
    return false;
  }
  const skipped = results.filter((result) => result.status === "skip").length;
  out.log(`✓ All checks passed (${results.length - skipped} passed, ${skipped} skipped)`);
  return true;
}

async function checkConfig({ cwd, config }: Project): Promise<StepResult> {
  const name = "config";
  if (config instanceof Error) {
    const problem = existsSync(path.join(cwd, CONFIG_FILE)) ? "invalid" : "missing";
    return {
      name,
      status: "fail",
      summary: `${CONFIG_FILE} ${problem}`,
      details: [config.message],
    };
  }
  return { name, status: "pass", summary: `registry ${config.registry}`, details: [] };
}

async function checkProvenance({ cwd, lock }: Project): Promise<StepResult> {
  const name = "provenance";
  if (!lock) return skip(name, lock);
  if (lock instanceof Error) {
    return { name, status: "fail", summary: "lock unreadable", details: [lock.message] };
  }

  const problems: string[] = [];
  const modified: string[] = [];
  let fileCount = 0;
  for (const [itemName, item] of sorted(lock.items)) {
    for (const [target, file] of sorted(item.files)) {
      fileCount++;
      try {
        const targetPath = resolveInside(cwd, target);
        if (!existsSync(targetPath)) {
          problems.push(
            `${target} is recorded in ${LOCK_FILE} (${itemName}) but missing. Restore it, or run: shelf add ${itemName} --overwrite`,
          );
        } else {
          const content = await readFile(targetPath);
          if (hashContent(content) === file.baseHash) continue;
          modified.push(`~ ${target} (${itemName}, modified locally)`);
          const line = content
            .toString("utf8")
            .split("\n")
            .findIndex((l) => l.startsWith(CONFLICT_START));
          if (line !== -1) {
            problems.push(
              `${target}:${line + 1} has an unresolved conflict from shelf update. Resolve it, then run: shelf check`,
            );
          }
        }
      } catch (error) {
        problems.push(errorMessage(error));
      }
    }
  }

  const summary = [
    plural(Object.keys(lock.items).length, "item"),
    plural(fileCount, "file"),
    ...(modified.length > 0 ? [`${modified.length} modified locally`] : []),
  ].join(", ");
  if (problems.length > 0) {
    return { name, status: "fail", summary: plural(problems.length, "problem"), details: problems };
  }
  return { name, status: "pass", summary, details: modified };
}

async function checkDependencies({ cwd, pm, lock }: Project): Promise<StepResult> {
  const name = "dependencies";
  if (!lock || lock instanceof Error) return skip(name, lock);

  let declared: Set<string>;
  try {
    declared = await declaredPackages(cwd);
  } catch (error) {
    return {
      name,
      status: "fail",
      summary: "package.json unreadable",
      details: [errorMessage(error)],
    };
  }

  const problems: string[] = [];
  const missingItems = new Set<string>();
  const missingPackages = new Map<string, string>();
  const packages = new Set<string>();
  for (const [itemName, item] of sorted(lock.items)) {
    for (const dependency of item.shelfDependencies) {
      if (lock.items[dependency]) continue;
      missingItems.add(dependency);
      problems.push(`${itemName} needs ${dependency}, which is not installed.`);
    }
    for (const [pkg, range] of sorted(item.dependencies)) {
      packages.add(pkg);
      if (declared.has(pkg)) continue;
      missingPackages.set(pkg, range);
      problems.push(`${itemName} needs ${pkg}@${range}, which is not in package.json.`);
    }
  }

  if (problems.length > 0) {
    const fixes = [
      ...(missingItems.size > 0
        ? [`Fix: shelf add ${[...missingItems].toSorted().join(" ")}`]
        : []),
      ...(missingPackages.size > 0
        ? [
            `Fix: ${addHint(
              pm,
              [...missingPackages].map(([pkg, range]) => `${pkg}@${range}`).toSorted(),
            )}`,
          ]
        : []),
    ];
    return {
      name,
      status: "fail",
      summary: plural(problems.length, "problem"),
      details: [...problems, ...fixes],
    };
  }
  return {
    name,
    status: "pass",
    summary: `${plural(packages.size, "package")} declared, Shelf dependencies installed`,
    details: [],
  };
}

async function checkImports({ cwd, config, lock }: Project): Promise<StepResult> {
  const name = "imports";
  if (!lock || lock instanceof Error) return skip(name, lock);
  const aliases = config instanceof Error ? {} : config.aliases;

  const problems: string[] = [];
  let importCount = 0;
  for (const [, item] of sorted(lock.items)) {
    for (const target of Object.keys(item.files).toSorted()) {
      if (!SOURCE.test(target)) continue;
      let content: string;
      try {
        const file = resolveInside(cwd, target);
        if (!existsSync(file)) continue;
        content = await readFile(file, "utf8");
      } catch (error) {
        problems.push(`${target} could not be read: ${errorMessage(error)}`);
        continue;
      }
      for (const spec of specifiers(content)) {
        const resolved = resolveSpecifier(target, spec, aliases);
        if (resolved === undefined) continue;
        importCount++;
        if (!resolvesToFile(cwd, resolved)) {
          problems.push(`${target} imports "${spec}", which does not resolve to a file.`);
        }
      }
    }
  }

  if (problems.length > 0) {
    return {
      name,
      status: "fail",
      summary: plural(problems.length, "broken import"),
      details: problems,
    };
  }
  return {
    name,
    status: "pass",
    summary: `${plural(importCount, "local import")} resolve`,
    details: [],
  };
}

// Helpers ------------------------------------------------------------------

function sorted<T>(record: Record<string, T>): Array<[string, T]> {
  return Object.entries(record).toSorted(([a], [b]) => compareText(a, b));
}

/** Skips a step that needs the lock, saying whether it is missing or unreadable. */
function skip(name: StepName, lock: Error | undefined): StepResult {
  const reason = lock ? `${LOCK_FILE} is unreadable` : `no ${LOCK_FILE}`;
  return { name, status: "skip", summary: `skipped: ${reason}`, details: [] };
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function isStepName(value: string): value is StepName {
  return STEPS.some((step) => step === value);
}

export function parseSteps(value: string | undefined): StepName[] | undefined {
  if (!value) return undefined;
  return value.split(",").map((raw) => {
    const step = raw.trim();
    if (!isStepName(step)) {
      throw new ShelfError(`Unknown check step "${step}". Steps: ${STEPS.join(", ")}`);
    }
    return step;
  });
}
