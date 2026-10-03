// Writes skills/shelf/SKILL.md, the copy of the skill that this repo publishes.
// Run: bun run skill:write
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { skillFile } from "./core/agents";

const file = path.resolve(import.meta.dir, "../../../skills/shelf/SKILL.md");
await writeFile(file, skillFile("npx shelf"));
console.log(`✓ wrote ${path.relative(process.cwd(), file)}`);
