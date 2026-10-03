import { diff } from "../../core/diff";
import { type Context, type ShelfProgram, resolveCwd } from "../program";

export function registerDiff(program: ShelfProgram, context: Context): void {
  program
    .command("diff")
    .description("Show Shelf's changes to an item since you installed it")
    .argument("<item>", "an installed item name")
    .option("--local", "show your changes instead")
    .action(async (name, _options, command) => {
      const { cwd, local } = command.optsWithGlobals();
      await diff({ cwd: resolveCwd(cwd), name, local: local === true, out: context.out });
    });
}
