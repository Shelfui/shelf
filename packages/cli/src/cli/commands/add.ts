import { add } from "../../core/add";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerAdd(program: ShelfProgram, context: Context): void {
  program
    .command("add")
    .description("Copy items into your project and record provenance")
    .argument("<items...>", "registry item names")
    .option("--overwrite", "replace locally modified or unmanaged files")
    .option("--skip-install", "do not install missing packages")
    .action(async (names, _options, command) => {
      const { cwd, overwrite, skipInstall } = command.optsWithGlobals();
      await add({
        cwd: resolveCwd(cwd),
        names,
        overwrite: overwrite === true,
        install: skipInstall !== true,
        out: context.out,
      });
    });
}
