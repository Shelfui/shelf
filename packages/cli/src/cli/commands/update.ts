import { update } from "../../core/update";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerUpdate(program: ShelfProgram, context: Context): void {
  program
    .command("update")
    .description("Update installed items, merging Shelf's changes into yours")
    .argument("[items...]", "installed item names (default: all with updates)")
    .option("--overwrite", "replace your changes with Shelf's version instead of merging")
    .option("--skip-install", "do not install missing packages")
    .action(async (names, _options, command) => {
      const { cwd, overwrite, skipInstall } = command.optsWithGlobals();
      await update({
        cwd: resolveCwd(cwd),
        names,
        overwrite: overwrite === true,
        install: skipInstall !== true,
        out: context.out,
      });
    });
}
