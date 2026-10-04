import { rmSync } from "node:fs";
import path from "node:path";
import { afterAll } from "bun:test";

// Test temp directories live in the ignored `.tmp/tests`. Registering here (a
// preload) applies to every test file, and removes whatever the run created.
const tempRoot = path.resolve(import.meta.dir, "../../../.tmp/tests");

afterAll(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});
