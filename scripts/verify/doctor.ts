import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { type Item, registryDir, repoRoot } from "./items";

interface Counts {
  errors: number;
  warnings: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** React Doctor findings per item, from one scan of the whole registry. */
export async function scanWithDoctor(items: Item[]): Promise<Map<string, Counts>> {
  const dir = await mkdtemp(path.join(tmpdir(), "shelf-doctor-"));
  const report = path.join(dir, "report.json");
  try {
    // A scan that finds problems exits non-zero, so the JSON file is read either way.
    await Bun.spawn(
      [
        "bunx",
        "react-doctor",
        path.relative(repoRoot, registryDir),
        "--json",
        "--json-out",
        report,
        "--no-telemetry",
        "--no-supply-chain",
      ],
      { cwd: repoRoot, stdout: "ignore", stderr: "ignore" },
    ).exited;
    const parsed: unknown = JSON.parse(await readFile(report, "utf8"));
    const diagnostics =
      isRecord(parsed) && Array.isArray(parsed["diagnostics"]) ? parsed["diagnostics"] : [];

    const counts = new Map<string, Counts>(
      items.map((item) => [item.name, { errors: 0, warnings: 0 }]),
    );
    for (const diagnostic of diagnostics) {
      if (!isRecord(diagnostic) || typeof diagnostic["filePath"] !== "string") continue;
      const file = diagnostic["filePath"];
      const owner = items.find((item) => file.startsWith(`${item.path}/`));
      const entry = owner && counts.get(owner.name);
      if (!entry) continue;
      if (diagnostic["severity"] === "error") entry.errors++;
      else entry.warnings++;
    }
    return counts;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
