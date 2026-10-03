import { build } from "../../core/build";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerBuild(program: ShelfProgram, context: Context): void {
  program
    .command("build")
    .description("Validate a registry and write the files that install, for static hosting")
    .argument("[dir]", "registry source directory", "registry")
    .option("--out <dir>", "output directory, replaced on every build", "dist/registry")
    .option("--storybook <dir>", "a Storybook build to serve at storybook/, for previews")
    .option("--usage <file>", "a shelf usage --json file to serve at usage.json")
    .option("--verify <file>", "a bun run verify report to serve at verify.json")
    .option("--no-site", "write only the registry files, without the Shelf Registry site")
    .action(async (dir, { out: outDir, storybook, usage, verify, site }, command) => {
      const { cwd } = command.optsWithGlobals();
      await build({
        cwd: resolveCwd(cwd),
        source: dir,
        outDir,
        out: context.out,
        site,
        ...(storybook !== undefined && { storybook }),
        ...(usage !== undefined && { usage }),
        ...(verify !== undefined && { verify }),
      });
    });
}
